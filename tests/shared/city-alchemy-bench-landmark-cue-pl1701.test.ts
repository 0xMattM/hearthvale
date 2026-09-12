import { describe, expect, it } from "vitest";
import {
  CITY_ALCHEMY_BENCH_LANDMARK_CUE,
  CITY_FISHING_DOCK_LANDMARK_CUE,
  CITY_SCARCE_STATION_FREE_CUE,
  CITY_SCARCE_STATION_TYPES,
  PROCESS_STATION_WORKING_EMISSIVE,
  cityAlchemyBenchLandmarkCue,
  cityAlchemyBenchLandmarkEmissiveIntensity,
  cityAlchemyBenchLandmarkHazeOpacity,
  cityAlchemyBenchLandmarkPulseEnvelope,
  cityAlchemyBenchLandmarkVsFishingDockContrast,
  cityAlchemyBenchLandmarkVsFreeStickyContrast,
  cityAlchemyBenchLandmarkVsWorkingContrast,
  CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED,
} from "@game/shared";

/**
 * PL170.1 — City alchemy-bench soft landmark cue leftover.
 * Choice: quiet cool tonic haze/emissive on existing city scarce alchemy_bench
 * while on City (complements brew cues + Free/Busy pads; recipes unchanged).
 * Continuous landmark on City only; working glow / pads stay their own cues.
 */
describe("CityLands PL170.1 city alchemy-bench soft landmark cue leftover", () => {
  it("pulses quiet cool tonic haze on City scarce alchemy bench (happy)", () => {
    const cue = cityAlchemyBenchLandmarkCue("city");
    expect(cue.show).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_ALCHEMY_BENCH_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_ALCHEMY_BENCH_LANDMARK_CUE.intensityBase : 0);
    expect(cue.hazeOpacity).toBe(
      CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED
        ? CITY_ALCHEMY_BENCH_LANDMARK_CUE.hazeOpacityBase
        : 0,
    );
    expect(cue.hazeRadius).toBe(CITY_ALCHEMY_BENCH_LANDMARK_CUE.hazeRadius);
    expect(CITY_SCARCE_STATION_TYPES).toContain("alchemy_bench");

    const peak = cityAlchemyBenchLandmarkEmissiveIntensity(1);
    const floor = cityAlchemyBenchLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_ALCHEMY_BENCH_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_ALCHEMY_BENCH_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityAlchemyBenchLandmarkHazeOpacity(1);
    const hazeFloor = cityAlchemyBenchLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; cool tonic ≠ working / Free / dock (edge)", () => {
    expect(cityAlchemyBenchLandmarkCue("player_land").show).toBe(false);
    expect(cityAlchemyBenchLandmarkCue("explore").show).toBe(false);
    expect(cityAlchemyBenchLandmarkCue("warrior").show).toBe(false);
    expect(cityAlchemyBenchLandmarkCue(null).show).toBe(false);
    expect(cityAlchemyBenchLandmarkCue("").show).toBe(false);
    expect(cityAlchemyBenchLandmarkCue("player_land").intensity).toBe(0);
    expect(cityAlchemyBenchLandmarkCue("player_land").hazeOpacity).toBe(0);

    expect(cityAlchemyBenchLandmarkVsWorkingContrast()).toBeGreaterThan(0);
    expect(cityAlchemyBenchLandmarkVsFreeStickyContrast()).toBeGreaterThan(0);
    expect(cityAlchemyBenchLandmarkVsFishingDockContrast()).toBeGreaterThan(0);
    expect(CITY_ALCHEMY_BENCH_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive.toLowerCase(),
    );
    expect(CITY_ALCHEMY_BENCH_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_SCARCE_STATION_FREE_CUE.haloColor.toLowerCase(),
    );
    expect(CITY_ALCHEMY_BENCH_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_FISHING_DOCK_LANDMARK_CUE.emissive.toLowerCase(),
    );

    // Continuous landmark stays quieter / slower than working glow.
    expect(CITY_ALCHEMY_BENCH_LANDMARK_CUE.intensityPeak).toBeLessThan(
      PROCESS_STATION_WORKING_EMISSIVE.intensityMax,
    );
    expect(CITY_ALCHEMY_BENCH_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(
      PROCESS_STATION_WORKING_EMISSIVE.periodMs,
    );

    const low = cityAlchemyBenchLandmarkPulseEnvelope(0);
    const mid = cityAlchemyBenchLandmarkPulseEnvelope(
      CITY_ALCHEMY_BENCH_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent recipes or NFT combat (failure)", () => {
    expect(cityAlchemyBenchLandmarkEmissiveIntensity(2)).toBe(
      CITY_ALCHEMY_BENCH_LANDMARK_CUE.intensityPeak,
    );
    expect(cityAlchemyBenchLandmarkEmissiveIntensity(-1)).toBe(
      CITY_ALCHEMY_BENCH_LANDMARK_CUE.intensityBase,
    );
    expect(cityAlchemyBenchLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(
      CITY_ALCHEMY_BENCH_LANDMARK_CUE.hazeOpacityPeak,
    ).toBeLessThanOrEqual(1);
    expect(String(CITY_ALCHEMY_BENCH_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|recipe/i,
    );
    expect(CITY_ALCHEMY_BENCH_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
