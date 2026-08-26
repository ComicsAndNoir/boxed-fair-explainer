import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Lock, PieChart, Shuffle, type LucideIcon } from "lucide-react";
import { Fragment } from "react";
import { popIn } from "../../styles/motion";
import styles from "./Overview.module.css";

interface Stage {
  label: string;
  desc: string;
  icon: LucideIcon;
}

const STAGES: Stage[] = [
  { label: "It seals its answer", desc: "Before you play, locked in and shown to you", icon: Lock },
  { label: "You add your ingredient", desc: "Something the site can't predict", icon: Shuffle },
  { label: "The mix decides your card", desc: "On odds you saw up front", icon: PieChart },
  { label: "You check it yourself", desc: "Re-run it and get the same result", icon: CheckCircle2 },
];

/** Household names, verified per-step in ARCHITECTURE.md §5.6 — not an implied partnership. */
const TRUSTED_BY = ["DocuSign", "Visa", "Mastercard", "Stripe"];

interface OverviewProps {
  onStart: () => void;
}

/** The landing screen — a visual preview of all four steps before diving in. */
export function Overview({ onStart }: OverviewProps) {
  return (
    <motion.div className={styles.wrapper} variants={popIn} initial="hidden" animate="visible">
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Learn exactly how we <br /><span>keep things fair</span>
        </h1>
        <p className={styles.heroSubtitle}>
          When you draw a card, it's backed by real inventory Boxed holds. You can have the physical card shipped 
          to you (free within the US) or sell it back for site credit.
        </p>
        <p className={styles.heroSubtitle}>
          <strong>Here's how we ensure the draw is fair, and how you can check.</strong>
        </p>
      </div>

      <div className={styles.stageRow}>
        <div className={styles.stageTrack}>
          {STAGES.map((stage, i) => (
            <Fragment key={stage.label}>
              <div className={styles.stageCard}>
                <span className={styles.stageNumber}>{i + 1}</span>
                <span className={styles.stageIcon}>
                  <stage.icon size={22} color="var(--color-accent-primary-glow)" aria-hidden />
                </span>
                <span className={styles.stageLabel}>{stage.label}</span>
                <span className={styles.stageDesc}>{stage.desc}</span>
              </div>
              {i < STAGES.length - 1 && <ArrowRight className={styles.connector} size={18} aria-hidden />}
            </Fragment>
          ))}
        </div>
      </div>

      <div className={styles.trustSection}>
        <span className={styles.trustHeading}>Not just theory — this exact cryptography already secures:</span>
        <div className={styles.trustRow}>
          {TRUSTED_BY.map((name) => (
            <span className={styles.trustBadge} key={name}>
              {name}
            </span>
          ))}
        </div>
        <span className={styles.trustHint}>
          Same techniques, different job — sourced links on each step below.
        </span>
      </div>

      <div className={styles.ctaArea}>
        <button type="button" className={styles.ctaButton} onClick={onStart}>
          Learn How It Works <ArrowRight size={18} aria-hidden />
        </button>
        <span className={styles.ctaHint}>Takes about a minute.</span>
      </div>
    </motion.div>
  );
}
