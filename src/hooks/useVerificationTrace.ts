import { useEffect, useReducer } from "react";
import { computeCumulativeRanges, type DropRange } from "../domain/dropTable";
import { hexToFraction, hmacSha256Hex, sha256Hex } from "../domain/provablyFair";
import type { DropTableEntry } from "../domain/types";

export interface VerificationTrace {
  computedHash: string;
  hashMatches: boolean;
  message: string;
  computedHmac: string;
  fraction: number;
  ranges: DropRange[];
  mappedEntry: DropTableEntry;
}

/**
 * Independently recomputes every intermediate value of the verify step —
 * not just the pass/fail booleans useProvablyFairDraw's verify() produces —
 * purely so MathReveal can show its work. Genuinely re-executed each time
 * this runs, same as the "real" verify; nothing here is cached or faked.
 */
export function useVerificationTrace(
  serverSeed: string | null,
  serverSeedHash: string | null,
  clientSeed: string,
  nonce: number,
  dropTable: DropTableEntry[],
): VerificationTrace | null {
  const [trace, dispatch] = useReducer((_: VerificationTrace | null, next: VerificationTrace | null) => next, null);

  useEffect(() => {
    if (!serverSeed || !serverSeedHash) {
      dispatch(null);
      return;
    }
    let cancelled = false;

    (async () => {
      const computedHash = await sha256Hex(serverSeed);
      const message = `${clientSeed}:${nonce}`;
      const computedHmac = await hmacSha256Hex(serverSeed, message);
      const fraction = hexToFraction(computedHmac);
      const ranges = computeCumulativeRanges(dropTable);
      const mappedEntry = ranges.find((r) => fraction < r.high)?.entry ?? dropTable[dropTable.length - 1];

      if (!cancelled) {
        dispatch({
          computedHash,
          hashMatches: computedHash === serverSeedHash,
          message,
          computedHmac,
          fraction,
          ranges,
          mappedEntry,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [serverSeed, serverSeedHash, clientSeed, nonce, dropTable]);

  return trace;
}
