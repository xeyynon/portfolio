import { journey, otherRoles, personalInfo, together } from "@/data/portfolioData";
import GroupPhoto from "@/components/organisms/GroupPhoto/GroupPhoto";
import JourneyWave, { type Story } from "@/components/organisms/JourneyWave/JourneyWave";
import SectionHead from "@/components/molecules/SectionHead";
import styles from "./sections.module.css";

/** Section: the journey as a wave, with his father's sentence running through it. */
export default function JourneySection() {
  const { motto, education } = personalInfo;
  const vectr = otherRoles.find((r) => r.org === "Vectr");

  // The stops that open into a card of their own. Every line in them is
  // already stated in the content file; the photo arrives from the owner.
  const stories: Record<"vectr" | "vit-ap", Story> = {
    vectr: {
      title: "Vectr",
      content: (
        <>
          {vectr && (
            <p className={styles.storyLead}>
              {vectr.role}. {vectr.note} <span className={styles.storyWhen}>{vectr.range}</span>
            </p>
          )}
          <p className={styles.storyLine}>Semi Finalist, Smart India Hackathon 2024, with Vectr.</p>
          <GroupPhoto together={together} />
        </>
      ),
    },
    "vit-ap": {
      title: education.school,
      content: (
        <>
          <p className={styles.storyLead}>
            {education.degree} <span className={styles.storyWhen}>{education.years}</span>
          </p>
          <p className={styles.storyLine}>More from these years will be pinned here soon.</p>
        </>
      ),
    },
  };

  return (
    <section className={styles.section} id="journey" aria-labelledby="journey-title">
      <div className={styles.wrap}>
        <SectionHead eyebrow="04" title="My journey" id="journey-title" />
        <p className={styles.mottoLine}>
          <span className={styles.mottoText}>&ldquo;{motto.text}&rdquo;</span> A sentence from {motto.by}, at every
          point on this line.
        </p>

        <JourneyWave points={journey} stories={stories} />
      </div>
    </section>
  );
}
