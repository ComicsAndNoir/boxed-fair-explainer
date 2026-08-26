import { BadgeCheck } from "lucide-react";
import { Fragment } from "react";
import { CompanyName } from "./RealWorldExample";
import styles from "./TrustTag.module.css";

interface TrustTagProps {
  /** e.g. ["DocuSign"] or ["Visa", "Mastercard"] */
  companies: string[];
}

/**
 * A compact teaser shown above the step heading — names the institution
 * without explaining the mechanism, since that comparison only makes sense
 * once the reader has seen the step's own explanation. The full explanation
 * and source link live in the matching `RealWorldExample` card below it.
 */
export function TrustTag({ companies }: TrustTagProps) {
  return (
    <span className={styles.tag}>
      <BadgeCheck size={14} className={styles.icon} aria-hidden />
      Verified real-world use:{" "}
      {companies.map((company, i) => (
        <Fragment key={company}>
          <CompanyName>{company}</CompanyName>
          {i < companies.length - 1 && " & "}
        </Fragment>
      ))}
    </span>
  );
}
