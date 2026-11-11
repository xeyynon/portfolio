import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  Line,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
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
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { tokenColor, tokenDisplayRgb } from "../tokens";
import { FIELD_FRAG, FULLSCREEN_VERT, GLOW_FRAG, GLOW_VERT, INSIDE_FRAG } from "./shaders";
import { clamp01, sphereState } from "./timeline";

/**
 * The sphere: one object made from the owner's worlds (redesign_plan.md,
 * "one original object"). A golden sphere that spins on its point like a top,
 * bends the starfield round it, runs backwards when the page is scrolled
 * back, and opens along six seams into something larger than itself.
 *
 * This file and its siblings in scene/ are the only code that touches
 * three.js. React talks to it through setProgress() and dispose().
 */

const R = 1;
const SEGMENTS = 6;
const SEAM_GAP = (1.4 * Math.PI) / 180;
const OPEN_MAX = 1.78; // radians a segment swings out, a little past flat
const TILT = 0.15;
const SPIN_SPEED = 1.5; // rad/s when closed
const PRECESS_SPEED = 0.32;
const FOV = 32;
const REVERSE_HOLD_MS = 450; // how long a scroll-back keeps time running backwards
const WING_SCALE = 0.72;
const WING_REST = 0.42; // radians a wing is raised at rest
const WING_BEAT = 0.2; // radians it moves either side of that
const WING_RATE = 2.1; // rad/s of the beat: a hover, not a flutter
const WING_SWEEP = 0.28; // radians the wings are swept back, for depth

/** Capability tokens, in the order of the six segments. */
const CAP_TOKENS = ["--v400", "--v450", "--v500", "--v560", "--v600", "--v680"] as const;

export type SphereStats = { fps: number; dpr: number };

export type SphereOptions = {
  /** Element whose computed style carries the colour tokens. */
  tokenSource: HTMLElement;
  reducedMotion: boolean;
  coarsePointer: boolean;
  onStats?: (stats: SphereStats) => void;
};

export class SphereScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(FOV, 1, 0.1, 60);
  private readonly precess = new Group();
  private readonly tilt = new Group();
  private readonly spin = new Group();
  private readonly hinges: Group[] = [];
  private readonly core: Mesh<SphereGeometry, ShaderMaterial>;
  private readonly halo: Mesh<SphereGeometry, ShaderMaterial>;
  private readonly coreLight: PointLight;
  private readonly wings = new Group();
  private readonly wingPivots: Group[] = [];
  private readonly wingGlass: MeshPhysicalMaterial;
  private readonly wingLines: LineBasicMaterial;
  private readonly field: ShaderMaterial;
  private readonly inside: ShaderMaterial;
  private readonly disposables: { dispose(): void }[] = [];
  private readonly resizeObserver: ResizeObserver;
  private readonly viewObserver: IntersectionObserver;
  private readonly centre = new Vector3();

  private target = 0;
  private shown = 0;
  private time = 0;
  private direction = 1;
  private lastScrollBack = -Infinity;
  private pointer = new Vector2();
  private pointerShown = new Vector2();
  private raf = 0;
  private last = 0;
  private inView = true;
  private disposed = false;
  private frames = 0;
  private statsSince = 0;
  private readonly basePixelRatio: number;
  private resolution = 1;
  private slowSamples = 0;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly options: SphereOptions) {
    const src = options.tokenSource;

    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.basePixelRatio = Math.min(window.devicePixelRatio || 1, options.coarsePointer ? 1.5 : 2);
    this.renderer.setPixelRatio(this.basePixelRatio);

    // Reflections for the gold: a neutral procedural room, no image download.
    const pmrem = new PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    this.scene.environment = env.texture;
    this.scene.environmentIntensity = 0.85;
    room.dispose();
    pmrem.dispose();
    this.disposables.push(env);

    const warm = tokenColor(src, "--lab-light");
    const key = new DirectionalLight(warm, 1.6);
    key.position.set(-3, 4, 5);
    this.scene.add(key);

    // The top: precession about the vertical, a fixed lean, then the spin.
    // Everything hangs from the tip, so the tip is the point that stays put.
    this.precess.position.y = -R;
    this.precess.add(this.tilt);
    this.tilt.add(this.spin);
    this.scene.add(this.precess);

    const shell = new SphereGeometry(R, 20, 44, -(Math.PI / 3 - SEAM_GAP) / 2, Math.PI / 3 - SEAM_GAP);
    const gold = new MeshStandardMaterial({ color: tokenColor(src, "--lab-gold"), metalness: 1, roughness: 0.24 });
    this.disposables.push(shell, gold);

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
    // camera, fading to nothing at its edge), not a flat disc. Seen through
    // the seams while closed.
    const coreGeo = new SphereGeometry(R * 0.86, 32, 16);
    const light = tokenDisplayRgb(src, "--lab-light");
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

    // Two wings in the form of a sail: thin ribs fanning from the root with a
    // membrane between them, scalloped along the trailing edge. The form follows
    // the film prop's wing as its designers describe it ("thin ribbed wings,
    // almost in the form of a sail"); the one change is the owner's: glass, not
    // metal (2026-11-11). They hang from the scene, not from the spin, so they
    // face the viewer while the sphere turns between them.
    const RIBS = 9;
    const WING_LENGTH = 2.9;
    const curl = (x: number) => 0.06 * x * x; // the sail curls toward the viewer along its length
    const tips: Vector3[] = [];
    for (let i = 0; i < RIBS; i++) {
      const t = i / (RIBS - 1); // 0 the leading rib, 1 the last trailing rib
      const angle = 0.2 - 0.72 * t;
      const length = WING_LENGTH * (1 - 0.6 * Math.pow(t, 1.25));
      const x = length * Math.cos(angle);
      tips.push(new Vector3(x, length * Math.sin(angle), curl(x)));
    }
    // Between two rib tips the membrane's edge dips toward the root, like cloth held by its ribs.
    const dips = tips.slice(0, -1).map((tip, i) => {
      const mid = tip.clone().add(tips[i + 1]).multiplyScalar(0.5 * 0.93);
      mid.z = curl(mid.x);
      return mid;
    });

    const root = new Vector3(0, 0, 0);
    const membrane: Vector3[] = [];
    const edge: Vector3[] = [root];
    for (let i = 0; i < RIBS - 1; i++) {
      membrane.push(root, tips[i], dips[i], root, dips[i], tips[i + 1]);
      edge.push(tips[i], dips[i]);
    }
    edge.push(tips[RIBS - 1]);
    const paneGeo = new BufferGeometry().setFromPoints(membrane);
    paneGeo.computeVertexNormals();
    const edgeGeo = new BufferGeometry().setFromPoints(edge);
    // Each rib bows a little on its way out, so the fan is not a set of rulers.
    const veinGeos = tips.map((tip) =>
      new BufferGeometry().setFromPoints(
        Array.from({ length: 11 }, (_, k) => {
          const t = k / 10;
          const x = tip.x * t;
          return new Vector3(x, tip.y * t + 0.05 * Math.sin(Math.PI * t), curl(x));
        }),
      ),
    );

    this.wingGlass = new MeshPhysicalMaterial({
      color: tokenColor(src, "--ink-hi"),
      metalness: 0,
      roughness: 0.08,
      clearcoat: 1,
      iridescence: 1,
      iridescenceIOR: 1.3,
      transparent: true,
      opacity: 0.3,
      side: DoubleSide,
      depthWrite: false,
      envMapIntensity: 1.6,
    });
    this.wingLines = new LineBasicMaterial({ color: warm, transparent: true, opacity: 0.7, toneMapped: false });
    this.disposables.push(paneGeo, edgeGeo, ...veinGeos, this.wingGlass, this.wingLines);

    for (const side of [1, -1]) {
      const pivot = new Group();
      pivot.position.set(side * R * 0.9, R * 0.3, 0);
      pivot.scale.set(side * WING_SCALE, WING_SCALE, WING_SCALE);
      pivot.add(new Mesh(paneGeo, this.wingGlass), new LineLoop(edgeGeo, this.wingLines));
      for (const g of veinGeos) pivot.add(new Line(g, this.wingLines));
      this.wings.add(pivot);
      this.wingPivots.push(pivot);
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
        uWarm: { value: tokenDisplayRgb(src, "--lab-light") },
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
        uWarm: { value: tokenDisplayRgb(src, "--lab-light") },
        uCaps: { value: CAP_TOKENS.map((t) => tokenDisplayRgb(src, t)) },
      },
    });
    const insideMesh = new Mesh(quad, this.inside);
    insideMesh.frustumCulled = false;
    insideMesh.renderOrder = 10;
    this.scene.add(insideMesh);
    this.disposables.push(this.field, this.inside);

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
    this.renderer.dispose();
  }

  private readonly onPointer = (e: PointerEvent): void => {
    this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
  };

  /** Runs the loop only while there is something to see. */
  private readonly schedule = (): void => {
    if (this.disposed || this.raf) return;
    if (document.hidden || !this.inView) return;
    this.raf = requestAnimationFrame(this.frame);
  };

  private resize(): void {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
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
    this.last = now;
    this.render(dt);

    this.frames++;
    if (now - this.statsSince >= 500) {
      const fps = this.statsSince ? Math.round((this.frames * 1000) / (now - this.statsSince)) : 0;
      this.adaptResolution(fps);
      this.options.onStats?.({ fps, dpr: this.renderer.getPixelRatio() });
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
   * Quality is chosen by measurement, not by guessing the device: after 1.5 s
   * under 40 fps the canvas renders at a lower resolution, down to 55%. It
   * never steps back up, so it cannot oscillate.
   */
  private adaptResolution(fps: number): void {
    if (!fps || fps >= 40 || this.resolution <= 0.55) {
      this.slowSamples = 0;
      return;
    }
    if (++this.slowSamples < 3) return;
    this.slowSamples = 0;
    this.resolution = Math.max(0.55, this.resolution - 0.15);
    this.renderer.setPixelRatio(this.basePixelRatio * this.resolution);
    this.resize();
  }

  private render(dt: number): void {
    const reduced = this.options.reducedMotion;

    // A little weight on the way to the scroll position. Scroll itself is never altered.
    this.shown = reduced ? 0 : this.shown + (this.target - this.shown) * Math.min(1, dt * 9);
    const s = sphereState(this.shown);

    const reversing = performance.now() - this.lastScrollBack < REVERSE_HOLD_MS;
    this.direction += ((reversing ? -1 : 1) - this.direction) * Math.min(1, dt * 6);
    const step = dt * this.direction;
    this.time += step;

    this.precess.rotation.y += step * PRECESS_SPEED * (1 - s.open);
    this.tilt.rotation.z = TILT * (1 - s.open);
    this.spin.rotation.y += step * SPIN_SPEED * (1 - 0.82 * s.open);

    for (let i = 0; i < SEGMENTS; i++) {
      this.hinges[i].rotation.z = clamp01(s.open * 1.2 - i * 0.04) * OPEN_MAX;
    }

    this.core.material.uniforms.uOpacity.value = 0.55 + 0.45 * s.glow;
    this.core.scale.setScalar(1 + 0.2 * s.glow);
    this.halo.material.uniforms.uOpacity.value = 0.3 * s.glow;
    this.coreLight.intensity = 2.5 * s.glow;

    // The wings ride with the sphere, beat slowly, and lift away as it opens.
    this.core.getWorldPosition(this.wings.position);
    // On a tall screen the wings are held higher, so their span fits the width.
    const tall = this.camera.aspect < 1 ? 0.38 : 0;
    const raise = WING_REST + tall + WING_BEAT * Math.sin(this.time * WING_RATE) + 0.75 * s.open;
    for (let i = 0; i < this.wingPivots.length; i++) {
      const side = i === 0 ? 1 : -1;
      this.wingPivots[i].rotation.set(0, side * WING_SWEEP, side * raise);
    }
    const present = 1 - s.open;
    this.wingGlass.opacity = 0.3 * present;
    this.wingLines.opacity = 0.7 * present;
    this.wings.visible = present > 0.01;

    const aspect = this.camera.aspect;
    const portrait = aspect < 1;
    const restZ = portrait ? 18 : 12;
    const lift = (portrait ? -1.2 : -0.95) * (1 - s.dive);
    this.pointerShown.lerp(this.pointer, Math.min(1, dt * 3));
    const calm = 1 - s.dive;
    this.camera.position.set(
      this.pointerShown.x * 0.35 * calm,
      lift + this.pointerShown.y * 0.2 * calm,
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
    f.uLens.value = 1 - s.open;

    const n = this.inside.uniforms;
    n.uTime.value = this.time;
    n.uCenter.value.set(cx, cy);
    n.uReveal.value = s.reveal;

    this.renderer.render(this.scene, this.camera);
  }
}
