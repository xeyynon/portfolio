import type { ComponentType } from "react";

/**
 * A project's world: what is its own on its designed page. The chrome, the
 * fonts and the order of the facts are shared (components/organisms/ProjectPage);
 * a world brings its colours and texture, its hero, and the exhibits only this
 * project could have. A world may not change the fonts or reorder the facts.
 *
 * Each world lives in its own folder under components/worlds/<slug>/ and
 * exports one `world` from its index.ts.
 */
export type World = {
  /**
   * Class that sets the world's tokens and backdrop on the page. It must set
   * --world-bg (the page colour) and --world-accent (the one accent).
   */
  className: string;
  hero: { title: string; Component: ComponentType };
  exhibits: { title: string; Component: ComponentType }[];
};
