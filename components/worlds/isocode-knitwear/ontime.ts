/**
 * The on-time arithmetic, as this page illustrates it. Pure: no React, no DOM.
 *
 * This is NOT the product's engine. It is the idea in its smallest form, so a
 * visitor can move two numbers and see a status with the sum behind it. The
 * page says so beside the exhibit. What is taken from the project: a status
 * always carries its sum, no updates is grey and never green, and a rate
 * based on little data is labelled an estimate.
 */

export type Status = "on-time" | "behind" | "no-updates";

/** A status is always a word, never a colour alone. */
export const STATUS_WORD: Record<Status, string> = {
  "on-time": "On time",
  behind: "Behind",
  "no-updates": "No updates",
};

/** The project's own example of a sum: need 467 a day, making 350 a day. */
export const EXAMPLE = { need: 467, made: 350 } as const;

/** The sliders' range. A range for the control, not a claim about any order. */
export const RATE_MAX = 800;

/** How much has come in from the floor. No thresholds are claimed: the visitor says which. */
export const UPDATES = [
  { key: "none", label: "None" },
  { key: "few", label: "A few" },
  { key: "plenty", label: "Plenty" },
] as const;
export type Updates = (typeof UPDATES)[number]["key"];

export type Verdict = {
  status: Status;
  /** True when the rate rests on little data. */
  estimate: boolean;
  /** The sum behind the status, in the project's own form. Empty when there is nothing to add up. */
  sum: string;
  /** What the sum comes to. */
  detail: string;
};

/** The status for one order and stage, with the sum that explains it. */
export function verdict(need: number, made: number, updates: Updates): Verdict {
  if (updates === "none") {
    return {
      status: "no-updates",
      estimate: false,
      sum: "",
      detail: "No counts have come in, so there is no sum to show. Grey, never green.",
    };
  }
  const sum = `need ${need} a day, making ${made} a day`;
  const gap = made - need;
  return {
    status: gap >= 0 ? "on-time" : "behind",
    estimate: updates === "few",
    sum,
    detail: gap === 0 ? "Exactly the pace it needs." : gap > 0 ? `${gap} a day to spare.` : `${-gap} a day short.`,
  };
}

/** How far along its track a bar is drawn, 0 to 1. */
export function share(rate: number): number {
  return Math.max(0, Math.min(1, rate / RATE_MAX));
}
