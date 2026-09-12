/**
 * Tileable brick / plaster / roof maps stamped from the Broken Vector colorscheme palette.
 * City Hall kits use these instead of the Collada house mesh.
 */

import { BRICK_PACK_COLORS } from "./brick-houses";
import { fillNormalFromHeight, hashNoise } from "./procedural-textures";
import {
  CanvasTexture,
  NearestFilter,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";

export type BrickHallSurfaceKind = "brick" | "plaster" | "roof" | "trim" | "stone";

export const BRICK_HALL_ATLAS_SIZE = 64;

/** Chunky low-poly bricks — 8×4 cells read as specks on a 6 m façade. */
export const BRICK_HALL_BRICK_ROWS = 4;
export const BRICK_HALL_BRICK_COLS = 2;

export interface BrickHallMaps {
  map: Texture;
  bumpMap: Texture;
  bumpScale: number;
}

const cache = new Map<string, BrickHallMaps>();

type Rgb = readonly [number, number, number];

/**
 * Writes a tileable albedo + height atlas for one hall surface.
 *
 * @param kind - Brick, plaster, roof tile, trim, or stone.
 * @param size - Square atlas edge in pixels.
 * @param albedo - RGBA albedo out.
 * @param height - RGBA height out (R used).
 */
export function fillBrickHallAlbedo(
  kind: BrickHallSurfaceKind,
  size: number,
  albedo: Uint8ClampedArray,
  height: Uint8ClampedArray,
): void {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error("brick hall atlas size must be a positive integer");
  }
  const needed = size * size * 4;
  if (albedo.length < needed || height.length < needed) {
    throw new Error("brick hall atlas buffers are too small");
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sample = sampleHallSurface(kind, x, y, size);
      const i = (y * size + x) * 4;
      albedo[i] = sample.rgb[0];
      albedo[i + 1] = sample.rgb[1];
      albedo[i + 2] = sample.rgb[2];
      albedo[i + 3] = 255;
      const h = Math.round(sample.height * 255);
      height[i] = h;
      height[i + 1] = h;
      height[i + 2] = h;
      height[i + 3] = 255;
    }
  }
}

/**
 * Builds (or returns cached) nearest-filter maps for a hall surface.
 *
 * @param kind - Surface family.
 * @param repeatX - U tiles.
 * @param repeatY - V tiles.
 * @returns Albedo + bump ready for MeshStandardMaterial.
 */
export function getBrickHallMaps(
  kind: BrickHallSurfaceKind,
  repeatX: number,
  repeatY: number,
): BrickHallMaps {
  const key = `v2:${kind}:${repeatX}:${repeatY}`;
  const hit = cache.get(key);
  if (hit && hit.map.userData.brickHallAlive === true) return hit;
  if (hit) cache.delete(key);

  if (typeof document === "undefined") return blankHallMaps();

  const size = BRICK_HALL_ATLAS_SIZE;
  const albedo = new Uint8ClampedArray(size * size * 4);
  const height = new Uint8ClampedArray(size * size * 4);
  const normal = new Uint8ClampedArray(size * size * 4);
  fillBrickHallAlbedo(kind, size, albedo, height);
  fillNormalFromHeight(height, size, normal, kind === "brick" || kind === "roof" ? 8 : 4);

  const map = canvasFromRgba(albedo, size, true);
  const bumpMap = canvasFromRgba(height, size, false);
  for (const tex of [map, bumpMap]) {
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.magFilter = NearestFilter;
    tex.minFilter = NearestFilter;
    tex.generateMipmaps = false;
    tex.userData.brickHallAlive = true;
    tex.needsUpdate = true;
  }

  const maps: BrickHallMaps = {
    map,
    bumpMap,
    bumpScale: kind === "brick" || kind === "roof" ? 0.22 : 0.08,
  };
  cache.set(key, maps);
  return maps;
}

interface HallSample {
  rgb: Rgb;
  height: number;
}

/**
 * One texel of a hall atlas.
 *
 * @param kind - Surface family.
 * @param x - Pixel X.
 * @param y - Pixel Y.
 * @param size - Atlas edge.
 * @returns Palette RGB + height.
 */
function sampleHallSurface(
  kind: BrickHallSurfaceKind,
  x: number,
  y: number,
  size: number,
): HallSample {
  if (kind === "brick") return sampleBrick(x, y, size);
  if (kind === "roof") return sampleRoof(x, y, size);
  if (kind === "stone") return sampleStone(x, y, size);
  if (kind === "trim") {
    const n = hashNoise(x, y, 3);
    return { rgb: mixRgb(BRICK_PACK_COLORS.trim, BRICK_PACK_COLORS.mortar, n * 0.12), height: 0.55 };
  }
  const n = hashNoise(x, y, 11);
  const rgb = mixRgb(BRICK_PACK_COLORS.plaster, BRICK_PACK_COLORS.plasterShade, 0.12 + n * 0.2);
  return { rgb, height: 0.42 + n * 0.12 };
}

/**
 * Running-bond brick cell from the pack terracotta + mortar.
 *
 * @param x - Pixel X.
 * @param y - Pixel Y.
 * @param size - Atlas edge.
 * @returns Brick or mortar sample.
 */
function sampleBrick(x: number, y: number, size: number): HallSample {
  const rows = BRICK_HALL_BRICK_ROWS;
  const cols = BRICK_HALL_BRICK_COLS;
  const row = Math.floor((y / size) * rows);
  const rowH = size / rows;
  const colW = size / cols;
  const shift = row % 2 === 0 ? 0 : colW / 2;
  const mortar = Math.max(2, Math.round(size * 0.07));
  const localY = y - row * rowH;
  const shiftedX = (x + shift) % size;
  const localX = shiftedX % colW;
  if (localX < mortar || localY < mortar) {
    return { rgb: BRICK_PACK_COLORS.mortar, height: 0.28 };
  }
  const col = Math.floor(shiftedX / colW);
  const n = hashNoise(col + 3, row + 9, 17);
  const rgb = mixRgb(BRICK_PACK_COLORS.brick, BRICK_PACK_COLORS.dark, n * 0.28);
  return { rgb, height: 0.62 + n * 0.18 };
}

/**
 * Overlapping terracotta tiles using the same brick cell, grouted with pack dark.
 *
 * @param x - Pixel X.
 * @param y - Pixel Y.
 * @param size - Atlas edge.
 * @returns Tile or grout sample.
 */
function sampleRoof(x: number, y: number, size: number): HallSample {
  const rows = 4;
  const cols = 3;
  const row = Math.floor((y / size) * rows);
  const rowH = size / rows;
  const colW = size / cols;
  const shift = row % 2 === 0 ? 0 : colW / 2;
  const grout = Math.max(1, Math.round(size * 0.04));
  const localY = y - row * rowH;
  const shiftedX = (x + shift) % size;
  const localX = shiftedX % colW;
  if (localX < grout || localY < grout) {
    return { rgb: BRICK_PACK_COLORS.dark, height: 0.22 };
  }
  const col = Math.floor(shiftedX / colW);
  const n = hashNoise(col, row, 29);
  const lit: Rgb = [148, 82, 68];
  const rgb = mixRgb(lit, BRICK_PACK_COLORS.brick, 0.35 + n * 0.4);
  return { rgb, height: 0.55 + n * 0.2 };
}

/**
 * Cobble-ish plaza stone from the pack gray cell.
 *
 * @param x - Pixel X.
 * @param y - Pixel Y.
 * @param size - Atlas edge.
 * @returns Stone sample.
 */
function sampleStone(x: number, y: number, size: number): HallSample {
  const cells = 4;
  const cx = Math.floor((x / size) * cells);
  const cy = Math.floor((y / size) * cells);
  const mortar = Math.max(1, Math.round(size / cells * 0.12));
  const localX = x - (cx * size) / cells;
  const localY = y - (cy * size) / cells;
  if (localX < mortar || localY < mortar) {
    return { rgb: BRICK_PACK_COLORS.mortar, height: 0.3 };
  }
  const n = hashNoise(cx, cy, 41);
  const rgb = mixRgb(BRICK_PACK_COLORS.stone, BRICK_PACK_COLORS.dark, n * 0.35);
  return { rgb, height: 0.5 + n * 0.2 };
}

/**
 * Mix two palette RGB cells.
 *
 * @param a - First RGB.
 * @param b - Second RGB.
 * @param t - 0 = a, 1 = b.
 * @returns Mixed RGB.
 */
function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  const k = Math.min(1, Math.max(0, t));
  return [
    Math.round(a[0] + (b[0] - a[0]) * k),
    Math.round(a[1] + (b[1] - a[1]) * k),
    Math.round(a[2] + (b[2] - a[2]) * k),
  ];
}

/**
 * CanvasTexture from an RGBA buffer.
 *
 * @param data - RGBA bytes.
 * @param size - Square edge.
 * @param srgb - Color texture vs data map.
 * @returns Three canvas texture.
 */
function canvasFromRgba(data: Uint8ClampedArray, size: number, srgb: boolean): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable for brick hall texture");
  const image = ctx.createImageData(size, size);
  image.data.set(data);
  ctx.putImageData(image, 0, 0);
  const tex = new CanvasTexture(canvas);
  if (srgb) tex.colorSpace = SRGBColorSpace;
  return tex;
}

/**
 * Node / SSR stub so kits still mount in tests.
 *
 * @returns Disposable blank maps.
 */
function blankHallMaps(): BrickHallMaps {
  const stub = { userData: { brickHallAlive: false } } as Texture;
  return { map: stub, bumpMap: stub, bumpScale: 0.1 };
}
