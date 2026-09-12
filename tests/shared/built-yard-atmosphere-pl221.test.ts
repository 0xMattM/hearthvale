import { describe, expect, it } from "vitest";
import {
  EMPTY_LAND_BUILD_BEACON_LABEL,
  emptyLandBuildBeaconMode,
  HOMESTEAD_YARD_VISUAL,
  homesteadYardAtmosphereMode,
  homesteadYardFloorColors,
  homesteadYardPathContrast,
  homesteadYardPlotContrast,
  isPlayerLandStationType,
} from "@game/shared";

/**
 * PL22.1 — Built-yard soft atmosphere SoT.
 * Choice: warmer plot/path + quiet pad after first station (same gate as PL3.1);
 * empty yard keeps quieter plot (PL114.1 warms outer meadow/fence separately).
 */
describe("CityLands PL22.1 built-yard soft atmosphere", () => {
  it("keeps empty yard quiet plot floors and beacon until first station (happy)", () => {
    const buildings = [{ type: "build_board" }, { type: "portal" }];
    expect(homesteadYardAtmosphereMode(buildings)).toBe("empty");
    expect(emptyLandBuildBeaconMode(buildings)).toBe("beacon");
    const floors = homesteadYardFloorColors("empty");
    expect(floors.plotColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.empty.plotColor.toLowerCase(),
    );
    expect(floors.pathColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.empty.pathColor.toLowerCase(),
    );
    expect(floors.meadowColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.empty.meadowColor.toLowerCase(),
    );
    expect(floors.padColor).toBeNull();
    expect(EMPTY_LAND_BUILD_BEACON_LABEL.toLowerCase()).toMatch(/empty land/);
  });

  it("applies lived pad/path tint after first placeable station (edge)", () => {
    const buildings = [
      { type: "build_board" },
      { type: "crop_plot" },
    ];
    expect(isPlayerLandStationType("crop_plot")).toBe(true);
    expect(homesteadYardAtmosphereMode(buildings)).toBe("lived");
    expect(emptyLandBuildBeaconMode(buildings)).toBe("soft");
    const floors = homesteadYardFloorColors("lived");
    expect(floors.plotColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.lived.plotColor.toLowerCase(),
    );
    expect(floors.pathColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.lived.pathColor.toLowerCase(),
    );
    expect(floors.padColor?.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.lived.padColor.toLowerCase(),
    );
    expect(homesteadYardPlotContrast()).toBeGreaterThan(35);
    expect(homesteadYardPathContrast()).toBeGreaterThan(35);
  });

  it("ignores decor/markers alone; no station invent (failure)", () => {
    expect(
      homesteadYardAtmosphereMode([
        { type: "build_board" },
        { type: "decor_pad" },
        { type: "decor_planter" },
      ]),
    ).toBe("empty");
    expect(homesteadYardFloorColors("empty").padColor).toBeNull();
    expect(isPlayerLandStationType("decor_planter")).toBe(false);
    expect(isPlayerLandStationType("swamp_hut")).toBe(false);
    expect(HOMESTEAD_YARD_VISUAL.empty.plotColor).not.toBe(
      HOMESTEAD_YARD_VISUAL.lived.plotColor,
    );
  });
});
