import { personalInfo, skills } from "@/data/portfolioData";
import SiteNav, { type NavItem } from "@/components/organisms/SiteNav/SiteNav";
import SphereOpening from "@/components/organisms/SphereOpening/SphereOpening";
import AboutSection from "@/components/sections/AboutSection";
import AmbientWaves from "@/components/organisms/AmbientWaves/AmbientWaves";
import HashLanding from "@/components/organisms/HashLanding/HashLanding";
import SnitchFlight from "@/components/organisms/SnitchFlight/SnitchFlight";
import StoneFlight from "@/components/organisms/StoneFlight/StoneFlight";
import ContactSection, {
  LANDING_ID,
} from "@/components/sections/ContactSection";
import DoingSection from "@/components/sections/DoingSection";
import JourneySection from "@/components/sections/JourneySection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import QuoteSection from "@/components/sections/QuoteSection";
import { buildCommands } from "@/lib/commands";
import styles from "./home.module.css";

// The owner's order (2026-11-11). The opening has no link: the mark goes there.
const NAV: NavItem[] = [
  { href: "#about", label: "About" },
  { href: "#doing", label: "Now" },
  { href: "#projects", label: "Projects" },
  { href: "#quote", label: "Quote" },
  { href: "#journey", label: "Journey" },
  { href: "#contact", label: "Contact" },
];

export default function HomePage() {
  const initials = personalInfo.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  const areas = skills.map(({ label, color }) => ({ label, color }));

  return (
    <div className={styles.home} id="top" data-redesign>
      <SiteNav
        mark={initials}
        items={NAV}
        areas={areas}
        commands={buildCommands("/")}
      />
      <main id="main">
        <SphereOpening
          name={personalInfo.name.toUpperCase()}
          motto={personalInfo.motto.text}
          mottoBy={personalInfo.motto.by}
          areas={areas}
        />
        {/* The opening's waves carry on, quietly, behind About to Projects. */}
        <div className={styles.waveZone}>
          <AmbientWaves
            openingSelector="[data-opening]"
            colors={areas.map((a) => a.color)}
          />
          <AboutSection />
          <DoingSection />
          <ProjectsSection />
        </div>
        <QuoteSection />
        <JourneySection />
        <ContactSection />
      </main>
      <SnitchFlight openingSelector="[data-opening]" landingId={LANDING_ID} />
      <StoneFlight openingSelector="[data-opening]" />
      <HashLanding />
    </div>
  );
}
