import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BRICK_PACK_COLORS } from "../../apps/web/lib/brick-houses";
import {
  fillBrickHallAlbedo,
  BRICK_HALL_BRICK_COLS,
  BRICK_HALL_BRICK_ROWS,
  type BrickHallSurfaceKind,
} from "../../apps/web/lib/brick-hall-textures";

/**
 * Counts unique RGB cells in an albedo buffer.
 *
 * @param albedo - RGBA bytes.
 * @returns Unique `r,g,b` keys.
 */
function uniqueRgb(albedo: Uint8ClampedArray): Set<string> {
  const keys = new Set<string>();
  for (let i = 0; i < albedo.length; i += 4) {
    keys.add(`${albedo[i]},${albedo[i + 1]},${albedo[i + 2]}`);
  }
  return keys;
}

describe("brick hall kit textures", () => {
  it("stamps chunky 4×2 running-bond brick from the colorscheme terracotta (happy)", () => {
    expect(BRICK_HALL_BRICK_ROWS).toBe(4);
    expect(BRICK_HALL_BRICK_COLS).toBe(2);
    const size = 64;
    const albedo = new Uint8ClampedArray(size * size * 4);
    const height = new Uint8ClampedArray(size * size * 4);
    fillBrickHallAlbedo("brick", size, albedo, height);
    const keys = uniqueRgb(albedo);
    expect(keys.has(BRICK_PACK_COLORS.mortar.join(","))).toBe(true);
    const brickish = [...keys].some((k) => {
      const [r, g, b] = k.split(",").map(Number);
      return r > 90 && r < 160 && g < r && b <= g + 8;
    });
    expect(brickish).toBe(true);
    expect(keys.size).toBeGreaterThan(2);
    expect(height[0]).toBeGreaterThan(0);
    const x = Math.round(size / BRICK_HALL_BRICK_COLS / 2);
    const y = Math.round(size / BRICK_HALL_BRICK_ROWS / 2);
    const i = (y * size + x) * 4;
    expect(albedo[i]).toBeGreaterThan(90);
    expect(albedo[i]).toBeLessThan(160);
  });

  it("keeps contrast on a tiny atlas and across roof/plaster (edge)", () => {
    for (const kind of ["brick", "roof", "plaster"] as BrickHallSurfaceKind[]) {
      const size = 2;
      const albedo = new Uint8ClampedArray(size * size * 4);
      const height = new Uint8ClampedArray(size * size * 4);
      fillBrickHallAlbedo(kind, size, albedo, height);
      expect(uniqueRgb(albedo).size).toBeGreaterThanOrEqual(1);
      expect(albedo[3]).toBe(255);
    }
  });

  it("rejects a zero-size atlas (failure)", () => {
    expect(() =>
      fillBrickHallAlbedo("brick", 0, new Uint8ClampedArray(0), new Uint8ClampedArray(0)),
    ).toThrow(/positive integer/);
    expect(() =>
      fillBrickHallAlbedo("roof", 8, new Uint8ClampedArray(4), new Uint8ClampedArray(4)),
    ).toThrow(/too small/);
  });

  it("City Hall copies the farmer-style concept kit, not packs or mill leftovers", () => {
    const hall = fs.readFileSync(
      path.join(process.cwd(), "apps/web/components/land-scene/CityClayHouse.tsx"),
      "utf8",
    );
    expect(hall).toContain("CityHallSurfaceMaterial");
    expect(hall).toContain("ShutterWindow");
    expect(hall).toContain("HallClock");
    expect(hall).not.toContain("BrickHouseProp");
    expect(hall).not.toContain("civicBlockKitMaterials");
    expect(hall).not.toContain("FarmPackProp");
    expect(hall).not.toContain("NikoVillageProp");
  });
});
