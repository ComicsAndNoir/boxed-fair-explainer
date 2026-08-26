import { useJargonToggle } from "../../hooks/jargonToggleContext";
import styles from "./JargonToggle.module.css";

export function JargonToggle() {
  const { showJargon, setShowJargon } = useJargonToggle();

  return (
    <div className={styles.wrapper}>
      <span className={styles.label} id="jargon-toggle-label">
        Show the technical terms
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={showJargon}
        aria-labelledby="jargon-toggle-label"
        className={`${styles.switch} ${showJargon ? styles.switchOn : ""}`}
        onClick={() => setShowJargon(!showJargon)}
      >
        <span className={`${styles.knob} ${showJargon ? styles.knobOn : ""}`} />
      </button>
    </div>
  );
}
