import { SealFingerprint } from "../shared/SealFingerprint";
import { InfoReveal } from "../shared/InfoReveal";
import styles from "./WizardSteps.module.css";

interface Step1CommitmentProps {
  serverSeedHash: string | null;
}

export function Step1Commitment({ serverSeedHash }: Step1CommitmentProps) {
  return (
    <>
      <p className={styles.lede}>
        Before you open a box, the site secretly decides the randomness it will use — then shows you a{" "}
        <strong>sealed, tamper-proof fingerprint</strong> of it, right now, before anything else happens.
      </p>

      <div className={styles.visualArea}>
        {serverSeedHash ? (
          <SealFingerprint hash={serverSeedHash} state="sealed" />
        ) : (
          <span className={styles.lede}>Sealing…</span>
        )}
      </div>

      <div className={styles.revealGroup}>
        <InfoReveal
          label="Why can't the site change its mind later?"
          jargonTerm="server seed hash"
          jargonExplanation="A SHA-256 hash of the secret server seed, published before the draw so the seed itself can be checked against it afterward."
        >
          <p>
            The seal is like a wax stamp on an envelope — it's a unique fingerprint of whatever's sealed inside. If
            the site swapped what's inside after showing you this, the fingerprint would change and you'd catch it.
            Because you saw the fingerprint <strong>before</strong> your box opened, the site was already locked in.
          </p>
        </InfoReveal>
      </div>
    </>
  );
}
