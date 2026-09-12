import { describe, expect, it } from "vitest";
import {
  ALCHEMY_BENCH_ATMOSPHERE_CUE,
  CITY_ALCHEMY_BENCH_LANDMARK_CUE,
  LOOM_ATMOSPHERE_CUE,
  PROCESS_STATION_WORKING_EMISSIVE,
  RECIPES,
  alchemyBenchAtmosphereCue,
  alchemyBenchAtmosphereEmissiveIntensity,
  alchemyBenchAtmosphereHazeOpacity,
  alchemyBenchAtmospherePulseEnvelope,
  alchemyBenchAtmosphereVsCityLandmarkContrast,
  alchemyBenchAtmosphereVsWorkingContrast,
} from "@game/shared";

/**
 * PL194.2 — Alchemy-bench soft atmosphere leftover.
 * Choice: quiet cool pulsing tonic mist over existing alchemy bench on player land
 * (complements Free/Busy + craft working + City cool tonic landmark PL170.1; recipes SoT).
 * City kinship covered by cool landmark alone — distinct deep tonic leftover, not stack.
 */
describe("CityLands PL194.2 alchemy-bench soft atmosphere leftover", () => {
  it("pulses quiet cool tonic mist on player land (happy)", () => {
    const cue = alchemyBenchAtmosphereCue("player_land");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      ALCHEMY_BENCH_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(ALCHEMY_BENCH_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(ALCHEMY_BENCH_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(ALCHEMY_BENCH_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(ALCHEMY_BENCH_ATMOSPHERE_CUE.hazeY);

    const peak = alchemyBenchAtmosphereEmissiveIntensity(1);
    const floor = alchemyBenchAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(ALCHEMY_BENCH_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(ALCHEMY_BENCH_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = alchemyBenchAtmosphereHazeOpacity(1);
    const hazeFloor = alchemyBenchAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off player land; mist ≠ City landmark / working / loom (edge)", () => {
    expect(alchemyBenchAtmosphereCue("city").show).toBe(false);
    expect(alchemyBenchAtmosphereCue("explore").show).toBe(false);
    expect(alchemyBenchAtmosphereCue("warrior").show).toBe(false);
    expect(alchemyBenchAtmosphereCue(null).show).toBe(false);
    expect(alchemyBenchAtmosphereCue("city").intensity).toBe(0);

    expect(alchemyBenchAtmosphereVsCityLandmarkContrast()).toBeGreaterThan(0);
    expect(alchemyBenchAtmosphereVsWorkingContrast()).toBeGreaterThan(0);
    expect(ALCHEMY_BENCH_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_ALCHEMY_BENCH_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(ALCHEMY_BENCH_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive.toLowerCase(),
    );
    expect(ALCHEMY_BENCH_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      LOOM_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );

    expect(ALCHEMY_BENCH_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      CITY_ALCHEMY_BENCH_LANDMARK_CUE.hazeRadius,
    );
    expect(ALCHEMY_BENCH_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      CITY_ALCHEMY_BENCH_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(ALCHEMY_BENCH_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      CITY_ALCHEMY_BENCH_LANDMARK_CUE.intensityPeak,
    );
    expect(ALCHEMY_BENCH_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      PROCESS_STATION_WORKING_EMISSIVE.intensityMax,
    );

    const low = alchemyBenchAtmospherePulseEnvelope(0);
    const mid = alchemyBenchAtmospherePulseEnvelope(
      ALCHEMY_BENCH_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent recipes or NFT combat (failure)", () => {
    const alchemyRecipes = RECIPES.filter(
      (r) => r.station === "alchemy_bench",
    );
    expect(alchemyRecipes.some((r) => r.id === "brew_herbal_tonic")).toBe(
      true,
    );
    expect(
      alchemyRecipes.find((r) => r.id === "brew_herbal_tonic")?.output,
    ).toEqual({
      itemId: "herbal_tonic",
      qty: 1,
    });

    expect(alchemyBenchAtmosphereEmissiveIntensity(2)).toBe(
      ALCHEMY_BENCH_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(alchemyBenchAtmosphereEmissiveIntensity(-1)).toBe(
      ALCHEMY_BENCH_ATMOSPHERE_CUE.intensityBase,
    );
    expect(alchemyBenchAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(ALCHEMY_BENCH_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(
      1,
    );
    expect(ALCHEMY_BENCH_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(String(ALCHEMY_BENCH_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|recipe|yield/i,
    );
  });
});
