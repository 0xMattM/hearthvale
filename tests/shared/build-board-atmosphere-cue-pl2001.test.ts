import { describe, expect, it } from "vitest";
import {
  BUILD_BOARD_ATMOSPHERE_CUE,
  BUILD_PLACE_SPAWN_FLASH,
  EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE,
  PLAYER_LAND_BUILDINGS,
  PLAYER_LAND_STATIONS,
  WORKSHOP_ATMOSPHERE_CUE,
  buildBoardAtmosphereCue,
  buildBoardAtmosphereEmissiveIntensity,
  buildBoardAtmosphereHazeOpacity,
  buildBoardAtmospherePulseEnvelope,
  buildBoardAtmosphereVsLandmarkContrast,
  buildBoardAtmosphereVsSpawnFlashContrast,
  buildBoardAtmosphereVsWorkshopAtmosphereContrast,
  emptyLandBuildBeaconMode,
  emptyLandBuildBoardLandmarkCue,
} from "@game/shared";

/**
 * PL200.1 — Build-board soft atmosphere leftover.
 * Choice: quiet warm pulsing timber mist over existing build board while yard
 * can place (complements beacon landmark PL160.1 + place flash PL134.1; costs SoT).
 * Landmark stays identity rim on empty — distinct wider/slower/quieter leftover;
 * soft-mode board keeps mist after first station (landmark alone is quiet).
 */
describe("CityLands PL200.1 build-board soft atmosphere leftover", () => {
  it("pulses quiet warm timber mist on player land (happy)", () => {
    const cue = buildBoardAtmosphereCue("player_land");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      BUILD_BOARD_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(BUILD_BOARD_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(BUILD_BOARD_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(BUILD_BOARD_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(BUILD_BOARD_ATMOSPHERE_CUE.hazeY);

    const peak = buildBoardAtmosphereEmissiveIntensity(1);
    const floor = buildBoardAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(BUILD_BOARD_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(BUILD_BOARD_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = buildBoardAtmosphereHazeOpacity(1);
    const hazeFloor = buildBoardAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);

    // Soft-mode yards can still place — leftover mist stays on (landmark quiet).
    expect(emptyLandBuildBeaconMode(PLAYER_LAND_BUILDINGS)).toBe("beacon");
    expect(emptyLandBuildBoardLandmarkCue("soft").show).toBe(false);
    expect(buildBoardAtmosphereCue("player_land").show).toBe(true);
  });

  it("stays quiet off player land; mist ≠ landmark / spawn / workshop (edge)", () => {
    expect(buildBoardAtmosphereCue("city").show).toBe(false);
    expect(buildBoardAtmosphereCue("explore").show).toBe(false);
    expect(buildBoardAtmosphereCue("warrior").show).toBe(false);
    expect(buildBoardAtmosphereCue(null).show).toBe(false);
    expect(buildBoardAtmosphereCue("").show).toBe(false);
    expect(buildBoardAtmosphereCue("city").intensity).toBe(0);
    expect(buildBoardAtmosphereCue("city").hazeOpacity).toBe(0);

    expect(buildBoardAtmosphereVsLandmarkContrast()).toBeGreaterThan(0);
    expect(buildBoardAtmosphereVsSpawnFlashContrast()).toBeGreaterThan(0);
    expect(buildBoardAtmosphereVsWorkshopAtmosphereContrast()).toBeGreaterThan(
      0,
    );
    expect(BUILD_BOARD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(BUILD_BOARD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      BUILD_PLACE_SPAWN_FLASH.emissiveColor.toLowerCase(),
    );
    expect(BUILD_BOARD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      WORKSHOP_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(BUILD_BOARD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      "#d4b060",
    );

    // Wider / slower / quieter leftover mist vs empty-land landmark disc.
    expect(BUILD_BOARD_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.hazeRadius,
    );
    expect(BUILD_BOARD_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(BUILD_BOARD_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.intensityPeak,
    );
    expect(BUILD_BOARD_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      BUILD_PLACE_SPAWN_FLASH.intensityPeak,
    );

    const low = buildBoardAtmospherePulseEnvelope(0);
    const mid = buildBoardAtmospherePulseEnvelope(
      BUILD_BOARD_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent stations or change build costs (failure)", () => {
    expect(PLAYER_LAND_BUILDINGS.some((b) => b.type === "build_board")).toBe(
      false,
    );
    expect(PLAYER_LAND_STATIONS.crop_plot.kitItemId).toBe("crop_plot_kit");
    expect(PLAYER_LAND_STATIONS.crop_plot.materials).toEqual([
      { itemId: "wood", qty: 2 },
    ]);
    expect(PLAYER_LAND_STATIONS.workshop.kitItemId).toBe("workshop_kit");

    expect(buildBoardAtmosphereEmissiveIntensity(2)).toBe(
      BUILD_BOARD_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(buildBoardAtmosphereEmissiveIntensity(-1)).toBe(
      BUILD_BOARD_ATMOSPHERE_CUE.intensityBase,
    );
    expect(buildBoardAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(BUILD_BOARD_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(BUILD_BOARD_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(BUILD_BOARD_ATMOSPHERE_CUE.hazeRadius).toBeLessThanOrEqual(2.5);
    expect(String(BUILD_BOARD_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|recipe|yield/i,
    );
  });
});
