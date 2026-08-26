import { motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { popIn } from "../../styles/motion";
import styles from "./ABTestIntro.module.css";

interface ABTestIntroProps {
  onChoose: (variant: "A" | "B") => void;
}

/**
 * The A/B test's own landing page — explains the test and what it measures,
 * then lets the viewer pick a variant. In a real deployment this assignment
 * would be random and blind; this demo makes that distinction explicit
 * rather than quietly picking one, per the app's honesty principle.
 */
export function ABTestIntro({ onChoose }: ABTestIntroProps) {
  return (
    <motion.div className={styles.wrapper} variants={popIn} initial="hidden" animate="visible">
      <div className={styles.hero}>
        <span className={styles.eyebrow}>A quick A/B test</span>
        <h1 className={styles.heroTitle}>Which explanation builds more confidence?</h1>
        <p className={styles.heroSubtitle}>
          You'll read one explanation of how Boxed's fairness system works, then answer a single question about how
          it left you feeling.
        </p>
      </div>

      <p className={styles.methodNote}>
        In a real test, you'd be shown one version at random without knowing an alternative exists. 
        For this demo, you get to pick which one you see.
      </p>

      <div className={styles.questionCallout}>
        <span className={styles.questionLabel}>What we're measuring</span>
        <span className={styles.questionText}>"How confident are you that the system used by boxed.gg is fair?"</span>
      </div>

      <div className={styles.pickerRow}>
        <div className={styles.variantCard}>
          <span className={styles.variantIcon}>
            <FileText size={22} color="var(--color-accent-primary-glow)" aria-hidden />
          </span>
          <span className={styles.variantLabel}>Version A</span>
          <span className={styles.variantTitle}>The current explainer</span>
          <span className={styles.variantDesc}>Boxed's real, existing Help Center article, as published today.</span>
          <button type="button" className={styles.variantButton} onClick={() => onChoose("A")}>
            View Version A
          </button>
        </div>

        <div className={styles.variantCard}>
          <span className={styles.variantIcon}>
            <Sparkles size={22} color="var(--color-accent-primary-glow)" aria-hidden />
          </span>
          <span className={styles.variantLabel}>Version B</span>
          <span className={styles.variantTitle}>The redesigned walkthrough</span>
          <span className={styles.variantDesc}>A guided, visual, four-step interactive explainer.</span>
          <button type="button" className={styles.variantButton} onClick={() => onChoose("B")}>
            View Version B
          </button>
        </div>
      </div>
    </motion.div>
  );
}
