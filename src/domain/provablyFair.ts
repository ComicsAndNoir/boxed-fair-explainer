import { mapFractionToEntry } from "./dropTable";
import type { CommitmentState, DropTableEntry, DrawOutcome } from "./types";

/**
 * Pure, framework-free provably-fair math. Every function here is called
 * twice in the real flow — once to draw, once to verify — with identical
 * inputs producing identical outputs. Nothing here is faked or memoized
 * across those two calls; they're two genuine executions.
 */

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes.buffer);
}

/** The site's secret, committed value ("what's sealed in the envelope"). */
export function generateServerSeed(): string {
  return randomHex(32);
}

/** A default suggestion the user can edit — their "ingredient." */
export function generateClientSeedSuggestion(): string {
  return randomHex(8);
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(digest);
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  const keyData = new TextEncoder().encode(secret);
  return crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return bytesToHex(signature);
}

/**
 * Converts the leading 13 hex chars (52 bits) of a hash into a [0, 1) float.
 * 52 bits stays within Number.MAX_SAFE_INTEGER so the division is exact.
 */
export function hexToFraction(hex: string): number {
  const slice = hex.slice(0, 13);
  const intValue = parseInt(slice, 16);
  const maxValue = Math.pow(16, slice.length);
  return intValue / maxValue;
}

/** Step 1: the site secretly decides its value and shows the sealed hash. */
export async function commitServerSeed(): Promise<CommitmentState> {
  const serverSeed = generateServerSeed();
  const serverSeedHash = await sha256Hex(serverSeed);
  return { serverSeed, serverSeedHash };
}

export interface DrawInputs {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
}

/** Step 3: blend the sealed value + the user's ingredient into an outcome. */
export async function deriveDrawResult(inputs: DrawInputs, table: DropTableEntry[]): Promise<DrawOutcome> {
  const message = `${inputs.clientSeed}:${inputs.nonce}`;
  const hmac = await hmacSha256Hex(inputs.serverSeed, message);
  const resultFraction = hexToFraction(hmac);
  const entry = mapFractionToEntry(resultFraction, table);
  return { entry, resultFraction };
}

/** Step 4: confirm the revealed seed matches the hash shown up front. */
export async function verifyCommitment(serverSeed: string, expectedHash: string): Promise<boolean> {
  const actualHash = await sha256Hex(serverSeed);
  return actualHash === expectedHash;
}
