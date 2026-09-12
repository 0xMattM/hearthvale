import { TUTOR_MESH_TINT_MIX } from "@game/shared";
import { CanvasTexture, type Texture } from "three";
import {
  recolorVillagerClothBytes,
  rgb01FromHex,
} from "@/lib/tutor-mesh-tint";

const tintedMapCache = new Map<string, CanvasTexture>();

function clothingSourceSize(
  image: {
    width?: number;
    height?: number;
    naturalWidth?: number;
    naturalHeight?: number;
  },
): { width: number; height: number } | null {
  const width = image.naturalWidth || image.width || 0;
  const height = image.naturalHeight || image.height || 0;
  if (width < 1 || height < 1) return null;
  return { width, height };
}

function blitTextureImage(
  ctx: CanvasRenderingContext2D,
  image: unknown,
  width: number,
  height: number,
): boolean {
  if (
    image instanceof HTMLImageElement ||
    image instanceof HTMLCanvasElement ||
    (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap)
  ) {
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }
  if (typeof ImageData !== "undefined" && image instanceof ImageData) {
    ctx.putImageData(image, 0, 0);
    return true;
  }
  const rec = image as { data?: ArrayBufferView; width?: number; height?: number };
  if (rec.data && rec.width && rec.height) {
    const bytes = new Uint8ClampedArray(
      rec.data.buffer,
      rec.data.byteOffset,
      rec.width * rec.height * 4,
    );
    ctx.putImageData(new ImageData(bytes, rec.width, rec.height), 0, 0);
    return true;
  }
  return false;
}

/**
 * Clone a villager atlas and paint clothing texels with the profession color.
 *
 * @param map - Shared FBX albedo (not mutated).
 * @param tintHex - Profession cloak hex.
 * @returns Cached canvas map, or the source map when the image cannot be read.
 */
export function tintVillagerClothingMap(
  map: Texture,
  tintHex: string,
): Texture {
  const key = `${map.uuid}:${tintHex}`;
  const hit = tintedMapCache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return map;
  const image = map.image as
    | { width?: number; height?: number; naturalWidth?: number; naturalHeight?: number }
    | undefined;
  const size = image ? clothingSourceSize(image) : null;
  if (!size) return map;

  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return map;
  if (!blitTextureImage(ctx, image, size.width, size.height)) return map;
  const pixels = ctx.getImageData(0, 0, size.width, size.height);
  recolorVillagerClothBytes(
    pixels.data,
    rgb01FromHex(tintHex),
    TUTOR_MESH_TINT_MIX,
  );
  ctx.putImageData(pixels, 0, 0);

  const tinted = new CanvasTexture(canvas);
  tinted.wrapS = map.wrapS;
  tinted.wrapT = map.wrapT;
  tinted.magFilter = map.magFilter;
  tinted.minFilter = map.minFilter;
  tinted.flipY = map.flipY;
  tinted.colorSpace = map.colorSpace;
  tinted.needsUpdate = true;
  tintedMapCache.set(key, tinted);
  return tinted;
}
