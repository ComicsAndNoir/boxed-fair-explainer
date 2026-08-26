import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import { revealVariants } from "../../styles/motion";
import { JargonToggle } from "../shared/JargonToggle";
import styles from "./AppHeader.module.css";

interface AppHeaderProps {
  /** On mobile, collapse the disclaimer while scrolled away from the top to reclaim space. */
  disclaimerCollapsed?: boolean;
}

/**
 * The illustrative-model disclaimer (requirements Section 4/6) — always
 * reachable, never hidden behind the jargon toggle or a step boundary. It
 * does collapse on mobile scroll (see VariantBExplainer's scroll listener)
 * and reappear at the top — still persistent, just space-conscious.
 */
export function AppHeader({ disclaimerCollapsed = false }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <span className={styles.title}>How Boxed Keeps It Fair</span>
        <JargonToggle />
      </div>
      <AnimatePresence initial={false}>
        {!disclaimerCollapsed && (
          <motion.div
            key="disclaimer"
            variants={revealVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            style={{ overflow: "hidden" }}
          >
            <div className={styles.disclaimer}>
              <Info size={16} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
              <span>
                <strong>Illustrative example</strong> using the industry-standard provably-fair method — the real
                system follows the same principle, this isn't Boxed's exact implementation.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
