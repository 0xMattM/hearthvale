import { describe, expect, it } from "vitest";
import {
  CITY_BUILDINGS,
  CITY_PERIMETER,
  CITY_PERIMETER_OUTSIDE,
  CITY_RIVER,
  WORLD,
  cityPerimeterInnerStoneFloor,
  cityPerimeterLayout,
  cityPerimeterOutsideBushes,
  cityPerimeterOutsideDirtPatches,
  cityPerimeterOutsideGround,
  cityPerimeterOutsideTrees,
  cityPerimeterPosts,
  cityPerimeterWalkInner,
  cityPerimeterWallRuns,
  clampWalkInsideCityPerimeter,
  clampWalkOutOfCityRiver,
  isBeyondCityWallOuter,
  isCityRiverWaterWorldZ,
  isOutsideCityPerimeter,
} from "@game/shared";

/**
 * City stone walls on west / east / camera-far; river still owns +Z.
 */
describe("city perimeter wall", () => {
  it("encloses the hub on three sides and meets the river (happy)", () => {
    const runs = cityPerimeterWallRuns();
    expect(runs).toHaveLength(3);
    expect(runs.map((r) => r.id).sort()).toEqual(["east", "south", "west"]);
    expect(cityPerimeterLayout().wallMaxZ).toBe(CITY_RIVER.walkMaxZ);
    expect(cityPerimeterPosts().length).toBeGreaterThan(8);

    const inner = cityPerimeterWalkInner();
    expect(
      clampWalkInsideCityPerimeter(0, 0, "city"),
    ).toEqual({ x: 0, z: 0 });
    expect(clampWalkInsideCityPerimeter(80, 0, "city").x).toBe(inner.maxX);
    expect(clampWalkInsideCityPerimeter(0, -80, "city").z).toBe(inner.minZ);
    expect(clampWalkInsideCityPerimeter(0, 80, "city").z).toBe(
      CITY_RIVER.walkMaxZ,
    );
  });

  it("keeps tutors and stations inside the wall (edge)", () => {
    const inner = cityPerimeterWalkInner();
    const g = WORLD.GRID;
    for (const b of CITY_BUILDINGS) {
      const x = b.x * g;
      const z = b.z * g;
      expect(x).toBeGreaterThan(inner.minX);
      expect(x).toBeLessThan(inner.maxX);
      expect(z).toBeGreaterThan(inner.minZ);
      expect(z).toBeLessThanOrEqual(inner.maxZ);
    }
    expect(CITY_PERIMETER.wallMinX).toBeLessThan(-26);
    expect(CITY_PERIMETER.wallMaxX).toBeGreaterThan(26);
    expect(
      clampWalkInsideCityPerimeter(-40, 10, "city").x,
    ).toBe(inner.minX);
  });

  it("does not wall off other maps or invent a fourth wall on the river (failure)", () => {
    expect(clampWalkInsideCityPerimeter(80, 80, "player_land")).toEqual({
      x: 80,
      z: 80,
    });
    expect(clampWalkInsideCityPerimeter(1, 40, "not_a_map")).toEqual({
      x: 1,
      z: 40,
    });
    expect(cityPerimeterWallRuns().some((r) => r.id === "north")).toBe(false);
    expect(isOutsideCityPerimeter(Number.NaN, 0)).toBe(true);
    expect(isOutsideCityPerimeter(0, 0)).toBe(false);
    expect(clampWalkOutOfCityRiver(0, 40, "city").z).toBe(CITY_RIVER.walkMaxZ);
  });
});

/**
 * Countryside beyond the walls — grass/dirt + trees/bushes, not civic stone.
 */
describe("city perimeter outside woods", () => {
  it("keeps stone inside the wall and plants woods on grass (happy)", () => {
    const stone = cityPerimeterInnerStoneFloor();
    const ground = cityPerimeterOutsideGround();
    const trees = cityPerimeterOutsideTrees();
    const bushes = cityPerimeterOutsideBushes();
    const spanX = CITY_PERIMETER.wallMaxX - CITY_PERIMETER.wallMinX;
    const spanZ = CITY_PERIMETER.wallMaxZ - CITY_PERIMETER.wallMinZ;

    expect(stone.width).toBeLessThan(spanX);
    expect(stone.depth).toBeLessThan(spanZ);
    expect(stone.width / 2).toBeLessThanOrEqual(CITY_PERIMETER.wallMaxX);
    expect(ground.width).toBeGreaterThan(stone.width);
    expect(ground.depth).toBeGreaterThan(stone.depth);
    expect(ground.y).toBeLessThan(stone.y);
    expect(ground.grassColor).toBe(CITY_PERIMETER_OUTSIDE.grassColor);
    expect(trees.length).toBeGreaterThanOrEqual(24);
    expect(bushes.length).toBeGreaterThanOrEqual(30);
    expect(trees.every((t) => t.scale >= 1.5)).toBe(true);
    for (const d of [...trees, ...bushes]) {
      expect(isBeyondCityWallOuter(d.x, d.z)).toBe(true);
      expect(isCityRiverWaterWorldZ(d.z)).toBe(false);
    }
  });

  it("puts dirt patches on the outer verge, not in the plaza (edge)", () => {
    const patches = cityPerimeterOutsideDirtPatches();
    expect(patches.length).toBeGreaterThan(6);
    for (const pad of patches) {
      expect(isBeyondCityWallOuter(pad.x, pad.z)).toBe(true);
      expect(isCityRiverWaterWorldZ(pad.z)).toBe(false);
      expect(pad.radius).toBeGreaterThan(1);
    }
    expect(isBeyondCityWallOuter(0, 0)).toBe(false);
    expect(isBeyondCityWallOuter(CITY_PERIMETER.wallMinX + 2, 0)).toBe(false);
  });

  it("does not treat the river or invalid points as wall-woods (failure)", () => {
    expect(isBeyondCityWallOuter(Number.NaN, 0)).toBe(false);
    expect(isBeyondCityWallOuter(0, Number.POSITIVE_INFINITY)).toBe(false);
    expect(isBeyondCityWallOuter(0, CITY_RIVER.centerZ)).toBe(false);
    expect(
      cityPerimeterOutsideTrees().some((t) => t.z > CITY_RIVER.walkMaxZ),
    ).toBe(false);
    expect(cityPerimeterInnerStoneFloor().width).toBeGreaterThan(0);
    expect(cityPerimeterOutsideGround().dirtPatches).toEqual(
      cityPerimeterOutsideDirtPatches(),
    );
  });
});
