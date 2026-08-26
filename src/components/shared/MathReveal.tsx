import { AnimatePresence, motion } from "framer-motion";
import { Calculator, CheckCircle2, ChevronDown, XCircle } from "lucide-react";
import { useId, useState } from "react";
import type { DropTableEntry } from "../../domain/types";
import { useVerificationTrace } from "../../hooks/useVerificationTrace";
import { trackEvent } from "../../lib/analytics";
import { revealVariants } from "../../styles/motion";
import styles from "./MathReveal.module.css";

interface MathRevealProps {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  dropTable: DropTableEntry[];
  outcomeEntryId: string;
}

function MatchBadge({ ok, goodLabel, badLabel }: { ok: boolean; goodLabel: string; badLabel: string }) {
  return (
    <span className={`${styles.matchBadge} ${ok ? styles.matchGood : styles.matchBad}`}>
      {ok ? <CheckCircle2 size={14} aria-hidden /> : <XCircle size={14} aria-hidden />}
      {ok ? goodLabel : badLabel}
    </span>
  );
}

/**
 * "Show me the math" — an illustrative worked trace of the verify step,
 * using the actual values from this draw (not a staged example). Every
 * value shown is genuinely recomputed by useVerificationTrace, independent
 * of the pass/fail booleans the primary "Verify" button already showed.
 */
export function MathReveal({ serverSeed, serverSeedHash, clientSeed, nonce, dropTable, outcomeEntryId }: MathRevealProps) {
  const [open, setOpen] = useState(false);
  const trace = useVerificationTrace(serverSeed, serverSeedHash, clientSeed, nonce, dropTable);
  const contentId = useId();

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => {
          const next = !open;
          trackEvent("expand_info", { label: "Show me the actual math", expanded: next });
          setOpen(next);
        }}
      >
        <span className={styles.triggerLabel}>
          <Calculator size={16} aria-hidden />
          Show me the actual math
        </span>
        <ChevronDown className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} size={18} aria-hidden />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={contentId}
            key="content"
            variants={revealVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            style={{ overflow: "hidden" }}
          >
            <div className={styles.content}>
              {!trace ? (
                <span className={styles.loading}>Computing…</span>
              ) : (
                <>
                  <div className={styles.step}>
                    <span className={styles.stepLabel}>1. Re-hash the revealed secret</span>
                    <span className={styles.stepPlain}>
                      SHA-256 runs on the server seed that was just revealed above.
                    </span>
                    <span className={styles.code}>{`SHA256(serverSeed)\n= ${trace.computedHash}`}</span>

                    <span className={styles.stepPlain}>
                      Compared against the fingerprint published back in step 1 — before your box ever opened.
                    </span>
                    <span className={styles.code}>{`published hash\n= ${serverSeedHash}`}</span>
                    <MatchBadge ok={trace.hashMatches} goodLabel="Identical — nothing was swapped" badLabel="Different — this would mean tampering" />
                  </div>

                  <div className={styles.step}>
                    <span className={styles.stepLabel}>2. Recompute the blend</span>
                    <span className={styles.stepPlain}>
                      The same server seed combines with your ingredient and draw number, exactly the way step 3 did
                      it.
                    </span>
                    <span className={styles.code}>{`HMAC-SHA256(serverSeed, "${trace.message}")\n= ${trace.computedHmac}`}</span>
                  </div>

                  <div className={styles.step}>
                    <span className={styles.stepLabel}>3. Turn it into a number</span>
                    <span className={styles.stepPlain}>The leading part of that result becomes a percentage.</span>
                    <span className={styles.code}>{`→ ${(trace.fraction * 100).toFixed(4)}%`}</span>
                  </div>

                  <div className={styles.step}>
                    <span className={styles.stepLabel}>4. Find the matching slice</span>
                    <span className={styles.stepPlain}>That percentage is checked against the published odds ranges:</span>
                    <div className={styles.rangeTable}>
                      {trace.ranges.map((r) => {
                        const isMatch = r.entry.id === trace.mappedEntry.id;
                        return (
                          <div key={r.entry.id} className={`${styles.rangeRow} ${isMatch ? styles.rangeRowActive : ""}`}>
                            <span>
                              {isMatch ? "→ " : "  "}
                              {r.entry.name}
                            </span>
                            <span>
                              {(r.low * 100).toFixed(2)}%–{(r.high * 100).toFixed(2)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <MatchBadge
                      ok={trace.mappedEntry.id === outcomeEntryId}
                      goodLabel={`Lands on ${trace.mappedEntry.name} — same card you actually got`}
                      badLabel={`Lands on ${trace.mappedEntry.name} — doesn't match what you got`}
                    />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
