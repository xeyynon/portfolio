import { personalInfo } from "@/data/portfolioData";
import QuotePlot from "@/components/organisms/QuotePlot/QuotePlot";
import Tile from "@/components/molecules/Tile";
import styles from "./sections.module.css";

/** Section: his quote, the graph that shows it, the formula behind it, and what is metaphor. */
export default function QuoteSection() {
  const { quote, name } = personalInfo;
  return (
    <section className={styles.section} id="quote" aria-label="My quote">
      <div className={styles.wrap}>
        {/* Set as a quotation, signed: no section title above it. */}
        <figure className={styles.quoteFigure}>
          <blockquote className={`${styles.quote} ${styles.quoteWide}`}>
            <p>&ldquo;{quote.text}&rdquo;</p>
          </blockquote>
          <figcaption className={styles.quoteBy}>{name}</figcaption>
        </figure>

        <div className={styles.grid}>
          <div className={styles.c8}>
            <QuotePlot />
          </div>
          <div className={styles.c4}>
            <Tile>
              <p className={styles.formula}>{quote.formula}</p>
              <p className={styles.proofText}>{quote.reason}</p>
              <p className={styles.proofNote}>{quote.note}</p>
            </Tile>
          </div>
        </div>
      </div>
    </section>
  );
}
