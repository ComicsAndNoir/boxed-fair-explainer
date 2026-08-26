import type { DropTableEntry, DrawOutcome } from "../../domain/types";
import type { DrawPhase } from "../../hooks/useProvablyFairDraw";
import { InfoReveal } from "../shared/InfoReveal";
import { OddsTable } from "../shared/OddsTable";
import { OddsWheel } from "../shared/OddsWheel";
import styles from "./WizardSteps.module.css";

interface Step3DrawAndMapProps {
  table: DropTableEntry[];
  phase: DrawPhase;
  outcome: DrawOutcome | null;
  onOpenBox: () => void;
}

export function Step3DrawAndMap({ table, phase, outcome, onOpenBox }: Step3DrawAndMapProps) {
  return (
    <>
      <p className={styles.lede}>
        The sealed value and your ingredient blend into one unpredictable number. That number points to a slot on
        the box's odds table below — <strong>and that slot is your card.</strong>
      </p>

      {phase === "ready" && (
        <button type="button" className={styles.primaryAction} onClick={onOpenBox}>
          Open the box
        </button>
      )}

      {(phase === "drawing" || phase === "drawn" || phase === "verifying" || phase === "verified") && (
        <OddsWheel table={table} resultFraction={outcome ? outcome.resultFraction : null} />
      )}

      {outcome && (
        <div className={styles.outcomeBanner}>
          You got: {outcome.entry.name} ({outcome.entry.oddsPercent.toFixed(2)}% odds)
        </div>
      )}

      <OddsTable table={table} highlightedId={outcome?.entry.id ?? null} />

      <div className={styles.note}>
        These odds can shift over time as card market prices move — but the odds shown above were the exact ones in
        effect for this draw, and that's what's locked in.
      </div>

      <div className={styles.revealGroup}>
        <InfoReveal
          label="How does a number turn into a card?"
          jargonTerm="hashing → result number → drop table"
          jargonExplanation="SHA-256/HMAC hashing turns the combined seeds into a number, which is normalized to a fraction and mapped onto the drop table's cumulative odds ranges."
        >
          <p>
            The mix gets scrambled into a number that's effectively unpredictable in advance, but exactly
            reproducible afterward. That number lands somewhere between 0% and 100% — wherever it lands on the bar
            above is your card, weighted so common cards get big slices and rare ones get tiny slivers.
          </p>
        </InfoReveal>
      </div>
    </>
  );
}
