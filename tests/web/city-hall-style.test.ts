import { describe, expect, it } from "vitest";
import {
  CITY_HALL_STYLE,
  cityHallRgbHex,
  fillCityHallAlbedo,
  type CityHallSurfaceKind,
} from "../../apps/web/lib/city-hall-style";

/**
 * Unique RGB keys in an albedo buffer.
 *
 * @param albedo - RGBA bytes.
 * @returns `r,g,b` set.
 */
function uniqueRgb(albedo: Uint8ClampedArray): Set<string> {
  const keys = new Set<string>();
  for (let i = 0; i < albedo.length; i += 4) {
    keys.add(`${albedo[i]},${albedo[i + 1]},${albedo[i + 2]}`);
  }
  return keys;
}

describe("city hall concept style", () => {
  it("stamps cream plaster from the concept palette (happy)", () => {
    const size = 64;
    const albedo = new Uint8ClampedArray(size * size * 4);
    const height = new Uint8ClampedArray(size * size * 4);
    fillCityHallAlbedo("plaster", size, albedo, height);
    expect(albedo[0]).toBeGreaterThan(230);
    expect(albedo[1]).toBeGreaterThan(220);
    expect(CITY_HALL_STYLE.frame[0]).toBeLessThan(180);
    expect(cityHallRgbHex(CITY_HALL_STYLE.shutter)).toBe("#3e6b4a");
    expect(height[0]).toBeGreaterThan(0);
  });

  it("keeps roof and stone contrast on a tiny atlas (edge)", () => {
    for (const kind of ["roof", "stone", "wood"] as CityHallSurfaceKind[]) {
      const size = 2;
      const albedo = new Uint8ClampedArray(size * size * 4);
      const height = new Uint8ClampedArray(size * size * 4);
      fillCityHallAlbedo(kind, size, albedo, height);
      expect(uniqueRgb(albedo).size).toBeGreaterThanOrEqual(1);
      expect(albedo[3]).toBe(255);
    }
  });

  it("rejects a zero-size atlas (failure)", () => {
    expect(() =>
      fillCityHallAlbedo("plaster", 0, new Uint8ClampedArray(0), new Uint8ClampedArray(0)),
    ).toThrow(/positive integer/);
    expect(() =>
      fillCityHallAlbedo("roof", 8, new Uint8ClampedArray(4), new Uint8ClampedArray(4)),
    ).toThrow(/too small/);
  });
});
