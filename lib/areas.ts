/**
 * Which of the six areas of work the visitor has come across so far. A
 * project page marks its areas as it is opened; the row of stones in the bar
 * and the stones in About me light up to match.
 *
 * Kept in the visitor's own browser only (localStorage): it is a convenience
 * for them, sent nowhere, and the page works the same without it. Every
 * access is guarded, because storage can be blocked or full.
 */

const KEY = "sp:areas";
const CHANGED = "sp:areas-changed";
const NONE: readonly string[] = [];

let cache: readonly string[] | null = null;

function read(): readonly string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const value: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : NONE;
  } catch {
    return NONE;
  }
}

/** The areas lit so far. Returns the same array until something changes, as React's store hook needs. */
export function litAreas(): readonly string[] {
  if (cache === null) cache = read();
  return cache;
}

export const noAreas = (): readonly string[] => NONE;

/** Lights the given areas, keeping any already lit. */
export function lightAreas(labels: readonly string[]): void {
  const current = litAreas();
  const added = labels.filter((l) => !current.includes(l));
  if (!added.length) return;
  cache = [...current, ...added];
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Storage is unavailable: the stones stay lit for this visit only.
  }
  window.dispatchEvent(new Event(CHANGED));
}

export function subscribeAreas(onChange: () => void): () => void {
  // Another tab changed it: read it again.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = null;
    onChange();
  };
  window.addEventListener(CHANGED, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGED, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
