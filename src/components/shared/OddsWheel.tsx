import { motion, useReducedMotion } from "framer-motion";
import type { DropTableEntry } from "../../domain/types";
import { RARITY_META } from "./RarityCardIcon";
import styles from "./OddsWheel.module.css";

interface OddsWheelProps {
  table: DropTableEntry[];
  /** [0, 1) — the real computed result. Pointer travels here, nowhere else. */
  resultFraction: number | null;
}

/**
 * A proportional "ruler" — each card gets a slice sized by its odds. The
 * pointer's landing position IS the actual math result (see
 * ARCHITECTURE.md §3), never a separately-randomized animation.
 */
export function OddsWheel({ table, resultFraction }: OddsWheelProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        {table.map((entry) => {
          const widthPercent = entry.oddsPercent;
          const color = `var(${RARITY_META[entry.rarity].tokenVar})`;
          return (
            <div
              key={entry.id}
              className={styles.segment}
              style={{ width: `${widthPercent}%`, background: color }}
              aria-hidden
            />
          );
        })}

        {resultFraction !== null && (
          <motion.div
            className={styles.pointer}
            initial={{ left: "0%" }}
            animate={{ left: `${resultFraction * 100}%` }}
            transition={
              prefersReducedMotion
                ? { duration: 0.01 }
                : { type: "spring", stiffness: 90, damping: 14, mass: 0.6 }
            }
          />
        )}
      </div>

      <div className={styles.legend}>
        {table.map((entry) => (
          <span key={entry.id} className={styles.legendItem}>
            <span
              className={styles.legendSwatch}
              style={{ background: `var(${RARITY_META[entry.rarity].tokenVar})` }}
              aria-hidden
            />
            {entry.name} · {entry.oddsPercent.toFixed(2)}%
          </span>
        ))}
      </div>
    </div>
  );
}
