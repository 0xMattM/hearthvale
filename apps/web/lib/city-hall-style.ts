/**
 * City Hall style lock — sampled from farmer-style concept art
 * (`public/models/city-hall/concept-34.png`). Tileable clay atlases, not Meshy,
 * not the brick pack, not mill/station leftover kits.
 */

import { fillNormalFromHeight, hashNoise } from "./procedural-textures";
import {
  CanvasTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";

type Rgb = readonly [number, number, number];

/** Shared clay atlas colors — mill can swap hues without changing the hall. */
export interface ClayAtlasPalette {
  plaster: Rgb;
  timber: Rgb;
  roof: Rgb;
  roofGrout: Rgb;
  stone: Rgb;
  stoneGrout: Rgb;
  shutter: Rgb;
  /** How much stone dirties plaster (0 = even wash). */
  plasterGrain: number;
}

export const CITY_HALL_STYLE = {
  plaster: [248, 242, 232],
  timber: [92, 58, 42],
  roof: [106, 64, 48],
  roofGrout: [72, 42, 32],
  stone: [206, 190, 158],
  stoneGrout: [176, 160, 132],
  shutter: [62, 107, 74],
  plasterGrain: 0.16,
  /** Same family as timber — not the honey-gold that read as plastic. */
  frame: [130, 92, 68],
  glass: [92, 112, 128],
  clockFace: [245, 236, 212],
  knob: [201, 162, 39],
} as const satisfies ClayAtlasPalette & Record<string, Rgb | number>;

export type CityHallSurfaceKind = "plaster" | "wood" | "roof" | "stone" | "shutter";

export const CITY_HALL_ATLAS_SIZE = 128;

export interface CityHallMaps {
  map: Texture;
  bumpMap: Texture;
  bumpScale: number;
}

const cache = new Map<string, CityHallMaps>();

/**
 * Tileable albedo + height for one clay surface.
 *
 * @param kind - Surface family.
 * @param size - Atlas edge.
 * @param albedo - RGBA out.
 * @param height - RGBA height out.
 * @param palette - Hall or mill hues.
 */
export function fillCityHallAlbedo(
  kind: CityHallSurfaceKind,
  size: number,
  albedo: Uint8ClampedArray,
  height: Uint8ClampedArray,
  palette: ClayAtlasPalette = CITY_HALL_STYLE,
): void {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error("city hall atlas size must be a positive integer");
  }
  const needed = size * size * 4;
  if (albedo.length < needed || height.length < needed) {
    throw new Error("city hall atlas buffers are too small");
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sample = sampleCityHallSurface(kind, x, y, size, palette);
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
 * Cached linear maps for a clay surface (hall or mill hues).
 *
 * @param kind - Surface family.
 * @param repeatX - U tiles.
 * @param repeatY - V tiles.
 * @param palette - Hall or mill hues.
 * @param cachePrefix - Distinct key so mill does not reuse hall maps.
 * @returns Albedo + bump.
 */
export function getClayMaps(
  kind: CityHallSurfaceKind,
  repeatX: number,
  repeatY: number,
  palette: ClayAtlasPalette = CITY_HALL_STYLE,
  cachePrefix = "hall-v2",
): CityHallMaps {
  const palKey = `${palette.plaster.join("-")}:${palette.roof.join("-")}:${palette.shutter.join("-")}`;
  const key = `${cachePrefix}:${kind}:${repeatX}:${repeatY}:${palKey}`;
  const hit = cache.get(key);
  if (hit && hit.map.userData.cityHallAlive === true) return hit;
  if (hit) cache.delete(key);
  if (typeof document === "undefined") return blankMaps();

  const size = CITY_HALL_ATLAS_SIZE;
  const albedo = new Uint8ClampedArray(size * size * 4);
  const heightBuf = new Uint8ClampedArray(size * size * 4);
  const normal = new Uint8ClampedArray(size * size * 4);
  fillCityHallAlbedo(kind, size, albedo, heightBuf, palette);
  fillNormalFromHeight(heightBuf, size, normal, kind === "roof" || kind === "stone" ? 6 : 3);

  const map = canvasFromRgba(albedo, size, true);
  const bumpMap = canvasFromRgba(heightBuf, size, false);
  for (const tex of [map, bumpMap]) {
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.magFilter = LinearFilter;
    tex.minFilter = LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    tex.userData.cityHallAlive = true;
    tex.needsUpdate = true;
  }
  const maps: CityHallMaps = {
    map,
    bumpMap,
    bumpScale: kind === "roof" ? 0.18 : kind === "wood" ? 0.12 : 0.06,
  };
  cache.set(key, maps);
  return maps;
}

/**
 * Cached linear maps for a hall surface (clay look, not pixel bricks).
 *
 * @param kind - Surface family.
 * @param repeatX - U tiles.
 * @param repeatY - V tiles.
 * @returns Albedo + bump.
 */
export function getCityHallMaps(
  kind: CityHallSurfaceKind,
  repeatX: number,
  repeatY: number,
): CityHallMaps {
  return getClayMaps(kind, repeatX, repeatY, CITY_HALL_STYLE, "hall-v2");
}

interface Sample {
  rgb: Rgb;
  height: number;
}

/**
 * One texel of the style atlas.
 *
 * @param kind - Surface family.
 * @param x - Pixel X.
 * @param y - Pixel Y.
 * @param size - Atlas edge.
 * @returns RGB + height.
 */
function sampleCityHallSurface(
  kind: CityHallSurfaceKind,
  x: number,
  y: number,
  size: number,
  palette: ClayAtlasPalette,
): Sample {
  if (kind === "wood") return sampleWood(x, y, size, palette);
  if (kind === "roof") return sampleRoof(x, y, size, palette);
  if (kind === "stone") return sampleStone(x, y, size, palette);
  if (kind === "shutter") {
    const n = hashNoise(x, y, 5);
    return { rgb: mix(palette.shutter, palette.timber, n * 0.12), height: 0.5 };
  }
  const n = hashNoise(x, y, 9);
  return {
    rgb: mix(palette.plaster, palette.stone, n * palette.plasterGrain),
    height: 0.42 + n * 0.1,
  };
}

/**
 * Vertical clay wood grain.
 *
 * @param x - Pixel X.
 * @param y - Pixel Y.
 * @param size - Atlas edge.
 * @returns Wood sample.
 */
function sampleWood(
  x: number,
  y: number,
  size: number,
  palette: ClayAtlasPalette,
): Sample {
  const n = hashNoise(Math.floor(x / 6), y, 13);
  const stripe = (x / size) * 5 + n;
  const t = Math.abs(Math.sin(stripe * Math.PI));
  return {
    rgb: mix(palette.timber, palette.roofGrout, t * 0.22),
    height: 0.48 + t * 0.2,
  };
}

/**
 * Large roof shingles (few rows — concept tiles are chunky).
 *
 * @param x - Pixel X.
 * @param y - Pixel Y.
 * @param size - Atlas edge.
 * @returns Shingle sample.
 */
function sampleRoof(
  x: number,
  y: number,
  size: number,
  palette: ClayAtlasPalette,
): Sample {
  const rows = 4;
  const cols = 3;
  const row = Math.floor((y / size) * rows);
  const rowH = size / rows;
  const colW = size / cols;
  const shift = row % 2 === 0 ? 0 : colW / 2;
  const grout = Math.max(2, Math.round(size * 0.045));
  const localY = y - row * rowH;
  const shiftedX = (x + shift) % size;
  const localX = shiftedX % colW;
  if (localX < grout || localY < grout) {
    return { rgb: palette.roofGrout, height: 0.28 };
  }
  const col = Math.floor(shiftedX / colW);
  const n = hashNoise(col, row, 21);
  return {
    rgb: mix(palette.roof, palette.timber, n * 0.35),
    height: 0.55 + n * 0.2,
  };
}

/**
 * Foundation blocks — few large stones, not cobble specks.
 *
 * @param x - Pixel X.
 * @param y - Pixel Y.
 * @param size - Atlas edge.
 * @returns Stone sample.
 */
function sampleStone(
  x: number,
  y: number,
  size: number,
  palette: ClayAtlasPalette,
): Sample {
  const cells = 3;
  const cx = Math.floor((x / size) * cells);
  const cy = Math.floor((y / size) * cells);
  const grout = Math.max(2, Math.round(size / cells * 0.1));
  const localX = x - (cx * size) / cells;
  const localY = y - (cy * size) / cells;
  if (localX < grout || localY < grout) {
    return { rgb: palette.stoneGrout, height: 0.3 };
  }
  const n = hashNoise(cx, cy, 33);
  return {
    rgb: mix(palette.stone, palette.plaster, n * 0.25),
    height: 0.5 + n * 0.18,
  };
}

/**
 * Mix two palette RGB cells.
 *
 * @param a - First RGB.
 * @param b - Second RGB.
 * @param t - 0 = a, 1 = b.
 * @returns Mixed RGB.
 */
function mix(a: Rgb, b: Rgb, t: number): Rgb {
  const k = Math.min(1, Math.max(0, t));
  return [
    Math.round(a[0] + (b[0] - a[0]) * k),
    Math.round(a[1] + (b[1] - a[1]) * k),
    Math.round(a[2] + (b[2] - a[2]) * k),
  ];
}

/**
 * CanvasTexture from RGBA bytes.
 *
 * @param data - RGBA.
 * @param size - Edge.
 * @param srgb - Color vs data.
 * @returns Texture.
 */
function canvasFromRgba(data: Uint8ClampedArray, size: number, srgb: boolean): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable for city hall texture");
  const image = ctx.createImageData(size, size);
  image.data.set(data);
  ctx.putImageData(image, 0, 0);
  const tex = new CanvasTexture(canvas);
  if (srgb) tex.colorSpace = SRGBColorSpace;
  return tex;
}

/**
 * SSR stub.
 *
 * @returns Blank maps.
 */
function blankMaps(): CityHallMaps {
  const stub = { userData: { cityHallAlive: false } } as Texture;
  return { map: stub, bumpMap: stub, bumpScale: 0.1 };
}

/**
 * Hex string from a palette RGB cell.
 *
 * @param rgb - Palette cell.
 * @returns CSS hex.
 */
export function cityHallRgbHex(rgb: Rgb): string {
  return `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** Margin-house clay washes — same atlas family as the hall, not brick pack. */
export const CITY_CIVIC_HOUSE_PALETTES = {
  peach: {
    ...CITY_HALL_STYLE,
    plaster: [244, 218, 196],
    shutter: [86, 92, 118],
    roof: [118, 70, 52],
  },
  sage: {
    ...CITY_HALL_STYLE,
    plaster: [224, 232, 214],
    shutter: [92, 74, 56],
    roof: [90, 96, 88],
  },
  rose: {
    ...CITY_HALL_STYLE,
    plaster: [236, 214, 214],
    shutter: [74, 102, 86],
    roof: [108, 58, 58],
  },
  ochre: {
    ...CITY_HALL_STYLE,
    plaster: [236, 214, 168],
    shutter: [70, 88, 78],
    roof: [96, 72, 48],
  },
  linen: {
    ...CITY_HALL_STYLE,
    plaster: [236, 232, 220],
    shutter: [62, 107, 74],
    roof: [84, 86, 94],
  },
} as const satisfies Record<string, ClayAtlasPalette>;

/**
 * Clay atlas for a margin house tint.
 *
 * @param tint - House wash id.
 * @returns Palette in the hall atlas family.
 */
export function cityCivicHousePalette(
  tint: keyof typeof CITY_CIVIC_HOUSE_PALETTES,
): ClayAtlasPalette {
  return CITY_CIVIC_HOUSE_PALETTES[tint];
}
