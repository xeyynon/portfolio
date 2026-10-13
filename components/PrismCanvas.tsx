"use client";

import { useEffect, useRef } from "react";
import {
  SAMPLES,
  type Mat3,
  type Vec3,
  rotationMatrix,
  traceSpectrum,
} from "@/lib/prism";
import type { ScrollSceneStore } from "@/lib/scrollScene";
import {
  PRISM_GLSL_COMMON,
  compilePrismProgram,
  observePrismResize,
} from "@/lib/prismShader";

/*
 * Two earlier attempts at "the beam must be a straight horizontal line"
 * both failed for the same underlying reason: the prism's glass and the
 * beam's incoming segment are rendered from the same 3D pose, so any single
 * rotation that fixes one necessarily disturbs the other.
 *   1. A fixed camera roll leveled the beam but rotated the *entire* frame,
 *      including the glass — the triangle rendered visibly spun sideways.
 *   2. Making BEAM_DIR itself world-horizontal kept the glass roll-free, but
 *      needed a large pitch/yaw tilt on the prism (swept via lib/prism.ts's
 *      own optics — a horizontal beam is only TIR-safe there at a
 *      substantial tilt) to avoid killing the spectrum, and that tilt was
 *      still enough to noticeably foreshorten the triangle and reveal its
 *      underside — reported as "look at the alignment of prism."
 *
 * The fix: stop trying to find one pose that satisfies both. The physics
 * (BEAM_ORIGIN/BEAM_DIR/REST_PITCH/REST_YAW/REST_ROLL below) is back to the
 * original, already-verified-safe diagonal-beam configuration — the one
 * that rendered a correctly-proportioned, non-tilted prism before any of
 * this. Only the *incoming* beam segment's rendered start point
 * (visualBeamOrigin, computed in the frame loop from the true entry point)
 * is different from the physics' own BEAM_ORIGIN: it shares the entry
 * point's y/z, so the segment drawn from it to the entry point is
 * perfectly horizontal on screen, while the refraction math underneath —
 * entry point, exit angles, dispersion, TIR safety — is entirely untouched
 * and still runs on the real diagonal beam. The rendered incoming ray and
 * the ray the optics actually trace are no longer the same 3D line; they
 * agree at the one point that matters, where the light visibly enters the
 * glass and the spectrum begins.
 */
const BEAM_ORIGIN: Vec3 = [-3.37, -0.67, 0.0];
const BEAM_DIR: Vec3 = [0.9455, 0.3256, 0.0];
const REST_PITCH = 0.06;
const REST_YAW = -0.08;
const REST_ROLL = 0.04;

// Staged load-in timing: the beam takes BEAM_TRAVEL_S seconds to visibly
// travel from off-screen to the glass, then the spectrum takes a further
// SPECTRUM_FADE_S to fade in once it arrives — sequential, not simultaneous.
const BEAM_TRAVEL_S = 1.0;
const SPECTRUM_FADE_S = 0.6;

// How far above centered "top" sits, and how much scroll progress (same
// 0..1 domain as fanGain's `s`) it takes to fully settle into the centered
// framing. Capped in *absolute* pixels (TOP_SHIFT_MAX_PX), not purely a
// percentage of viewport height: a pure vh-percentage shift (the first
// version of this, 20vh) scaled down on shorter viewports but not by
// enough — the hero text above the scene is a fixed-px height, not
// vh-relative, so on a shorter viewport the shift was still large enough
// to push the beam line straight through the wordmark ("the prism top is
// overflowing"). The 10%-of-height term still tapers it further on very
// short viewports (phones) where even TOP_SHIFT_MAX_PX would be too much.
// Mirrored in app/globals.css (.hero min-height), which ends the hero at
// the prism's base. Change these three and FOV_K/ASPECT_* there too.
const TOP_SHIFT_MAX_PX = 90;
const TOP_SHIFT_VH = 10;
const TOP_SHIFT_END = 0.12;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// fwdScale = FOV_K * clamp(aspect, ASPECT_MIN, ASPECT_MAX). Originally
// calibrated against a short, wide hero strip (~2.9 aspect) that never went
// below ~1.15 at any real viewport width. Now the canvas is full-viewport,
// so aspect genuinely swings from portrait phones (~0.45) to ultrawide
// desktops — the range below is a starting point for that, not a final
// answer; re-verify in-browser at real breakpoints before trusting it (see
// TASKS.md).
const FOV_K = 2.6 / 2.9;
const ASPECT_MIN = 0.5;
const ASPECT_MAX = 2.6;

// ARTISTIC — the fan's spread widens with scroll progress: tight near the
// physically-real ~13° at the top of the page, opening toward a wide, legible
// fan by the bottom. Both ends still run through the same spreadFan gain
// mechanism in lib/prism.ts (physics generates the geometry, this only
// magnifies deviation from its own mean), so neither endpoint can introduce
// a pose spreadFan didn't already handle safely. Range widened (was
// 1.3–3.4): with the prism's own rotation now fixed (see the frame loop),
// this gain is the only thing scroll drives, so it needed more range to
// still read as a clear scroll-linked effect on its own.
const FAN_GAIN_MIN = 1.1;
const FAN_GAIN_MAX = 6.0;

// SCROLL SPIN — owner, 2026-10-11: "rotate the prism in 3D, like the Earth
// rotates", linked to scroll, with real optics. The prism spins about its
// vertical axis (yaw) as the page scrolls: one full turn plus YAW_EXTRA,
// from REST_YAW at the top to YAW_END at the bottom. The beam and the
// prism's position stay put.
// Measured by sweeping lib/prism.ts: every yaw keeps all 10 wavelengths,
// but between ~35 and ~145 degrees (and the same half-turn later) the beam
// crosses the prism's flat end faces, so the fan collapses to one white
// line, as a real spinning prism does. YAW_EXTRA = 25 degrees lands in the
// wide part (fan ~73 degrees at FAN_GAIN_MAX); 35 degrees would collapse.
const SCROLL_TRAVEL_START = 0.08;
const YAW_EXTRA = (25 * Math.PI) / 180;
const YAW_END = Math.PI * 2 + YAW_EXTRA;

// The spin is not linear in scroll: it moves slowly while the rainbow is out
// and quickly through the edge-on stretches (fan collapsed), so the rainbow
// is visible for ~70% of the page instead of ~45%. Breakpoints in degrees
// along the path, from the sweep: fan out until 35, collapsed to 145, out to
// 215, collapsed to 325, out to the end. EDGE_SPEED is how much less scroll
// a collapsed degree takes.
const SPIN_BREAKS_DEG = [35, 145, 215, 325];
const EDGE_SPEED = 0.75;

/** Maps spin progress (0..1, linear in scroll) to yaw in radians. */
function spinYaw(u: number): number {
  const start = (REST_YAW * 180) / Math.PI;
  const end = (YAW_END * 180) / Math.PI;
  const stops = [start, ...SPIN_BREAKS_DEG, end];
  // Scroll weight of each segment: full for rainbow segments, EDGE_SPEED
  // for the collapsed ones (odd-indexed segments).
  const weights = stops.slice(1).map((d, i) => (d - stops[i]) * (i % 2 === 1 ? EDGE_SPEED : 1));
  const total = weights.reduce((a, b) => a + b, 0);
  let target = u * total;
  for (let i = 0; i < weights.length; i++) {
    if (target <= weights[i] || i === weights.length - 1) {
      const f = weights[i] === 0 ? 0 : Math.min(1, target / weights[i]);
      return ((stops[i] + (stops[i + 1] - stops[i]) * f) * Math.PI) / 180;
    }
    target -= weights[i];
  }
  return YAW_END;
}
const SCROLL_ZOOM_END = 0.8;
// How much the rays' glow bands widen by the end (1 = unchanged).
const SCROLL_RAY_SCALE_END = 2.4;

// FOCUS — clicking a wavelength chip in the hero dispatches a
// "prism:focus" event with that chip's nm; the rays near it brighten and the
// rest dim, easing back over FOCUS_MS. Sample i sits at
// FOCUS_NM_MIN + i * step, matching lib/prism.ts's LAMBDA_MIN/MAX.
const FOCUS_MS = 3200;
const FOCUS_NM_MIN = 410;
const FOCUS_NM_MAX = 690;
const FOCUS_SIGMA_NM = 32;

// PERFORMANCE — after IDLE_MS with no scroll or pointer movement the loop
// draws every other frame (about 30 fps): the slow motes don't need 60.
const IDLE_MS = 6000;

// SMOOTHNESS — the prism's pose, fan, zoom and dimming follow scroll through
// a critically damped ease with this time constant (seconds), so wheel
// ticks and sudden stops glide instead of stepping. Frame-rate independent.
const SCROLL_EASE_S = 0.22;

// ARTISTIC — how much the glass's environment-derived lighting recedes as
// scroll progress moves through the scene, so the background stays
// subordinate to the prism/beam/spectrum and so About's text has less
// background luminance to fight. Never touches the beam or spectrum, which
// are the simulated light itself, not environment reflections.
const SCENE_DIM_FLOOR = 0.55;

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

#define SAMPLES ${SAMPLES}
#define PLANES 5
#define MOTE_COUNT 4

uniform vec2  uRes;
uniform float uFwdScale;
uniform float uZoom;
uniform float uRayScale;
uniform float uFocusW[SAMPLES];
uniform float uExitGain;
uniform float uTime;
uniform vec3  uCam;
uniform vec3  uPlaneN[PLANES];
uniform float uPlaneC[PLANES];
uniform vec3  uBeamO;
uniform vec3  uEntry;
uniform vec3  uExitP[SAMPLES];
uniform vec3  uExitD[SAMPLES];
uniform vec3  uColor[SAMPLES];
uniform float uFade;
uniform float uArtSpin;
uniform float uSceneDim;
uniform float uBeamProgress;
uniform float uSpectrumFade;

${PRISM_GLSL_COMMON}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
  // Scroll zoom (SCROLL_ZOOM_END in the frame loop): a slight screen-space
  // zoom of the whole picture. Framing only; the optics are untouched.
  uv = uv * uZoom;

  /*
   * ARTISTIC SCROLL ROLL — screen-space only, not physics.
   *
   * The real prism rotation (rotationMatrix/traceSpectrum, computed on the
   * CPU) stays inside its TIR-safe envelope and is never widened by this.
   * This rotates the view ray itself around the image centre — a camera
   * roll — after the spectrum has already been traced, so it cannot put the
   * glass into a pose the CPU-side yawFloor clamp hasn't already cleared.
   * Same philosophy as FAN_GAIN in lib/prism.ts: physics generates the
   * geometry, this term only changes how it's framed for legibility.
   */
  float asC = cos(uArtSpin), asS = sin(uArtSpin);
  uv = vec2(uv.x * asC - uv.y * asS, uv.x * asS + uv.y * asC);

  vec3 fwd   = normalize(-uCam);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up    = cross(right, fwd);
  vec3 rd    = normalize(right * uv.x + up * uv.y + fwd * uFwdScale);
  vec3 ro    = uCam;

  // A second, static camera — pointer parallax (uCam) never reaches this
  // one — used only for the incident white beam below. Requested directly:
  // the glass/spectrum should drift with the mouse again, but the beam
  // must "stick" regardless. Everything else in the scene (glass, spectrum,
  // motes, environment) still uses the ro/rd pair above and does drift.
  vec3 camFixed = vec3(0.0, 0.34, 3.6);
  vec3 fwdFixed   = normalize(-camFixed);
  vec3 rightFixed = normalize(cross(fwdFixed, vec3(0.0, 1.0, 0.0)));
  vec3 upFixed    = cross(rightFixed, fwdFixed);
  vec3 rdFixed    = normalize(rightFixed * uv.x + upFixed * uv.y + fwdFixed * uFwdScale);
  vec3 roFixed    = camFixed;

  vec3 col = vec3(0.0);

  /* --- incident beam, white, in air ---
     Draws in progressively (uBeamProgress: 0 = still at uBeamO, 1 = has
     reached the glass) rather than fading in as a full-length line — the
     requested load sequence is the beam visibly *travelling* to the prism,
     not just materializing, matching how the original SVG hero drew its
     beam in via stroke-dashoffset. */
  vec3 beamFar = mix(uBeamO, uEntry, uBeamProgress);
  col += vec3(0.62, 0.66, 0.78) * segmentGlow(roFixed, rdFixed, uBeamO, beamFar, 0.0016) * 1.5;

  /* --- refracted spectrum: inside the glass, then out into air ---
     Held at zero (via uSpectrumFade) until the beam above has finished
     travelling — "the moment the beam hits the prism, the spectrum rays
     should emerge," not before. Accumulated separately from col so one
     multiply gates the whole stage. */
  vec3 spectrum = vec3(0.0);
  for (int i = 0; i < SAMPLES; i++) {
    // uFocusW brightens the wavelengths near a chosen colour for a moment
    // (hero chips, see FOCUS_* below); 1.0 everywhere otherwise.
    vec3 c = uColor[i] * uFocusW[i];
    vec3 p = uExitP[i];
    vec3 d = uExitD[i];

    // Internal path: tighter and brighter, since it is confined by the glass.
    spectrum += c * segmentGlow(ro, rd, uEntry, p, 0.0011) * 0.85;

    // Emergent fan. Three overlapping widths: a hot core for definition, a
    // mid band for body, and a wide haze so the rays sit in atmosphere rather
    // than looking like stroked vectors.
    if (dot(d, d) > 0.5 && uExitGain > 0.001) {
      // Long enough to leave the frame at any pan/zoom (was 9, which ended
      // mid-screen on phones once the scroll travel zoomed in).
      vec3 far = p + d * 30.0;
      // uRayScale widens the mid band and haze with scroll so the fan grows
      // from hairlines into bands that fill the screen by the end.
      // uExitGain stays 1: while the prism is edge-on the fan is kept open
      // by blending toward the rest-pose fan in the frame loop (owner: no
      // white light, keep the rainbow).
      spectrum += c * segmentGlow(ro, rd, p, far, 0.00055) * 2.6 * uExitGain;
      spectrum += c * segmentGlow(ro, rd, p, far, 0.0030 * uRayScale) * 0.85 * uExitGain;
      spectrum += c * segmentGlow(ro, rd, p, far, 0.0180 * uRayScale * uRayScale) * 0.20 * uExitGain;

      // A train of motes riding each ray, staggered per wavelength so the
      // fan reads as light in transit rather than static lines. Each fades
      // in over the first 6% of its own travel and out over the last 12%,
      // holding near-full brightness through the middle. MOTE_COUNT motes
      // per ray (evenly offset in phase) rather than one — a single mote
      // per ray read as too sparse ("more dense" was the request); this
      // is the same travelling-light effect, just several in flight
      // along each ray at once instead of a lone dot.
      for (int m = 0; m < MOTE_COUNT; m++) {
        float phase = fract(uTime * 0.16 + float(i) * 0.13 + float(m) / float(MOTE_COUNT));
        vec3 mote = p + d * (phase * 9.0);
        float moteFade = smoothstep(0.0, 0.06, phase) * smoothstep(1.0, 0.88, phase);
        spectrum += (c * 0.7 + 0.5) * pointGlow(ro, rd, mote, 0.0034) * 2.4 * moteFade;
      }
    }
  }
  col += spectrum * uSpectrumFade;

  /* --- the glass itself --- */
  float tn, tf; vec3 nn, nf;
  if (traceGlass(ro, rd, tn, nn, tf, nf) && tn > 0.0) {
    float cosI = clamp(dot(-rd, nn), 0.0, 1.0);

    // Schlick. The rim is where glass declares itself.
    float fres = 0.04 + 0.96 * pow(1.0 - cosI, 5.0);

    vec3 refl = environment(reflect(rd, nn));

    // Single mid-spectrum index for the body; the dispersion that matters
    // visually is carried by the traced fan above.
    vec3 refrDir = refract(rd, nn, 1.0 / 1.66);
    vec3 refr = environment(refrDir);

    // Beer-Lambert over the path length: thicker glass, cooler and denser.
    float thickness = max(tf - tn, 0.0);
    refr *= exp(-thickness * vec3(0.34, 0.26, 0.20));

    vec3 glass = mix(refr, refl, fres);

    // Edge accent, widened from a narrow grazing-only band (exponent 8) to
    // a much broader one (exponent 3): at 8, the rim only lit up at the
    // most extreme angles, which combined with environment()'s old dim
    // baseline left most of the body reading as flat black. This is still
    // a rim effect, not a global bloom — it fades to 0 at head-on
    // incidence — just wide enough that some part of the silhouette
    // reliably catches it from ordinary viewing angles.
    float edge = pow(1.0 - cosI, 3.0);
    glass += vec3(0.55, 0.72, 0.95) * edge * 0.55;

    // Flat ambient glass tint, independent of viewing angle or the
    // environment map: without this, a facet lit by neither the key/fill
    // highlight nor the edge rim above had nothing distinguishing it from
    // the pure-black background it sits in front of. This is what actually
    // fixes "the prism is not visible" — the rim/highlight terms alone
    // only lit up a fraction of the body on any given frame.
    glass += vec3(0.05, 0.065, 0.09);

    // Faint internal caustic so the body is not empty.
    glass += vec3(0.10, 0.13, 0.20) * pow(thickness, 1.6) * 0.05;

    // ARTISTIC — uSceneDim recedes the glass's environment-derived light as
    // scroll progress advances. Applied once, here, after every glass term
    // is summed, so it covers reflection/refraction/edge/caustic together —
    // and only those. The beam and spectrum below are the simulated light
    // itself, not an environment response, and are never scaled by this.
    // uFade (the original, un-staged ease-in) covers the glass itself —
    // requested to appear together with the beam from the very start, not
    // gated behind the beam's travel like the spectrum is.
    glass *= uSceneDim * uFade;

    col += glass;
  }

  /* --- atmosphere: sparse drifting motes, parallaxed by depth --- */
  for (int i = 0; i < 2; i++) {
    float depth = 1.0 + float(i) * 1.7;
    vec2  gp = uv * (3.5 * depth) + vec2(uTime * 0.012 * depth, uTime * 0.006);
    vec2  cell = floor(gp);
    vec2  f = fract(gp) - 0.5;
    float h = hash(cell + float(i) * 37.0);
    if (h > 0.955) {
      float d = length(f - (vec2(hash(cell + 5.0), hash(cell + 9.0)) - 0.5) * 0.7);
      col += vec3(0.5, 0.6, 0.85) * (0.0016 / (0.0016 + d * d)) * 0.055 / depth * uFade;
    }
  }

  col = tonemap(col);

  // Dither before quantisation: the background is a dark gradient and would
  // otherwise band visibly on 8-bit displays.
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function PrismCanvas({
  onFail,
  sceneStore,
}: {
  onFail: () => void;
  sceneStore: ScrollSceneStore | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // sceneStore arrives as a prop that starts null and becomes real only
  // after ScrollSceneProvider's own mount effect runs — after the WebGL
  // setup effect below has already started (it depends only on `onFail`, so
  // it never re-runs when the prop later changes). The frame loop reads
  // this ref every tick instead of closing over the prop, so it always sees
  // the current store rather than the null it was handed at setup time.
  const sceneStoreRef = useRef(sceneStore);
  useEffect(() => {
    sceneStoreRef.current = sceneStore;
  }, [sceneStore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    if (!gl) {
      onFail();
      return;
    }

    const compiled = compilePrismProgram(gl, VERT, FRAG);
    if (!compiled) {
      onFail();
      return;
    }
    const { program: prog, vs, fs } = compiled;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(prog, name);
    const uRes = u("uRes");
    const uFwdScale = u("uFwdScale");
    const uZoom = u("uZoom");
    const uRayScale = u("uRayScale");
    const uFocusW = u("uFocusW[0]");
    const uExitGain = u("uExitGain");
    const focusW = new Float32Array(SAMPLES).fill(1);
    let focus: { nm: number; t0: number } | null = null;
    const onFocus = (e: Event) => {
      const nm = (e as CustomEvent<number>).detail;
      if (typeof nm === "number") focus = { nm, t0: performance.now() };
      markActive();
    };
    let lastActive = performance.now();
    let frameNo = 0;
    const markActive = () => {
      lastActive = performance.now();
    };
    window.addEventListener("prism:focus", onFocus);
    window.addEventListener("scroll", markActive, { passive: true });
    const uTime = u("uTime");
    const uCam = u("uCam");
    const uPlaneN = u("uPlaneN[0]");
    const uPlaneC = u("uPlaneC[0]");
    const uBeamO = u("uBeamO");
    const uEntry = u("uEntry");
    const uExitP = u("uExitP[0]");
    const uExitD = u("uExitD[0]");
    const uColor = u("uColor[0]");
    const uFade = u("uFade");
    const uArtSpin = u("uArtSpin");
    const uSceneDim = u("uSceneDim");
    const uBeamProgress = u("uBeamProgress");
    const uSpectrumFade = u("uSpectrumFade");

    // Captured after the null guards so the render loop closes over
    // non-nullable handles.
    const ctx = gl;
    const cv = canvas;

    // The top-shift transform (below) is applied to this — .prism-scene,
    // the shared parent of both the canvas and the SVG fallback (.prism-wrap)
    // — rather than the canvas alone. Shifting only the canvas left the
    // fallback (visible during the ~1.2s before WebGL mounts, per
    // PrismScene.tsx's idle-defer) rendering at the old centered position;
    // the scene would visibly jump from centered to top the moment the
    // canvas took over. Both elements move together now, correct from the
    // very first frame.
    const sceneEl = cv.parentElement;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Pointer parallax is back on the dynamic camera (uCam) — requested
    // directly: the glass/spectrum should drift with the mouse. The
    // incident beam is immune to it by construction (see roFixed/rdFixed
    // in the shader above), so this can't reintroduce the "beam moves"
    // complaint that removing parallax entirely was fixing before.
    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    let sEased = -1;
    let lastNow = performance.now();
    let visible = true;
    let fade = 0;
    let raf = 0;
    let elapsed = 0;
    let start = performance.now();

    const onPointer = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointermove", markActive, { passive: true });

    // 1.1M fragments/frame — a wider budget than the project-page ray gets
    // (lib/prismShader.ts), since this canvas is full-viewport and carries
    // the scroll-driven animation the ray doesn't.
    // Lowered from 1.1M in build 1046 for smoother scrolling on mid-range
    // laptops; the difference is not visible at this blur level.
    const ro = observePrismResize(cv, ctx, 900_000);

    const frame = (now: number) => {
      if (!visible || document.hidden) {
        raf = 0;
        return;
      }
      frameNo++;
      if (now - lastActive > IDLE_MS && frameNo % 2 === 1 && !focus) {
        raf = requestAnimationFrame(frame);
        return;
      }
      elapsed = (now - start) / 1000;
      const still = reduce.matches;
      const t = still ? 0 : elapsed;

      // Pointer parallax is eased rather than tracked: weight, not twitch.
      eased.x += (pointer.x - eased.x) * 0.045;
      eased.y += (pointer.y - eased.y) * 0.045;

      fade += (1 - fade) * 0.035;

      // Staged load-in, requested to match how the original SVG hero
      // sequenced itself: the beam visibly travels in first, and only once
      // it reaches the glass does the spectrum emerge — not everything
      // fading in as one unit. Driven off raw elapsed time (not `t`, which
      // is pinned to 0 under reduced motion) so the stage boundaries are
      // real seconds since mount; reduced motion skips the sequence
      // entirely and jumps straight to the settled end state, same as
      // `fade`/`still` do everywhere else in this file.
      const beamProgress = still ? 1 : smoothstep(0, BEAM_TRAVEL_S, elapsed);
      const spectrumFade = still
        ? 1
        : smoothstep(BEAM_TRAVEL_S, BEAM_TRAVEL_S + SPECTRUM_FADE_S, elapsed);

      const sRaw = still ? 0 : Math.min(1, Math.max(0, sceneStoreRef.current?.get() ?? 0));
      // Eased copy of scroll for everything the eye follows (spin, fan,
      // zoom, dim). The vertical top shift below keeps the raw value so the
      // prism stays aligned with the hero text at the top of the page.
      const dt = Math.min(0.1, Math.max(0, (now - lastNow) / 1000));
      lastNow = now;
      if (still || sEased < 0) sEased = sRaw;
      else sEased += (sRaw - sEased) * (1 - Math.exp(-dt / SCROLL_EASE_S));
      if (Math.abs(sRaw - sEased) > 1e-4) lastActive = now;
      const s = sEased;

      // On load, the scene renders near the top of the pinned box — close
      // to the wordmark above it — rather than centered. As soon as
      // scrolling starts it slides down and settles into the centered
      // framing for the rest of the pin span, and reverses cleanly on
      // scroll-up since it's driven by live scroll position every frame,
      // not a one-shot animation. TOP_SHIFT_VH/TOP_SHIFT_END are the only
      // two numbers governing this — how far up "top" sits, and how much
      // scroll progress it takes to settle.
      const topProgress = smoothstep(0, TOP_SHIFT_END, sRaw);
      const maxShift = Math.min(TOP_SHIFT_MAX_PX, TOP_SHIFT_VH * 0.01 * cv.clientHeight);
      const shiftPx = (1 - topProgress) * -maxShift;
      // Always set explicitly, never cleared to "" — shiftPx reaches exactly
      // 0 once fully centered (1 - topProgress === 0, and JS's `0` is
      // falsy), and clearing the inline style at that exact point let
      // .prism-scene's own static CSS default (translateY(-90px), added for
      // the pre-JS first paint) take back over with nothing left to
      // override it. That was the "snaps back to top" glitch — it
      // reproduced deterministically at exactly the scroll position where
      // shiftPx first hit 0, confirmed against both dev and a production
      // build. Always writing a transform, even translateY(0px), keeps the
      // inline style permanently authoritative once JS is running.
      if (sceneEl) sceneEl.style.transform = `translateY(${shiftPx}px)`;

      // The incident beam holds one fixed pose; the prism's only motion is
      // the scroll-linked spin about its vertical axis (spinYaw, above) —
      // no idle time-based drift, no pointer-driven rotation.
      // Previously pitch/yaw/roll all wobbled continuously (autonomous sine
      // waves) and pitch/yaw also reacted to both scroll and pointer, which
      // moved the entry point where the beam appears to strike the glass
      // every frame — reading as "the light is moving" rather than settled.
      // Only the fan's spread (fanGain, below) responds to scroll now. This
      // exact pose (REST_PITCH/REST_YAW/REST_ROLL, declared above with
      // BEAM_ORIGIN/BEAM_DIR) was chosen by sweeping lib/prism.ts's optics
      // standalone for a horizontal beam, not by the yawFloor safety margin
      // the old scroll-driven range needed — there is no range to protect
      // now that this is a single constant pose, so that clamp is gone.
      const yaw = still ? REST_YAW : spinYaw(smoothstep(SCROLL_TRAVEL_START, 1, s));
      const rot: Mat3 = rotationMatrix(REST_PITCH, yaw, REST_ROLL);

      // The gain passed here only reshapes how far each already-traced ray
      // sits from the fan's mean (see spreadFan in lib/prism.ts) — it cannot
      // revive or kill a TIR outcome, so scroll-driving it is exactly as
      // safe as the fixed 2.4 it replaces. This is now the *only* thing
      // scroll drives: the fan widens from a tight, physically-real spread
      // at the top of the page to a wide, legible spectrum by the bottom,
      // while the beam and glass underneath it never move.
      const fanGain = still ? FAN_GAIN_MIN : FAN_GAIN_MIN + s * (FAN_GAIN_MAX - FAN_GAIN_MIN);
      const path = traceSpectrum(rot, BEAM_ORIGIN, BEAM_DIR, fanGain);

      // ARTISTIC — uSceneDim recedes the glass's own lighting as scroll
      // progresses (see its shader comment); it never touches the beam or
      // spectrum, which are the simulated light itself. uArtSpin (the
      // screen-space camera roll this used to carry, in both its
      // scroll-driven and fixed forms) is retired for good — the beam is
      // now level by construction (BEAM_DIR itself), so no image rotation
      // is needed to fake it, and none is applied.
      const sceneDim = still ? 1 : 1 - s * (1 - SCENE_DIM_FLOOR);

      // Pointer parallax is back on this dynamic camera — the glass and
      // spectrum drift with the mouse again, a viewer looking around a
      // fixed object. The beam stays immune to it (roFixed/rdFixed in the
      // shader use a hardcoded, matching-but-separate camera constant), so
      // this can no longer drag the beam along with it the way the single
      // shared camera used to.
      const cam: Vec3 = [-eased.x * 0.3, 0.34 - eased.y * 0.2, 3.6];

      // The horizontal FOV is aspect-scaled: without this, the fixed 2.6
      // constant that framed the fan correctly on a wide desktop canvas
      // clipped almost the entire rainbow on a narrow mobile canvas, since
      // the visible NDC-x range is ±aspect regardless of FOV. Scaling keeps
      // the same world-space content in frame at any aspect; the clamp stops
      // ultra-wide monitors from zooming out until the prism is a speck.
      const aspect = cv.width / cv.height;
      const fwdScale = FOV_K * Math.min(Math.max(aspect, ASPECT_MIN), ASPECT_MAX);

      ctx.uniform2f(uRes, cv.width, cv.height);
      ctx.uniform1f(uFwdScale, fwdScale);
      const travel = still ? 0 : smoothstep(SCROLL_TRAVEL_START, 1, s);
      ctx.uniform1f(uZoom, 1 + travel * (SCROLL_ZOOM_END - 1));
      ctx.uniform1f(uRayScale, 1 + travel * (SCROLL_RAY_SCALE_END - 1));
      if (focus) {
        const k = Math.max(0, 1 - (now - focus.t0) / FOCUS_MS);
        const strength = k * k * (3 - 2 * k);
        for (let i = 0; i < SAMPLES; i++) {
          const nm = FOCUS_NM_MIN + (i * (FOCUS_NM_MAX - FOCUS_NM_MIN)) / (SAMPLES - 1);
          const g = Math.exp(-((nm - focus.nm) ** 2) / (2 * FOCUS_SIGMA_NM ** 2));
          focusW[i] = 1 + strength * (1.8 * g - 0.6 * (1 - g));
        }
        if (k === 0) focus = null;
      } else {
        focusW.fill(1);
      }
      ctx.uniform1fv(uFocusW, focusW);

      // Fan width in degrees (vertical angle of each live exit ray). Below a
      // few degrees the fan reads as one white line; owner: "I don't want
      // this white light, I need the rainbow pattern". So as the real fan
      // collapses (prism edge-on), each ray's direction eases toward the
      // fan the prism makes at its rest pose. The glass still spins in true
      // 3D and the rays still leave from the real exit points; only the
      // edge-on directions are artistic.
      let minA = Infinity;
      let maxA = -Infinity;
      for (let i = 0; i < SAMPLES; i++) {
        const dx = path.exitDirs[i * 3];
        const dy = path.exitDirs[i * 3 + 1];
        const dz = path.exitDirs[i * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < 0.5) continue;
        const a = (Math.atan2(dy, Math.hypot(dx, dz)) * 180) / Math.PI;
        if (a < minA) minA = a;
        if (a > maxA) maxA = a;
      }
      const fanDeg = maxA > minA ? maxA - minA : 0;
      const keepOpen = 1 - smoothstep(3, 14, fanDeg);
      if (keepOpen > 0) {
        const ref = traceSpectrum(rotationMatrix(REST_PITCH, REST_YAW, REST_ROLL), BEAM_ORIGIN, BEAM_DIR, fanGain);
        const dirs = path.exitDirs;
        for (let i = 0; i < SAMPLES; i++) {
          const o = i * 3;
          const rx = ref.exitDirs[o], ry = ref.exitDirs[o + 1], rz = ref.exitDirs[o + 2];
          if (rx * rx + ry * ry + rz * rz < 0.5) continue;
          const ax = dirs[o], ay = dirs[o + 1], az = dirs[o + 2];
          const alive = ax * ax + ay * ay + az * az > 0.5;
          const bx = alive ? ax + (rx - ax) * keepOpen : rx;
          const by = alive ? ay + (ry - ay) * keepOpen : ry;
          const bz = alive ? az + (rz - az) * keepOpen : rz;
          const len = Math.hypot(bx, by, bz) || 1;
          dirs[o] = bx / len;
          dirs[o + 1] = by / len;
          dirs[o + 2] = bz / len;
        }
      }
      ctx.uniform1f(uExitGain, 1);
      ctx.uniform1f(uArtSpin, 0);
      ctx.uniform1f(uSceneDim, sceneDim);
      ctx.uniform1f(uTime, t);
      ctx.uniform3fv(uCam, cam);
      ctx.uniform3fv(uPlaneN, path.planeN);
      ctx.uniform1fv(uPlaneC, path.planeC);

      // The rendered incoming-beam segment runs from here to path.entry —
      // not from BEAM_ORIGIN. Sharing the entry point's y/z (only x differs,
      // pulled far enough left to stay off-canvas) makes the drawn segment
      // perfectly horizontal, while BEAM_ORIGIN/BEAM_DIR above are still
      // exactly what traceSpectrum used to compute that entry point and
      // every exit ray — the physics is untouched, only this one segment's
      // rendered start point is artistic. See the file-header comment for
      // why the beam and the glass can't both be leveled by rotating one
      // shared pose.
      // x is pulled much further left than BEAM_ORIGIN's own -3.37 (which
      // only reached partway across the frame, leaving a visible gap at the
      // left edge — reported directly: "the white light should come from
      // the leftmost of the screen") so the drawn segment starts well
      // outside the frustum at any realistic aspect ratio and the line
      // spans the full width, edge to edge.
      const visualBeamOrigin: Vec3 = [-14, path.entry[1], path.entry[2]];
      ctx.uniform3fv(uBeamO, visualBeamOrigin);
      ctx.uniform3fv(uEntry, path.entry);
      ctx.uniform3fv(uExitP, path.exitPoints);
      ctx.uniform3fv(uExitD, path.exitDirs);
      ctx.uniform3fv(uColor, path.colors);
      ctx.uniform1f(uFade, Math.min(fade, 1));
      ctx.uniform1f(uBeamProgress, beamProgress);
      ctx.uniform1f(uSpectrumFade, spectrumFade);

      ctx.drawArrays(ctx.TRIANGLES, 0, 3);

      // A still frame needs no further work once it has faded in.
      if (still && fade > 0.995) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) {
          start = performance.now() - elapsed * 1000;
          raf = requestAnimationFrame(frame);
        }
      },
      { threshold: 0 }
    );
    io.observe(cv);

    const onVisibility = () => {
      if (!document.hidden && visible && !raf) {
        start = performance.now() - elapsed * 1000;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("prism:focus", onFocus);
      window.removeEventListener("scroll", markActive);
      window.removeEventListener("pointermove", markActive);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      ctx.deleteProgram(prog);
      ctx.deleteShader(vs);
      ctx.deleteShader(fs);
      ctx.deleteBuffer(buf);
    };
  }, [onFail]);

  return <canvas ref={canvasRef} className="prism-canvas" aria-hidden="true" />;
}
