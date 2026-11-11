/**
 * Hand-written passes drawn round the three.js objects:
 *  - FIELD: the dark field behind the sphere, a procedural starfield bent by
 *    a point lens centred on it.
 *  - INSIDE: what is in the sphere, revealed as a growing disc from the
 *    sphere's position until it covers the screen.
 *  - GLOW: the light inside, as a soft orb.
 *  - FINAL: the last pass. Bright highlights roll off; everything else is
 *    left exactly as it was, then encoded for the screen.
 *
 * The scene is drawn into a linear, high-range buffer so that highlights can
 * bloom. These shaders still think in the colours the screen shows (their
 * colour uniforms are sRGB, from tokenDisplayRgb) and convert with toLinear
 * as their last step, so a token painted here comes out of FINAL as exactly
 * that token. That is what lets the canvas meet the page with no seam.
 */

const TO_LINEAR = /* glsl */ `
vec3 toLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}
`;

export const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const FIELD_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uAspect;
uniform vec2 uCenter;   // sphere centre in uv
uniform float uLensR;   // Einstein radius, in screen heights
uniform float uLens;    // 0 no bending, 1 full
uniform vec3 uBg;
uniform vec3 uInk;
uniform vec3 uWarm;
${TO_LINEAR}
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 starLayer(vec2 uv, float scale, float seed) {
  vec2 g = uv * scale;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float n = hash21(id + seed);
  float b = max(0.0, (n - 0.88) / 0.12);
  vec2 off = vec2(hash21(id + seed + 1.3), hash21(id + seed + 7.1)) - 0.5;
  float d = length(f - off * 0.7);
  float tw = 0.75 + 0.25 * sin(uTime * (0.6 + b * 1.4) + n * 40.0);
  float s = smoothstep(0.035 + 0.045 * b, 0.0, d);
  vec3 tint = mix(uInk, uWarm, hash21(id + seed + 3.7));
  return tint * s * b * tw;
}

void main() {
  vec2 p = vUv - uCenter;
  p.x *= uAspect;
  float r = length(p);

  // Point-lens mapping: a ray seen at angle theta left the source at
  // beta = theta - thetaE^2 / theta. Inside thetaE the image flips, which is
  // what draws the arcs round the sphere.
  float bend = uLens * uLensR * uLensR / (r * r + 1e-4);
  vec2 q = p * (1.0 - bend);

  vec2 uv = q + vec2(uTime * 0.004, 0.0);
  vec3 col = uBg;
  col += starLayer(uv, 14.0, 1.0) * 0.9;
  col += starLayer(uv, 27.0, 5.0) * 0.7;
  col += starLayer(uv, 52.0, 9.0) * 0.45;

  // The Einstein ring itself, faint, and a soft halo so the sphere sits in light.
  float ring = exp(-pow((r - uLensR) / 0.010, 2.0));
  col += uWarm * ring * 0.16 * uLens;
  col += uWarm * 0.05 * exp(-r * 5.5) * uLens;

  gl_FragColor = vec4(toLinear(col), 1.0);
}
`;

export const INSIDE_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uAspect;
uniform vec2 uCenter;
uniform float uReveal;  // 0..1
uniform vec3 uBg;
uniform vec3 uWarm;
uniform vec3 uCaps[6];
${TO_LINEAR}
float trunkY(float x) { return 0.035 * sin(x * 2.2 + uTime * 0.24); }
float ownY(float fi, float x) {
  float amp = 0.045 + 0.012 * fi;
  float k = 2.6 + fi * 0.55;
  float ph = uTime * (0.22 + 0.04 * fi) + fi * 1.7;
  return (fi - 2.5) * 0.115 + amp * sin(x * k + ph);
}
// Where across the screen (-1..1) each branch starts to leave the line (waves.ts SPLIT).
float splitOf(float fi) {
  return fi < 0.5 ? -0.62 : fi < 1.5 ? -0.40 : fi < 2.5 ? -0.18 : fi < 3.5 ? -0.74 : fi < 4.5 ? -0.52 : -0.30;
}
float parted(float fi, float x, float hw) {
  float a = splitOf(fi);
  return smoothstep(a, a + 0.55, x / hw);
}
float branchY(float fi, float x, float s) { return mix(trunkY(x), ownY(fi, x), s); }
float glowLine(float d) { return exp(-d * 170.0) * 0.55 + exp(-d * 16.0) * 0.07; }
vec3 strand(vec3 ca, vec3 cb, float a, float b, float at, vec2 p, float hw) {
  float u = p.x / hw;
  float show = smoothstep(at - 0.04, at, u) * (1.0 - smoothstep(at + 0.3, at + 0.34, u));
  if (show <= 0.0) return vec3(0.0);
  float m = smoothstep(at, at + 0.3, u);
  float y = mix(branchY(a, p.x, parted(a, p.x, hw)), branchY(b, p.x, parted(b, p.x, hw)), m);
  return mix(ca, cb, m) * glowLine(abs(p.y - y)) * show * 0.6;
}
void main() {
  vec2 c = vUv - uCenter;
  c.x *= uAspect;
  float r = length(c);

  // The disc grows past the far corner of any screen shape.
  float reach = uReveal * (1.2 + uAspect);
  float edge = 0.05 + 0.10 * uReveal;
  float mask = 1.0 - smoothstep(reach - edge, reach, r);
  if (mask <= 0.001) discard;

  vec2 p = vUv - 0.5;
  p.x *= uAspect;
  float hw = uAspect * 0.5;

  // One timeline branching into six (AmbientWaves/waves.ts draws the same
  // lines after the hand-off: keep the numbers in both the same).
  vec3 col = uBg;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float s = parted(fi, p.x, hw);
    float d = abs(p.y - branchY(fi, p.x, s));
    col += uCaps[i] * glowLine(d) * (0.4 + 0.6 * s);
  }
  // Strands that cross from one branch to another.
  col += strand(uCaps[0], uCaps[1], 0.0, 1.0, 0.08, p, hw);
  col += strand(uCaps[3], uCaps[5], 3.0, 5.0, 0.02, p, hw);
  col += strand(uCaps[2], uCaps[4], 2.0, 4.0, 0.42, p, hw);
  col += strand(uCaps[1], uCaps[3], 1.0, 3.0, 0.62, p, hw);

  // Light at the rim of the opening, strongest while it is still small.
  float rim = exp(-pow((r - reach + edge) / 0.03, 2.0)) * (1.0 - uReveal);
  col += uWarm * rim * 0.9;

  gl_FragColor = vec4(toLinear(col), mask);
}
`;

/** A soft orb of light: brightest where the surface faces the camera. */
export const GLOW_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

export const GLOW_FRAG = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vView;
uniform vec3 uColor;
uniform float uPower;
uniform float uOpacity;
${TO_LINEAR}
void main() {
  float facing = pow(max(dot(normalize(vNormal), normalize(vView)), 0.0), uPower);
  gl_FragColor = vec4(toLinear(uColor) * facing * uOpacity, facing * uOpacity);
}
`;

export const FINAL_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Below the knee a value passes through untouched, so the dark field and the
 * page colours keep their exact values; above it, light rolls off toward
 * white without clipping. Then the standard encoding for the screen.
 */
export const FINAL_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tDiffuse;
const float KNEE = 0.72;

vec3 shoulder(vec3 c) {
  vec3 over = max(c - KNEE, 0.0);
  vec3 rolled = KNEE + (1.0 - KNEE) * (1.0 - exp(-over / (1.0 - KNEE)));
  return mix(c, rolled, step(KNEE, c));
}

vec3 toScreen(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  vec3 col = max(texture2D(tDiffuse, vUv).rgb, 0.0);
  gl_FragColor = vec4(toScreen(shoulder(col)), 1.0);
}
`;
