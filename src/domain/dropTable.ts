import type { DropTableEntry } from "./types";

/**
 * Sample drop table — requirements doc Section 8, "Starter Slab Box."
 * Odds sum to 100.00%.
 */
export const STARTER_SLAB_BOX: DropTableEntry[] = [
  { id: "common-trainer", name: "Common Trainer", rarity: "common", oddsPercent: 70, gemValue: 20 },
  { id: "foil-sidekick", name: "Foil Sidekick", rarity: "uncommon", oddsPercent: 22, gemValue: 120 },
  { id: "holo-champion", name: "Holo Champion", rarity: "rare", oddsPercent: 7, gemValue: 900 },
  { id: "graded-legend", name: "Graded Legend (1-of-few)", rarity: "jackpot", oddsPercent: 1, gemValue: 25000 },
];

export const STARTER_SLAB_BOX_PRICE_GEMS = 250;

/**
 * Maps a [0, 1) fraction onto the drop table using cumulative odds ranges,
 * in table order. Same function is called at draw time and again at verify
 * time — if the inputs match, the outcome always matches.
 */
export function mapFractionToEntry(fraction: number, table: DropTableEntry[]): DropTableEntry {
  let cumulative = 0;
  for (const entry of table) {
    cumulative += entry.oddsPercent / 100;
    if (fraction < cumulative) return entry;
  }
  return table[table.length - 1];
}

export interface DropRange {
  entry: DropTableEntry;
  /** [0, 1) cumulative range this entry occupies. */
  low: number;
  high: number;
}

/** The same cumulative walk mapFractionToEntry does, but returning every entry's range for display. */
export function computeCumulativeRanges(table: DropTableEntry[]): DropRange[] {
  let cumulative = 0;
  return table.map((entry) => {
    const low = cumulative;
    cumulative += entry.oddsPercent / 100;
    return { entry, low, high: cumulative };
  });
}
