/**
 * The two WebGL rooms on the page.
 *
 *   1. The hero dollhouse — an orbitable model of the reconstructed room.
 *   2. The reality-gap interior — the same room, same camera position, with
 *      only the lens focal length changing.
 *
 * Both share one geometry builder and one render loop. The loop is
 * dirty-flagged: a frame is only drawn when something actually moved, so an
 * idle page costs nothing. All colours come from the CSS tokens, which is why
 * the rooms are rebuilt whenever the theme changes.
 */
import * as THREE from 'three';
import { token, prefersReducedMotion, onThemeChange } from './theme';

/**
 * three.js dropped the legacy ×π light scaling in r155 (lighting is now
 * physically correct by default, and the old `useLegacyLights` escape hatch
 * was removed in r165). The scene was lit under the old convention, so the
 * factor is reapplied here to keep the exposure exactly where it was.
 */
const LIGHT_SCALE = Math.PI;

interface Palette {
  wall: THREE.Color;
  floor: THREE.Color;
  object: THREE.Color;
  fabric: THREE.Color;
  dark: THREE.Color;
  accent: THREE.Color;
}

/** One canvas and everything needed to draw into it. */
interface SceneRecord {
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  room: THREE.Group;
  enclosed: boolean;
  ratio: number;
  dirty: boolean;
}

function palette(): Palette {
  return {
    wall: new THREE.Color(token('--room-wall')),
    floor: new THREE.Color(token('--room-floor')),
    object: new THREE.Color(token('--room-object')),
    fabric: new THREE.Color(token('--room-fabric')),
    dark: new THREE.Color(token('--room-dark')),
    accent: new THREE.Color(token('--accent')),
  };
}

/* ── Room geometry (real dimensions, in metres) ───────── */
const W = 2.40;
const D = 2.90;
const H = 2.55;

function buildRoom(enclosed: boolean): THREE.Group {
  const P = palette();
  const g = new THREE.Group();
  function mat(c: THREE.ColorRepresentation): THREE.MeshLambertMaterial {
    return new THREE.MeshLambertMaterial({ color: c });
  }
  const mFloor = mat(P.floor);
  const mObj = mat(P.object);
  const mFab = mat(P.fabric);
  const mDark = mat(P.dark);
  const mAcc = mat(P.accent);
  // Every wall normal points INTO the room, so front-face culling gives both
  // effects for free: a dollhouse from outside, a sealed box from inside.
  const mWall = mat(P.wall);

  function plane(w: number, h: number, material: THREE.Material): THREE.Mesh {
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  }
  function box(
    w: number, h: number, d: number,
    material: THREE.Material,
    x: number, y: number, z: number,
  ): THREE.Mesh {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    b.position.set(x, y, z);
    g.add(b);
    return b;
  }

  const fl = plane(W, D, mFloor); fl.rotation.x = -Math.PI / 2; g.add(fl);

  const back = plane(W, H, mWall); back.position.set(0, H / 2, -D / 2); g.add(back);
  const left = plane(D, H, mWall); left.rotation.y = Math.PI / 2; left.position.set(-W / 2, H / 2, 0); g.add(left);
  const right = plane(D, H, mWall); right.rotation.y = -Math.PI / 2; right.position.set(W / 2, H / 2, 0); g.add(right);
  if (enclosed) {
    const front = plane(W, H, mWall); front.rotation.y = Math.PI; front.position.set(0, H / 2, D / 2); g.add(front);
    const ceil = plane(W, D, mWall); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, H, 0); g.add(ceil);
  }

  const frame = plane(1.17, 1.32, mat(0xFFFFFF));
  frame.position.set(0.15, 1.42, -D / 2 + 0.006); g.add(frame);
  const win = plane(1.05, 1.20, new THREE.MeshBasicMaterial({ color: 0xF3F7FF }));
  win.position.set(0.15, 1.42, -D / 2 + 0.012); g.add(win);

  const rug = plane(1.10, 0.95, mFab); rug.rotation.x = -Math.PI / 2;
  rug.position.set(0.18, 0.004, 0.42); g.add(rug);

  box(0.90, 0.30, 1.90, mDark, -W / 2 + 0.47, 0.15, -D / 2 + 1.08);
  box(0.88, 0.18, 1.86, mFab, -W / 2 + 0.47, 0.39, -D / 2 + 1.08);
  box(0.52, 0.13, 0.30, mAcc, -W / 2 + 0.47, 0.545, -D / 2 + 0.28);

  box(0.98, 0.05, 0.52, mObj, W / 2 - 0.56, 0.745, -D / 2 + 0.34);
  box(0.05, 0.72, 0.48, mDark, W / 2 - 1.02, 0.36, -D / 2 + 0.34);
  box(0.05, 0.72, 0.48, mDark, W / 2 - 0.10, 0.36, -D / 2 + 0.34);
  box(0.40, 0.44, 0.40, mObj, W / 2 - 0.56, 0.22, -D / 2 + 0.92);
  box(0.40, 0.42, 0.05, mDark, W / 2 - 0.56, 0.63, -D / 2 + 1.12);

  box(0.58, 1.92, 0.56, mObj, W / 2 - 0.33, 0.96, D / 2 - 0.38);

  box(0.05, 1.30, 0.05, mDark, -W / 2 + 0.20, 0.65, D / 2 - 0.35);
  box(0.26, 0.20, 0.26, mFab, -W / 2 + 0.20, 1.40, D / 2 - 0.35);

  return g;
}

/** Look up a canvas, returning null rather than throwing when it is absent. */
function canvasById(id: string): HTMLCanvasElement | null {
  const el = document.getElementById(id);
  return el instanceof HTMLCanvasElement ? el : null;
}

export function initScenes(): void {
  const reduce = prefersReducedMotion();
  const scenes: SceneRecord[] = [];

  function makeScene(canvas: HTMLCanvasElement, enclosed: boolean, ratio: number): SceneRecord {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, canvas.width / canvas.height, 0.05, 100);
    const room = buildRoom(enclosed);
    scene.add(room);
    scene.add(new THREE.HemisphereLight(0xFFFFFF, 0x404652, 0.82 * LIGHT_SCALE));
    const key = new THREE.DirectionalLight(0xFFF4E6, 0.70 * LIGHT_SCALE);
    key.position.set(0.9, 2.6, -3.2); scene.add(key);
    const fill = new THREE.DirectionalLight(0xDCE7FF, 0.34 * LIGHT_SCALE);
    fill.position.set(-2.2, 1.6, 2.4); scene.add(fill);
    const rec: SceneRecord = {
      canvas, renderer, scene, camera,
      room, enclosed, ratio, dirty: true,
    };
    scenes.push(rec);
    return rec;
  }

  function resize(rec: SceneRecord): void {
    const w = rec.canvas.clientWidth;
    if (!w) return;
    const h = Math.round(w * rec.ratio);
    rec.renderer.setSize(w, h, false);
    rec.camera.aspect = w / h;
    rec.camera.updateProjectionMatrix();
    rec.dirty = true;
  }

  /** The rooms hold no state of their own, so a theme change just rebuilds them. */
  function refreshSceneColors(): void {
    scenes.forEach((rec) => {
      rec.scene.remove(rec.room);
      rec.room = buildRoom(rec.enclosed);
      rec.scene.add(rec.room);
      rec.dirty = true;
    });
  }

  /* ── Scene 1: orbitable dollhouse view ────────────────── */
  const heroCanvas = canvasById('heroStage');
  const hero = heroCanvas ? makeScene(heroCanvas, false, 800 / 1100) : null;
  let yaw = -0.70;
  let pitch = 0.36;
  const radius = 5.45;
  let auto = !reduce;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  const hint = document.getElementById('heroHint');

  function placeHero(): void {
    if (!hero) return;
    pitch = Math.max(0.06, Math.min(1.05, pitch));
    hero.camera.position.set(
      Math.sin(yaw) * Math.cos(pitch) * radius,
      Math.sin(pitch) * radius + 0.25,
      Math.cos(yaw) * Math.cos(pitch) * radius,
    );
    hero.camera.lookAt(0, 1.02, 0);
    hero.dirty = true;
  }
  placeHero();

  if (hero) {
    const hs = hero.canvas;
    hs.addEventListener('pointerdown', (e: PointerEvent) => {
      // The first touch of the controls ends the auto-rotation for good: once
      // someone is steering, the camera drifting under them is an annoyance.
      dragging = true; auto = false; lastX = e.clientX; lastY = e.clientY;
      hs.setPointerCapture(e.pointerId);
      if (hint) hint.textContent = 'Free view · true perspective';
    });
    hs.addEventListener('pointermove', (e: PointerEvent) => {
      if (!dragging) return;
      yaw -= (e.clientX - lastX) * 0.0072;
      pitch += (e.clientY - lastY) * 0.0050;
      lastX = e.clientX; lastY = e.clientY;
      placeHero();
    });
    (['pointerup', 'pointercancel', 'pointerleave'] as const).forEach((ev) => {
      hs.addEventListener(ev, () => { dragging = false; });
    });
    // The canvas is focusable, so the same orbit is reachable from the keyboard.
    hs.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { yaw += 0.14; }
      else if (e.key === 'ArrowRight') { yaw -= 0.14; }
      else if (e.key === 'ArrowUp') { pitch += 0.07; }
      else if (e.key === 'ArrowDown') { pitch -= 0.07; }
      else return;
      auto = false; e.preventDefault(); placeHero();
    });
  }

  /* ── Scene 2: interior view, variable focal length ────── */
  const lensCanvas = canvasById('lensStage');
  const lens = lensCanvas ? makeScene(lensCanvas, true, 720 / 1100) : null;
  if (lens) {
    lens.camera.position.set(-W / 2 + 0.34, 1.58, D / 2 - 0.30);
    lens.camera.lookAt(0.34, 1.02, -D / 2 + 0.2);
  }

  const focal = document.getElementById('focal');
  const focalInput = focal instanceof HTMLInputElement ? focal : null;
  const focalVal = document.getElementById('focalVal');
  const focalName = document.getElementById('focalName');
  const fakeArea = document.getElementById('fakeArea');
  const REAL_AREA = 6.9;

  function nameFor(f: number): string {
    if (f <= 17) return 'Ultra wide-angle';
    if (f <= 24) return 'Wide-angle';
    if (f <= 32) return 'Moderate wide';
    if (f <= 42) return 'Close to the human eye';
    return 'What you actually see';
  }
  function applyFocal(): void {
    if (!focalInput) return;
    const f = Number(focalInput.value);
    // 36 × 24 mm sensor. Vertical FOV drives the camera; horizontal drives the maths.
    if (lens) {
      lens.camera.fov = 2 * Math.atan(12 / f) * 180 / Math.PI;
      lens.camera.updateProjectionMatrix();
      lens.dirty = true;
    }
    const ratio = Math.tan(Math.atan(18 / f)) / Math.tan(Math.atan(18 / 50));
    if (focalVal) focalVal.textContent = String(f);
    if (focalName) focalName.textContent = nameFor(f);
    if (fakeArea) fakeArea.textContent = (REAL_AREA * Math.pow(ratio, 0.6)).toFixed(1) + ' m²';
  }
  if (focalInput) focalInput.addEventListener('input', applyFocal);

  // Nothing on the page to draw — bail out before starting a render loop.
  if (!scenes.length) {
    applyFocal();
    return;
  }

  function frame(): void {
    if (auto && !dragging) { yaw += 0.0016; placeHero(); }
    scenes.forEach((rec) => {
      if (rec.dirty) { rec.renderer.render(rec.scene, rec.camera); rec.dirty = false; }
    });
    requestAnimationFrame(frame);
  }
  function resizeAll(): void {
    scenes.forEach(resize);
    placeHero();
    applyFocal();
  }
  window.addEventListener('resize', resizeAll);
  onThemeChange(refreshSceneColors);
  resizeAll();
  frame();
}
