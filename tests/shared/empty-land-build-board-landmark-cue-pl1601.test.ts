import { describe, expect, it } from "vitest";
import {
  BUILD_PLACE_SPAWN_FLASH,
  EMPTY_LAND_BUILD_BEACON_LABEL,
  EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE,
  EMPTY_LAND_BUILD_SOFT_LABEL,
  PLAYER_LAND_BUILDINGS,
  emptyLandBuildBeaconMode,
  emptyLandBuildBoardLandmarkCue,
  emptyLandBuildBoardLandmarkEmissiveIntensity,
  emptyLandBuildBoardLandmarkHazeOpacity,
  emptyLandBuildBoardLandmarkPulseEnvelope,
  emptyLandBuildBoardLandmarkVsBeaconPadContrast,
  emptyLandBuildBoardLandmarkVsChimneyContrast,
  emptyLandBuildBoardLandmarkVsSpawnFlashContrast,
} from "@game/shared";

/**
 * PL160.1 — Empty-land build-board soft landmark cue leftover.
 * Choice: quiet warm timber haze/emissive on existing build_board while
 * empty-land beacon shows (complements beacon PL3.1 + tip PL52.1);
 * layouts / slots unchanged; soft-mode quiet.
 */
describe("CityLands PL160.1 empty-land build-board soft landmark cue leftover", () => {
  it("pulses warm timber haze while empty-land beacon shows (happy)", () => {
    const cue = emptyLandBuildBoardLandmarkCue("beacon");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(
      EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.intensityBase,
    );
    expect(cue.hazeOpacity).toBe(
      EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.hazeOpacityBase,
    );
    expect(cue.hazeRadius).toBe(
      EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.hazeRadius,
    );

    const peak = emptyLandBuildBoardLandmarkEmissiveIntensity(1);
    const floor = emptyLandBuildBoardLandmarkEmissiveIntensity(0);
    expect(peak).toBe(EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = emptyLandBuildBoardLandmarkHazeOpacity(1);
    const hazeFloor = emptyLandBuildBoardLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);

    expect(emptyLandBuildBeaconMode(PLAYER_LAND_BUILDINGS)).toBe("beacon");
    expect(EMPTY_LAND_BUILD_BEACON_LABEL).toMatch(/empty land/i);
  });

  it("stays quiet after first station; timber ≠ beacon gold / spawn / chimney (edge)", () => {
    expect(emptyLandBuildBoardLandmarkCue("soft").show).toBe(false);
    expect(emptyLandBuildBoardLandmarkCue("soft").intensity).toBe(0);
    expect(emptyLandBuildBoardLandmarkCue("soft").hazeOpacity).toBe(0);

    const lived = emptyLandBuildBeaconMode([
      ...PLAYER_LAND_BUILDINGS,
      { type: "crop_plot" },
    ]);
    expect(lived).toBe("soft");
    expect(emptyLandBuildBoardLandmarkCue(lived).show).toBe(false);
    expect(EMPTY_LAND_BUILD_SOFT_LABEL).toBe("Build");

    expect(emptyLandBuildBoardLandmarkVsBeaconPadContrast()).toBeGreaterThan(0);
    expect(emptyLandBuildBoardLandmarkVsSpawnFlashContrast()).toBeGreaterThan(
      0,
    );
    expect(emptyLandBuildBoardLandmarkVsChimneyContrast()).toBeGreaterThan(0);
    expect(EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      "#d4b060",
    );
    expect(EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      BUILD_PLACE_SPAWN_FLASH.emissiveColor.toLowerCase(),
    );

    const low = emptyLandBuildBoardLandmarkPulseEnvelope(0);
    const mid = emptyLandBuildBoardLandmarkPulseEnvelope(
      EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent boards or change place slots (failure)", () => {
    expect(PLAYER_LAND_BUILDINGS.some((b) => b.type === "build_board")).toBe(
      false,
    );
    expect(
      PLAYER_LAND_BUILDINGS.filter((b) => b.type === "build_board"),
    ).toHaveLength(0);

    expect(emptyLandBuildBoardLandmarkEmissiveIntensity(2)).toBe(
      EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.intensityPeak,
    );
    expect(emptyLandBuildBoardLandmarkEmissiveIntensity(-1)).toBe(
      EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.intensityBase,
    );
    expect(emptyLandBuildBoardLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(
      EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.hazeOpacityPeak,
    ).toBeLessThanOrEqual(1);
    expect(String(EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|fare/i,
    );
  });
});
