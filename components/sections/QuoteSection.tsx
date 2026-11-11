import { personalInfo } from "@/data/portfolioData";
import QuotePlot from "@/components/organisms/QuotePlot/QuotePlot";
import SectionHead from "@/components/molecules/SectionHead";
import Tile from "@/components/molecules/Tile";
import styles from "./sections.module.css";

/** Section: his quote, the graph that shows it, the formula behind it, and what is metaphor. */
export default function QuoteSection() {
  const { quote } = personalInfo;
  return (
    <section className={styles.section} id="quote" aria-labelledby="quote-title">
      <div className={styles.wrap}>
        <SectionHead eyebrow="04" title="My quote" id="quote-title" />

        <blockquote className={`${styles.quote} ${styles.quoteWide}`}>{quote.text}</blockquote>

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
