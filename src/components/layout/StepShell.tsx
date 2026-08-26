import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { stepVariants } from "../../styles/motion";
import styles from "./StepShell.module.css";

interface StepShellProps {
  step: number;
  totalSteps: number;
  title: string;
  /** Rendered above the heading, inside the same per-step transition — e.g. a compact trust teaser. */
  banner?: ReactNode;
  /** Rendered after children, inside the same per-step transition — e.g. the full trust/context detail. */
  footer?: ReactNode;
  direction: 1 | -1;
  onNext?: () => void;
  onBack?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  hideNext?: boolean;
  children: ReactNode;
}

export function StepShell({
  step,
  totalSteps,
  title,
  banner,
  footer,
  direction,
  onNext,
  onBack,
  nextDisabled,
  nextLabel = "Next",
  hideNext = false,
  children,
}: StepShellProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the new step's heading so screen-reader users get a clear
  // "you're on step N" cue without relying on the visual progress dots.
  useEffect(() => {
    // preventScroll: the heading is already in view right after a step
    // transition — without this, the browser's focus-scroll clips the
    // sticky header banner above it.
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  return (
    <div className={styles.shell}>
      <div className={styles.progress} role="tablist" aria-label="Walkthrough progress">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((dotStep) => (
          <span
            key={dotStep}
            role="tab"
            aria-selected={dotStep === step}
            aria-label={`Step ${dotStep} of ${totalSteps}`}
            className={`${styles.dot} ${dotStep === step ? styles.dotActive : ""} ${
              dotStep < step ? styles.dotDone : ""
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className={styles.content}
        >
          {banner}
          <h2 className={styles.heading} tabIndex={-1} ref={headingRef}>
            {title}
          </h2>
          {children}
          {footer}
        </motion.div>
      </AnimatePresence>

      <div className={styles.nav}>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonSecondary}`}
          onClick={onBack}
          disabled={!onBack}
          style={{ visibility: onBack ? "visible" : "hidden" }}
        >
          Back
        </button>
        {!hideNext && (
          <button
            type="button"
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={onNext}
            disabled={nextDisabled}
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}
