import { projects, skills, projectLabel, skillId } from "@/data/portfolioData";

/**
 * A kind of paper slip the gun can fire. Every slip is derived from
 * data/portfolioData.ts (no copy of its own): a project becomes a big
 * "bill", a capability becomes a small tag. A slip's colour is the
 * capability colour, so one colour keeps one meaning (rules.md, Colour).
 */
export type SlipKind = {
  id: string;
  size: "big" | "tag";
  /** Big printed word on the slip. */
  word: string;
  /** Small spaced line under the word (big slips only). */
  sub: string;
  /** Serial in the corner, like a banknote ("No. 01"). */
  serial?: string;
  color: string;
  /** Detail card: kicker, title, one line, and where it leads. */
  kicker: string;
  title: string;
  text: string;
  href: string;
  hrefLabel: string;
  /** Capability labels, for "spray one capability". */
  capabilities: string[];
};

export const SLIP_SIZE = {
  big: { w: 220, h: 84 },
  tag: { w: 104, h: 64 },
} as const;

export const projectSlips: SlipKind[] = projects.map((p) => ({
  id: `p-${p.slug}`,
  size: "big",
  word: p.short,
  sub: p.tag,
  serial: `No. ${p.num}`,
  color: p.color,
  kicker: `Project ${p.num} · ${p.skills[0]}`,
  title: projectLabel(p),
  text: p.domain,
  href: `/projects/${p.slug}`,
  hrefLabel: "Open the project",
  capabilities: p.skills,
}));

export const skillSlips: SlipKind[] = skills.map((s) => ({
  id: `s-${skillId(s.label)}`,
  size: "tag",
  word: s.label,
  sub: "",
  color: s.color,
  kicker: "Capability",
  title: s.label,
  text: s.items.join(" · "),
  href: `#${skillId(s.label)}`,
  hrefLabel: "See the skills",
  capabilities: [s.label],
}));

/** Every slip that names this capability: its projects, then its tag. */
export function slipsFor(capability: string): SlipKind[] {
  return [
    ...projectSlips.filter((k) => k.capabilities.includes(capability)),
    ...skillSlips.filter((k) => k.title === capability),
  ];
}

/**
 * Builds one slip as a real <button>. Slips are created imperatively because
 * the engine moves them every frame; going through React state at 60 fps
 * would re-render the section for nothing. textContent only, never innerHTML.
 * A slip in flight is aria-hidden and out of the tab order; it becomes a
 * focusable button only once it has landed in the tray.
 */
export function createSlipEl(k: SlipKind): HTMLButtonElement {
  const b = document.createElement("button");
  b.type = "button";
  b.className = `gslip gslip-${k.size}`;
  b.tabIndex = -1;
  b.setAttribute("aria-hidden", "true");
  b.setAttribute("aria-label", `${k.title}: show details`);
  b.style.setProperty("--slip-color", k.color);

  if (k.serial) {
    const serial = document.createElement("span");
    serial.className = "gslip-serial";
    serial.textContent = k.serial;
    b.appendChild(serial);
  }

  const word = document.createElement("span");
  word.className = "gslip-word";
  word.textContent = k.word;
  if (k.size === "big") {
    // 36% of the slip height, shrunk for long names so they never clip
    // (TELEGRAM DRIVE is 14 letters). 0.66em is Space Grotesk 700's
    // average uppercase advance; 186px is the slip's inner width.
    const size = Math.min(SLIP_SIZE.big.h * 0.36, 186 / (k.word.length * 0.66));
    word.style.setProperty("--word-size", `${size.toFixed(1)}px`);
  }
  b.appendChild(word);

  if (k.sub) {
    const sub = document.createElement("span");
    sub.className = "gslip-sub";
    sub.textContent = k.sub;
    b.appendChild(sub);
  }
  return b;
}
