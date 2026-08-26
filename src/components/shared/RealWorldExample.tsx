import { ExternalLink, Landmark } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./RealWorldExample.module.css";

interface RealWorldExampleProps {
  /** Plain-language description of the real institution/use — wrap company names in <CompanyName>. */
  description: ReactNode;
  href: string;
  linkLabel: string;
}

/** Wrap an institution's name in this wherever it appears in a description, to draw the eye. */
export function CompanyName({ children }: { children: ReactNode }) {
  return <strong className={styles.companyName}>{children}</strong>;
}

/**
 * A verified, sourced real-world example of the underlying cryptographic
 * primitive in use by a known institution — not a claim that the institution
 * runs this exact card-draw scheme. Every href here has been fetched and
 * confirmed to say what the copy claims (see ARCHITECTURE.md §5.5).
 */
export function RealWorldExample({ description, href, linkLabel }: RealWorldExampleProps) {
  return (
    <div className={styles.wrapper}>
      <Landmark size={18} className={styles.icon} aria-hidden />
      <div className={styles.body}>
        <span className={styles.label}>Already trusted, every day</span>
        <p className={styles.desc}>{description}</p>
        <a className={styles.link} href={href} target="_blank" rel="noopener noreferrer">
          {linkLabel} <ExternalLink size={13} aria-hidden />
        </a>
      </div>
    </div>
  );
}
