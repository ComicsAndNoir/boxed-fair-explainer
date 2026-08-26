import { motion } from "framer-motion";
import { CheckCircle2, Lock, Unlock } from "lucide-react";
import { popIn } from "../../styles/motion";
import styles from "./SealFingerprint.module.css";

export type SealState = "sealed" | "revealing" | "verified";

interface SealFingerprintProps {
  /** SHA-256 hash of the server seed — shown before the draw, unchanged after. */
  hash: string;
  state: SealState;
  /** Only shown once state is "revealing" or "verified". */
  serverSeed?: string | null;
}

function truncate(value: string, length = 20): string {
  return value.length > length ? `${value.slice(0, length)}…` : value;
}

export function SealFingerprint({ hash, state, serverSeed }: SealFingerprintProps) {
  const revealed = state === "revealing" || state === "verified";

  return (
    <div className={styles.wrapper}>
      <motion.div
        className={`${styles.seal} ${state === "verified" ? styles.sealVerified : ""}`}
        variants={popIn}
        initial="hidden"
        animate="visible"
      >
        {state === "sealed" && <Lock size={28} color="var(--color-accent-primary-glow)" aria-hidden />}
        {state === "revealing" && <Unlock size={28} color="var(--color-accent-primary-glow)" aria-hidden />}
        {state === "verified" && <CheckCircle2 size={28} color="var(--color-accent-secondary)" aria-hidden />}
      </motion.div>

      <div>
        <div className={styles.hashLabel}>{revealed ? "Sealed fingerprint (still matches)" : "Sealed fingerprint"}</div>
        <div className={styles.hashValue}>{truncate(hash)}</div>
      </div>

      {revealed && serverSeed && (
        <div>
          <div className={styles.hashLabel}>What was inside</div>
          <div className={styles.hashValue}>{truncate(serverSeed)}</div>
        </div>
      )}

      {state === "verified" && (
        <span className={styles.matchBadge}>
          <CheckCircle2 size={16} aria-hidden /> Seal matches — nothing was swapped
        </span>
      )}
    </div>
  );
}
