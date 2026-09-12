import { describe, expect, it } from "vitest";
import {
  CITY_ATMOSPHERE_MAIN_HALL,
  CITY_CIVIC_HOUSE_PLACEMENTS,
  cityCivicHouseClearsStations,
  cityCivicHouseFacesInward,
  cityCivicHouseInsideWall,
  cityCivicHouseWalkObstacles,
  cityCivicHouses,
  cityCivicHousesReadAsMarginTown,
  staticMapWalkObstacles,
} from "@game/shared";

/**
 * Margin clay houses — hall-family street inside the wall, not stations.
 */
describe("city civic margin houses", () => {
  it("places several smaller hall-kit houses on the inner wall (happy)", () => {
    const houses = cityCivicHouses();
    expect(houses).toEqual(CITY_CIVIC_HOUSE_PLACEMENTS);
    expect(cityCivicHousesReadAsMarginTown()).toBe(true);
    expect(houses.length).toBeGreaterThanOrEqual(6);
    expect(new Set(houses.map((h) => h.tint)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(houses.map((h) => h.look)).size).toBeGreaterThanOrEqual(3);
    expect(houses.every((h) => h.w < CITY_ATMOSPHERE_MAIN_HALL.w)).toBe(true);
    expect(houses.every((h) => h.h < CITY_ATMOSPHERE_MAIN_HALL.h)).toBe(true);
    expect(Math.min(...houses.map((h) => h.w))).toBeGreaterThan(3.2);
    expect(Math.min(...houses.map((h) => h.h))).toBeGreaterThan(2.5);
    expect(houses.every((h) => cityCivicHouseFacesInward(h))).toBe(true);
    expect(
      houses.filter((h) => h.id.startsWith("w-")).every((h) => Math.sin(h.rotY) > 0.8),
    ).toBe(true);
    expect(
      houses.filter((h) => h.id.startsWith("e-")).every((h) => Math.sin(h.rotY) < -0.8),
    ).toBe(true);
  });

  it("keeps footprints inside the wall and off stations (edge)", () => {
    const houses = cityCivicHouses();
    expect(houses.every((h) => cityCivicHouseInsideWall(h))).toBe(true);
    expect(houses.every((h) => cityCivicHouseClearsStations(h))).toBe(true);
    const solids = cityCivicHouseWalkObstacles();
    expect(solids).toHaveLength(houses.length);
    const city = staticMapWalkObstacles("city");
    expect(
      solids.every((o) =>
        city.some((c) => c.worldX === o.worldX && c.worldZ === o.worldZ),
      ),
    ).toBe(true);
  });

  it("rejects a hall-sized clone, a plaza stack, or an empty street (failure)", () => {
    const sample = CITY_CIVIC_HOUSE_PLACEMENTS[0]!;
    expect(
      cityCivicHousesReadAsMarginTown([
        { ...sample, w: 6.2, h: 3.9, id: "hall-clone" },
      ]),
    ).toBe(false);
    expect(
      cityCivicHouseClearsStations({ ...sample, x: 0, z: 0, id: "fountain" }),
    ).toBe(false);
    expect(cityCivicHousesReadAsMarginTown([])).toBe(false);
    expect(
      cityCivicHouseFacesInward({
        ...sample,
        rotY: sample.rotY + Math.PI,
        id: "faces-wall",
      }),
    ).toBe(false);
    expect(
      cityCivicHousesReadAsMarginTown(
        CITY_CIVIC_HOUSE_PLACEMENTS.map((h) => ({ ...h, look: "cottage" })),
      ),
    ).toBe(false);
    expect(
      cityCivicHouseInsideWall({
        ...sample,
        x: -40,
        z: 0,
        id: "outside-wall",
      }),
    ).toBe(false);
  });
});
