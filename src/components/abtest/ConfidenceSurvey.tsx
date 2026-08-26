import { motion } from "framer-motion";
import { popIn } from "../../styles/motion";
import styles from "./ConfidenceSurvey.module.css";

export type ConfidenceAnswer = 1 | 2 | 3 | 4 | 5 | "unsure";

interface ConfidenceSurveyProps {
  onSubmit: (answer: ConfidenceAnswer) => void;
}

/**
 * The single end-of-test question, shown identically regardless of which
 * variant was viewed — no mention of "version A/B", no branding hints, so
 * the answer isn't primed by knowing which explainer was shown.
 */
export function ConfidenceSurvey({ onSubmit }: ConfidenceSurveyProps) {
  return (
    <motion.div className={styles.wrapper} variants={popIn} initial="hidden" animate="visible">
      <h1 className={styles.question}>How confident are you that the system used by boxed.gg is fair?</h1>

      <div className={styles.scaleBlock}>
        <div className={styles.scaleRow}>
          {([1, 2, 3, 4, 5] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={styles.scaleButton}
              onClick={() => onSubmit(value)}
              aria-label={`${value} out of 5`}
            >
              {value}
            </button>
          ))}
        </div>
        <div className={styles.scaleLabels}>
          <span>Low confidence</span>
          <span>High confidence</span>
        </div>
      </div>

      <button type="button" className={styles.unsureButton} onClick={() => onSubmit("unsure")}>
        Still not sure
      </button>
    </motion.div>
  );
}
