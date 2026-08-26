import { Shuffle } from "lucide-react";
import { generateClientSeedSuggestion } from "../../domain/provablyFair";
import { trackEvent } from "../../lib/analytics";
import { InfoReveal } from "../shared/InfoReveal";
import styles from "./WizardSteps.module.css";

interface Step2UserInputProps {
  clientSeed: string;
  nonce: number;
  onClientSeedChange: (value: string) => void;
}

export function Step2UserInput({ clientSeed, nonce, onClientSeedChange }: Step2UserInputProps) {
  return (
    <>
      <p className={styles.lede}>
        Now <strong>you</strong> add your own ingredient — something the site doesn't control and can't predict.
        Because your input gets mixed in, the site couldn't have pre-arranged a bad result for you.
      </p>

      <div className={styles.visualArea}>
        <div className={styles.fieldRow} style={{ width: "100%", maxWidth: 360 }}>
          <input
            className={styles.textInput}
            value={clientSeed}
            onChange={(e) => onClientSeedChange(e.target.value)}
            aria-label="Your ingredient"
            spellCheck={false}
          />
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => {
              trackEvent("shuffle_client_seed");
              onClientSeedChange(generateClientSeedSuggestion());
            }}
            aria-label="Shuffle a new random ingredient"
          >
            <Shuffle size={18} aria-hidden />
          </button>
        </div>
      </div>

      <span className={styles.counter}>
        This is draw <span className={styles.counterValue}>#{nonce}</span> — every draw gets its own counter so no
        two are ever mixed the same way.
      </span>

      <div className={styles.revealGroup}>
        <InfoReveal
          label="What's actually going into the mix?"
          jargonTerm="client seed, nonce & salt"
          jargonExplanation="Client seed: your value, editable. Nonce: the draw counter shown above. Salt: extra randomness the site adds on top — all three get combined with the sealed value before hashing."
        >
          <p>
            You can type anything here, or shuffle for a random suggestion — it's yours either way. The site also
            adds a small counter (which draw this is) and a bit of its own extra randomness, but your ingredient is
            the part it can't see coming.
          </p>
        </InfoReveal>
      </div>
    </>
  );
}
