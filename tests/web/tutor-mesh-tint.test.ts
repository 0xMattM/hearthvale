import { describe, expect, it } from "vitest";
import {
  recolorVillagerClothBytes,
  rgb01FromHex,
  villagerPixelIsCloth,
  villagerPixelIsSkin,
} from "../../apps/web/lib/tutor-mesh-tint";

function pixel(bytes: Uint8ClampedArray, r: number, g: number, b: number) {
  bytes[0] = r;
  bytes[1] = g;
  bytes[2] = b;
  bytes[3] = 255;
}

/**
 * Cloth texels pick up the profession color; peach skin stays put.
 */
describe("tutor villager clothing tint", () => {
  it("recolors a brown apron toward fisher teal (happy)", () => {
    const bytes = new Uint8ClampedArray([90, 58, 40, 255]);
    const tint = rgb01FromHex("#2a7a9a");
    const count = recolorVillagerClothBytes(bytes, tint, 0.88);
    expect(count).toBe(1);
    expect(bytes[2]!).toBeGreaterThan(bytes[0]!);
    expect(bytes[0]!).toBeLessThan(70);
  });

  it("leaves peach skin and dark outlines alone (edge)", () => {
    expect(villagerPixelIsSkin(232, 200, 160)).toBe(true);
    expect(villagerPixelIsCloth(232, 200, 160)).toBe(false);
    expect(villagerPixelIsCloth(24, 18, 14)).toBe(false);
    const skin = new Uint8ClampedArray([232, 200, 160, 255]);
    recolorVillagerClothBytes(skin, rgb01FromHex("#2a7a9a"), 0.88);
    expect([...skin]).toEqual([232, 200, 160, 255]);
  });

  it("does not recolor when mix is 0 or the texel is not cloth (failure)", () => {
    expect(villagerPixelIsCloth(90, 58, 40)).toBe(true);
    const bytes = new Uint8ClampedArray([90, 58, 40, 255]);
    expect(recolorVillagerClothBytes(bytes, rgb01FromHex("#2a7a9a"), 0)).toBe(1);
    expect([...bytes]).toEqual([90, 58, 40, 255]);
    pixel(bytes, 232, 200, 160);
    expect(recolorVillagerClothBytes(bytes, rgb01FromHex("#c47838"), 1)).toBe(0);
    expect(rgb01FromHex("nope")).toEqual({ r: 0, g: 0, b: 0 });
  });
});
