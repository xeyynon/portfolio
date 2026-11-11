"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { matchCommands, type Command } from "@/lib/commands";
import styles from "./CommandPalette.module.css";

/**
 * Organism: the assistant. One box that goes anywhere on the site: type a few
 * letters of a section, a project or a way to reach him, and press Enter.
 * Opens with its button, with Ctrl K or Cmd K, or with "/" when not typing.
 *
 * It is a dialog with a combobox in it: focus moves in when it opens and back
 * to where it was when it closes, Tab stays inside, the arrow keys move
 * through the list, and Esc closes it and does nothing else.
 */
export default function CommandPalette({ commands }: { commands: Command[] }) {
  const router = useRouter();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  const matches = useMemo(() => matchCommands(commands, query), [commands, query]);
  const current = matches[Math.min(index, matches.length - 1)];

  const show = useCallback(() => {
    returnTo.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setIndex(0);
    setStatus("");
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
    const el = returnTo.current;
    if (el && el.isConnected) el.focus();
  }, []);

  // The shortcuts that open it, from anywhere on the page.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.repeat || e.defaultPrevented) return;
      const chord = (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k";
      const target = e.target as HTMLElement | null;
      const typing = !!target?.closest("input, textarea, select, [contenteditable='true']");
      const slash = e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !typing;
      if (!chord && !slash) return;
      e.preventDefault();
      if (open) hide();
      else show();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, show, hide]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Keep the chosen row in view as the arrows move through a long list.
  useEffect(() => {
    if (!open || !current) return;
    listRef.current?.querySelector(`[data-id="${current.id}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, current]);

  const run = async (command: Command) => {
    if (command.copy) {
      try {
        await navigator.clipboard.writeText(command.copy);
        setStatus("Copied.");
        window.setTimeout(hide, 700);
      } catch {
        setStatus(`Could not copy. The address is ${command.copy}`);
      }
      return;
    }
    if (!command.href) return;
    hide();
    if (command.href.startsWith("mailto:")) window.location.assign(command.href);
    else if (/^https?:/.test(command.href)) window.open(command.href, "_blank", "noopener,noreferrer");
    else router.push(command.href);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      // One press closes this and nothing else on the page hears it.
      e.preventDefault();
      e.stopPropagation();
      hide();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (matches.length ? (Math.min(i, matches.length - 1) + 1) % matches.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (matches.length ? (Math.min(i, matches.length - 1) - 1 + matches.length) % matches.length : 0));
    } else if (e.key === "Enter" && document.activeElement === inputRef.current) {
      e.preventDefault();
      if (current) void run(current);
    } else if (e.key === "Tab") {
      // Two stops inside: the box and the close button.
      e.preventDefault();
      (document.activeElement === inputRef.current ? closeRef.current : inputRef.current)?.focus();
    }
  };

  return (
    <>
      <button type="button" className={styles.trigger} onClick={show} aria-haspopup="dialog" aria-label="Go anywhere on this site" title="Go anywhere (Ctrl K)">
        <Search size={14} aria-hidden="true" />
        <span className={styles.word}>Go to</span>
        <kbd className={styles.key} aria-hidden="true">
          Ctrl K
        </kbd>
      </button>

      {open && (
        <div className={styles.backdrop} onPointerDown={(e) => e.target === e.currentTarget && hide()}>
          <div className={styles.dialog} role="dialog" aria-modal="true" aria-label="Go anywhere on this site" onKeyDown={onKeyDown}>
            <div className={styles.top}>
              <label className="sr-only" htmlFor={`${id}-box`}>
                Type a section, a project or a way to reach me
              </label>
              <input
                id={`${id}-box`}
                ref={inputRef}
                className={styles.box}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={`${id}-list`}
                aria-activedescendant={current ? `${id}-${current.id}` : undefined}
                aria-autocomplete="list"
                autoComplete="off"
                spellCheck={false}
                placeholder="Section, project, or how to reach me"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
              />
              <button type="button" ref={closeRef} className={styles.close} onClick={hide}>
                Close <kbd className={styles.key} aria-hidden="true">Esc</kbd>
              </button>
            </div>

            <ul className={styles.list} id={`${id}-list`} role="listbox" aria-label="Places and actions" ref={listRef}>
              {/* Options of a listbox, per the combobox pattern: they are never
                  focused themselves. The keyboard reaches them through the box
                  (arrows and Enter); the click is the pointer's way to the same thing. */}
              {matches.map((command) => (
                <li
                  key={command.id}
                  id={`${id}-${command.id}`}
                  data-id={command.id}
                  className={styles.option}
                  role="option"
                  aria-selected={command === current}
                  onPointerMove={() => setIndex(matches.indexOf(command))}
                  onClick={() => void run(command)}
                >
                  <span className={styles.optionLabel}>{command.label}</span>
                  <span className={styles.optionGroup}>{command.group}</span>
                </li>
              ))}
              {matches.length === 0 && <li className={styles.none}>Nothing on this site matches that.</li>}
            </ul>

            <p className={styles.status} role="status">
              {status}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
