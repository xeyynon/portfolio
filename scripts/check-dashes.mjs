// Fails if any prerendered page contains an em dash (U+2014) or en dash
// (U+2013). The site uses none: names and subtitles are told apart by
// weight, time spans use "→", numeric ranges use "to". Run after
// `npm run build`. Reads the prerendered HTML (.next/server/app) and the
// built stylesheets (.next/static), because CSS `content:` can put a dash
// on the page too (the old "—" list bullet did). Comments in source are
// fine; the build strips them.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const files = [];
const walk = (dir, ext) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, ext);
    else if (p.endsWith(ext)) files.push(p);
  }
};

try {
  walk(".next/server/app", ".html");
  walk(".next/static", ".css");
} catch {
  console.error("check-dashes: build output not found. Run `npm run build` first.");
  process.exit(2);
}

let failures = 0;
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(/.{0,40}[\u2013\u2014].{0,40}/g)) {
    failures++;
    console.error(`${file}: …${m[0].replace(/\s+/g, " ")}…`);
  }
}

if (failures) {
  console.error(`\ncheck-dashes: ${failures} em/en dash(es) on the page. Use a subtitle, "→", "to" or "·" instead.`);
  process.exit(1);
}
console.log(`check-dashes: ${files.length} pages and stylesheets, no em or en dashes.`);
