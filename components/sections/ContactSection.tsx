import { personalInfo } from "@/data/portfolioData";
import CopyEmail from "@/components/CopyEmail";
import Eyebrow from "@/components/atoms/Eyebrow";
import Tile from "@/components/molecules/Tile";
import styles from "./sections.module.css";

/** Section: how to reach him, each way showing the actual address or handle. Then the close. */
export default function ContactSection() {
  const { contact, availability, name } = personalInfo;
  return (
    <section className={styles.section} id="contact" aria-labelledby="contact-title">
      <div className={styles.wrap}>
        <Eyebrow>06</Eyebrow>
        <h2 className={styles.contactTitle} id="contact-title">
          Let&apos;s build something together.
        </h2>
        <p className={`${styles.lede} ${styles.contactLede}`}>{availability.detail}</p>

        <ul className={styles.grid}>
          <li className={styles.c6}>
            <Tile className={styles.emailTile}>
              <Eyebrow as="span">Email</Eyebrow>
              <span className={styles.emailRow}>
                <a className={`${styles.contactValue} ${styles.emailLink}`} href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
                <CopyEmail email={contact.email} />
              </span>
            </Tile>
          </li>
          <li className={styles.c6}>
            <Tile href={contact.resume}>
              <Eyebrow as="span">Resume</Eyebrow>
              <span className={styles.contactValue}>View resume ↗</span>
            </Tile>
          </li>
          <li className={`${styles.c6} ${styles.half}`}>
            <Tile href={contact.github.url}>
              <Eyebrow as="span">GitHub</Eyebrow>
              <span className={styles.contactValue}>{contact.github.handle} ↗</span>
            </Tile>
          </li>
          <li className={`${styles.c6} ${styles.half}`}>
            <Tile href={contact.linkedin.url}>
              <Eyebrow as="span">LinkedIn</Eyebrow>
              <span className={styles.contactValue}>{contact.linkedin.handle} ↗</span>
            </Tile>
          </li>
        </ul>

        <div className={styles.close}>
          <span className={styles.closeSphere} aria-hidden="true" />
          <p className={styles.closeLine}>It opened at the start. It closes here.</p>
        </div>

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
