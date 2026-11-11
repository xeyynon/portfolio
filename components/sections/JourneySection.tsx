import { journey, personalInfo } from "@/data/portfolioData";
import JourneyWave from "@/components/organisms/JourneyWave/JourneyWave";
import SectionHead from "@/components/molecules/SectionHead";
import styles from "./sections.module.css";

/** Section: the journey as a wave, with his father's sentence running through it. */
export default function JourneySection() {
  const { motto } = personalInfo;
  return (
    <section className={styles.section} id="journey" aria-labelledby="journey-title">
      <div className={styles.wrap}>
        <SectionHead eyebrow="05" title="My journey" id="journey-title" />
        <p className={styles.mottoLine}>
          <span className={styles.mottoText}>&ldquo;{motto.text}&rdquo;</span> A sentence from {motto.by}, at every
          point on this line.
        </p>
        <JourneyWave points={journey} />
      </div>
    </section>
  );
}
