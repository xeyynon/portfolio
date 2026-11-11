/**
 * Two full-screen passes drawn by three.js around the sphere:
 *  - FIELD: the dark field behind it, a procedural starfield bent by a point
 *    lens centred on the sphere (the Gargantua idea at the size of a marble).
 *  - INSIDE: what is in the sphere, revealed as a growing disc from the
 *    sphere's position until it covers the screen.
 * Both write display colours directly, so their colour uniforms are sRGB
 * (scene/tokens.ts, tokenDisplayRgb).
 */

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

  // The Einstein ring itself, faint.
  float ring = exp(-pow((r - uLensR) / 0.010, 2.0));
  col += uWarm * ring * 0.22 * uLens;
  // A soft halo so the sphere sits in light, not on a sticker.
  col += uWarm * 0.05 * exp(-r * 5.5) * uLens;

  gl_FragColor = vec4(col, 1.0);
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

  vec3 col = uBg;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float amp = 0.045 + 0.012 * fi;
    float k = 2.6 + fi * 0.55;
    float ph = uTime * (0.22 + 0.04 * fi) + fi * 1.7;
    float y = (fi - 2.5) * 0.115 + amp * sin(p.x * k + ph);
    float d = abs(p.y - y);
    float line = exp(-d * 170.0) * 0.55 + exp(-d * 16.0) * 0.07;
    col += uCaps[i] * line;
  }

  // Light at the rim of the opening, strongest while it is still small.
  float rim = exp(-pow((r - reach + edge) / 0.03, 2.0)) * (1.0 - uReveal);
  col += uWarm * rim * 0.9;

  gl_FragColor = vec4(col, mask);
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
void main() {
  float facing = pow(max(dot(normalize(vNormal), normalize(vView)), 0.0), uPower);
  gl_FragColor = vec4(uColor * facing * uOpacity, facing * uOpacity);
}
`;
