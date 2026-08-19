// Project detail pages are live with the old, already-shipped layout while
// the prism-ray redesign is still being finished. Flip this in Vercel
// (Settings → Environment Variables → SHOW_PROJECT_PAGES=true) to switch
// every /projects/[slug] page over to the new ProjectPrismRay hero once
// it's ready to showcase — no code change needed.
export const SHOW_PROJECT_PAGES = process.env.SHOW_PROJECT_PAGES === "true";
