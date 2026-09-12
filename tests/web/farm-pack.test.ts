import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  FARM_PACK_CITY_HALL,
  FARM_PACK_CITY_HALL_FIT,
  FARM_PACK_CIVIC_BLOCKS,
  farmPackFitScale,
  farmPackModel,
  farmPackPreloadUrls,
} from "../../apps/web/lib/farm-pack";

const FARM_DIR = path.join(process.cwd(), "apps/web/public/models/farm-pack");

describe("farm pack civic buildings", () => {
  it("catalogs the large barn GLB (happy)", () => {
    expect(farmPackModel(FARM_PACK_CITY_HALL).file).toBe("barn-large.glb");
    expect(FARM_PACK_CIVIC_BLOCKS).toHaveLength(4);
    expect(farmPackPreloadUrls()).toContain("/models/farm-pack/barn-large.glb");
    expect(
      farmPackFitScale({ x: 639, y: 480, z: 736 }, FARM_PACK_CITY_HALL_FIT),
    ).toBeCloseTo(6.8 / 736);
  });

  it("caps a tiny bbox so it cannot enlarge the GLB (edge)", () => {
    expect(
      farmPackFitScale({ x: 0.4, y: 0.3, z: 0.4 }, FARM_PACK_CITY_HALL_FIT),
    ).toBe(1);
  });

  it("caps a broken zero-size measurement at 1 (failure)", () => {
    expect(farmPackFitScale({ x: 0, y: 0, z: 0 }, FARM_PACK_CITY_HALL_FIT)).toBe(1);
  });

  it("ships extracted barn GLBs (failure if missing)", () => {
    for (const file of [
      "barn-large.glb",
      "barn-mid.glb",
      "house-white.glb",
      "barn-white.glb",
    ]) {
      const p = path.join(FARM_DIR, file);
      expect(fs.existsSync(p), file).toBe(true);
      const buf = fs.readFileSync(p);
      expect(buf.length).toBeGreaterThan(200);
      expect(buf.slice(0, 4).toString("ascii")).toBe("glTF");
    }
  });
});
