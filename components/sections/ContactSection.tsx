import { personalInfo } from "@/data/portfolioData";
import CopyEmail from "@/components/CopyEmail";
import SnitchMark from "@/components/atoms/SnitchMark";
import Eyebrow from "@/components/atoms/Eyebrow";
import styles from "./sections.module.css";

/** The landing spot's id, shared with the flight that ends there. */
export const LANDING_ID = "snitch-landing";

/** Section: how to reach him, each way showing the actual address or handle. Then the close. */
export default function ContactSection() {
  const { contact, availability, name } = personalInfo;
  return (
    <section className={styles.section} id="contact" aria-labelledby="contact-title">
      {/* The close is one centred column, on the same axis as the Snitch that lands below. */}
      <div className={`${styles.wrap} ${styles.contactWrap}`}>
        <Eyebrow>05</Eyebrow>
        <h2 className={styles.contactTitle} id="contact-title">
          Let&apos;s build something together.
        </h2>
        <p className={`${styles.lede} ${styles.contactLede}`}>{availability.detail}</p>

        {/* Each way to reach him as a chip as wide as what it says. */}
        <ul className={styles.reach}>
          <li className={`${styles.chip} ${styles.chipEmail}`}>
            <span className={styles.chipLabel}>Email</span>
            <a className={`${styles.chipValue} ${styles.emailLink}`} href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
            <CopyEmail email={contact.email} />
          </li>
          {contact.showResume && (
            <li>
              <a className={styles.chip} href={contact.resume} target="_blank" rel="noopener noreferrer">
                <span className={styles.chipLabel}>Resume</span>
                <span className={styles.chipValue}>View resume ↗</span>
              </a>
            </li>
          )}
          <li>
            <a className={styles.chip} href={contact.github.url} target="_blank" rel="noopener noreferrer">
              <span className={styles.chipLabel}>GitHub</span>
              <span className={styles.chipValue}>{contact.github.handle} ↗</span>
            </a>
          </li>
          <li>
            <a className={styles.chip} href={contact.linkedin.url} target="_blank" rel="noopener noreferrer">
              <span className={styles.chipLabel}>LinkedIn</span>
              <span className={styles.chipValue}>{contact.linkedin.handle} ↗</span>
            </a>
          </li>
        </ul>

        {/* Where the small Snitch lands and opens. A plain link to his email:
            it works with no script, and the flight is only the way it arrives. */}
        <a className={styles.landing} id={LANDING_ID} href={`mailto:${contact.email}`}>
          <SnitchMark open className={styles.landingMark} />
          <span className={styles.landingSmall}>It opens at the close</span>
          <span className={styles.landingBig}>
            Write to me <span aria-hidden="true">→</span>
          </span>
        </a>

        <footer className={styles.footer}>
          <span>© 2026 {name.toUpperCase()}</span>
          <a className={styles.emailLink} href="#top">
            Back to the top ↑
          </a>
        </footer>
      </div>
    </section>
  );
}
