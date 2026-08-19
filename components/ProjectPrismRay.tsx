"use client";
import { useEffect, useRef, useState } from "react";
import {
  nearestSampleIndex,
  rotationMatrix,
  traceSpectrum,
  type Mat3,
  type Vec3,
} from "@/lib/prism";
import {
  PRISM_GLSL_COMMON,
  compilePrismProgram,
  observePrismResize,
  scheduleIdle,
} from "@/lib/prismShader";

/**
 * The single-wavelength continuation of the homepage's spectrum, shown on a
 * project's own page. Same beam, same glass, same optics engine as the
 * pinned hero scene — but isolated to the one wavelength assigned to this
 * project.
 *
 * Reuses the exact rest pose and beam already verified TIR-safe on the
 * homepage (PrismCanvas.tsx) rather than deriving a new one.
 *
 * Previously each project also got a "different angle" via a per-wavelength
 * screen-space camera roll (rollForWavelength, now removed) — the same
 * uArtSpin mechanism PrismCanvas.tsx used to use, and the same bug: at the
 * roll magnitudes this produced (up to ±90°, e.g. -50° for this exact
 * project), the whole rendered image rotates, including the glass, which
 * reads as a garbled, mirrored-looking double-triangle rather than a prism
 * shot from a different side — reported directly as "look at this glitch."
 * Every project's roll fell in a range large enough to trigger this (-70°
 * to +50° across the six wavelength tokens), so this wasn't one project's
 * bug, it was all six. Fixed the same way PrismCanvas.tsx was: no more
 * screen roll. Each project page still reads as visually distinct via its
 * own wavelength colour.
 */

// Same beam and rest pose as the homepage's PrismCanvas — proven TIR-safe,
// deliberately not re-derived here.
const BEAM_ORIGIN: Vec3 = [-3.37, -0.67, 0.0];
const BEAM_DIR: Vec3 = [0.9455, 0.3256, 0.0];
const REST_POSE: [number, number, number] = [0.06, -0.08, 0.07];

// Same staged load-in timing as PrismCanvas.tsx.
const BEAM_TRAVEL_S = 1.0;
const SPECTRUM_FADE_S = 0.6;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

const WAVELENGTH_BY_TOKEN: Record<string, number> = {
  "var(--v400)": 400,
  "var(--v450)": 450,
  "var(--v500)": 500,
  "var(--v560)": 560,
  "var(--v600)": 600,
  "var(--v680)": 680,
};

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

#define PLANES 5
#define MOTE_COUNT 4

uniform vec2  uRes;
uniform float uFwdScale;
uniform float uTime;
uniform vec3  uCam;
uniform float uArtSpin;
uniform vec3  uPlaneN[PLANES];
uniform float uPlaneC[PLANES];
uniform vec3  uBeamO;
uniform vec3  uEntry;
uniform vec3  uExitP;
uniform vec3  uExitD;
uniform vec3  uColor;
uniform float uFade;
uniform float uBeamProgress;
uniform float uSpectrumFade;

${PRISM_GLSL_COMMON}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;

  float asC = cos(uArtSpin), asS = sin(uArtSpin);
  uv = vec2(uv.x * asC - uv.y * asS, uv.x * asS + uv.y * asC);

  vec3 fwd   = normalize(-uCam);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up    = cross(right, fwd);
  vec3 rd    = normalize(right * uv.x + up * uv.y + fwd * uFwdScale);
  vec3 ro    = uCam;

  vec3 col = vec3(0.0);

  // Same staged-reveal + straight-beam treatment as PrismCanvas.tsx: the
  // beam draws in progressively toward the glass (uBeamProgress) rather
  // than fading in at full length, and uBeamO here is a horizontal-only
  // start point (see the JS below), not the true physics origin — the
  // camera here never moves (no pointer parallax on this static ray), so
  // this alone is enough to keep the beam level, no second fixed camera
  // needed the way the homepage's mouse-driven one required.
  vec3 beamFar = mix(uBeamO, uEntry, uBeamProgress);
  col += vec3(0.62, 0.66, 0.78) * segmentGlow(ro, rd, uBeamO, beamFar, 0.0018) * 1.4;

  vec3 spectrum = vec3(0.0);
  spectrum += uColor * segmentGlow(ro, rd, uEntry, uExitP, 0.0013) * 0.85;

  if (dot(uExitD, uExitD) > 0.5) {
    // 28.0, not the 9.0 this used to share with PrismCanvas.tsx: that
    // length was tuned for the homepage's own camera framing, and this
    // ray's camera now spans a much wider full-viewport canvas (following
    // the same full-bleed fix as the ray's own background) — 9 world
    // units stopped well short of the right edge of the frame at that
    // width, reported directly as "not touching the rightmost screen."
    // Longer reliably overshoots the visible frame at any aspect ratio.
    vec3 far = uExitP + uExitD * 28.0;
    spectrum += uColor * segmentGlow(ro, rd, uExitP, far, 0.0007) * 2.6;
    spectrum += uColor * segmentGlow(ro, rd, uExitP, far, 0.0035) * 0.85;
    spectrum += uColor * segmentGlow(ro, rd, uExitP, far, 0.020) * 0.20;

    // MOTE_COUNT motes in flight per ray, same as PrismCanvas.tsx — a
    // single mote (the old behaviour here) read as too sparse. Travel
    // distance matches the ray's own new length (28.0) so motes ride the
    // full visible ray, not just the first third of it.
    for (int m = 0; m < MOTE_COUNT; m++) {
      float phase = fract(uTime * 0.18 + float(m) / float(MOTE_COUNT));
      vec3 mote = uExitP + uExitD * (phase * 28.0);
      float moteFade = smoothstep(0.0, 0.06, phase) * smoothstep(1.0, 0.88, phase);
      spectrum += (uColor * 0.7 + 0.5) * pointGlow(ro, rd, mote, 0.0034) * 2.4 * moteFade;
    }
  }
  col += spectrum * uSpectrumFade;

  float tn, tf; vec3 nn, nf;
  if (traceGlass(ro, rd, tn, nn, tf, nf) && tn > 0.0) {
    float cosI = clamp(dot(-rd, nn), 0.0, 1.0);
    float fres = 0.04 + 0.96 * pow(1.0 - cosI, 5.0);
    vec3 refl = environment(reflect(rd, nn));
    vec3 refrDir = refract(rd, nn, 1.0 / 1.66);
    vec3 refr = environment(refrDir);
    float thickness = max(tf - tn, 0.0);
    refr *= exp(-thickness * vec3(0.34, 0.26, 0.20));
    vec3 glass = mix(refr, refl, fres);
    // Same widened-rim + flat-ambient fix as PrismCanvas.tsx's identical
    // block — the old narrow rim (exponent 8) plus environment()'s dim
    // baseline left the glass body indistinguishable from the black
    // backdrop for most of its silhouette.
    float edge = pow(1.0 - cosI, 3.0);
    glass += vec3(0.55, 0.72, 0.95) * edge * 0.55;
    glass += vec3(0.05, 0.065, 0.09);
    glass *= uFade;
    col += glass;
  }

  col = tonemap(col);

  // Added after tonemap, not before: this shader's "empty" pixels were
  // literal (0,0,0), which is visibly darker than the page's own
  // near-black (--bg-dark, #0B0C0F) over a large rectangular area — the
  // canvas read as a distinct black box against the page rather than
  // blending into it ("the black background behind the prism"). Matching
  // it here, post-tonemap so the curve can't darken it further, makes the
  // canvas's own background pixels equal the page's, not just close.
  col += vec3(0.0431, 0.0471, 0.0588);

  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function ProjectPrismRay({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  const nm = WAVELENGTH_BY_TOKEN[color] ?? 500;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let disposed = false;
    let cleanup = () => {};

    const start = () => {
      if (disposed) return;
      const gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
      });
      if (!gl) {
        setFailed(true);
        return;
      }

      const compiled = compilePrismProgram(gl, VERT, FRAG);
      if (!compiled) {
        setFailed(true);
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
      const uTime = u("uTime");
      const uCam = u("uCam");
      const uArtSpin = u("uArtSpin");
      const uPlaneN = u("uPlaneN[0]");
      const uPlaneC = u("uPlaneC[0]");
      const uBeamO = u("uBeamO");
      const uEntry = u("uEntry");
      const uExitP = u("uExitP");
      const uExitD = u("uExitD");
      const uColorLoc = u("uColor");
      const uFade = u("uFade");
      const uBeamProgress = u("uBeamProgress");
      const uSpectrumFade = u("uSpectrumFade");

      const ctx = gl;
      const cv = canvas;

      // The optics are static (a fixed rest pose, matching the homepage) —
      // traced once, not per frame, since there is no scroll/pointer input
      // driving it here.
      const rot: Mat3 = rotationMatrix(...REST_POSE);
      const path = traceSpectrum(rot, BEAM_ORIGIN, BEAM_DIR);
      const idx = nearestSampleIndex(nm);
      const exitP: Vec3 = [
        path.exitPoints[idx * 3],
        path.exitPoints[idx * 3 + 1],
        path.exitPoints[idx * 3 + 2],
      ];
      const exitD: Vec3 = [
        path.exitDirs[idx * 3],
        path.exitDirs[idx * 3 + 1],
        path.exitDirs[idx * 3 + 2],
      ];
      const rayColor: Vec3 = [
        path.colors[idx * 3],
        path.colors[idx * 3 + 1],
        path.colors[idx * 3 + 2],
      ];
      // 260K fragments/frame — a much smaller budget than the homepage scene
      // (lib/prismShader.ts): this ray is a small, single-wavelength, static
      // decoration, not the full-viewport animated centrepiece.
      const ro = observePrismResize(cv, ctx, 260_000);

      let raf = 0;
      let fade = 0;
      let visible = true;
      let elapsed = 0;
      let frameStart = performance.now();

      const frame = (now: number) => {
        if (!visible) {
          raf = 0;
          return;
        }
        elapsed = (now - frameStart) / 1000;
        const t = reduce ? 0 : elapsed;
        fade += (1 - fade) * 0.035;

        // Same staged sequence as PrismCanvas.tsx: beam travels in first,
        // spectrum only starts fading in once it arrives. Reduced motion
        // skips straight to the settled end state.
        const beamProgress = reduce ? 1 : smoothstep(0, BEAM_TRAVEL_S, elapsed);
        const spectrumFade = reduce
          ? 1
          : smoothstep(BEAM_TRAVEL_S, BEAM_TRAVEL_S + SPECTRUM_FADE_S, elapsed);

        const aspect = cv.width / cv.height;
        const fwdScale = (2.6 / 2.9) * Math.min(Math.max(aspect, 0.6), 3.2);
        const cam: Vec3 = [0, 0.34, 3.6];

        // Rendered start point for the incoming beam is horizontal-only
        // (shares the entry point's y/z), not the true physics origin —
        // same trick as PrismCanvas.tsx's visualBeamOrigin, so the beam
        // reads as a level line instead of the diagonal the optics
        // actually use internally.
        const visualBeamOrigin: Vec3 = [-14, path.entry[1], path.entry[2]];

        ctx.uniform2f(uRes, cv.width, cv.height);
        ctx.uniform1f(uFwdScale, fwdScale);
        ctx.uniform1f(uTime, t);
        ctx.uniform3fv(uCam, cam);
        ctx.uniform1f(uArtSpin, 0);
        ctx.uniform3fv(uPlaneN, path.planeN);
        ctx.uniform1fv(uPlaneC, path.planeC);
        ctx.uniform3fv(uBeamO, visualBeamOrigin);
        ctx.uniform3fv(uEntry, path.entry);
        ctx.uniform3fv(uExitP, exitP);
        ctx.uniform3fv(uExitD, exitD);
        ctx.uniform3fv(uColorLoc, rayColor);
        ctx.uniform1f(uFade, Math.min(fade, 1));
        ctx.uniform1f(uBeamProgress, beamProgress);
        ctx.uniform1f(uSpectrumFade, spectrumFade);

        ctx.drawArrays(ctx.TRIANGLES, 0, 3);

        if (reduce && fade > 0.995) {
          raf = 0;
          return;
        }
        raf = requestAnimationFrame(frame);
      };

      // Same IntersectionObserver pause PrismCanvas already uses: this ray
      // sits at the very top of a long project page, so without it the loop
      // would otherwise run for the entire time the page stays open, long
      // after it has scrolled out of view.
      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible && !raf) {
            frameStart = performance.now() - elapsed * 1000;
            raf = requestAnimationFrame(frame);
          }
        },
        { threshold: 0 }
      );
      io.observe(cv);

      raf = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        ctx.deleteProgram(prog);
        ctx.deleteShader(vs);
        ctx.deleteShader(fs);
        ctx.deleteBuffer(buf);
      };
    };

    const cancelIdle = scheduleIdle(start, 1200);

    return () => {
      disposed = true;
      cancelIdle();
      cleanup();
    };
  }, [nm]);

  if (failed) return null;

  return <canvas ref={canvasRef} className="pp-ray" aria-hidden="true" />;
}
