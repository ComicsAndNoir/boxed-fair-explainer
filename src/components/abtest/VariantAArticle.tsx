import { ArrowRight } from "lucide-react";
import { EXISTING_EXPLAINER } from "../../domain/existingExplainerContent";
import styles from "./VariantAArticle.module.css";

interface VariantAArticleProps {
  onFinish: () => void;
}

/**
 * Variant A of the A/B test — a faithful reproduction of Boxed's real,
 * current Help Center article (see domain/existingExplainerContent.ts for
 * provenance). Deliberately plain: no animation, no jargon toggle, no
 * illustrative-model disclaimer — none of that is part of the real article,
 * and adding it would make this an unfair comparison.
 */
export function VariantAArticle({ onFinish }: VariantAArticleProps) {
  const content = EXISTING_EXPLAINER;

  return (
    <div className={styles.wrapper}>
      <article className={styles.article}>
        <p className={styles.sourceNote}>Reproduced from Boxed.GG's Help Center, as published today.</p>

        <header>
          <h1 className={styles.title}>{content.title}</h1>
          <p className={styles.subtitle}>{content.subtitle}</p>
        </header>

        <p className={styles.paragraph}>{content.intro}</p>

        <div className={styles.tldrBlock}>
          <div className={styles.tldrLabel}>TL;DR</div>
          <p className={styles.paragraph}>{content.tldr}</p>
        </div>

        <section>
          <h2 className={styles.sectionHeading}>What provably fair means</h2>
          {content.whatItMeans.map((p) => (
            <p className={styles.paragraph} key={p}>
              {p}
            </p>
          ))}
        </section>

        <section>
          <h2 className={styles.sectionHeading}>How it works</h2>
          {content.howItWorksIntro.map((p) => (
            <p className={styles.paragraph} key={p}>
              {p}
            </p>
          ))}
          {content.values.map((v) => (
            <div key={v.heading}>
              <h3 className={styles.subHeading}>{v.heading}</h3>
              <p className={styles.paragraph}>{v.text}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className={styles.sectionHeading}>Putting it together</h2>
          <p className={styles.paragraph}>{content.puttingItTogether}</p>
        </section>

        <section>
          <h2 className={styles.sectionHeading}>How to verify an outcome</h2>
          {content.verifySteps.map((s) => (
            <div key={s.title}>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.paragraph}>{s.text}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className={styles.sectionHeading}>Common questions</h2>
          {content.faq.map((item) => (
            <div key={item.question}>
              <h3 className={styles.faqQuestion}>{item.question}</h3>
              <p className={styles.paragraph}>{item.answer}</p>
            </div>
          ))}
        </section>

        <div className={styles.continueRow}>
          <button type="button" className={styles.continueButton} onClick={onFinish}>
            Continue to survey <ArrowRight size={16} aria-hidden style={{ verticalAlign: "-2px" }} />
          </button>
        </div>
      </article>
    </div>
  );
}
