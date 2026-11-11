import type { Metadata } from "next";
import { personalInfo } from "@/data/portfolioData";
import SiteNav, { type NavItem } from "@/components/organisms/SiteNav/SiteNav";
import SphereOpening from "@/components/organisms/SphereOpening/SphereOpening";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import DoingSection from "@/components/sections/DoingSection";
import JourneySection from "@/components/sections/JourneySection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import QuoteSection from "@/components/sections/QuoteSection";
import styles from "./home.module.css";

// The redesigned home page (MD/redesign_plan.md, section 0), built beside the
// current one so it can be judged before it replaces it. Not linked from the
// site and kept out of search results.
export const metadata: Metadata = {
  title: "Lab · Home",
  robots: { index: false, follow: false },
};

// The owner's order (2026-11-11). The opening has no link: the mark goes there.
const NAV: NavItem[] = [
  { href: "#about", label: "About" },
  { href: "#doing", label: "Now" },
  { href: "#projects", label: "Projects" },
  { href: "#quote", label: "Quote" },
  { href: "#journey", label: "Journey" },
  { href: "#contact", label: "Contact" },
];

export default function RedesignHomePage() {
  const initials = personalInfo.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <div className={styles.home} id="top" data-redesign-home>
      <SiteNav mark={initials} items={NAV} />
      <SphereOpening
        name={personalInfo.name.toUpperCase()}
        motto={personalInfo.motto.text}
        mottoBy={personalInfo.motto.by}
      />
      <AboutSection />
      <DoingSection />
      <ProjectsSection />
      <QuoteSection />
      <JourneySection />
      <ContactSection />
    </div>
  );
}
