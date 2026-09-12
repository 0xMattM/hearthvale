import { describe, expect, it } from "vitest";
import {
  EMPTY_LAND_BUILD_BEACON_LABEL,
  emptyHomesteadFenceVsMeadowContrast,
  emptyHomesteadVsExploreMeadowContrast,
  emptyLandBuildBeaconMode,
  emptyVsLivedHomesteadMeadowContrast,
  EXPLORE_WILDS_VISUAL,
  exploreVsHomesteadCanopyContrast,
  HOMESTEAD_YARD_VISUAL,
  homesteadYardAtmosphereMode,
  homesteadYardFloorColors,
} from "@game/shared";

/**
 * PL114.1 — Empty-homestead meadow contrast SoT.
 * Choice: warmer empty outer meadow + readable fence vs Explore cool canopy;
 * plot/beacon gate unchanged (no station invent).
 */
describe("CityLands PL114.1 empty-homestead meadow contrast", () => {
  it("warms empty outer meadow + fence apart from Explore canopy (happy)", () => {
    const buildings = [{ type: "build_board" }, { type: "portal" }];
    expect(homesteadYardAtmosphereMode(buildings)).toBe("empty");
    expect(emptyLandBuildBeaconMode(buildings)).toBe("beacon");

    const floors = homesteadYardFloorColors("empty", "home");
    expect(floors.meadowColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.empty.meadowColor.toLowerCase(),
    );
    expect(floors.fencePostColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.empty.fencePostColor.toLowerCase(),
    );
    expect(floors.fenceRailColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.empty.fenceRailColor.toLowerCase(),
    );
    expect(floors.meadowColor.toLowerCase()).not.toBe(
      EXPLORE_WILDS_VISUAL.canopyColor.toLowerCase(),
    );
    expect(floors.padColor).toBeNull();
    expect(emptyHomesteadVsExploreMeadowContrast()).toBeGreaterThan(80);
    expect(emptyHomesteadFenceVsMeadowContrast()).toBeGreaterThan(45);
    expect(EMPTY_LAND_BUILD_BEACON_LABEL.toLowerCase()).toMatch(/empty land/);
  });

  it("keeps lived meadow quieter and empty warmer; visit stays cool (edge)", () => {
    const empty = homesteadYardFloorColors("empty", "home");
    const lived = homesteadYardFloorColors("lived", "home");
    const visit = homesteadYardFloorColors("empty", "visit");

    expect(empty.meadowColor.toLowerCase()).not.toBe(
      lived.meadowColor.toLowerCase(),
    );
    expect(emptyVsLivedHomesteadMeadowContrast()).toBeGreaterThan(30);
    expect(lived.meadowColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.meadowColor.toLowerCase(),
    );
    expect(lived.fencePostColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.lived.fencePostColor.toLowerCase(),
    );
    expect(visit.meadowColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.visit.meadowColor.toLowerCase(),
    );
    expect(visit.fencePostColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.visit.fencePostColor.toLowerCase(),
    );
    expect(exploreVsHomesteadCanopyContrast()).toBeGreaterThan(40);
  });

  it("does not invent stations; beacon gate unchanged (failure)", () => {
    expect(
      homesteadYardAtmosphereMode([
        { type: "build_board" },
        { type: "decor_pad" },
      ]),
    ).toBe("empty");
    expect(homesteadYardFloorColors("empty").padColor).toBeNull();
    expect(HOMESTEAD_YARD_VISUAL.empty.meadowColor).not.toBe(
      EXPLORE_WILDS_VISUAL.canopyColor,
    );
    expect(HOMESTEAD_YARD_VISUAL.empty.fencePostColor).not.toBe(
      HOMESTEAD_YARD_VISUAL.lived.fencePostColor,
    );
    // Atmosphere-only — no spawn / station invent fields on empty visual.
    expect(
      Object.keys(HOMESTEAD_YARD_VISUAL.empty).every(
        (k) =>
          k === "meadowColor" ||
          k === "plotColor" ||
          k === "pathColor" ||
          k === "fencePostColor" ||
          k === "fenceRailColor",
      ),
    ).toBe(true);
  });
});
