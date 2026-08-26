import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import styles from "./App.module.css";
import { ABTestIntro } from "./components/abtest/ABTestIntro";
import { ConfidenceSurvey, type ConfidenceAnswer } from "./components/abtest/ConfidenceSurvey";
import { Debrief } from "./components/abtest/Debrief";
import { VariantAArticle } from "./components/abtest/VariantAArticle";
import { VariantBExplainer } from "./components/wizard/VariantBExplainer";

type Phase = "intro" | "variant-a" | "variant-b" | "survey" | "debrief";
type Variant = "A" | "B";

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

function App() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [variant, setVariant] = useState<Variant | null>(null);
  const [answer, setAnswer] = useState<ConfidenceAnswer | null>(null);

  function chooseVariant(next: Variant) {
    setVariant(next);
    setPhase(next === "A" ? "variant-a" : "variant-b");
  }

  function finishVariant() {
    setPhase("survey");
  }

  function submitSurvey(next: ConfidenceAnswer) {
    setAnswer(next);
    setPhase("debrief");
  }

  function tryOtherVariant() {
    if (!variant) return;
    const other: Variant = variant === "A" ? "B" : "A";
    setAnswer(null);
    chooseVariant(other);
  }

  function restart() {
    setVariant(null);
    setAnswer(null);
    setPhase("intro");
  }

  return (
    <AnimatePresence mode="wait">
      {phase === "intro" && (
        <motion.div key="intro" className={styles.viewport} variants={fadeVariants} initial="hidden" animate="visible" exit="exit">
          <ABTestIntro onChoose={chooseVariant} />
        </motion.div>
      )}

      {phase === "variant-a" && (
        <motion.div key="variant-a" className={styles.viewport} variants={fadeVariants} initial="hidden" animate="visible" exit="exit">
          <VariantAArticle onFinish={finishVariant} />
        </motion.div>
      )}

      {phase === "variant-b" && (
        <motion.div key="variant-b" className={styles.viewport} variants={fadeVariants} initial="hidden" animate="visible" exit="exit">
          <VariantBExplainer onFinish={finishVariant} />
        </motion.div>
      )}

      {phase === "survey" && (
        <motion.div key="survey" className={styles.viewport} variants={fadeVariants} initial="hidden" animate="visible" exit="exit">
          <ConfidenceSurvey onSubmit={submitSurvey} />
        </motion.div>
      )}

      {phase === "debrief" && variant && answer && (
        <motion.div key="debrief" className={styles.viewport} variants={fadeVariants} initial="hidden" animate="visible" exit="exit">
          <Debrief variant={variant} answer={answer} onTryOtherVariant={tryOtherVariant} onRestart={restart} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
