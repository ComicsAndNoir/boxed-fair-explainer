import type { DropTableEntry } from "../../domain/types";
import { RarityCardIcon } from "./RarityCardIcon";
import styles from "./OddsTable.module.css";

interface OddsTableProps {
  table: DropTableEntry[];
  highlightedId?: string | null;
}

/**
 * The published drop table, shown openly. Scrolls within its own container
 * on narrow viewports — the page itself never scrolls horizontally.
 */
export function OddsTable({ table, highlightedId }: OddsTableProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scrollArea}>
        <div className={styles.scrollTrack}>
          {table.map((entry) => (
            <div
              key={entry.id}
              className={styles.row}
              style={{
                outline: entry.id === highlightedId ? "2px solid var(--color-accent-primary-glow)" : undefined,
                borderRadius: "var(--radius-lg)",
              }}
            >
              <RarityCardIcon rarity={entry.rarity} name={entry.name} />
              <span className={styles.stat}>
                <span className={styles.statValue}>{entry.oddsPercent.toFixed(2)}%</span> odds
              </span>
              <span className={styles.stat}>
                <span className={styles.statValue}>{entry.gemValue.toLocaleString()}</span> gems
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
