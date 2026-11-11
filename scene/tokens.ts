import { Color, SRGBColorSpace, Vector3 } from "three";

/**
 * Colour comes from tokens, never literals (rules.md). A WebGL scene cannot
 * resolve var(), so the scene reads the computed custom properties from an
 * element and converts them once.
 */
export function readToken(source: Element, name: string): string {
  const value = getComputedStyle(source).getPropertyValue(name).trim();
  if (!value) throw new Error(`Scene token ${name} is not defined on the scene's element`);
  return value;
}

/** A token as a three.js Color, for lit materials (three works in linear light). */
export function tokenColor(source: Element, name: string): Color {
  return new Color().setStyle(readToken(source, name));
}

/**
 * A token as display (sRGB) components, for hand-written shaders that write
 * gl_FragColor directly: those bypass three's output conversion, so they must
 * be given the values the screen should show.
 */
export function tokenDisplayRgb(source: Element, name: string): Vector3 {
  const rgb = { r: 0, g: 0, b: 0 };
  tokenColor(source, name).getRGB(rgb, SRGBColorSpace);
  return new Vector3(rgb.r, rgb.g, rgb.b);
}
