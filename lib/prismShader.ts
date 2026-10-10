/**
 * GLSL shared between the two prism renderers (components/PrismCanvas.tsx,
 * the scroll-driven homepage scene, and components/ProjectPrismRay.tsx, the
 * static single-wavelength ray on project pages). Both trace the same glass
 * against the same studio lighting; only the per-frame animation and the
 * number of simultaneous rays differ, which stays in each component's own
 * fragment shader.
 *
 * Extracted rather than left duplicated
 * because the two copies had already drifted once (see the git history of
 * this file's predecessor blocks) — one shared source is the only way a
 * future tuning pass (like the mote fade above) reaches both renderers by
 * construction instead of by remembering to copy it twice.
 *
 * Both consumers must declare `uniform vec3 uPlaneN[PLANES];` and
 * `uniform float uPlaneC[PLANES];` (PLANES = 5) before splicing this in —
 * traceGlass reads them directly rather than taking them as parameters,
 * matching how it was already written in both original copies.
 */
export const PRISM_GLSL_COMMON = `
/* Soft 3D point light, used for the motes travelling along each ray. */
float pointGlow(vec3 ro, vec3 rd, vec3 p, float size) {
  float t = max(dot(rd, p - ro), 0.0);
  float d = length((ro + rd * t) - p);
  float g = size / (size + d * d * 60.0);
  return g * g;
}

/* ---------------------------------------------------------------
   Volumetric segment glow.
   Closest approach between the view ray and a light segment, shaped
   into a soft tube. This is what makes the beam read as light in air
   rather than a stroked line.
---------------------------------------------------------------- */
float segmentGlow(vec3 ro, vec3 rd, vec3 a, vec3 b, float width) {
  vec3 ab = b - a;
  vec3 w0 = ro - a;

  float bb = dot(rd, ab);
  float cc = dot(ab, ab);
  float dd = dot(rd, w0);
  float ee = dot(ab, w0);

  // Closest approach between the view ray and the segment. The sign of the
  // segment parameter matters: a negated denominator clamps every ray to its
  // start point and the whole fan collapses into dots.
  float den = cc - bb * bb;
  float s = den < 1e-6 ? 0.0 : clamp((ee - bb * dd) / den, 0.0, 1.0);

  vec3  q = a + ab * s;
  float t = max(dot(rd, q - ro), 0.0);
  float d = length((ro + rd * t) - q);

  float core = width / (width + d * d * 26.0);
  return core * core;
}

/* ---------------------------------------------------------------
   Ray against the convex solid, as a slab test over its half-spaces.
---------------------------------------------------------------- */
bool traceGlass(vec3 ro, vec3 rd, out float tn, out vec3 nn, out float tf, out vec3 nf) {
  tn = -1e9; tf = 1e9;
  nn = vec3(0.0); nf = vec3(0.0);

  for (int i = 0; i < PLANES; i++) {
    vec3  n = uPlaneN[i];
    float denom = dot(n, rd);
    float dist  = dot(n, ro) + uPlaneC[i];

    if (abs(denom) < 1e-6) {
      if (dist > 0.0) return false;
    } else {
      float t = -dist / denom;
      if (denom < 0.0) { if (t > tn) { tn = t; nn = n; } }
      else             { if (t < tf) { tf = t; nf = n; } }
    }
  }
  return tn <= tf && tf > 0.0;
}

/* ---------------------------------------------------------------
   Studio environment. A soft key from upper-left, a cool fill from
   lower-right, near-black everywhere else — the lighting of a product
   shot, not an outdoor scene.
---------------------------------------------------------------- */
vec3 environment(vec3 d) {
  float up = d.y * 0.5 + 0.5;
  // Base ambient roughly doubled and both highlight cones widened (lower
  // exponents) from the original tuning: at the old values the glass body
  // was, in practice, dark enough to be indistinguishable from the pure-
  // black backdrop except for a razor-thin, easy-to-miss key highlight —
  // the prism read as invisible rather than as glass. This keeps the same
  // "studio product shot" character (still near-black away from the key/
  // fill directions) while giving the body enough ambient level to read as
  // a solid against the background from most viewing angles, not just one.
  vec3 c = mix(vec3(0.022, 0.025, 0.036), vec3(0.075, 0.085, 0.115), pow(up, 1.6));

  float key = pow(max(dot(d, normalize(vec3(-0.35, 0.72, 0.45))), 0.0), 10.0);
  c += vec3(0.95, 0.97, 1.0) * key * 0.9;

  float fill = pow(max(dot(d, normalize(vec3(0.62, -0.25, 0.55))), 0.0), 5.0);
  c += vec3(0.16, 0.22, 0.34) * fill * 0.4;

  return c;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

/* Filmic tone curve. Keeps the beam core from clipping to flat white. */
vec3 tonemap(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}
`;

/** Compiles and links a program from vertex/fragment source. Logs and
 * returns null on any failure — callers already know how to react (both
 * renderers call their onFail/setFailed path). Shaders are not deleted on
 * success: the caller keeps the handles for its own cleanup, matching how
 * both renderers already manage the rest of their GL resources. */
export function compilePrismProgram(
  gl: WebGLRenderingContext,
  vertSrc: string,
  fragSrc: string
): { program: WebGLProgram; vs: WebGLShader; fs: WebGLShader } | null {
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  };

  const vs = compile(gl.VERTEX_SHADER, vertSrc);
  const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) return null;

  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return null;
  }
  gl.useProgram(program);
  return { program, vs, fs };
}

/** Sizes a canvas to its CSS box, capped at `budget` fragments/frame by
 * scaling down devicePixelRatio rather than clamping the ratio alone —
 * keeps a wide, short canvas and a tall, narrow one under the same real
 * cost. Returns a ResizeObserver already observing the canvas; call
 * `.disconnect()` on it during cleanup. */
export function observePrismResize(
  canvas: HTMLCanvasElement,
  gl: WebGLRenderingContext,
  budget: number
): ResizeObserver {
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const raw = Math.min(window.devicePixelRatio || 1, 2);
    const area = r.width * r.height * raw * raw;
    const dpr = area > budget ? raw * Math.sqrt(budget / area) : raw;

    const w = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  return ro;
}

/** requestIdleCallback with a setTimeout fallback, and the matching
 * cancellation — the exact pattern both renderers' mount-deferral already
 * used independently. Returns a single cancel function so callers don't
 * need to remember which path was taken. */
export function scheduleIdle(cb: () => void, timeout: number): () => void {
  const hasIdle = typeof window.requestIdleCallback === "function";
  if (hasIdle) {
    const id = window.requestIdleCallback(cb, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, Math.min(timeout, 400));
  return () => clearTimeout(id);
}
