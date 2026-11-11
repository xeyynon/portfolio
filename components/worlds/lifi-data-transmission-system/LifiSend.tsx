"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { BITS_PER_CHAR, MAX_CHARS, bitsToText, clean, textToBits } from "./bits";
import styles from "./lifi.module.css";

const BIT_MS = 90; // one bit arrives; each cell fills once and stays, nothing blinks
const FIRST_WORD = "hello";

/** A space is a real character on the link; drawn as a mark so it can be seen. */
const visible = (ch: string) => (ch === " " ? "␣" : ch);

/**
 * Organism: send a word across. The visitor types a short word; it is turned
 * into bits, the bits arrive one at a time, and the word is put back together
 * from the bits that have arrived. The round trip is real, and it runs in the
 * browser only: it shows the idea, and says nothing about the hardware.
 *
 * With reduced motion the whole word arrives at once.
 */
export default function LifiSend() {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useRef(true);
  const [draft, setDraft] = useState(FIRST_WORD);
  const [sent, setSent] = useState(FIRST_WORD);
  // How many bits have reached the far side. It opens with the first word already across.
  const [arrived, setArrived] = useState(FIRST_WORD.length * BITS_PER_CHAR);

  const bits = textToBits(sent);
  const got = Math.min(arrived, bits.length);
  const flying = got < bits.length;
  // Decoded from the bits that have arrived, not copied from what was typed.
  const decoded = bitsToText(bits.slice(0, got));

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const view = new IntersectionObserver((entries) => {
      inView.current = entries.some((e) => e.isIntersecting);
    });
    view.observe(root);
    return () => view.disconnect();
  }, []);

  useEffect(() => {
    if (!flying) return;
    const timer = window.setInterval(() => {
      if (document.hidden || !inView.current) return;
      setArrived((n) => n + 1);
    }, BIT_MS);
    return () => window.clearInterval(timer);
  }, [flying]);

  const send = (event: FormEvent) => {
    event.preventDefault();
    const word = clean(draft);
    if (!word) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setSent(word);
    setArrived(reduced ? word.length * BITS_PER_CHAR : 0);
  };

  return (
    <div className={styles.send} ref={rootRef}>
      <form className={styles.form} onSubmit={send}>
        <label className={styles.label} htmlFor={id}>
          A short word to send (up to {MAX_CHARS} plain characters)
        </label>
        <div className={styles.field}>
          <input
            id={id}
            className={styles.input}
            type="text"
            value={draft}
            maxLength={MAX_CHARS}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            onChange={(e) => setDraft(clean(e.target.value))}
          />
          <button type="submit" className={styles.sendButton} disabled={!draft}>
            Send
          </button>
        </div>
      </form>

      <p className={styles.schematic}>
        A demonstration in the browser. Your word really is turned into bits and put back together from them, but
        nothing here passes through the hardware, and this is not the firmware&apos;s own framing.
      </p>

      <table className={styles.link}>
        <caption className={styles.linkCaption}>
          Eight bits to a character. A filled 1 is light on, a hollow 0 is light off, and a dashed box has not arrived
          yet.
        </caption>
        <thead>
          <tr>
            <th scope="col">Typed</th>
            <th scope="col">On the beam</th>
            <th scope="col">Decoded</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(sent).map((ch, i) => (
            <tr key={i}>
              <th scope="row" className={styles.char}>
                {visible(ch)}
              </th>
              <td>
                <span className={styles.bits}>
                  {bits.slice(i * BITS_PER_CHAR, (i + 1) * BITS_PER_CHAR).map((bit, b) => (
                    <span
                      key={b}
                      className={styles.bit}
                      data-on={bit === 1}
                      data-arrived={i * BITS_PER_CHAR + b < got}
                    >
                      {bit}
                    </span>
                  ))}
                </span>
              </td>
              <td className={styles.char} data-side="decoded">
                {i < decoded.length ? visible(decoded[i]) : <span className={styles.waiting}>·</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className={styles.count} aria-hidden="true">
        {got} of {bits.length} bits across
      </p>
      <p className={styles.status} aria-live="polite">
        {flying
          ? `Sending “${sent}” as ${bits.length} bits.`
          : `“${sent}” left as ${bits.length} bits and was decoded as “${decoded}”.`}
      </p>
    </div>
  );
}
