import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useId, useState, type ReactNode } from "react";
import { useJargonToggle } from "../../hooks/jargonToggleContext";
import { trackEvent } from "../../lib/analytics";
import { revealVariants } from "../../styles/motion";
import styles from "./InfoReveal.module.css";

interface InfoRevealProps {
  /** Plain-language trigger, e.g. "Why can't the site cheat here?" */
  label: string;
  /** Plain-language explanation — the primary content, always shown when open. */
  children: ReactNode;
  /** The real technical term, shown only when the jargon toggle is on. */
  jargonTerm?: string;
  jargonExplanation?: string;
}

/**
 * Per-element "click to understand more" affordance. The jargon block inside
 * is gated by the global toggle, independent of whether this reveal itself
 * is open — so a curious user can open ten of these before ever seeing a
 * technical term.
 */
export function InfoReveal({ label, children, jargonTerm, jargonExplanation }: InfoRevealProps) {
  const [open, setOpen] = useState(false);
  const { showJargon } = useJargonToggle();
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
          trackEvent("expand_info", { label, expanded: next });
          setOpen(next);
        }}
      >
        <span>{label}</span>
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
              {children}
              {showJargon && jargonTerm && (
                <div className={styles.jargon}>
                  <div className={styles.jargonTerm}>The industry calls this: {jargonTerm}</div>
                  {jargonExplanation && <p>{jargonExplanation}</p>}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
