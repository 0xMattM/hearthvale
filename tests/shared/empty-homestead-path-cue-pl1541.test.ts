import { describe, expect, it } from "vitest";
import {
  EMPTY_HOMESTEAD_PATH_CUE,
  EMPTY_LAND_BUILD_BEACON_LABEL,
  emptyHomesteadPathCue,
  emptyHomesteadPathEmissiveIntensity,
  emptyHomesteadPathPulseEnvelope,
  emptyHomesteadPathVsEmptyMeadowContrast,
  emptyHomesteadPathVsLivedPathContrast,
  emptyLandBuildBeaconMode,
  HOMESTEAD_YARD_VISUAL,
  homesteadYardAtmosphereMode,
  LIVED_HOMESTEAD_PATH_CUE,
  livedHomesteadPathCue,
} from "@game/shared";

/**
 * PL154.1 — Empty-homestead path soft cue leftover.
 * Choice: quiet cooler emissive on the existing yard path/cross when empty
 * (same station gate as PL3.1 / PL22.1) so empty yards read apart from lived
 * warm path PL142.1; complements empty meadow PL114.1; layouts / slots unchanged.
 */
describe("CityLands PL154.1 empty-homestead path soft cue", () => {
  it("pulses cooler path emissive on empty yards (happy)", () => {
    const buildings = [{ type: "build_board" }, { type: "portal" }];
    expect(homesteadYardAtmosphereMode(buildings)).toBe("empty");
    expect(emptyLandBuildBeaconMode(buildings)).toBe("beacon");

    const cue = emptyHomesteadPathCue("empty");
    expect(cue.show).toBe(true);
    expect(cue.intensity).toBeGreaterThan(0);
    expect(cue.emissive.toLowerCase()).toBe(
      EMPTY_HOMESTEAD_PATH_CUE.emissive.toLowerCase(),
    );
    expect(cue.emissive.toLowerCase()).not.toBe("#000000");

    const peak = emptyHomesteadPathEmissiveIntensity(true, 1);
    const floor = emptyHomesteadPathEmissiveIntensity(true, 0);
    expect(peak).toBe(EMPTY_HOMESTEAD_PATH_CUE.intensityPeak);
    expect(floor).toBe(EMPTY_HOMESTEAD_PATH_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);
    expect(peak).toBeLessThan(LIVED_HOMESTEAD_PATH_CUE.intensityPeak);
  });

  it("stays quiet once lived; cooler ≠ lived warm / meadow (edge)", () => {
    const livedBuildings = [
      { type: "build_board" },
      { type: "crop_plot" },
    ];
    expect(homesteadYardAtmosphereMode(livedBuildings)).toBe("lived");
    expect(emptyHomesteadPathCue("lived").show).toBe(false);
    expect(emptyHomesteadPathEmissiveIntensity(false, 1)).toBe(0);
    expect(livedHomesteadPathCue("lived").show).toBe(true);

    expect(emptyHomesteadPathVsLivedPathContrast()).toBeGreaterThan(40);
    expect(emptyHomesteadPathVsEmptyMeadowContrast()).toBeGreaterThan(30);
    expect(EMPTY_HOMESTEAD_PATH_CUE.emissive.toLowerCase()).not.toBe(
      LIVED_HOMESTEAD_PATH_CUE.emissive.toLowerCase(),
    );
    expect(EMPTY_HOMESTEAD_PATH_CUE.emissive.toLowerCase()).not.toBe(
      HOMESTEAD_YARD_VISUAL.empty.meadowColor.toLowerCase(),
    );

    expect(EMPTY_HOMESTEAD_PATH_CUE.pulsePeriodMs).toBeGreaterThan(0);
    const low = emptyHomesteadPathPulseEnvelope(0);
    const mid = emptyHomesteadPathPulseEnvelope(
      EMPTY_HOMESTEAD_PATH_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(low).toBeLessThanOrEqual(1);
    expect(mid).toBeGreaterThan(low);
    expect(EMPTY_LAND_BUILD_BEACON_LABEL.toLowerCase()).toMatch(/empty land/);
  });

  it("does not invent slots; clamps / layout stay intact (failure)", () => {
    expect(
      homesteadYardAtmosphereMode([
        { type: "build_board" },
        { type: "decor_pad" },
      ]),
    ).toBe("empty");
    expect(emptyHomesteadPathCue("empty").show).toBe(true);
    expect(emptyHomesteadPathCue("lived").intensity).toBe(0);
    expect(emptyHomesteadPathEmissiveIntensity(true, 2)).toBe(
      EMPTY_HOMESTEAD_PATH_CUE.intensityPeak,
    );
    expect(emptyHomesteadPathEmissiveIntensity(true, -1)).toBe(
      EMPTY_HOMESTEAD_PATH_CUE.intensityBase,
    );
    expect(emptyHomesteadPathPulseEnvelope(Number.NaN)).toBe(0);
    expect(HOMESTEAD_YARD_VISUAL.empty.pathColor.length).toBeGreaterThan(0);
    expect(String(EMPTY_HOMESTEAD_PATH_CUE.emissive)).not.toMatch(
      /nft|combat/i,
    );
  });
});
