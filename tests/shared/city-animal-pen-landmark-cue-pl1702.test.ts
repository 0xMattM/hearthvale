import { describe, expect, it } from "vitest";
import {
  ANIMAL_PEN,
  ANIMAL_PEN_READY_PAD_PULSE,
  CITY_ANIMAL_PEN_LANDMARK_CUE,
  CITY_BUILDINGS,
  CITY_LAND,
  CITY_LOOM_LANDMARK_CUE,
  CITY_PRACTICE_STATIONS,
  CITY_SCARCE_STATION_FREE_CUE,
  CITY_SCARCE_STATION_TYPES,
  cityAnimalPenLandmarkCue,
  cityAnimalPenLandmarkEmissiveIntensity,
  cityAnimalPenLandmarkHazeOpacity,
  cityAnimalPenLandmarkPulseEnvelope,
  cityAnimalPenLandmarkVsFreeStickyContrast,
  cityAnimalPenLandmarkVsLoomContrast,
  cityAnimalPenLandmarkVsReadyPadContrast,
  CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED,
} from "@game/shared";

/**
 * PL170.2 — City animal-pen soft landmark cue leftover.
 * Choice: seed scarce city animal_pen (Vision profession station) + quiet warm
 * hay haze/emissive while on City (complements feed/collect + Free/Busy pads;
 * yields/cooldowns unchanged). Continuous landmark on City only.
 */
describe("CityLands PL170.2 city animal-pen soft landmark cue leftover", () => {
  it("pulses quiet warm hay haze on City scarce animal pen (happy)", () => {
    expect(CITY_BUILDINGS.some((b) => b.type === "animal_pen")).toBe(true);
    expect(CITY_BUILDINGS.length).toBe(CITY_LAND.buildSlots);
    expect(CITY_SCARCE_STATION_TYPES).toContain("animal_pen");
    expect(CITY_PRACTICE_STATIONS.animal_breeder).toEqual(["animal_pen"]);

    const cue = cityAnimalPenLandmarkCue("city");
    expect(cue.show).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_ANIMAL_PEN_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_ANIMAL_PEN_LANDMARK_CUE.intensityBase : 0);
    expect(cue.hazeOpacity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_ANIMAL_PEN_LANDMARK_CUE.hazeOpacityBase : 0);
    expect(cue.hazeRadius).toBe(CITY_ANIMAL_PEN_LANDMARK_CUE.hazeRadius);

    const peak = cityAnimalPenLandmarkEmissiveIntensity(1);
    const floor = cityAnimalPenLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_ANIMAL_PEN_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_ANIMAL_PEN_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityAnimalPenLandmarkHazeOpacity(1);
    const hazeFloor = cityAnimalPenLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; warm hay ≠ ready / Free / loom (edge)", () => {
    expect(cityAnimalPenLandmarkCue("player_land").show).toBe(false);
    expect(cityAnimalPenLandmarkCue("explore").show).toBe(false);
    expect(cityAnimalPenLandmarkCue("warrior").show).toBe(false);
    expect(cityAnimalPenLandmarkCue(null).show).toBe(false);
    expect(cityAnimalPenLandmarkCue("").show).toBe(false);
    expect(cityAnimalPenLandmarkCue("player_land").intensity).toBe(0);
    expect(cityAnimalPenLandmarkCue("player_land").hazeOpacity).toBe(0);

    expect(cityAnimalPenLandmarkVsReadyPadContrast()).toBeGreaterThan(0);
    expect(cityAnimalPenLandmarkVsFreeStickyContrast()).toBeGreaterThan(0);
    expect(cityAnimalPenLandmarkVsLoomContrast()).toBeGreaterThan(0);
    expect(CITY_ANIMAL_PEN_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      ANIMAL_PEN_READY_PAD_PULSE.padEmissive.toLowerCase(),
    );
    expect(CITY_ANIMAL_PEN_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_SCARCE_STATION_FREE_CUE.haloColor.toLowerCase(),
    );
    expect(CITY_ANIMAL_PEN_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_LOOM_LANDMARK_CUE.emissive.toLowerCase(),
    );

    // Continuous landmark stays quieter / slower than ready pad pulse.
    expect(CITY_ANIMAL_PEN_LANDMARK_CUE.intensityPeak).toBeLessThan(
      ANIMAL_PEN_READY_PAD_PULSE.intensityPeak,
    );
    expect(CITY_ANIMAL_PEN_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(
      ANIMAL_PEN_READY_PAD_PULSE.pulsePeriodMs,
    );

    const low = cityAnimalPenLandmarkPulseEnvelope(0);
    const mid = cityAnimalPenLandmarkPulseEnvelope(
      CITY_ANIMAL_PEN_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent yields, combat, or NFT power (failure)", () => {
    expect(ANIMAL_PEN.cooldownMs).toBe(45_000);
    expect(ANIMAL_PEN.feedQty).toBe(1);
    expect(ANIMAL_PEN.cleanQty).toBe(1);
    expect(ANIMAL_PEN.xp).toBe(5);
    expect(cityAnimalPenLandmarkEmissiveIntensity(2)).toBe(
      CITY_ANIMAL_PEN_LANDMARK_CUE.intensityPeak,
    );
    expect(cityAnimalPenLandmarkEmissiveIntensity(-1)).toBe(
      CITY_ANIMAL_PEN_LANDMARK_CUE.intensityBase,
    );
    expect(cityAnimalPenLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_ANIMAL_PEN_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(CITY_ANIMAL_PEN_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|yield/i,
    );
    expect(CITY_ANIMAL_PEN_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
