/**
 * Recolor villager clothing pixels toward a profession tint; keep skin / hair / outlines.
 */

export interface Rgb01 {
  r: number;
  g: number;
  b: number;
}

/**
 * Parse #rrggbb to 0…1 RGB.
 *
 * @param hex - CSS hex color.
 * @returns Linear-ish 0…1 channels; black if the hex is invalid.
 */
export function rgb01FromHex(hex: string): Rgb01 {
  const n = parseInt(hex.replace("#", ""), 16);
  if (!Number.isFinite(n)) return { r: 0, g: 0, b: 0 };
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  };
}

/**
 * Peach face / arms on the Villager NPC atlas.
 *
 * @param r - Red 0…255.
 * @param g - Green 0…255.
 * @param b - Blue 0…255.
 * @returns True when the texel should stay untinted.
 */
export function villagerPixelIsSkin(r: number, g: number, b: number): boolean {
  const lum = (r + g + b) / 3;
  return r > 160 && g > 110 && b > 70 && r > g && g >= b * 0.7 && lum > 140;
}

/**
 * Shirt / apron / pants — mid dark chromatic texels, not skin or ink.
 *
 * @param r - Red 0…255.
 * @param g - Green 0…255.
 * @param b - Blue 0…255.
 * @returns True when the texel is clothing to recolor.
 */
export function villagerPixelIsCloth(r: number, g: number, b: number): boolean {
  const lum = (r + g + b) / 3;
  if (lum < 38 || lum > 210) return false;
  const span = Math.max(r, g, b) - Math.min(r, g, b);
  if (span < 18 && lum > 170) return false;
  if (villagerPixelIsSkin(r, g, b)) return false;
  return true;
}

/**
 * Recolor clothing bytes in place (RGBA).
 *
 * @param bytes - Image RGBA buffer.
 * @param tint - Profession color 0…1.
 * @param mix - Blend 0…1 from original cloth toward luminance * tint.
 * @returns Count of recolored texels.
 */
export function recolorVillagerClothBytes(
  bytes: Uint8ClampedArray,
  tint: Rgb01,
  mix: number,
): number {
  let count = 0;
  const amount = Math.min(1, Math.max(0, mix));
  for (let i = 0; i < bytes.length; i += 4) {
    const r = bytes[i]!;
    const g = bytes[i + 1]!;
    const b = bytes[i + 2]!;
    if (!villagerPixelIsCloth(r, g, b)) continue;
    const lum = Math.max(0.4, (r + g + b) / (3 * 255));
    const nr = lum * tint.r * 255;
    const ng = lum * tint.g * 255;
    const nb = lum * tint.b * 255;
    bytes[i] = r + (nr - r) * amount;
    bytes[i + 1] = g + (ng - g) * amount;
    bytes[i + 2] = b + (nb - b) * amount;
    count += 1;
  }
  return count;
}
