/**
 * Procedural surface textures — CanvasTexture maps so world kits read with grain,
 * not flat solid colors. No external atlases; cached per kind + repeat.
 */

import {
  CanvasTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";

export type SurfaceTextureKind =
  | "stone"
  | "cobble"
  | "dirt"
  | "grass"
  | "wood"
  | "bark"
  | "cloth"
  | "plaster"
  | "leather"
  | "metal"
  | "thatch";

export interface ProceduralSurfaceMaps {
  map: CanvasTexture;
  roughnessMap: CanvasTexture;
  bumpMap: CanvasTexture;
  normalMap: CanvasTexture;
  bumpScale: number;
  normalScale: number;
}

interface SurfaceSpec {
  seed: number;
  bumpScale: number;
  /** Default UV repeat for large floor planes. */
  defaultRepeat: number;
}

const SPECS: Record<SurfaceTextureKind, SurfaceSpec> = {
  stone: { seed: 11, bumpScale: 0.18, defaultRepeat: 4.5 },
  cobble: { seed: 23, bumpScale: 0.28, defaultRepeat: 3.2 },
  dirt: { seed: 37, bumpScale: 0.14, defaultRepeat: 6 },
  grass: { seed: 41, bumpScale: 0.08, defaultRepeat: 10 },
  wood: { seed: 53, bumpScale: 0.16, defaultRepeat: 1.4 },
  bark: { seed: 59, bumpScale: 0.24, defaultRepeat: 1.6 },
  cloth: { seed: 67, bumpScale: 0.09, defaultRepeat: 3 },
  plaster: { seed: 71, bumpScale: 0.1, defaultRepeat: 2.2 },
  leather: { seed: 79, bumpScale: 0.13, defaultRepeat: 2.2 },
  metal: { seed: 83, bumpScale: 0.06, defaultRepeat: 1.6 },
  thatch: { seed: 89, bumpScale: 0.2, defaultRepeat: 2.2 },
};

const TEX_SIZE = 256;
/** Floor/span: keep maps bright so kit hex × grain does not crush to mud. */
export const PROCEDURAL_ALBEDO_FLOOR = 0.5;
export const PROCEDURAL_ALBEDO_SPAN = 0.5;
const cache = new Map<string, ProceduralSurfaceMaps>();

/**
 * Hash noise in [0, 1).
 *
 * @param x - Cell X.
 * @param y - Cell Y.
 * @param seed - Pattern seed.
 * @returns Pseudo-random unit value.
 */
export function hashNoise(x: number, y: number, seed: number): number {
  let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + seed * 9973;
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/**
 * Smooth value noise at fractional coords.
 *
 * @param x - Sample X.
 * @param y - Sample Y.
 * @param seed - Pattern seed.
 * @returns Interpolated noise in [0, 1).
 */
export function valueNoise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hashNoise(x0, y0, seed);
  const b = hashNoise(x0 + 1, y0, seed);
  const c = hashNoise(x0, y0 + 1, seed);
  const d = hashNoise(x0 + 1, y0 + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

/**
 * Layered value noise so grain is blotchy instead of a single frequency.
 *
 * @param x - Sample X.
 * @param y - Sample Y.
 * @param seed - Pattern seed.
 * @param octaves - Layer count.
 * @returns FBM in [0, 1).
 */
export function fbmNoise(
  x: number,
  y: number,
  seed: number,
  octaves = 3,
): number {
  let sum = 0;
  let amp = 1;
  let freq = 1;
  let tot = 0;
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(x * freq, y * freq, seed + i * 19) * amp;
    tot += amp;
    amp *= 0.5;
    freq *= 2.05;
  }
  return tot > 0 ? sum / tot : 0;
}

function clamp01(n: number): number {
  if (n <= 0) return 0;
  if (n >= 1) return 1;
  return n;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Fills albedo / roughness / height buffers for one surface kind.
 * Albedo is a tinted grayscale so Three multiplies kit hex with visible grain.
 *
 * @param kind - Surface pattern family.
 * @param size - Square texture edge in pixels.
 * @param albedo - RGBA albedo out.
 * @param roughness - RGBA roughness out (R used).
 * @param height - RGBA height out (R used).
 */
export function fillSurfaceBuffers(
  kind: SurfaceTextureKind,
  size: number,
  albedo: Uint8ClampedArray,
  roughness: Uint8ClampedArray,
  height: Uint8ClampedArray,
): void {
  const seed = SPECS[kind].seed;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const sample = sampleSurface(kind, u, v, seed);
      const i = (y * size + x) * 4;
      const gray = clamp01(
        PROCEDURAL_ALBEDO_FLOOR + sample.albedo * PROCEDURAL_ALBEDO_SPAN,
      );
      // Reason: grass maps need a green bias so kit×map reads as turf, not plastic fill.
      if (kind === "grass") {
        const blade =
          (fbmNoise(u * 40, v * 12, seed + 41, 2) - 0.5) * 0.12;
        const r = Math.round(clamp01(gray * 0.62 + blade * 0.05) * 255);
        const g = Math.round(clamp01(gray * 1.08 + blade * 0.1) * 255);
        const b = Math.round(clamp01(gray * 0.48) * 255);
        albedo[i] = r;
        albedo[i + 1] = g;
        albedo[i + 2] = b;
        albedo[i + 3] = 255;
      } else {
        // Reason: slight warm/cool split so grain is not a flat gray multiply.
        const tint = (fbmNoise(u * 9, v * 9, seed + 31, 2) - 0.5) * 0.14;
        const r = Math.round(clamp01(gray + tint) * 255);
        const g = Math.round(gray * 255);
        const b = Math.round(clamp01(gray - tint * 0.65) * 255);
        albedo[i] = r;
        albedo[i + 1] = g;
        albedo[i + 2] = b;
        albedo[i + 3] = 255;
      }
      const rv = Math.round(clamp01(sample.roughness) * 255);
      roughness[i] = rv;
      roughness[i + 1] = rv;
      roughness[i + 2] = rv;
      roughness[i + 3] = 255;
      const h = Math.round(clamp01(sample.height) * 255);
      height[i] = h;
      height[i + 1] = h;
      height[i + 2] = h;
      height[i + 3] = 255;
    }
  }
}

/**
 * Builds a tangent-space normal map from a grayscale height buffer.
 *
 * @param height - RGBA height (R used).
 * @param size - Square edge.
 * @param out - RGBA normal out (RGB = xyz 0..255).
 * @param strength - Slope exaggeration.
 */
export function fillNormalFromHeight(
  height: Uint8ClampedArray,
  size: number,
  out: Uint8ClampedArray,
  strength = 6,
): void {
  function hAt(x: number, y: number): number {
    const xx = ((x % size) + size) % size;
    const yy = ((y % size) + size) % size;
    return height[(yy * size + xx) * 4]! / 255;
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (hAt(x - 1, y) - hAt(x + 1, y)) * strength;
      const dy = (hAt(x, y - 1) - hAt(x, y + 1)) * strength;
      const len = Math.hypot(dx, dy, 1) || 1;
      const i = (y * size + x) * 4;
      out[i] = Math.round((dx / len * 0.5 + 0.5) * 255);
      out[i + 1] = Math.round((dy / len * 0.5 + 0.5) * 255);
      out[i + 2] = Math.round((1 / len * 0.5 + 0.5) * 255);
      out[i + 3] = 255;
    }
  }
}

interface SurfaceSample {
  albedo: number;
  roughness: number;
  height: number;
}

/**
 * Samples one texel of a surface pattern.
 *
 * @param kind - Pattern family.
 * @param u - U in [0,1).
 * @param v - V in [0,1).
 * @param seed - Pattern seed.
 * @returns Albedo / roughness / height in [0,1].
 */
function sampleSurface(
  kind: SurfaceTextureKind,
  u: number,
  v: number,
  seed: number,
): SurfaceSample {
  switch (kind) {
    case "cobble":
      return sampleCobble(u, v, seed);
    case "stone":
      return sampleStone(u, v, seed);
    case "dirt":
      return sampleDirt(u, v, seed);
    case "grass":
      return sampleGrass(u, v, seed);
    case "wood":
      return sampleWood(u, v, seed);
    case "bark":
      return sampleBark(u, v, seed);
    case "cloth":
      return sampleCloth(u, v, seed);
    case "plaster":
      return samplePlaster(u, v, seed);
    case "leather":
      return sampleLeather(u, v, seed);
    case "metal":
      return sampleMetal(u, v, seed);
    case "thatch":
      return sampleThatch(u, v, seed);
    default:
      return { albedo: 0.85, roughness: 0.7, height: 0.5 };
  }
}

function sampleCobble(u: number, v: number, seed: number): SurfaceSample {
  // Reason: Voronoi cells + soft mortar — old axis-aligned grid read as ruler lines.
  const cells = 5.2;
  const gx = u * cells;
  const gy = v * cells;
  let minD = 9;
  let minD2 = 9;
  let tone = 0.5;
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      const ix = Math.floor(gx) + ox;
      const iy = Math.floor(gy) + oy;
      const px = ix + hashNoise(ix, iy, seed);
      const py = iy + hashNoise(ix, iy, seed + 7);
      const d = Math.hypot(gx - px, gy - py);
      if (d < minD) {
        minD2 = minD;
        minD = d;
        tone = hashNoise(ix, iy, seed + 13);
      } else if (d < minD2) {
        minD2 = d;
      }
    }
  }
  const edge = minD2 - minD;
  const stone = smoothstep(0.05, 0.16, edge);
  const n = fbmNoise(u * 14, v * 14, seed, 3);
  const mortarAlbedo = 0.42 + n * 0.12;
  const stoneAlbedo = 0.72 + tone * 0.26 + n * 0.1;
  const albedo = mortarAlbedo + (stoneAlbedo - mortarAlbedo) * stone;
  return {
    albedo,
    roughness: 0.68 + (1 - stone) * 0.28 + n * 0.08,
    height: 0.18 + stone * (0.55 + n * 0.16),
  };
}

function sampleStone(u: number, v: number, seed: number): SurfaceSample {
  const n1 = fbmNoise(u * 7, v * 7, seed, 4);
  const n2 = fbmNoise(u * 22, v * 22, seed + 3, 2);
  const crackN = fbmNoise(u * 5, v * 18, seed + 7, 2);
  const crack = smoothstep(0.46, 0.5, Math.abs(crackN - 0.5)) * 0.16;
  const albedo = 0.62 + n1 * 0.26 + n2 * 0.08 - crack;
  return {
    albedo,
    roughness: 0.72 + n2 * 0.2,
    height: 0.34 + n1 * 0.42 - crack * 0.55,
  };
}

function sampleDirt(u: number, v: number, seed: number): SurfaceSample {
  const n1 = fbmNoise(u * 11, v * 11, seed, 4);
  const n2 = fbmNoise(u * 32, v * 32, seed + 2, 2);
  const pebble = hashNoise(Math.floor(u * 28 + n1 * 3), Math.floor(v * 28), seed);
  const pebbleMix = smoothstep(0.9, 0.97, pebble);
  return {
    albedo: 0.58 + n1 * 0.28 + n2 * 0.1 + pebbleMix * 0.1,
    roughness: 0.82 + n2 * 0.14,
    height: 0.3 + n1 * 0.38 + pebbleMix * 0.18,
  };
}

function sampleGrass(u: number, v: number, seed: number): SurfaceSample {
  // Reason: softer low-frequency turf — high-frequency blades shimmered under dusk light.
  const n1 = fbmNoise(u * 4.5, v * 4.5, seed, 3);
  const tuft = fbmNoise(u * 2.2, v * 2.2, seed + 11, 2);
  const soft = fbmNoise(u * 14, v * 14, seed + 5, 2);
  return {
    albedo: 0.5 + n1 * 0.22 + tuft * 0.12 + soft * 0.08,
    roughness: 0.98,
    height: 0.4 + n1 * 0.2 + tuft * 0.15,
  };
}

function sampleWood(u: number, v: number, seed: number): SurfaceSample {
  const warp = fbmNoise(u * 2.4, v * 3.2, seed, 3) * 0.22;
  const wobble = fbmNoise(u * 1.2, v * 9, seed + 1, 2) * 0.07;
  const grain = Math.sin((v + warp + wobble) * Math.PI * 16);
  const n = fbmNoise(u * 6, v * 16, seed + 2, 2);
  const knot = fbmNoise(u * 5, v * 5, seed + 9, 2);
  const ring = smoothstep(0.74, 0.86, knot) * 0.14;
  const g = 0.5 + grain * 0.5;
  return {
    albedo: 0.55 + g * 0.28 + n * 0.1 - ring,
    roughness: 0.68 + n * 0.22,
    height: 0.38 + g * 0.28 + n * 0.12 - ring * 0.45,
  };
}

function sampleBark(u: number, v: number, seed: number): SurfaceSample {
  const warp = fbmNoise(u * 2, v * 6, seed, 3);
  const ridges = Math.abs(Math.sin(u * Math.PI * 11 + warp * 4.5));
  const n = fbmNoise(u * 16, v * 8, seed + 4, 3);
  return {
    albedo: 0.42 + ridges * 0.32 + n * 0.16,
    roughness: 0.9,
    height: 0.22 + ridges * 0.55 + n * 0.18,
  };
}

function sampleCloth(u: number, v: number, seed: number): SurfaceSample {
  const warpU = u + fbmNoise(u * 3, v * 3, seed, 2) * 0.04;
  const warpV = v + fbmNoise(u * 3, v * 3, seed + 4, 2) * 0.04;
  const weaveU = 0.5 + 0.5 * Math.sin(warpU * Math.PI * 28);
  const weaveV = 0.5 + 0.5 * Math.sin(warpV * Math.PI * 28);
  const weave = weaveU * 0.45 + weaveV * 0.45;
  const n = fbmNoise(u * 14, v * 14, seed + 8, 2);
  return {
    albedo: 0.62 + weave * 0.22 + n * 0.1,
    roughness: 0.8 + weave * 0.12,
    height: 0.4 + weave * 0.22 + n * 0.08,
  };
}

function samplePlaster(u: number, v: number, seed: number): SurfaceSample {
  const n1 = fbmNoise(u * 6, v * 6, seed, 4);
  const n2 = fbmNoise(u * 24, v * 24, seed + 2, 2);
  return {
    albedo: 0.68 + n1 * 0.22 + n2 * 0.08,
    roughness: 0.82 + n2 * 0.12,
    height: 0.4 + n1 * 0.28 + n2 * 0.12,
  };
}

function sampleLeather(u: number, v: number, seed: number): SurfaceSample {
  const n1 = fbmNoise(u * 8, v * 8, seed, 4);
  const n2 = fbmNoise(u * 22, v * 22, seed + 6, 2);
  return {
    albedo: 0.52 + n1 * 0.32 + n2 * 0.12,
    roughness: 0.62 + n1 * 0.28,
    height: 0.34 + n1 * 0.38 + n2 * 0.1,
  };
}

function sampleMetal(u: number, v: number, seed: number): SurfaceSample {
  const warp = fbmNoise(u * 1.5, v * 8, seed, 2);
  const streak = 0.5 + 0.5 * Math.sin((v + warp * 0.35) * Math.PI * 22);
  const n = fbmNoise(u * 12, v * 12, seed + 1, 2);
  return {
    albedo: 0.7 + streak * 0.18 + n * 0.08,
    roughness: 0.28 + n * 0.32,
    height: 0.46 + streak * 0.12 + n * 0.06,
  };
}

function sampleThatch(u: number, v: number, seed: number): SurfaceSample {
  const warp = fbmNoise(u * 2, v * 8, seed, 3);
  const strand = 0.5 + 0.5 * Math.sin((u + warp * 0.4) * Math.PI * 20);
  const n = fbmNoise(u * 10, v * 5, seed + 3, 2);
  return {
    albedo: 0.5 + strand * 0.32 + n * 0.12,
    roughness: 0.88,
    height: 0.28 + strand * 0.45 + n * 0.12,
  };
}

/**
 * Builds (or returns cached) Three maps for a surface kind.
 *
 * @param kind - Pattern family.
 * @param repeat - UV repeat (defaults per kind).
 * @returns Color / roughness / bump maps ready for MeshStandardMaterial.
 */
export function getProceduralSurfaceMaps(
  kind: SurfaceTextureKind,
  repeat?: number | readonly [number, number],
): ProceduralSurfaceMaps {
  const spec = SPECS[kind];
  const { u: ru, v: rv } = surfaceRepeatXY(repeat, spec.defaultRepeat);
  const key = `${kind}:${ru}:${rv}:n7`;
  const hit = cache.get(key);
  if (hit && isProceduralMapsAlive(hit)) return hit;
  if (hit) cache.delete(key);

  if (typeof document === "undefined") {
    // Reason: SSR / tests without DOM — return disposable blank textures.
    return blankMaps(spec.bumpScale);
  }

  const albedo = new Uint8ClampedArray(TEX_SIZE * TEX_SIZE * 4);
  const rough = new Uint8ClampedArray(TEX_SIZE * TEX_SIZE * 4);
  const height = new Uint8ClampedArray(TEX_SIZE * TEX_SIZE * 4);
  const normal = new Uint8ClampedArray(TEX_SIZE * TEX_SIZE * 4);
  fillSurfaceBuffers(kind, TEX_SIZE, albedo, rough, height);
  fillNormalFromHeight(height, TEX_SIZE, normal, spec.bumpScale * 95);

  const map = canvasFromRgba(albedo, TEX_SIZE, true);
  const roughnessMap = canvasFromRgba(rough, TEX_SIZE, false);
  const bumpMap = canvasFromRgba(height, TEX_SIZE, false);
  const normalMap = canvasFromRgba(normal, TEX_SIZE, false);
  for (const tex of [map, roughnessMap, bumpMap, normalMap]) {
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
    tex.repeat.set(ru, rv);
    tex.magFilter = LinearFilter;
    tex.minFilter = LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    tex.userData.proceduralAlive = true;
    tex.addEventListener("dispose", () => {
      tex.userData.proceduralAlive = false;
      const cached = cache.get(key);
      if (
        cached &&
        (cached.map === tex ||
          cached.roughnessMap === tex ||
          cached.bumpMap === tex ||
          cached.normalMap === tex)
      ) {
        cache.delete(key);
      }
    });
  }

  const maps: ProceduralSurfaceMaps = {
    map,
    roughnessMap,
    bumpMap,
    normalMap,
    bumpScale: spec.bumpScale,
    normalScale: 1.85 + spec.bumpScale * 5.5,
  };
  cache.set(key, maps);
  return maps;
}

/**
 * True when cached procedural maps still have live GPU-backed textures.
 *
 * @param maps - Cached map trio.
 * @returns False after R3F/Three dispose.
 */
export function isProceduralMapsAlive(maps: ProceduralSurfaceMaps): boolean {
  return (
    maps.map?.userData?.proceduralAlive === true &&
    maps.roughnessMap?.userData?.proceduralAlive === true &&
    maps.bumpMap?.userData?.proceduralAlive === true &&
    maps.normalMap?.userData?.proceduralAlive === true
  );
}

/**
 * UV repeat on X/Y. A single number tiles both axes; a pair is for long paths
 * so grain is not stretched into stripes.
 *
 * @param repeat - Uniform tile count, or `[u, v]`.
 * @param fallback - Used when missing / non-positive.
 * @returns Positive U and V repeats.
 */
export function surfaceRepeatXY(
  repeat: number | readonly [number, number] | undefined,
  fallback: number,
): { u: number; v: number } {
  const fb = Number.isFinite(fallback) && fallback > 0 ? fallback : 1;
  if (Array.isArray(repeat) && repeat.length >= 2) {
    const u = Number.isFinite(repeat[0]) && repeat[0] > 0 ? repeat[0] : fb;
    const v = Number.isFinite(repeat[1]) && repeat[1] > 0 ? repeat[1] : fb;
    return { u, v };
  }
  if (typeof repeat === "number" && Number.isFinite(repeat) && repeat > 0)
    return { u: repeat, v: repeat };
  return { u: fb, v: fb };
}

/**
 * Default UV repeat for a surface kind (floors / props).
 *
 * @param kind - Pattern family.
 * @returns Suggested repeat count.
 */
export function defaultSurfaceRepeat(kind: SurfaceTextureKind): number {
  return SPECS[kind].defaultRepeat;
}

function canvasFromRgba(
  data: Uint8ClampedArray,
  size: number,
  srgb: boolean,
): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable for procedural texture");
  const image = ctx.createImageData(size, size);
  image.data.set(data);
  ctx.putImageData(image, 0, 0);
  const tex = new CanvasTexture(canvas);
  if (srgb) tex.colorSpace = SRGBColorSpace;
  return tex;
}

function blankMaps(bumpScale: number): ProceduralSurfaceMaps {
  const canvas = typeof document !== "undefined"
    ? document.createElement("canvas")
    : (null as unknown as HTMLCanvasElement);
  if (!canvas) {
    // Minimal stub for Node tests — callers should use fillSurfaceBuffers directly.
    const stub = {
      image: { width: 1, height: 1 },
      needsUpdate: true,
      wrapS: RepeatWrapping,
      wrapT: RepeatWrapping,
      repeat: { set() {} },
    } as unknown as CanvasTexture;
    return {
      map: stub,
      roughnessMap: stub,
      bumpMap: stub,
      normalMap: stub,
      bumpScale,
      normalScale: 1,
    };
  }
  canvas.width = 1;
  canvas.height = 1;
  const tex = new CanvasTexture(canvas);
  return {
    map: tex,
    roughnessMap: tex,
    bumpMap: tex,
    normalMap: tex,
    bumpScale,
    normalScale: 1,
  };
}
