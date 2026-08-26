import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import styles from "../../App.module.css";
import { AppHeader } from "../layout/AppHeader";
import { StepShell } from "../layout/StepShell";
import { Overview } from "../overview/Overview";
import { CompanyName, RealWorldExample } from "../shared/RealWorldExample";
import { TrustTag } from "../shared/TrustTag";
import { useMobileScrollCollapse } from "../../hooks/useMobileScrollCollapse";
import { useProvablyFairDraw } from "../../hooks/useProvablyFairDraw";
import { Step1Commitment } from "./Step1Commitment";
import { Step2UserInput } from "./Step2UserInput";
import { Step3DrawAndMap } from "./Step3DrawAndMap";
import { Step4RevealVerify } from "./Step4RevealVerify";

const TOTAL_STEPS = 4;

const STEP_TITLES = [
  "The site locks in its answer before you play",
  "You add your own ingredient",
  "The mix decides your card — on odds you saw up front",
  "Check it yourself",
];

/**
 * Verified real-world examples (see ARCHITECTURE.md §5.5, §5.7). Split across
 * two placements: `companies` drives the compact `TrustTag` teaser above the
 * heading, `description`/`href`/`linkLabel` drive the full `RealWorldExample`
 * card after the step's own explanation — where "the same way" type phrasing
 * actually has something to refer back to.
 */
const REAL_WORLD_EXAMPLES = [
  {
    companies: ["DocuSign"],
    description: (
      <>
        <CompanyName>DocuSign</CompanyName> protects every document you sign online the same way: once a document is
        finalized, a tamper-evident digital seal locks it in place. If even a single byte changes afterward, the
        seal breaks and it's instantly detectable — the same 'locked in before, provable after' guarantee.
      </>
    ),
    href: "https://www.docusign.com/blog/is-your-esignature-safe",
    linkLabel: "See how DocuSign seals signed documents",
  },
  {
    companies: ["Visa", "Mastercard"],
    description: (
      <>
        Every time you tap or insert a chip card, <CompanyName>Visa</CompanyName>, <CompanyName>Mastercard</CompanyName>,
        and other major networks generate a brand-new one-time code for that specific transaction — mixing in a
        fresh, unpredictable value so the code can never be reused or guessed in advance. That's the same job your
        ingredient does here.
      </>
    ),
    href: "https://www.emvco.com/emv-technologies/emv-contact-chip/",
    linkLabel: "See how EMV chip cards do this (EMVCo)",
  },
  {
    companies: ["Stripe"],
    description: (
      <>
        HMAC-SHA256 — the exact algorithm used here — is what <CompanyName>Stripe</CompanyName> uses to sign every
        webhook it sends to businesses around the world, so the recipient can prove it genuinely came from{" "}
        <CompanyName>Stripe</CompanyName>. Same algorithm, different job: there it proves a message wasn't forged;
        here it produces the unpredictable number that picks your card.
      </>
    ),
    href: "https://docs.stripe.com/webhooks#verify-manually",
    linkLabel: "See Stripe's webhook signature docs",
  },
  {
    companies: ["DocuSign"],
    description: (
      <>
        <CompanyName>DocuSign</CompanyName> again: once a document is signed, its tamper-evident seal and Certificate
        of Completion let anyone confirm afterward that nothing was altered — you don't have to just take{" "}
        <CompanyName>DocuSign</CompanyName>'s word for it, the seal itself proves it.
      </>
    ),
    href: "https://www.docusign.com/blog/is-your-esignature-safe",
    linkLabel: "See DocuSign's tamper-evident sealing",
  },
];

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

interface VariantBExplainerProps {
  /** Called when the user chooses to leave the wizard for the survey, from Step 4. */
  onFinish: () => void;
}

/** Variant B of the A/B test — the redesigned, animation-led walkthrough (previously the whole app). */
export function VariantBExplainer({ onFinish }: VariantBExplainerProps) {
  // 0 = overview (visual summary), 1-4 = the guided wizard steps.
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const { state, setClientSeed, openBox, verify, tryAgain } = useProvablyFairDraw();
  const { scrollRootRef, disclaimerCollapsed } = useMobileScrollCollapse();

  function goTo(nextStep: number, dir: 1 | -1) {
    setDirection(dir);
    setStep(nextStep);
  }

  function handleTryAgain() {
    tryAgain();
    goTo(3, 1);
  }

  const nextGate: Record<number, boolean> = {
    1: state.serverSeedHash === null,
    2: false,
    3: state.outcome === null,
    4: true,
  };

  return (
    <div ref={scrollRootRef} style={{ display: "contents" }}>
      <AppHeader disclaimerCollapsed={disclaimerCollapsed} />
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="overview"
            className={styles.viewport}
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Overview onStart={() => goTo(1, 1)} />
          </motion.div>
        ) : (
          <motion.div
            key="wizard"
            className={styles.viewport}
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <StepShell
              step={step}
              totalSteps={TOTAL_STEPS}
              title={STEP_TITLES[step - 1]}
              banner={<TrustTag companies={REAL_WORLD_EXAMPLES[step - 1].companies} />}
              footer={<RealWorldExample {...REAL_WORLD_EXAMPLES[step - 1]} />}
              direction={direction}
              onBack={() => goTo(step - 1, -1)}
              onNext={step < TOTAL_STEPS ? () => goTo(step + 1, 1) : undefined}
              nextDisabled={nextGate[step]}
              hideNext={step === TOTAL_STEPS}
            >
              {step === 1 && <Step1Commitment serverSeedHash={state.serverSeedHash} />}
              {step === 2 && (
                <Step2UserInput clientSeed={state.clientSeed} nonce={state.nonce} onClientSeedChange={setClientSeed} />
              )}
              {step === 3 && (
                <Step3DrawAndMap
                  table={state.dropTable}
                  phase={state.phase}
                  outcome={state.outcome}
                  onOpenBox={openBox}
                />
              )}
              {step === 4 && (
                <Step4RevealVerify
                  serverSeed={state.serverSeed}
                  serverSeedHash={state.serverSeedHash}
                  clientSeed={state.clientSeed}
                  nonce={state.nonce}
                  dropTable={state.dropTable}
                  outcome={state.outcome}
                  phase={state.phase}
                  verifyResult={state.verifyResult}
                  onVerify={verify}
                  onTryAgain={handleTryAgain}
                  onFinish={onFinish}
                />
              )}
            </StepShell>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
