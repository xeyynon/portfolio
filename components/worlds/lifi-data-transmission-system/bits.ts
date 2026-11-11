/**
 * Text to bits and back. Pure: no React, no DOM.
 *
 * This is the round trip the "Send a word across" exhibit runs in the browser.
 * It shows the idea of on-off keying (a 1 is light on, a 0 is light off). It is
 * not the framing the firmware uses, and the page does not claim it is.
 */

export const BITS_PER_CHAR = 8;
export const MAX_CHARS = 8;

const printable = (code: number) => code >= 32 && code <= 126;

/** What the demonstration can carry: printable ASCII, at most MAX_CHARS characters. */
export function clean(text: string): string {
  let out = "";
  for (let i = 0; i < text.length && out.length < MAX_CHARS; i++) {
    if (printable(text.charCodeAt(i))) out += text[i];
  }
  return out;
}

/** Each character as eight bits, most significant first. */
export function textToBits(text: string): number[] {
  const bits: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    for (let b = BITS_PER_CHAR - 1; b >= 0; b--) bits.push((code >> b) & 1);
  }
  return bits;
}

/** The characters whose eight bits have all arrived. A part-received character is left out. */
export function bitsToText(bits: readonly number[]): string {
  let out = "";
  for (let i = 0; i + BITS_PER_CHAR <= bits.length; i += BITS_PER_CHAR) {
    let code = 0;
    for (let b = 0; b < BITS_PER_CHAR; b++) code = (code << 1) | (bits[i + b] & 1);
    out += String.fromCharCode(code);
  }
  return out;
}
