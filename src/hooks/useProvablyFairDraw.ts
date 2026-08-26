import { useCallback, useEffect, useReducer } from "react";
import { STARTER_SLAB_BOX } from "../domain/dropTable";
import {
  commitServerSeed,
  deriveDrawResult,
  generateClientSeedSuggestion,
  verifyCommitment,
} from "../domain/provablyFair";
import type { DropTableEntry, DrawOutcome } from "../domain/types";

export type DrawPhase = "committing" | "ready" | "drawing" | "drawn" | "verifying" | "verified";

interface DrawState {
  phase: DrawPhase;
  serverSeed: string | null;
  serverSeedHash: string | null;
  clientSeed: string;
  /** "Which draw this is" — increments on every new commitment, including the first. */
  nonce: number;
  outcome: DrawOutcome | null;
  verifyResult: { hashMatches: boolean; outcomeMatches: boolean } | null;
  dropTable: DropTableEntry[];
}

type Action =
  | { type: "COMMITTED"; serverSeed: string; serverSeedHash: string }
  | { type: "SET_CLIENT_SEED"; clientSeed: string }
  | { type: "DRAW_REQUESTED" }
  | { type: "DRAWN"; outcome: DrawOutcome }
  | { type: "VERIFY_REQUESTED" }
  | { type: "VERIFIED"; hashMatches: boolean; outcomeMatches: boolean }
  | { type: "RESET_REQUESTED"; nonce: number; clientSeed: string };

function reducer(state: DrawState, action: Action): DrawState {
  switch (action.type) {
    case "COMMITTED":
      return { ...state, phase: "ready", serverSeed: action.serverSeed, serverSeedHash: action.serverSeedHash };
    case "SET_CLIENT_SEED":
      return { ...state, clientSeed: action.clientSeed };
    case "DRAW_REQUESTED":
      return { ...state, phase: "drawing" };
    case "DRAWN":
      return { ...state, phase: "drawn", outcome: action.outcome };
    case "VERIFY_REQUESTED":
      return { ...state, phase: "verifying" };
    case "VERIFIED":
      return {
        ...state,
        phase: "verified",
        verifyResult: { hashMatches: action.hashMatches, outcomeMatches: action.outcomeMatches },
      };
    case "RESET_REQUESTED":
      return {
        ...state,
        phase: "committing",
        nonce: action.nonce,
        clientSeed: action.clientSeed,
        serverSeed: null,
        serverSeedHash: null,
        outcome: null,
        verifyResult: null,
      };
    default:
      return state;
  }
}

function initialState(): DrawState {
  return {
    phase: "committing",
    serverSeed: null,
    serverSeedHash: null,
    clientSeed: generateClientSeedSuggestion(),
    nonce: 1,
    outcome: null,
    verifyResult: null,
    dropTable: STARTER_SLAB_BOX,
  };
}

/**
 * Drives the whole commit -> input -> draw -> reveal -> verify state machine.
 * See ARCHITECTURE.md §3 for the full data flow matrix this implements.
 */
export function useProvablyFairDraw() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  useEffect(() => {
    if (state.phase !== "committing") return;
    let cancelled = false;
    commitServerSeed().then(({ serverSeed, serverSeedHash }) => {
      if (!cancelled) dispatch({ type: "COMMITTED", serverSeed, serverSeedHash });
    });
    return () => {
      cancelled = true;
    };
  }, [state.phase, state.nonce]);

  const setClientSeed = useCallback((clientSeed: string) => {
    dispatch({ type: "SET_CLIENT_SEED", clientSeed });
  }, []);

  const openBox = useCallback(async () => {
    if (!state.serverSeed || state.phase !== "ready") return;
    dispatch({ type: "DRAW_REQUESTED" });
    const outcome = await deriveDrawResult(
      { serverSeed: state.serverSeed, clientSeed: state.clientSeed, nonce: state.nonce },
      state.dropTable,
    );
    dispatch({ type: "DRAWN", outcome });
  }, [state.serverSeed, state.clientSeed, state.nonce, state.dropTable, state.phase]);

  const verify = useCallback(async () => {
    if (!state.serverSeed || !state.serverSeedHash || !state.outcome) return;
    dispatch({ type: "VERIFY_REQUESTED" });
    const hashMatches = await verifyCommitment(state.serverSeed, state.serverSeedHash);
    const replay = await deriveDrawResult(
      { serverSeed: state.serverSeed, clientSeed: state.clientSeed, nonce: state.nonce },
      state.dropTable,
    );
    const outcomeMatches =
      replay.entry.id === state.outcome.entry.id && replay.resultFraction === state.outcome.resultFraction;
    dispatch({ type: "VERIFIED", hashMatches, outcomeMatches });
  }, [state.serverSeed, state.serverSeedHash, state.outcome, state.clientSeed, state.nonce, state.dropTable]);

  const tryAgain = useCallback(() => {
    dispatch({ type: "RESET_REQUESTED", nonce: state.nonce + 1, clientSeed: generateClientSeedSuggestion() });
  }, [state.nonce]);

  return { state, setClientSeed, openBox, verify, tryAgain };
}
