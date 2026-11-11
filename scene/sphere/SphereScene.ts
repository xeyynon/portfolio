import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  HalfFloatType,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NoToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  PointLight,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { publishWaveTime, waveTimeNow } from "@/lib/waveClock";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { tokenColor, tokenDisplayRgb } from "../tokens";
import { createBodyRelief } from "./body";
import { FIELD_FRAG, FINAL_FRAG, FINAL_VERT, FULLSCREEN_VERT, GLOW_FRAG, GLOW_VERT, INSIDE_FRAG } from "./shaders";
import { clamp01, smoothstep, sphereState } from "./timeline";
import { sailPositions, spinePositions } from "./wing";

/**
 * The sphere: a golden ball with relief round its body and two long ribbed
 * wings of glass, after the film prop the owner asked for, with his one
 * change (glass wings). It spins on its point like a top, bends the
 * starfield round it, runs backwards when the page is scrolled back, and
 * opens along six seams into something larger than itself.
 *
 * This file and its siblings in scene/ are the only code that touches
 * three.js. React talks to it through setProgress() and dispose().
 */

const R = 1;
const SEGMENTS = 6;
const SEAM_GAP = (1.4 * Math.PI) / 180;
const OPEN_MAX = 1.78; // radians a segment swings out, a little past flat
const TILT = 0.15;
const SPIN_SPEED = 0.9; // rad/s when closed: slow enough to read the relief
const PRECESS_SPEED = 0.32;
const FOV = 32;
const REVERSE_HOLD_MS = 950; // how long a scroll-back keeps time running backwards
// Going back is slower than going forward (owner, 2026-11-11: "needs to be a
// little slower"): the scene takes longer to follow a scroll back, and time
// itself runs backwards at a fraction of its forward pace.
const FOLLOW_FORWARD = 9;
const FOLLOW_BACK = 3.2;
const REVERSE_PACE = 0.55;

const WING_REST = 0.3; // radians a wing is raised at rest
const WING_TALL = 0.72; // extra raise on a tall screen, so the span fits the width
const WING_BEAT = 0.13; // the slow beat, radians either side of rest
const WING_BEAT_RATE = 1.7;
const WING_FLUTTER = 0.03; // a fast shiver on top of it
const WING_FLUTTER_RATE = 15;
const WING_SWEEP = 0.3; // radians the wings are swept back, for depth

const ARRIVE_SECONDS = 2.2; // the flight in, once, when the scene first draws
const ARRIVE_FROM = new Vector3(8.5, 3.2, -9);

/** Capability tokens, in the order of the six segments. */
const CAP_TOKENS = ["--v400", "--v450", "--v500", "--v560", "--v600", "--v680"] as const;

export type SphereStats = { fps: number; dpr: number; bloom: boolean };

export type SphereOptions = {
  /** Element whose computed style carries the colour tokens. */
  tokenSource: HTMLElement;
  reducedMotion: boolean;
  coarsePointer: boolean;
  onStats?: (stats: SphereStats) => void;
  /**
   * True when the browser would draw WebGL without a real GPU. The scene then
   * runs without bloom or multisampling and starts at a lower resolution.
   */
  lite?: boolean;
  /**
   * Switches for measuring what each part costs, from the lab page's ?q=
   * parameter: "a" no automatic step-down, "f" full quality even without a GPU, "b" no bloom, "m" no multisampling, "t" true transmission
   * glass (light bent through the wings; several times dearer than the
   * default, which only reflects).
   */
  debug?: string;
};

/**
 * What the gold and the glass reflect: a dark studio with a few lit panels.
 * Mostly darkness with hard, bright shapes in it is what makes polished
 * metal and glass read as polished; even light makes them look like plastic.
 */
function studio(warm: Color, cool: Color): { scene: Scene; dispose: () => void } {
  const scene = new Scene();
  const made: { dispose(): void }[] = [];
  const panel = (w: number, h: number, at: [number, number, number], light: Color, power: number) => {
    const geometry = new PlaneGeometry(w, h);
    const material = new MeshBasicMaterial({ color: light.clone().multiplyScalar(power), side: DoubleSide });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...at);
    mesh.lookAt(0, 0, 0);
    scene.add(mesh);
    made.push(geometry, material);
  };
  panel(7, 7, [-6, 7, 6], warm, 7); // a large soft key, above and to the left
  panel(1.2, 10, [8, 1, -3], warm, 24); // a hard strip behind on the right: the rim
  panel(9, 1, [0, 4, -9], cool, 9); // a thin line across the back
  panel(1, 1, [3.5, 5, 7], cool, 70); // a small hot source: the glint
  panel(0.6, 0.6, [-4, 2, 8], warm, 60); // a second glint, low on the left
  panel(9, 3, [1, -7, 4], warm, 1.2); // a little light from below
  panel(16, 16, [0, 1, 12], cool, 0.6); // a dim wall in front, so no facet reflects pure black
  return { scene, dispose: () => made.forEach((m) => m.dispose()) };
}

export class SphereScene {
  private readonly renderer: WebGLRenderer;
  private readonly composer: EffectComposer;
  private readonly bloom: UnrealBloomPass;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(FOV, 1, 0.1, 80);
  private readonly body = new Group();
  private readonly precess = new Group();
  private readonly tilt = new Group();
  private readonly spin = new Group();
  private readonly hinges: Group[] = [];
  private readonly core: Mesh<SphereGeometry, ShaderMaterial>;
  private readonly halo: Mesh<SphereGeometry, ShaderMaterial>;
  private readonly coreLight: PointLight;
  private readonly pointerLight: PointLight;
  private readonly wings = new Group();
  private readonly wingPivots: Group[] = [];
  private readonly wingJoints: Mesh[] = [];
  private readonly field: ShaderMaterial;
  private readonly inside: ShaderMaterial;
  private readonly disposables: { dispose(): void }[] = [];
  private readonly resizeObserver: ResizeObserver;
  private readonly viewObserver: IntersectionObserver;
  private readonly centre = new Vector3();
  private readonly basePixelRatio: number;

  private target = 0;
  private shown = 0;
  private time = 0;
  private direction = 1;
  private arrived: number;
  private lastScrollBack = -Infinity;
  private pointer = new Vector2();
  private pointerShown = new Vector2();
  private hasPointer = false;
  private raf = 0;
  private last = 0;
  private inView = true;
  /** False while the lines are carried by the page behind (AmbientWaves): nothing here is seen then. */
  private active = true;
  private disposed = false;
  private frames = 0;
  private statsSince = 0;
  private resolution = 1;
  private slowSamples = 0;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly options: SphereOptions) {
    const src = options.tokenSource;
    this.arrived = options.reducedMotion ? 1 : 0;

    // No antialiasing or tone mapping on the canvas itself: the scene is drawn
    // into a multisampled high-range buffer and finished by the last pass.
    this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
    this.renderer.toneMapping = NoToneMapping;
    this.basePixelRatio = Math.min(window.devicePixelRatio || 1, options.coarsePointer ? 1.5 : 2);
    this.renderer.setPixelRatio(this.basePixelRatio);

    const warm = tokenColor(src, "--lab-light");
    const cool = tokenColor(src, "--ink-hi");
    const light = tokenDisplayRgb(src, "--lab-light");

    const pmrem = new PMREMGenerator(this.renderer);
    const room = studio(warm, cool);
    const env = pmrem.fromScene(room.scene, 0.02);
    this.scene.environment = env.texture;
    room.dispose();
    pmrem.dispose();
    this.disposables.push(env);

    const key = new DirectionalLight(warm, 0.9);
    key.position.set(-3, 4, 5);
    this.scene.add(key);

    // A light the visitor holds: it sits in front of the scene wherever the
    // pointer is, so moving the mouse slides a highlight over the gold and
    // along the ribs of the wings (owner, 2026-11-11). Off on touch screens
    // and with reduced motion, where there is no pointer to follow.
    this.pointerLight = new PointLight(cool, 0, 30, 1.4);
    this.scene.add(this.pointerLight);

    // The top: precession about the vertical, a fixed lean, then the spin.
    // Everything hangs from the tip, so the tip is the point that stays put.
    this.precess.position.y = -R;
    this.precess.add(this.tilt);
    this.tilt.add(this.spin);
    this.body.add(this.precess);
    this.scene.add(this.body);

    const relief = createBodyRelief();
    const shell = new SphereGeometry(R, 24, 56, -(Math.PI / 3 - SEAM_GAP) / 2, Math.PI / 3 - SEAM_GAP);
    // Polished gold under a thin lacquer: the metal gives the warm reflection,
    // the clear coat a second, sharper one on top. That double highlight is
    // what reads as "shining" rather than merely "gold".
    const gold = new MeshPhysicalMaterial({
      color: tokenColor(src, "--lab-gold"),
      metalness: 1,
      roughness: 0.12,
      map: relief,
      bumpMap: relief,
      bumpScale: 1.3,
      envMapIntensity: 1.8,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });
    this.disposables.push(relief, shell, gold);

    for (let i = 0; i < SEGMENTS; i++) {
      const cap = tokenColor(src, CAP_TOKENS[i]);
      const lining = new MeshStandardMaterial({
        color: cap,
        emissive: cap,
        emissiveIntensity: 0.55,
        metalness: 0,
        roughness: 0.6,
        side: BackSide,
      });
      this.disposables.push(lining);

      const yaw = new Group();
      yaw.rotation.y = (i * Math.PI) / 3;
      const hinge = new Group();
      const outer = new Mesh(shell, gold);
      const inner = new Mesh(shell, lining);
      outer.position.y = R;
      inner.position.y = R;
      hinge.add(outer, inner);
      yaw.add(hinge);
      this.spin.add(yaw);
      this.hinges.push(hinge);
    }

    // What is inside: light, drawn as a soft orb (bright where it faces the
    // camera, fading to nothing at its edge). Seen through the seams while closed.
    const coreGeo = new SphereGeometry(R * 0.86, 32, 16);
    const glow = (power: number) =>
      new ShaderMaterial({
        vertexShader: GLOW_VERT,
        fragmentShader: GLOW_FRAG,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        uniforms: { uColor: { value: light }, uPower: { value: power }, uOpacity: { value: 0 } },
      });
    this.core = new Mesh(coreGeo, glow(1.3));
    this.core.position.y = R;
    this.tilt.add(this.core);
    this.halo = new Mesh(coreGeo, glow(3.5));
    this.halo.scale.setScalar(2.6);
    this.core.add(this.halo);
    this.coreLight = new PointLight(warm, 0, 12, 1.6);
    this.core.add(this.coreLight);
    this.disposables.push(coreGeo, this.core.material, this.halo.material);

    // The wings: ribbed glass. Light passes through and is bent and split by
    // the ribbing, which is where the sparkle comes from. They hang from the
    // scene, not from the spin, so they face the viewer while the body turns.
    const sailGeo = new BufferGeometry();
    sailGeo.setAttribute("position", new BufferAttribute(sailPositions(), 3));
    sailGeo.computeVertexNormals();
    const spineGeo = new BufferGeometry();
    spineGeo.setAttribute("position", new BufferAttribute(spinePositions(), 3));
    spineGeo.computeVertexNormals();
    const debug = options.debug ?? "";
    // Glass against a dark field is seen almost entirely by what it reflects,
    // so the default glass reflects and lets the field show through, without
    // bending it. Bending light through it (transmission) redraws the whole
    // scene every frame and measured several times slower; it stays behind a
    // switch for comparison.
    const glass = debug.includes("t")
      ? new MeshPhysicalMaterial({
          color: cool,
          metalness: 0,
          roughness: 0.04,
          transmission: 1,
          thickness: 0.3,
          ior: 1.5,
          dispersion: 5,
          iridescence: 0.7,
          iridescenceIOR: 1.3,
          clearcoat: 1,
          envMapIntensity: 2.4,
          side: DoubleSide,
        })
      : new MeshPhysicalMaterial({
          // Only what the glass reflects is drawn, added as light over the
          // field: a dark reflection adds nothing, so the field shows through
          // clean, and a bright one is a glint. Lit like a mirror with a thin
          // film on it, which is where the colours along the ribs come from.
          color: cool,
          metalness: 1,
          roughness: 0.05,
          iridescence: 1,
          iridescenceIOR: 1.7,
          iridescenceThicknessMinimum: 180,
          iridescenceThicknessMaximum: 620,
          // brighter wings (owner, 2026-11-12): more of the studio in every rib
          envMapIntensity: 1.75,
          transparent: true,
          opacity: 0.62,
          blending: AdditiveBlending,
          depthWrite: false,
          side: DoubleSide,
        });
    // The ball joint each wing grows from.
    const jointGeo = new SphereGeometry(R * 0.11, 20, 14);
    const jointGold = new MeshPhysicalMaterial({
      color: tokenColor(src, "--lab-gold"),
      metalness: 1,
      roughness: 0.16,
      envMapIntensity: 1.8,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
    });
    this.disposables.push(sailGeo, spineGeo, glass, jointGeo, jointGold);

    for (const side of [1, -1]) {
      const pivot = new Group();
      pivot.position.set(side * R * 0.96, R * 0.22, 0.05);
      pivot.add(new Mesh(sailGeo, glass), new Mesh(spineGeo, glass));
      const joint = new Mesh(jointGeo, jointGold);
      joint.position.copy(pivot.position);
      this.wings.add(pivot, joint);
      this.wingPivots.push(pivot);
      this.wingJoints.push(joint);
    }
    this.scene.add(this.wings);

    const quad = new PlaneGeometry(2, 2);
    this.disposables.push(quad);

    this.field = new ShaderMaterial({
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: FIELD_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uCenter: { value: new Vector2(0.5, 0.5) },
        uLensR: { value: 0.1 },
        uLens: { value: 1 },
        uBg: { value: tokenDisplayRgb(src, "--bg-dark") },
        uInk: { value: tokenDisplayRgb(src, "--ink-hi") },
        uWarm: { value: light },
      },
    });
    const fieldMesh = new Mesh(quad, this.field);
    fieldMesh.frustumCulled = false;
    fieldMesh.renderOrder = -10;
    this.scene.add(fieldMesh);

    this.inside = new ShaderMaterial({
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: INSIDE_FRAG,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uCenter: { value: new Vector2(0.5, 0.5) },
        uReveal: { value: 0 },
        uBg: { value: tokenDisplayRgb(src, "--bg-dark-2") },
        uWarm: { value: light },
        uCaps: { value: CAP_TOKENS.map((t) => tokenDisplayRgb(src, t)) },
      },
    });
    const insideMesh = new Mesh(quad, this.inside);
    insideMesh.frustumCulled = false;
    insideMesh.renderOrder = 10;
    this.scene.add(insideMesh);
    this.disposables.push(this.field, this.inside);

    // Scene, then bloom on what is brighter than white, then the finish.
    const lite = options.lite === true && !debug.includes("f"); // "f" forces full quality
    if (lite) this.resolution = 0.7;
    const buffer = new WebGLRenderTarget(1, 1, {
      type: HalfFloatType,
      samples: lite || debug.includes("m") ? 0 : 4,
    });
    this.composer = new EffectComposer(this.renderer, buffer);
    this.composer.setPixelRatio(this.basePixelRatio);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new Vector2(1, 1), 0.42, 0.45, 1.0);
    this.bloom.enabled = !lite && !debug.includes("b");
    this.composer.addPass(this.bloom);
    const finish = new ShaderPass({
      uniforms: { tDiffuse: { value: null } },
      vertexShader: FINAL_VERT,
      fragmentShader: FINAL_FRAG,
    });
    this.composer.addPass(finish);
    this.disposables.push(buffer, this.bloom, finish);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.viewObserver = new IntersectionObserver((entries) => {
      this.inView = entries.some((e) => e.isIntersecting);
      this.schedule();
    });
    this.viewObserver.observe(canvas);
    document.addEventListener("visibilitychange", this.schedule);
    if (!options.coarsePointer && !options.reducedMotion) {
      window.addEventListener("pointermove", this.onPointer, { passive: true });
    }

    this.resize();
    this.schedule();
  }

  /** Stops or restarts drawing; used while the page behind carries the waves. */
  setActive(on: boolean): void {
    if (on === this.active) return;
    this.active = on;
    this.schedule();
  }

  /** Scroll progress, 0..1. A decrease is a scroll back: time runs backwards for a moment. */
  setProgress(progress: number): void {
    const next = clamp01(progress);
    if (next < this.target - 1e-4) this.lastScrollBack = performance.now();
    this.target = next;
    if (this.options.reducedMotion) return; // the still frame does not follow scroll
    this.schedule();
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.viewObserver.disconnect();
    document.removeEventListener("visibilitychange", this.schedule);
    window.removeEventListener("pointermove", this.onPointer);
    for (const d of this.disposables) d.dispose();
    this.composer.dispose();
    this.renderer.dispose();
  }

  private readonly onPointer = (e: PointerEvent): void => {
    this.hasPointer = true;
    this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
  };

  /** Runs the loop only while there is something to see. */
  private readonly schedule = (): void => {
    if (this.disposed || this.raf) return;
    if (document.hidden || !this.inView || !this.active) return;
    this.raf = requestAnimationFrame(this.frame);
  };

  private resize(): void {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    const ratio = this.basePixelRatio * this.resolution;
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(ratio);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.field.uniforms.uAspect.value = w / h;
    this.inside.uniforms.uAspect.value = w / h;
    if (this.options.reducedMotion) this.render(0);
  }

  private readonly frame = (now: number): void => {
    this.raf = 0;
    if (this.disposed) return;
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0;
    // Back after a pause (scrolled away, tab hidden): the waves went on being
    // drawn elsewhere on the shared clock, so pick them up where they are.
    if (this.last && now - this.last > 250) this.time = waveTimeNow();
    this.last = now;
    this.render(dt);

    this.frames++;
    if (now - this.statsSince >= 500) {
      const fps = this.statsSince ? Math.round((this.frames * 1000) / (now - this.statsSince)) : 0;
      this.adaptQuality(fps);
      this.options.onStats?.({ fps, dpr: this.renderer.getPixelRatio(), bloom: this.bloom.enabled });
      this.frames = 0;
      this.statsSince = now;
    }

    if (this.options.reducedMotion) {
      this.last = 0;
      return;
    }
    this.raf = requestAnimationFrame(this.frame);
    if (document.hidden || !this.inView) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.last = 0;
    }
  };

  /**
   * Quality is chosen by measurement, not by guessing the device. After 1.5 s
   * under 40 fps the canvas renders at a lower resolution, down to 55%; if it
   * is still slow there, the bloom goes too. It never steps back up, so it
   * cannot oscillate.
   */
  private adaptQuality(fps: number): void {
    if (!fps || fps >= 40 || this.options.debug?.includes("a")) {
      this.slowSamples = 0;
      return;
    }
    if (++this.slowSamples < 3) return;
    this.slowSamples = 0;
    if (this.resolution > 0.55) {
      this.resolution = Math.max(0.55, this.resolution - 0.15);
      this.resize();
    } else {
      this.bloom.enabled = false;
    }
  }

  private render(dt: number): void {
    const reduced = this.options.reducedMotion;

    // A little weight on the way to the scroll position. Scroll itself is never altered.
    const follow = this.target < this.shown ? FOLLOW_BACK : FOLLOW_FORWARD;
    this.shown = reduced ? 0 : this.shown + (this.target - this.shown) * Math.min(1, dt * follow);
    const s = sphereState(this.shown);
    // The wings fold into the body first; only then do the segments part.
    const fold = smoothstep(0, 0.34, s.open);
    const part = smoothstep(0.26, 1, s.open);

    const reversing = performance.now() - this.lastScrollBack < REVERSE_HOLD_MS;
    this.direction += ((reversing ? -1 : 1) - this.direction) * Math.min(1, dt * 4);
    const step = dt * (this.direction < 0 ? this.direction * REVERSE_PACE : this.direction);
    this.time += step;
    publishWaveTime(this.time);

    // The flight in: from far off to the right, easing to rest, with a sway that dies out.
    this.arrived = Math.min(1, this.arrived + dt / ARRIVE_SECONDS);
    const away = Math.pow(1 - this.arrived, 3);
    this.body.position.copy(ARRIVE_FROM).multiplyScalar(away);
    this.body.position.y += Math.sin(this.arrived * 9) * 0.9 * away;

    this.precess.rotation.y += step * PRECESS_SPEED * (1 - part);
    this.tilt.rotation.z = TILT * (1 - part);
    this.spin.rotation.y += step * SPIN_SPEED * (1 - 0.82 * part);

    for (let i = 0; i < SEGMENTS; i++) {
      this.hinges[i].rotation.z = clamp01(part * 1.2 - i * 0.04) * OPEN_MAX;
    }

    this.core.material.uniforms.uOpacity.value = 0.55 + 0.45 * s.glow;
    this.core.scale.setScalar(1 + 0.2 * s.glow);
    this.halo.material.uniforms.uOpacity.value = 0.3 * s.glow;
    this.coreLight.intensity = 2.5 * s.glow;

    // The wings ride with the body, beat, and draw back into it as it opens.
    this.core.getWorldPosition(this.wings.position);
    const tall = this.camera.aspect < 1 ? WING_TALL : 0;
    const hurry = 1 + 2.5 * away; // they work harder while it is still flying in
    const raise =
      WING_REST +
      tall +
      WING_BEAT * Math.sin(this.time * WING_BEAT_RATE * hurry) +
      WING_FLUTTER * Math.sin(this.time * WING_FLUTTER_RATE);
    const out = 1 - fold;
    for (let i = 0; i < this.wingPivots.length; i++) {
      const side = i === 0 ? 1 : -1;
      const pivot = this.wingPivots[i];
      pivot.rotation.set(0, side * WING_SWEEP, side * raise);
      pivot.scale.set(side * out, out, out);
      pivot.visible = out > 0.02;
      // The joint belongs to the closed body; it goes once the segments part.
      this.wingJoints[i].visible = part < 0.02;
    }

    const aspect = this.camera.aspect;
    const portrait = aspect < 1;
    const restZ = portrait ? 21 : 14.6;
    const lift = (portrait ? -0.6 : -0.45) * (1 - s.dive);
    this.pointerShown.lerp(this.pointer, Math.min(1, dt * 3));
    const calm = 1 - s.dive;

    // The pointer moves two things: its own light, and the whole studio the
    // gold and glass reflect, which turns a little with it. Together the
    // reflections follow the hand.
    if (this.hasPointer) {
      this.pointerLight.position.set(this.pointerShown.x * 7, lift + this.pointerShown.y * 4.5, 5.5);
      this.pointerLight.intensity = 60 * calm;
      this.scene.environmentRotation.set(-this.pointerShown.y * 0.55, this.pointerShown.x * 0.95, 0);
    }

    this.camera.position.set(
      this.pointerShown.x * 0.4 * calm,
      lift + this.pointerShown.y * 0.25 * calm,
      restZ + (2.3 - restZ) * s.dive,
    );
    this.camera.lookAt(0, lift, 0);
    this.camera.updateMatrixWorld();

    // Where the sphere is on screen, for the lens and for the opening disc.
    this.core.getWorldPosition(this.centre);
    const dist = this.camera.position.distanceTo(this.centre);
    this.centre.project(this.camera);
    const cx = this.centre.x * 0.5 + 0.5;
    const cy = this.centre.y * 0.5 + 0.5;
    const radius = (0.5 * R) / (dist * Math.tan((FOV * Math.PI) / 360));

    const f = this.field.uniforms;
    f.uTime.value = this.time;
    f.uCenter.value.set(cx, cy);
    f.uLensR.value = radius * 1.34;
    f.uLens.value = 1 - part;

    const n = this.inside.uniforms;
    n.uTime.value = this.time;
    n.uCenter.value.set(cx, cy);
    n.uReveal.value = s.reveal;

    this.composer.render();
  }
}
