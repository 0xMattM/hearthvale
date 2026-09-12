import { describe, expect, it } from "vitest";
import {
  CITY_FISHING_DOCK_LANDMARK_CUE,
  CITY_LOOM_LANDMARK_CUE,
  CITY_SCARCE_STATION_FREE_CUE,
  CITY_SCARCE_STATION_TYPES,
  PROCESS_STATION_WORKING_EMISSIVE,
  cityLoomLandmarkCue,
  cityLoomLandmarkEmissiveIntensity,
  cityLoomLandmarkHazeOpacity,
  cityLoomLandmarkPulseEnvelope,
  cityLoomLandmarkVsFishingDockContrast,
  cityLoomLandmarkVsFreeStickyContrast,
  cityLoomLandmarkVsWorkingContrast,
  CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED,
} from "@game/shared";

/**
 * PL169.2 — City loom soft landmark cue leftover.
 * Choice: quiet warm thread haze/emissive on existing city scarce loom while on
 * City (complements weave craft cues + Free/Busy pads; recipes unchanged).
 * Continuous landmark on City only; working glow / pads stay their own cues.
 */
describe("CityLands PL169.2 city loom soft landmark cue leftover", () => {
  it("pulses quiet warm thread haze on City scarce loom (happy)", () => {
    const cue = cityLoomLandmarkCue("city");
    expect(cue.show).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_LOOM_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_LOOM_LANDMARK_CUE.intensityBase : 0);
    expect(cue.hazeOpacity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_LOOM_LANDMARK_CUE.hazeOpacityBase : 0);
    expect(cue.hazeRadius).toBe(CITY_LOOM_LANDMARK_CUE.hazeRadius);
    expect(CITY_SCARCE_STATION_TYPES).toContain("loom");

    const peak = cityLoomLandmarkEmissiveIntensity(1);
    const floor = cityLoomLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_LOOM_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_LOOM_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityLoomLandmarkHazeOpacity(1);
    const hazeFloor = cityLoomLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; warm thread ≠ working / Free / dock (edge)", () => {
    expect(cityLoomLandmarkCue("player_land").show).toBe(false);
    expect(cityLoomLandmarkCue("explore").show).toBe(false);
    expect(cityLoomLandmarkCue("warrior").show).toBe(false);
    expect(cityLoomLandmarkCue(null).show).toBe(false);
    expect(cityLoomLandmarkCue("").show).toBe(false);
    expect(cityLoomLandmarkCue("player_land").intensity).toBe(0);
    expect(cityLoomLandmarkCue("player_land").hazeOpacity).toBe(0);

    expect(cityLoomLandmarkVsWorkingContrast()).toBeGreaterThan(0);
    expect(cityLoomLandmarkVsFreeStickyContrast()).toBeGreaterThan(0);
    expect(cityLoomLandmarkVsFishingDockContrast()).toBeGreaterThan(0);
    expect(CITY_LOOM_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive.toLowerCase(),
    );
    expect(CITY_LOOM_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_SCARCE_STATION_FREE_CUE.haloColor.toLowerCase(),
    );
    expect(CITY_LOOM_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_FISHING_DOCK_LANDMARK_CUE.emissive.toLowerCase(),
    );

    // Continuous landmark stays quieter / slower than working glow.
    expect(CITY_LOOM_LANDMARK_CUE.intensityPeak).toBeLessThan(
      PROCESS_STATION_WORKING_EMISSIVE.intensityMax,
    );
    expect(CITY_LOOM_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(
      PROCESS_STATION_WORKING_EMISSIVE.periodMs,
    );

    const low = cityLoomLandmarkPulseEnvelope(0);
    const mid = cityLoomLandmarkPulseEnvelope(
      CITY_LOOM_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent recipes or NFT combat (failure)", () => {
    expect(cityLoomLandmarkEmissiveIntensity(2)).toBe(
      CITY_LOOM_LANDMARK_CUE.intensityPeak,
    );
    expect(cityLoomLandmarkEmissiveIntensity(-1)).toBe(
      CITY_LOOM_LANDMARK_CUE.intensityBase,
    );
    expect(cityLoomLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_LOOM_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(CITY_LOOM_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|recipe/i,
    );
    expect(CITY_LOOM_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
