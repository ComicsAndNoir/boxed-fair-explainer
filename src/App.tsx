import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "./App.module.css";
import { ABTestIntro } from "./components/abtest/ABTestIntro";
import { ConfidenceSurvey, type ConfidenceAnswer } from "./components/abtest/ConfidenceSurvey";
import { Debrief } from "./components/abtest/Debrief";
import { VariantAArticle } from "./components/abtest/VariantAArticle";
import { VariantBExplainer } from "./components/wizard/VariantBExplainer";
import { trackEvent, trackPageView } from "./lib/analytics";

type Phase = "intro" | "variant-a" | "variant-b" | "survey" | "debrief";
type Variant = "A" | "B";

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/**
 * Virtual pageviews for phases with no internal navigation of their own.
 * 'variant-b' is deliberately absent — VariantBExplainer fires its own
 * step-level pageviews, since App has no visibility into its wizard step.
 */
const PHASE_PAGE: Partial<Record<Phase, { path: string; title: string }>> = {
  intro: { path: "/intro", title: "A/B Test Intro" },
  "variant-a": { path: "/variant-a", title: "Variant A — Current Explainer" },
  survey: { path: "/survey", title: "Confidence Survey" },
  debrief: { path: "/debrief", title: "Debrief" },
};

function App() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [variant, setVariant] = useState<Variant | null>(null);
  const [answer, setAnswer] = useState<ConfidenceAnswer | null>(null);

  useEffect(() => {
    const page = PHASE_PAGE[phase];
    if (page) trackPageView(page.path, page.title);
  }, [phase]);

  function chooseVariant(next: Variant) {
    trackEvent("select_variant", { variant: next });
    setVariant(next);
    setPhase(next === "A" ? "variant-a" : "variant-b");
  }

  function finishVariant() {
    if (variant) trackEvent("continue_to_survey", { variant });
    setPhase("survey");
  }

  function submitSurvey(next: ConfidenceAnswer) {
    if (variant) trackEvent("submit_survey", { variant, answer: String(next) });
    setAnswer(next);
    setPhase("debrief");
  }

  function tryOtherVariant() {
    if (!variant) return;
    const other: Variant = variant === "A" ? "B" : "A";
    trackEvent("try_other_variant", { from_variant: variant, to_variant: other });
    setAnswer(null);
    chooseVariant(other);
  }

  function restart() {
    if (variant) trackEvent("restart_demo", { variant });
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
