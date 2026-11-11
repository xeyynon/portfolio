import Image from "next/image";
import { personalInfo, skills } from "@/data/portfolioData";
import CapDot from "@/components/atoms/CapDot";
import Eyebrow from "@/components/atoms/Eyebrow";
import FactTile from "@/components/molecules/FactTile";
import SectionHead from "@/components/molecules/SectionHead";
import Tile from "@/components/molecules/Tile";
import styles from "./sections.module.css";

/** Section: who he is, then the six areas he works in, each with its colour and its name. */
export default function AboutSection() {
  const { education, hometown } = personalInfo;
  return (
    <section className={styles.section} id="about" aria-labelledby="about-title">
      <div className={styles.wrap}>
        <SectionHead eyebrow="01" title="About me" id="about-title" />

        <div className={styles.grid}>
          <div className={`${styles.c4} ${styles.photo}`}>
            <Image
              src="/sources/myImage.jpg"
              alt="Surya Pratik speaking at a lectern"
              fill
              sizes="(max-width: 560px) 92vw, (max-width: 900px) 46vw, 360px"
              className={styles.photoImage}
            />
          </div>
          <div className={styles.c8}>
            <Tile className={styles.statement}>
              <p className={styles.headline}>{personalInfo.headline}</p>
              <p className={styles.lede}>{personalInfo.focus}</p>
              <p className={`${styles.lede} ${styles.muted}`}>{personalInfo.belief}</p>
            </Tile>
          </div>

          <div className={`${styles.c4} ${styles.half}`}>
            <FactTile label="Study" value={education.degree} note={`${education.school} · ${education.years}`} />
          </div>
          <div className={`${styles.c4} ${styles.half}`}>
            <FactTile label="CGPA" value={`${education.cgpa} / 10`} />
          </div>
          <div className={styles.c4}>
            <FactTile label="From" value={hometown.city} note={hometown.region} />
          </div>
        </div>

        <ul className={styles.grid} aria-labelledby="about-areas">
          <li className={styles.subhead}>
            <Eyebrow as="h3" id="about-areas">Six areas, one colour each</Eyebrow>
          </li>
          {skills.map((area) => (
            <li key={area.label} className={styles.c4}>
              <Tile>
                <h4 className={styles.capName}>
                  <CapDot color={area.color} />
                  {area.label}
                </h4>
                <ul className={styles.capItems}>
                  {area.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Tile>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
