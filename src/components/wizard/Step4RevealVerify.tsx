import { ArrowRight, RotateCcw } from "lucide-react";
import type { DropTableEntry, DrawOutcome } from "../../domain/types";
import type { DrawPhase } from "../../hooks/useProvablyFairDraw";
import { InfoReveal } from "../shared/InfoReveal";
import { MathReveal } from "../shared/MathReveal";
import { SealFingerprint, type SealState } from "../shared/SealFingerprint";
import styles from "./WizardSteps.module.css";

interface Step4RevealVerifyProps {
  serverSeed: string | null;
  serverSeedHash: string | null;
  clientSeed: string;
  nonce: number;
  dropTable: DropTableEntry[];
  outcome: DrawOutcome | null;
  phase: DrawPhase;
  verifyResult: { hashMatches: boolean; outcomeMatches: boolean } | null;
  onVerify: () => void;
  onTryAgain: () => void;
  /** Optional — when present, shows a "Continue to survey" exit alongside "Open another box". */
  onFinish?: () => void;
}

export function Step4RevealVerify({
  serverSeed,
  serverSeedHash,
  clientSeed,
  nonce,
  dropTable,
  outcome,
  phase,
  verifyResult,
  onVerify,
  onTryAgain,
  onFinish,
}: Step4RevealVerifyProps) {
  if (!serverSeed || !serverSeedHash || !outcome) {
    return <p className={styles.lede}>Open a box in the previous step first.</p>;
  }

  const verified = phase === "verified" && verifyResult;
  const sealState: SealState = verified ? "verified" : "revealing";
  const bothMatch = verified && verifyResult.hashMatches && verifyResult.outcomeMatches;

  return (
    <>
      <p className={styles.lede}>
        Now the site opens the sealed envelope. Confirm the seal matches what you were shown at the very start, then
        re-run the blend yourself and watch the <strong>same card</strong> come out.
      </p>

      <div className={styles.visualArea}>
        <SealFingerprint hash={serverSeedHash} state={sealState} serverSeed={serverSeed} />
      </div>

      {phase !== "verified" && (
        <button type="button" className={styles.primaryAction} onClick={onVerify} disabled={phase === "verifying"}>
          {phase === "verifying" ? "Verifying…" : "Verify"}
        </button>
      )}

      {verified && !bothMatch && (
        <div className={styles.note}>Something didn't match — that would mean the draw was tampered with.</div>
      )}

      {bothMatch && (
        <>
          <div className={styles.outcomeBanner}>Confirmed: {outcome.entry.name}, exactly as opened.</div>

          <div className={`${styles.summaryBlock} ${styles.summaryGood}`}>
            <span className={styles.summaryTitle}>What this proves</span>
            <span>The site couldn't change which card you won after the fact — you can check that yourself.</span>
          </div>

          <div className={`${styles.summaryBlock} ${styles.summaryBoundary}`}>
            <span className={styles.summaryTitle}>What this doesn't prove</span>
            <span>
              That the odds are good value. A fair draw and generous odds are two separate things — provably fair
              only guarantees the first.
            </span>
          </div>

          <div className={styles.buttonRow}>
            {onFinish && (
              <button type="button" className={styles.primaryAction} onClick={onFinish}>
                Continue to survey <ArrowRight size={16} aria-hidden />
              </button>
            )}
            <button
              type="button"
              className={styles.iconButton}
              style={{ gap: 8, width: "auto", padding: "0 16px" }}
              onClick={onTryAgain}
            >
              <RotateCcw size={16} aria-hidden /> Open another box
            </button>
          </div>
        </>
      )}

      <div className={styles.revealGroup}>
        <InfoReveal
          label="What did 'Verify' just do?"
          jargonTerm="reveal server seed, re-hash, replay"
          jargonExplanation="Re-runs SHA-256 on the revealed server seed and compares it to the hash shown in step 1, then re-runs the HMAC-SHA256 + mapping from step 3 and compares the outcome — both genuinely recomputed, not cached."
        >
          <p>
            It hashed the now-revealed secret and checked it against the fingerprint from step one — a match means
            nothing was swapped. Then it replayed the exact same blend from step three and got the exact same card —
            proof the outcome wasn't secretly picked afterward.
          </p>
        </InfoReveal>

        {bothMatch && (
          <MathReveal
            serverSeed={serverSeed}
            serverSeedHash={serverSeedHash}
            clientSeed={clientSeed}
            nonce={nonce}
            dropTable={dropTable}
            outcomeEntryId={outcome.entry.id}
          />
        )}
      </div>
    </>
  );
}
