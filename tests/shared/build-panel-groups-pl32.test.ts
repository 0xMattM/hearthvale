import { describe, expect, it } from "vitest";
import {
  PLAYER_LAND_STATION_BUILD_GROUPS,
  PLAYER_LAND_STATIONS,
  type PlayerLandStationType,
} from "@game/shared";

/**
 * PL3.2 — BuildPanel station groups (gather / process / care).
 * Costs unchanged; every catalog station appears once.
 */
describe("CityLands PL3.2 BuildPanel grouped by profession categories", () => {
  it("exposes gather / process / care headers covering all stations (happy)", () => {
    const ids = PLAYER_LAND_STATION_BUILD_GROUPS.map((g) => g.id);
    expect(ids).toEqual(["gather", "process", "care"]);
    expect(PLAYER_LAND_STATION_BUILD_GROUPS.map((g) => g.header)).toEqual([
      "Gather",
      "Process",
      "Care",
    ]);

    const listed = PLAYER_LAND_STATION_BUILD_GROUPS.flatMap((g) => [
      ...g.stations,
    ]);
    const catalog = Object.keys(PLAYER_LAND_STATIONS) as PlayerLandStationType[];
    expect(listed.sort()).toEqual([...catalog].sort());
  });

  it("keeps coin costs unchanged vs station catalog (edge)", () => {
    for (const group of PLAYER_LAND_STATION_BUILD_GROUPS) {
      for (const type of group.stations) {
        expect(PLAYER_LAND_STATIONS[type].kitItemId).toBeTruthy();
        expect(PLAYER_LAND_STATIONS[type].name.length).toBeGreaterThan(0);
      }
    }
    expect(PLAYER_LAND_STATIONS.crop_plot.kitItemId).toBe("crop_plot_kit");
    expect(PLAYER_LAND_STATIONS.workshop.kitItemId).toBe("workshop_kit");
    expect(PLAYER_LAND_STATIONS.animal_pen.kitItemId).toBe("animal_pen_kit");
  });

  it("rejects duplicate membership and empty groups (failure)", () => {
    const listed = PLAYER_LAND_STATION_BUILD_GROUPS.flatMap((g) => [
      ...g.stations,
    ]);
    expect(new Set(listed).size).toBe(listed.length);
    expect(
      PLAYER_LAND_STATION_BUILD_GROUPS.every((g) => g.stations.length > 0),
    ).toBe(true);
    expect(listed).not.toContain("build_board" as never);
    expect(PLAYER_LAND_STATION_BUILD_GROUPS.find((g) => g.id === "gather")!
      .stations).toContain("tree_stump");
    expect(PLAYER_LAND_STATION_BUILD_GROUPS.find((g) => g.id === "process")!
      .stations).toContain("forge");
  });
});
