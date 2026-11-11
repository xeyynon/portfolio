"use client";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import { skills } from "@/data/portfolioData";
import Keycap from "./Keycap";
import GunGraphic from "./GunGraphic";
import SlipDetail from "./SlipDetail";
import { PaperGunEngine } from "./engine";
import { projectSlips, skillSlips, slipsFor, type SlipKind } from "./slips";

/**
 * Organism: the Paper Gun section. Hold the gun (or "Spray my work", or
 * Space/Enter on either) and it sprays the work as paper slips that flutter
 * like bills, then glide into a tray in arrival order. Click a slip for its
 * detail card. A capability chip sprays only that capability's slips.
 *
 * Built from a friend's "money gun" brief, reworked for this site: dark
 * glass instead of an off-white page, the site's fonts and tokens, capability
 * colours instead of a random palette, and real resume-backed content.
 */
export default function PaperGun() {
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<SVGCircleElement>(null);
  const recoilRef = useRef<HTMLSpanElement>(null);
  const chargeRef = useRef<SVGGElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const intakeRef = useRef<SVGCircleElement>(null);
  const engineRef = useRef<PaperGunEngine | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<SlipKind | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    const tray = trayRef.current;
    const slot = slotRef.current;
    const recoil = recoilRef.current;
    const charge = chargeRef.current;
    const glow = glowRef.current;
    if (!stage || !layer || !tray || !slot || !recoil || !charge || !glow) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const engine: PaperGunEngine = new PaperGunEngine({
      stage,
      layer,
      tray,
      slot,
      recoil,
      charge,
      glow,
      bigs: projectSlips,
      tags: skillSlips,
      reduced,
      // The brief fires 20 slips 0.7 s after load. Here the opening burst
      // waits for the prism to charge the gun the first time it is in view.
      onFullCharge: () => engine.burst(Array.from({ length: 20 }, () => undefined), 95, 150),
      onShot: () => window.dispatchEvent(new Event("prism:pulse")),
      onCount: setCount,
      onSelect: (kind, el) => {
        if (el) openerRef.current = el;
        setSelected(kind);
      },
    });
    engineRef.current = engine;
    engine.layout();

    const ro = new ResizeObserver(() => engine.layout());
    ro.observe(stage);

    // In view: the background prism turns to face the gun and charges it
    // (PrismCanvas listens for prism:aim). Out of view: it lets go.
    // The target is a live getter, so the rays track the gun as it recoils
    // and as the page scrolls.
    const target = () => {
      const el = intakeRef.current;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };
    const aim = (on: boolean) => {
      engine.setAimed(on);
      window.dispatchEvent(new CustomEvent("prism:aim", { detail: { on, target } }));
    };
    const io = new IntersectionObserver(
      (entries) => aim(entries.some((e) => e.isIntersecting)),
      { rootMargin: "-20% 0px -35% 0px" }
    );
    io.observe(stage);

    // A hold never outlives the window losing focus.
    const stop = () => engine.stopHold();
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", stop);

    return () => {
      ro.disconnect();
      io.disconnect();
      window.dispatchEvent(new CustomEvent("prism:aim", { detail: { on: false } }));
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", stop);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const close = useCallback(() => {
    setSelected(null);
    engineRef.current?.setActive(null);
    const el = openerRef.current;
    if (el && el.isConnected) el.focus();
  }, []);

  // Esc closes the card and stops there (rules.md: Esc undoes one step),
  // returning focus to the slip that opened it.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected, close]);

  /** Press-and-hold to spray, by pointer or by Space/Enter. */
  const hold = {
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      engineRef.current?.startHold(e.currentTarget);
    },
    onPointerUp: () => engineRef.current?.stopHold(),
    onPointerCancel: () => engineRef.current?.stopHold(),
    onLostPointerCapture: () => engineRef.current?.stopHold(),
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      if (!e.repeat) engineRef.current?.startHold(e.currentTarget);
    },
    onKeyUp: (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      engineRef.current?.stopHold();
    },
    onBlur: () => engineRef.current?.stopHold(),
    // Screen readers activate with a synthetic click (detail 0) and no
    // pointer or key events: give them one shot per activation.
    onClick: (e: MouseEvent<HTMLButtonElement>) => {
      if (e.detail === 0) engineRef.current?.fireOnce();
    },
    // A long touch-press would otherwise open the context menu.
    onContextMenu: (e: MouseEvent) => e.preventDefault(),
  };

  function sprayCapability(label: string, el: HTMLElement) {
    const kinds = slipsFor(label);
    if (!kinds.length) return;
    engineRef.current?.burst(kinds, 95);
    openerRef.current = el;
    setSelected(kinds[0]);
  }

  return (
    <div className="wrap pg" id="paper-gun">
      <div className="section-head">
        <h2 className="eyebrow">PAPER GUN</h2>
        <span className="count">
          {String(projectSlips.length).padStart(2, "0")} PROJECTS · {String(skillSlips.length).padStart(2, "0")} CAPABILITIES
        </span>
      </div>

      <div className="pg-stage" ref={stageRef}>
        <div className="pg-copy">
          <h3 className="pg-title">
            My <span className="pg-spectrum">work</span> comes out of this gun.
          </h3>
          <p className="pg-lede">
            Hold the trigger and catch a slip. Every slip is a project or a capability, in its capability&apos;s colour. Click one to open it.
          </p>

          <div className="pg-actions">
            <Keycap legend="⏎" tone="paper" {...hold}>
              Spray my work
            </Keycap>
            <Keycap legend="↺" tone="ink" onClick={() => engineRef.current?.cleanup()}>
              Clean up
            </Keycap>
            <span className="pg-count">
              <span className="pg-count-n">{count}</span> {count === 1 ? "slip" : "slips"} sprayed
            </span>
          </div>

          <div className="pg-mags" role="group" aria-label="Spray one capability">
            <span className="pg-mags-label" aria-hidden="true">Spray one:</span>
            {skills.map((s) => (
              <button
                key={s.label}
                type="button"
                className="pfilter-chip"
                style={{ "--chip-color": s.color } as React.CSSProperties}
                onClick={(e) => sprayCapability(s.label, e.currentTarget)}
              >
                <span className="pfilter-dot" aria-hidden="true" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pg-gun-col">
          <button type="button" className="pg-gun" aria-label="Paper gun: hold to spray slips" {...hold}>
            <GunGraphic slotRef={slotRef} recoilRef={recoilRef} chargeRef={chargeRef} glowRef={glowRef} intakeRef={intakeRef} />
          </button>
        </div>

        <div className="pg-tray">
          <p className="pg-tray-label" id="pg-tray-label">WHAT CAME OUT · CLICK A SLIP</p>
          <div className="pg-tray-slots" ref={trayRef}>
            {count === 0 && <p className="pg-tray-empty">Nothing yet. Hold the trigger.</p>}
          </div>
        </div>

        {/* Slips live here, over the whole stage, so they can fly from the
            gun to the tray. DOM order is tray order. */}
        <div className="pg-layer" ref={layerRef} role="group" aria-labelledby="pg-tray-label" />

        <div className="pg-card-slot" aria-live="polite">
          {selected && <SlipDetail kind={selected} onClose={close} />}
        </div>
      </div>
    </div>
  );
}
