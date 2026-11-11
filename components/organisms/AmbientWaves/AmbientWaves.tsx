"use client";

import { useEffect, useRef } from "react";
import { publishWaveTime, waveTimeNow } from "@/lib/waveClock";
import { LINKS, linkAt, pace, strength, waveY, weight } from "./waves";
import styles from "./AmbientWaves.module.css";

/** The canvas is drawn at this fraction of the screen's pixels and scaled up:
 *  far less to draw, and the scaling itself gives the lines their soft glow. */
const RESOLUTION = 0.34;
/** Once the lines are this slow, they are redrawn this often (ms), not every frame. */
const REST_FRAME_MS = 66;

/**
 * Organism: the opening's branching timeline, carried on behind the sections
 * after it.
 *
 * The hand-off: the moment the six-branches page starts to leave, the opening
 * stops drawing (it is told so through `data-handoff`) and this layer, fixed
 * behind the page, draws the same lines (same formula, same clock, same place
 * on screen, same strength), so nothing visibly changes. From there the lines
 * hold still on screen while the legend and the opening's ground scroll away,
 * and fade to a trace and slow almost to a stop as the reader moves into
 * About: there, but never asking to be looked at. Its time is written back to
 * the shared clock, so scrolling back hands the lines to the opening exactly
 * where they are.
 *
 * Cheap by design: a small canvas scaled up, no blur filters, redrawn at a
 * low rate once nearly still, and not drawn at all outside its stretch of the
 * page. It sits behind everything (z-index -1 in the page's stacking context),
 * takes no clicks and says nothing to assistive tech. With reduced motion the
 * lines hold still and only follow the scroll.
 */
export default function AmbientWaves({ openingSelector, colors }: { openingSelector: string; colors: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const zone = canvas?.parentElement;
    const opening = document.querySelector<HTMLElement>(openingSelector);
    const ctx = canvas?.getContext("2d");
    if (!canvas || !zone || !opening || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The tokens, as colours the canvas can use.
    const css = getComputedStyle(canvas);
    const read = (v: string) => {
      const name = v.match(/var\((--[\w-]+)\)/)?.[1];
      return name ? css.getPropertyValue(name).trim() : v;
    };
    const lines = colors.map(read);
    const ground = css.getPropertyValue("--bg-dark-2").trim();

    let raf = 0;
    let live = false;
    let time = 0;
    let lastNow = 0;
    let lastDrawn = 0;

    const trace = (yAt: (x: number) => number | null, w: number, vh: number, aspect: number) => {
      ctx.beginPath();
      const step = Math.max(6, w / 90);
      let open = false;
      for (let x = 0; x <= w + step; x += step) {
        const v = yAt((x / w - 0.5) * aspect);
        if (v === null) {
          open = false;
          continue;
        }
        const y = vh * (0.5 - v);
        if (open) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
        open = true;
      }
    };

    const draw = (vh: number, scrolled: number) => {
      const w = window.innerWidth;
      const cw = Math.max(1, Math.round(w * RESOLUTION));
      const ch = Math.max(1, Math.round(vh * RESOLUTION));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      ctx.setTransform(RESOLUTION, 0, 0, RESOLUTION, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = ground;
      ctx.fillRect(0, 0, w, vh);

      const s = strength(scrolled);
      const aspect = w / vh;
      const half = aspect / 2;
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // A wide faint glow, then the line: soft once scaled up.
      const passes = [
        { width: 0.03 * vh, alpha: 0.07 },
        { width: 0.007 * vh, alpha: 0.42 },
      ];

      lines.forEach((color, i) => {
        trace((x) => waveY(i, x, time, half), w, vh, aspect);
        ctx.strokeStyle = color;
        // a little dimmer overall where all six share one line, as in the shader
        const shared = weight(i, -0.9 * half, half);
        for (const p of passes) {
          ctx.globalAlpha = p.alpha * s * (0.5 + 0.5 * shared);
          ctx.lineWidth = p.width;
          ctx.stroke();
        }
      });

      for (const link of LINKS) {
        trace(
          (x) => {
            const at = linkAt(link, x, time, half);
            return at.show > 0.05 ? at.y : null;
          },
          w,
          vh,
          aspect,
        );
        ctx.strokeStyle = lines[link.b];
        ctx.globalAlpha = 0.25 * s;
        ctx.lineWidth = 0.006 * vh;
        ctx.stroke();
      }
    };

    const frame = (now: number) => {
      raf = 0;
      const vh = window.innerHeight;
      const scrolled = (vh - opening.getBoundingClientRect().bottom) / vh;
      const inZone = scrolled > 0 && zone.getBoundingClientRect().bottom > 0;

      // The opening gives up its lines only while this layer carries them.
      if (inZone !== live) {
        live = inZone;
        if (live) {
          opening.dataset.handoff = "true";
          canvas.style.visibility = "visible";
          time = waveTimeNow();
          lastNow = now;
          lastDrawn = 0;
        } else {
          delete opening.dataset.handoff;
          canvas.style.visibility = "hidden";
        }
      }
      opening.style.setProperty("--out", String(Math.min(1, Math.max(0, scrolled / 0.45))));
      if (!live) return;

      // Time runs slower the further in, and is written back so the clock stays one.
      const dt = Math.min(0.1, (now - lastNow) / 1000);
      lastNow = now;
      const speed = reduced ? 0 : pace(scrolled);
      time += dt * speed;
      publishWaveTime(time);

      // Nearly still: no need to draw every frame.
      if (speed >= 0.3 || now - lastDrawn >= REST_FRAME_MS) {
        lastDrawn = now;
        draw(vh, scrolled);
      }
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    wake();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    document.addEventListener("visibilitychange", wake);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
      document.removeEventListener("visibilitychange", wake);
      delete opening.dataset.handoff;
      opening.style.removeProperty("--out");
    };
  }, [openingSelector, colors]);

  return <canvas ref={canvasRef} className={styles.layer} aria-hidden="true" />;
}
