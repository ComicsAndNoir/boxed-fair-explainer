import { motion } from "framer-motion";
import { ArrowLeftRight, RotateCcw } from "lucide-react";
import { popIn } from "../../styles/motion";
import type { ConfidenceAnswer } from "./ConfidenceSurvey";
import styles from "./Debrief.module.css";

interface DebriefProps {
  variant: "A" | "B";
  answer: ConfidenceAnswer;
  onTryOtherVariant: () => void;
  onRestart: () => void;
}

const VARIANT_LABEL: Record<"A" | "B", string> = {
  A: "Version A — the current explainer",
  B: "Version B — the redesigned walkthrough",
};

function formatAnswer(answer: ConfidenceAnswer): string {
  return answer === "unsure" ? "Still not sure" : `${answer} / 5`;
}

/** Demo-only wrap-up: reveals what the respondent actually saw, for whoever's running the demo to discuss. */
export function Debrief({ variant, answer, onTryOtherVariant, onRestart }: DebriefProps) {
  return (
    <motion.div className={styles.wrapper} variants={popIn} initial="hidden" animate="visible">
      <h1 className={styles.title}>Thanks for taking part</h1>

      <div className={styles.recap}>
        <div className={styles.recapRow}>
          <span className={styles.recapLabel}>You were shown</span>
          <span className={styles.recapValue}>{VARIANT_LABEL[variant]}</span>
        </div>
        <div className={styles.recapRow}>
          <span className={styles.recapLabel}>Your confidence rating</span>
          <span className={styles.recapValue}>{formatAnswer(answer)}</span>
        </div>
      </div>

      <div className={styles.actionRow}>
        <button type="button" className={styles.primaryButton} onClick={onTryOtherVariant}>
          <ArrowLeftRight size={16} aria-hidden style={{ verticalAlign: "-2px", marginRight: 6 }} />
          Try Version {variant === "A" ? "B" : "A"} instead
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onRestart}>
          <RotateCcw size={16} aria-hidden style={{ verticalAlign: "-2px", marginRight: 6 }} />
          Restart demo
        </button>
      </div>
    </motion.div>
  );
}
