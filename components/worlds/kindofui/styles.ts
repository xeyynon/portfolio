/**
 * The style sampler's choices. Pure data, no React, no DOM.
 *
 * Four styles drawn for this page to show the idea: the same small panel,
 * restyled. They are not the library's own code or its own entries; the page
 * says so. The library's count of styles (38) is from the project's notes.
 */

export const SAMPLE_STYLES = [
  { key: "flat", label: "Flat", note: "Solid fills, no depth: colour and spacing do all the work." },
  {
    key: "glass",
    label: "Glass",
    note: "A translucent pane with a light edge over a coloured backdrop. Here it is faked without a blur.",
  },
  { key: "brutalist", label: "Neo-brutalist", note: "Thick black outlines, hard offset shadows, loud flat colour." },
  { key: "soft", label: "Soft", note: "One surface colour, shaped only by a light and a dark shadow." },
] as const;

export type SampleStyle = (typeof SAMPLE_STYLES)[number]["key"];

/** The library's own count of visual styles, as the project gives it. */
export const LIBRARY_STYLES = 38;
