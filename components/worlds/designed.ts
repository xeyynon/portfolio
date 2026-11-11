/**
 * Which projects have a page designed for them (their own world, hero and
 * exhibits). The rest still open on the single shared template. A plain list
 * with no imports, so anything can ask where a project's page lives.
 */
export const DESIGNED = [
  // "tarang", "dhara": their pages are not open yet (PAGELESS_PROJECTS in data/portfolioData.ts); the worlds are kept.
  "orca",
  "surrag",
  "lifi-data-transmission-system",
  "human-presence-detection",
  "ecox-industrial-safety",
  "flowiq",
  "telegram-drive",
  "smart-water-quality",
  "isocode-knitwear",
  "dukaan-dost",
  "kindofui",
] as const;

export type DesignedSlug = (typeof DESIGNED)[number];

export const isDesigned = (slug: string): slug is DesignedSlug => (DESIGNED as readonly string[]).includes(slug);

/** Where a project opens: its designed page if it has one, the shared template if not. */
export const projectHref = (slug: string) => `/projects/${slug}`;
