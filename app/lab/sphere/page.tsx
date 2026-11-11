import type { Metadata } from "next";
import { personalInfo } from "@/data/portfolioData";
import SphereOpening from "@/components/organisms/SphereOpening/SphereOpening";
import styles from "./page.module.css";

// The sphere alone, with its readings, for judging it. Not part of the site:
// not linked from any page and kept out of search results.
export const metadata: Metadata = {
  title: "Lab · Sphere",
  robots: { index: false, follow: false },
};

export default function SphereLabPage() {
  return (
    <SphereOpening
      name={personalInfo.name.toUpperCase()}
      motto={personalInfo.motto.text}
      mottoBy={personalInfo.motto.by}
      showReadings
    >
      <section className={styles.card} aria-labelledby="lab-about">
        <p className={styles.eyebrow}>Prototype · what the sphere opens onto</p>
        <h2 className={styles.title} id="lab-about">About me</h2>
        <p className={styles.text}>
          This tile stands where the About me section will begin. Scroll back up and everything runs in reverse.
        </p>
      </section>
    </SphereOpening>
  );
}
