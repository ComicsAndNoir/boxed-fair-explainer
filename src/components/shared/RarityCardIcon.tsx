import { Circle, Crown, Gem, Sparkles, type LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import type { Rarity } from "../../domain/types";
import styles from "./RarityCardIcon.module.css";

const RARITY_META: Record<Rarity, { label: string; icon: LucideIcon; tokenVar: string }> = {
  common: { label: "Common", icon: Circle, tokenVar: "--color-rarity-common" },
  uncommon: { label: "Uncommon", icon: Sparkles, tokenVar: "--color-rarity-uncommon" },
  rare: { label: "Rare", icon: Gem, tokenVar: "--color-rarity-rare" },
  jackpot: { label: "Jackpot", icon: Crown, tokenVar: "--color-rarity-jackpot" },
};

interface RarityCardIconProps {
  rarity: Rarity;
  name: string;
  iconSize?: number;
}

/**
 * Rarity is always communicated as color + icon + text together, never
 * color alone (requirements Section 7 accessibility rule).
 */
export function RarityCardIcon({ rarity, name, iconSize = 24 }: RarityCardIconProps) {
  const meta = RARITY_META[rarity];
  const Icon = meta.icon;
  return (
    <div className={styles.card} style={{ "--rarity-color": `var(${meta.tokenVar})` } as CSSProperties}>
      <div className={styles.swatch}>
        <Icon size={iconSize} color={`var(${meta.tokenVar})`} strokeWidth={2} aria-hidden />
      </div>
      <span className={styles.name}>{name}</span>
      <span className={styles.rarityLabel}>{meta.label}</span>
    </div>
  );
}

export { RARITY_META };
