/**
 * Optics for the hero prism.
 *
 * The spectrum fan is not decorative geometry. Each wavelength is refracted
 * through the actual prism using Cauchy's dispersion equation, so the fan
 * angles are a consequence of the prism's orientation — rotate it and the
 * spectrum spreads and sweeps the way real glass would.
 *
 * Runs on the CPU once per frame (a few hundred flops) and uploads the
 * resulting ray set to the shader, rather than re-deriving it per pixel.
 */

export type Vec3 = [number, number, number];

/* ---------- vector helpers ---------- */

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/* ---------- prism geometry ---------- */

/** Number of wavelength samples traced through the glass. */
export const SAMPLES = 10;

const INRADIUS = 0.62;
// Thinner than a geometrically "natural" prism, closer to the slender,
// almost graphic triangle on the Dark Side of the Moon cover than a chunky
// 3D solid. Pure scaling — changes only the plane offsets (c), never the
// normals (n) that angle-of-incidence math runs on, so this cannot affect
// TIR safety; the yawFloor clamp and its 21,500-pose sweep stay valid
// unchanged. Thinner glass also passes more light under the Beer-Lambert
// absorption term in the shader, which reads as clearer, more transparent
// glass "for free."
const HALF_DEPTH = 0.38;
const COS30 = Math.sqrt(3) / 2;

/**
 * An equilateral triangular cross-section in XY, extruded along Z, expressed
 * as five outward-facing half-spaces. A point is inside when
 * `dot(n, p) + c <= 0` for every plane, which makes ray intersection a slab
 * test rather than a mesh traversal.
 */
export const PLANES: { n: Vec3; c: number }[] = [
  { n: [0, -1, 0], c: -INRADIUS },
  { n: [COS30, 0.5, 0], c: -INRADIUS },
  { n: [-COS30, 0.5, 0], c: -INRADIUS },
  { n: [0, 0, 1], c: -HALF_DEPTH },
  { n: [0, 0, -1], c: -HALF_DEPTH },
];

/* ---------- dispersion ---------- */

/*
 * Cauchy coefficients, centred on crown glass (n ≈ 1.51) with dispersion
 * pushed to the top of the plausible range: n runs 1.485 (red) → 1.535
 * (violet).
 *
 * The mean index is not a style choice. A 60° prism has a critical angle of
 * asin(1/n) at the exit face; at n = 1.66 that is 37°, while the internal ray
 * arrives at roughly 45°, so every wavelength totally internally reflects and
 * nothing leaves the glass. Crown glass raises the critical angle to ~41° and
 * lets the spectrum out.
 */
const CAUCHY_A = 1.418;
const CAUCHY_B = 0.032;

/** Refractive index at a given wavelength in nanometres. */
export function ior(nm: number): number {
  const um = nm / 1000;
  return CAUCHY_A + CAUCHY_B / (um * um);
}

/**
 * Approximate linear-sRGB for a visible wavelength. Deliberately not the site
 * palette — the fan should be the physics, and the palette should be the echo
 * of it, not the other way round.
 */
export function wavelengthRGB(nm: number): Vec3 {
  let r = 0;
  let g = 0;
  let b = 0;

  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = -(nm - 510) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = -(nm - 645) / 65;
  } else if (nm <= 780) {
    r = 1;
  }

  // Roll off at the ends of the visible range so the fan fades rather than
  // terminating on a hard edge.
  let falloff = 1;
  if (nm > 700) falloff = 0.3 + (0.7 * (780 - nm)) / 80;
  else if (nm < 420) falloff = 0.3 + (0.7 * (nm - 380)) / 40;

  return [r * falloff, g * falloff, b * falloff];
}

/* ---------- ray / convex-solid intersection ---------- */

type Hit = { tNear: number; tFar: number; nNear: Vec3; nFar: Vec3 } | null;

/** Slab test against the half-space set. Returns both entry and exit. */
function intersect(ro: Vec3, rd: Vec3, planes: { n: Vec3; c: number }[]): Hit {
  let tNear = -1e9;
  let tFar = 1e9;
  let nNear: Vec3 = [0, 0, 0];
  let nFar: Vec3 = [0, 0, 0];

  for (const { n, c } of planes) {
    const denom = dot(n, rd);
    const dist = dot(n, ro) + c;

    if (Math.abs(denom) < 1e-9) {
      if (dist > 0) return null; // parallel and outside this slab
      continue;
    }

    const t = -dist / denom;
    if (denom < 0) {
      if (t > tNear) {
        tNear = t;
        nNear = n;
      }
    } else if (t < tFar) {
      tFar = t;
      nFar = n;
    }
  }

  if (tNear > tFar || tFar < 0) return null;
  return { tNear, tFar, nNear, nFar };
}

/**
 * Snell's law. `n` must face the incoming ray. Returns null on total internal
 * reflection, which is a real outcome at these angles and must be handled
 * rather than clamped away.
 */
function refract(i: Vec3, n: Vec3, eta: number): Vec3 | null {
  const cosi = -dot(n, i);
  const k = 1 - eta * eta * (1 - cosi * cosi);
  if (k < 0) return null;
  return add(scale(i, eta), scale(n, eta * cosi - Math.sqrt(k)));
}

/* ---------- 3x3 rotation ---------- */

export type Mat3 = number[]; // column-major, 9 entries

export function rotationMatrix(rx: number, ry: number, rz: number): Mat3 {
  const [sx, cx] = [Math.sin(rx), Math.cos(rx)];
  const [sy, cy] = [Math.sin(ry), Math.cos(ry)];
  const [sz, cz] = [Math.sin(rz), Math.cos(rz)];

  // R = Ry * Rx * Rz
  return [
    cy * cz + sy * sx * sz, cx * sz, -sy * cz + cy * sx * sz,
    -cy * sz + sy * sx * cz, cx * cz, sy * sz + cy * sx * cz,
    sy * cx, -sx, cy * cx,
  ];
}

const applyMat = (m: Mat3, v: Vec3): Vec3 => [
  m[0] * v[0] + m[3] * v[1] + m[6] * v[2],
  m[1] * v[0] + m[4] * v[1] + m[7] * v[2],
  m[2] * v[0] + m[5] * v[1] + m[8] * v[2],
];

/* ---------- the traced result ---------- */

export type SpectrumPath = {
  /** World-space entry point on the glass — shared by every wavelength. */
  entry: Vec3;
  /** Per-wavelength internal segment end points. */
  exitPoints: Float32Array;
  /** Per-wavelength outgoing directions after leaving the glass. */
  exitDirs: Float32Array;
  /** Per-wavelength linear RGB. */
  colors: Float32Array;
  /** World-space planes for the shader's own prism trace. */
  planeN: Float32Array;
  planeC: Float32Array;
  /** True when the incident ray misses the solid entirely. */
  missed: boolean;
};

const LAMBDA_MIN = 410;
const LAMBDA_MAX = 690;

/**
 * Which of traceSpectrum's SAMPLES output slots is nearest a target
 * wavelength — used to pick a single project-accent ray back out of a full
 * trace (see components/ProjectPrismRay.tsx), rather than re-deriving the
 * sample spacing at every call site.
 */
export function nearestSampleIndex(nm: number): number {
  const t = (nm - LAMBDA_MIN) / (LAMBDA_MAX - LAMBDA_MIN);
  return Math.min(SAMPLES - 1, Math.max(0, Math.round(t * (SAMPLES - 1))));
}

/**
 * Artistic spread applied to the emergent fan.
 *
 * Real dispersion through a 60° prism separates violet from red by only ~13°,
 * which at this canvas's aspect ratio reads as a single diagonal streak rather
 * than a spectrum. The physics still generates everything that matters — the
 * ordering of the wavelengths, their relative spacing, the entry and exit
 * geometry, and the way the whole fan sweeps as the prism turns. This gain
 * only scales each ray's deviation from the fan's mean direction, so the
 * result is the true spectrum, magnified.
 *
 * Raising the glass index to achieve this optically would push past the
 * critical angle and lose the spectrum to total internal reflection instead.
 *
 * A caller-supplied value (see traceSpectrum) rather than always this
 * default lets the hero scene widen the spread with scroll progress — still
 * squarely an artistic choice, not a physics one, so it's exposed as a
 * parameter rather than hidden as an internal constant.
 */
const FAN_GAIN = 2.4;

/**
 * Amplifies each exit ray's angular deviation from the fan's mean direction.
 * Dead rays (total internal reflection) are skipped so they neither contribute
 * to the mean nor get revived — the gain reshapes live rays only and can
 * neither create nor erase a TIR outcome.
 */
function spreadFan(dirs: Float32Array, gain: number): void {
  const live: number[] = [];
  const mean: Vec3 = [0, 0, 0];

  for (let i = 0; i < SAMPLES; i++) {
    const d: Vec3 = [dirs[i * 3], dirs[i * 3 + 1], dirs[i * 3 + 2]];
    if (dot(d, d) < 0.5) continue;
    live.push(i);
    mean[0] += d[0];
    mean[1] += d[1];
    mean[2] += d[2];
  }
  if (live.length < 2) return;

  const axis = norm(mean);

  for (const i of live) {
    const d: Vec3 = [dirs[i * 3], dirs[i * 3 + 1], dirs[i * 3 + 2]];
    const spread = norm([
      axis[0] + (d[0] - axis[0]) * gain,
      axis[1] + (d[1] - axis[1]) * gain,
      axis[2] + (d[2] - axis[2]) * gain,
    ]);
    dirs.set(spread, i * 3);
  }
}

/**
 * Traces the incident beam through the rotated prism for every wavelength
 * sample: refract in, cross the glass, refract out.
 */
export function traceSpectrum(
  rot: Mat3,
  beamOrigin: Vec3,
  beamDir: Vec3,
  fanGain: number = FAN_GAIN
): SpectrumPath {
  // Rotating the planes is cheaper and clearer than inverse-transforming the
  // ray, and the shader needs the world-space planes anyway.
  const planeN = new Float32Array(PLANES.length * 3);
  const planeC = new Float32Array(PLANES.length);
  const world = PLANES.map(({ n, c }, i) => {
    const wn = applyMat(rot, n);
    planeN[i * 3] = wn[0];
    planeN[i * 3 + 1] = wn[1];
    planeN[i * 3 + 2] = wn[2];
    planeC[i] = c;
    return { n: wn, c };
  });

  const exitPoints = new Float32Array(SAMPLES * 3);
  const exitDirs = new Float32Array(SAMPLES * 3);
  const colors = new Float32Array(SAMPLES * 3);

  const rd = norm(beamDir);
  const hit = intersect(beamOrigin, rd, world);

  if (!hit) {
    return {
      entry: beamOrigin,
      exitPoints,
      exitDirs,
      colors,
      planeN,
      planeC,
      missed: true,
    };
  }

  const entry = add(beamOrigin, scale(rd, hit.tNear));

  for (let i = 0; i < SAMPLES; i++) {
    const nm = LAMBDA_MIN + ((LAMBDA_MAX - LAMBDA_MIN) * i) / (SAMPLES - 1);
    const eta = 1 / ior(nm);
    const rgb = wavelengthRGB(nm);

    colors[i * 3] = rgb[0];
    colors[i * 3 + 1] = rgb[1];
    colors[i * 3 + 2] = rgb[2];

    const inside = refract(rd, hit.nNear, eta);
    if (!inside) {
      // Grazing entry: park the segment at the entry point so it contributes
      // nothing rather than shooting off in an arbitrary direction.
      exitPoints.set(entry, i * 3);
      exitDirs.set([0, 0, 0], i * 3);
      continue;
    }

    // Nudge off the surface so the exit trace does not re-hit the entry face.
    const from = add(entry, scale(inside, 1e-4));
    const out = intersect(from, inside, world);
    if (!out) {
      exitPoints.set(entry, i * 3);
      exitDirs.set([0, 0, 0], i * 3);
      continue;
    }

    const exitPoint = add(from, scale(inside, out.tFar));
    exitPoints.set(exitPoint, i * 3);

    // Leaving the glass: the interface normal must face the ray, which is
    // travelling outward, so it is the negated outward normal.
    const facing: Vec3 = scale(out.nFar, -1);
    const outward = refract(inside, facing, ior(nm));

    // Total internal reflection is left as a dead segment; at the working
    // angles it only occurs transiently during rotation.
    exitDirs.set(outward ?? [0, 0, 0], i * 3);
  }

  spreadFan(exitDirs, fanGain);

  return { entry, exitPoints, exitDirs, colors, planeN, planeC, missed: false };
}
