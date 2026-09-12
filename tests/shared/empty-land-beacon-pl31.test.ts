import { describe, expect, it } from "vitest";
import {
  EMPTY_LAND_BUILD_BEACON_LABEL,
  EMPTY_LAND_BUILD_SOFT_LABEL,
  emptyLandBuildBeaconMode,
  emptyLandBuildBeaconWorldLabel,
  emptyLandBuildBoardTip,
  isPlayerLandStationType,
  PLAYER_LAND_STATIONS,
} from "@game/shared";

/**
 * PL3.1 — Empty-land build board beacon SoT.
 * Choice: soften (soft "Build" label) after first station rather than hide entirely.
 */
describe("CityLands PL3.1 empty-land build board beacon", () => {
  it("shows full beacon label on fresh empty land (happy)", () => {
    const mode = emptyLandBuildBeaconMode([
      { type: "build_board" },
      { type: "portal" },
    ]);
    expect(mode).toBe("beacon");
    expect(emptyLandBuildBeaconWorldLabel(mode)).toBe(
      EMPTY_LAND_BUILD_BEACON_LABEL,
    );
    expect(EMPTY_LAND_BUILD_BEACON_LABEL.toLowerCase()).toMatch(/build here/);
    expect(EMPTY_LAND_BUILD_BEACON_LABEL.toLowerCase()).toMatch(/empty land/);
  });

  it("softens after first placeable station; tip stays dismissible copy (edge)", () => {
    const mode = emptyLandBuildBeaconMode([
      { type: "build_board" },
      { type: "crop_plot" },
    ]);
    expect(mode).toBe("soft");
    expect(emptyLandBuildBeaconWorldLabel(mode)).toBe(
      EMPTY_LAND_BUILD_SOFT_LABEL,
    );
    expect(EMPTY_LAND_BUILD_SOFT_LABEL).toBe("Build");
    expect(emptyLandBuildBoardTip().toLowerCase()).toMatch(/intentional|empty/);
    expect(emptyLandBuildBoardTip().toLowerCase()).not.toContain("always-on");
  });

  it("ignores non-station markers and rejects unknown as stations (failure)", () => {
    expect(
      emptyLandBuildBeaconMode([
        { type: "build_board" },
        { type: "decor_pad" },
        { type: "notice_board" },
      ]),
    ).toBe("beacon");
    expect(isPlayerLandStationType("build_board")).toBe(false);
    expect(isPlayerLandStationType("swamp_hut")).toBe(false);
    expect(Object.keys(PLAYER_LAND_STATIONS).length).toBeGreaterThanOrEqual(8);
    expect(
      emptyLandBuildBeaconMode([{ type: "workshop" as const }]),
    ).toBe("soft");
  });
});
