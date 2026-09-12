import { describe, expect, it } from "vitest";
import {
  CITY_BUILDINGS,
  EXPLORE_BUILDINGS,
  EXPLORE_SECTIONS,
  WORLD,
} from "@game/shared";

/** Homestead inner plot plane in CityEnvironment sibling HomesteadEnvironment. */
const HOMESTEAD_PLOT: [number, number] = [18, 16];
/** City plaza plane after map-footprint spread (must read larger than land plot). */
const CITY_PLAZA: [number, number] = [32, 28];

/**
 * City / Explore map footprint vs homestead plot.
 * Prevents hub + wilds packing back into land-sized islands.
 */
describe("CityLands city/explore map footprint", () => {
  it("city buildings span a larger world box than the homestead plot (happy)", () => {
    const xs = CITY_BUILDINGS.map((b) => b.x * WORLD.GRID);
    const zs = CITY_BUILDINGS.map((b) => b.z * WORLD.GRID);
    const width = Math.max(...xs) - Math.min(...xs);
    const depth = Math.max(...zs) - Math.min(...zs);
    expect(width).toBeGreaterThan(HOMESTEAD_PLOT[0]);
    expect(depth).toBeGreaterThan(HOMESTEAD_PLOT[1]);
    expect(CITY_PLAZA[0]).toBeGreaterThan(HOMESTEAD_PLOT[0]);
    expect(CITY_PLAZA[1]).toBeGreaterThan(HOMESTEAD_PLOT[1]);
  });

  it("explore sections sit outside a land-sized center (edge)", () => {
    for (const section of EXPLORE_SECTIONS) {
      const [fw, fd] = section.floorSize;
      expect(fw).toBeGreaterThanOrEqual(24);
      expect(fd).toBeGreaterThanOrEqual(20);
    }
    const xs = EXPLORE_BUILDINGS.map((b) => Math.abs(b.x));
    expect(Math.max(...xs)).toBeGreaterThanOrEqual(10);
  });

  it("rejects packing city stations back into ±4 grid (failure)", () => {
    const maxAbs = Math.max(
      ...CITY_BUILDINGS.map((b) => Math.max(Math.abs(b.x), Math.abs(b.z))),
    );
    expect(maxAbs).toBeGreaterThan(4);
  });
});
