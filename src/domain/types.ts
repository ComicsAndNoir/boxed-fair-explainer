export type Rarity = "common" | "uncommon" | "rare" | "jackpot";

export interface DropTableEntry {
  id: string;
  name: string;
  rarity: Rarity;
  /** Percentage odds, e.g. 70 for 70.00% */
  oddsPercent: number;
  gemValue: number;
}

export interface DrawOutcome {
  entry: DropTableEntry;
  /** Normalized [0, 1) result the hash produced */
  resultFraction: number;
}

export interface CommitmentState {
  /** Kept secret client-side until the reveal step */
  serverSeed: string;
  /** SHA-256 of serverSeed, shown to the user before the draw ("the seal") */
  serverSeedHash: string;
}
