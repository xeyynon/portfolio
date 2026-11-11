import { personalInfo, projects, projectLabel } from "@/data/portfolioData";
import { projectHref } from "@/components/worlds/designed";

/**
 * What the command palette can do, built from the content file so it can
 * never offer a project or a link that does not exist. Pure: no React, no DOM.
 */
export type Command = {
  id: string;
  /** What is shown and what typing is matched against. */
  label: string;
  /** The kind of thing it is, shown beside it. */
  group: "Section" | "Project" | "Reach me";
  /** Where it goes. External addresses open in a new tab. */
  href?: string;
  /** Text to copy instead of going somewhere. */
  copy?: string;
};

const SECTIONS: [id: string, label: string][] = [
  ["top", "Opening"],
  ["about", "About me"],
  ["doing", "What I am doing"],
  ["projects", "My projects"],
  ["quote", "My quote"],
  ["journey", "My journey"],
  ["contact", "Contact"],
];

/** `home` is the address of the home page, so sections can be reached from any page. */
export function buildCommands(home: string): Command[] {
  const { contact } = personalInfo;
  return [
    ...SECTIONS.map(([id, label]): Command => ({ id: `section-${id}`, label, group: "Section", href: `${home}#${id}` })),
    ...projects.map((p): Command => ({ id: `project-${p.slug}`, label: projectLabel(p), group: "Project", href: projectHref(p.slug) })),
    { id: "copy-email", label: `Copy email address: ${contact.email}`, group: "Reach me", copy: contact.email },
    { id: "write-email", label: "Write me an email", group: "Reach me", href: `mailto:${contact.email}` },
    ...(contact.showResume ? [{ id: "resume", label: "Open my resume", group: "Reach me", href: contact.resume } as Command] : []),
    { id: "github", label: `GitHub: ${contact.github.handle}`, group: "Reach me", href: contact.github.url },
    { id: "linkedin", label: `LinkedIn: ${contact.linkedin.handle}`, group: "Reach me", href: contact.linkedin.url },
  ];
}

/** Commands whose label contains every word typed, in any order. An empty query keeps them all. */
export function matchCommands(commands: Command[], query: string): Command[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return commands;
  return commands.filter((c) => {
    const text = `${c.label} ${c.group}`.toLowerCase();
    return words.every((w) => text.includes(w));
  });
}
