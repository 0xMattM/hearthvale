import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  BRICK_HOUSE_CITY_HALL,
  BRICK_HOUSE_CITY_HALL_FIT,
  BRICK_HOUSE_CIVIC_BLOCKS,
  BRICK_HOUSE_CIVIC_FIT,
  BRICK_HOUSE_COLORSCHEME_URL,
  BRICK_HOUSE_LARGE,
  brickHouseFitScale,
  brickHouseModel,
  brickHousePreloadUrls,
} from "../../apps/web/lib/brick-houses";
import { japanVillageCrop, japanVillageProp } from "../../apps/web/lib/japan-village";

const BRICK_DIR = path.join(
  process.cwd(),
  "apps/web/public/models/brick-houses",
);
const JV_DIR = path.join(
  process.cwd(),
  "apps/web/public/models/japan-village",
);

describe("brick houses + japan village crops", () => {
  it("scales a civic Collada house to pad height ~3.5m (happy)", () => {
    expect(brickHouseFitScale({ x: 8, y: 10, z: 7 }, BRICK_HOUSE_CIVIC_FIT)).toBeCloseTo(
      3.5 / 10,
    );
    expect(brickHouseFitScale({ x: 22, y: 33, z: 18 }, BRICK_HOUSE_CITY_HALL_FIT)).toBeCloseTo(
      4.2 / 33,
    );
  });

  it("caps a tiny bbox so it cannot enlarge the Collada graph (edge)", () => {
    expect(
      brickHouseFitScale({ x: 0.5, y: 0.4, z: 0.5 }, BRICK_HOUSE_CIVIC_FIT),
    ).toBe(1);
  });

  it("caps a broken zero-size measurement at 1 (failure)", () => {
    expect(brickHouseFitScale({ x: 0, y: 0, z: 0 }, BRICK_HOUSE_CIVIC_FIT)).toBe(1);
  });

  it("maps planted crops to Japan Village produce (edge)", () => {
    expect(japanVillageCrop("wheat", "sprout")?.file).toBe("Sprout.gltf");
    expect(brickHouseModel(BRICK_HOUSE_LARGE).file).toBe("House-2-2.dae");
    expect(brickHouseModel(BRICK_HOUSE_CITY_HALL).file).toBe("House-2-2.dae");
    expect(BRICK_HOUSE_CIVIC_BLOCKS).toHaveLength(4);
    expect(brickHousePreloadUrls()).toContain(BRICK_HOUSE_COLORSCHEME_URL);
    expect(japanVillageCrop("corn", "ready")?.file).toBe("Corn.gltf");
    expect(japanVillageCrop("potato", "growing")?.file).toBe("Potato.gltf");
    expect(japanVillageCrop("herb", "ready")?.file).toBe("Carrot_Orange.gltf");
    expect(japanVillageCrop("wheat", "ready")).toBeNull();
    expect(japanVillageCrop("cotton", "growing")).toBeNull();
    expect(japanVillageProp("corn").url).toContain("Corn.gltf");
  });

  it("ships DAE + colorscheme and crop glTFs (failure if missing)", () => {
    const scheme = path.join(BRICK_DIR, "houses-colorscheme-6.png");
    expect(fs.existsSync(scheme)).toBe(true);
    expect(fs.statSync(scheme).size).toBeGreaterThan(100);
    for (const kind of [BRICK_HOUSE_LARGE, ...BRICK_HOUSE_CIVIC_BLOCKS]) {
      const file = path.join(BRICK_DIR, brickHouseModel(kind).file);
      expect(fs.existsSync(file), brickHouseModel(kind).file).toBe(true);
      const xml = fs.readFileSync(file, "utf8").slice(0, 80);
      expect(xml).toContain("COLLADA");
    }
    for (const stem of ["Sprout", "Corn", "Potato", "Carrot_Orange"]) {
      expect(fs.existsSync(path.join(JV_DIR, `${stem}.gltf`)), stem).toBe(true);
      expect(fs.existsSync(path.join(JV_DIR, `${stem}.bin`)), stem).toBe(true);
    }
  });
});
