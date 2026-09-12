import { describe, expect, it } from "vitest";
import {
  ANIMAL_PEN,
  ANIMAL_PEN_ATMOSPHERE_CUE,
  ANIMAL_PEN_READY_PAD_PULSE,
  CITY_ANIMAL_PEN_LANDMARK_CUE,
  animalPenAtmosphereCue,
  animalPenAtmosphereEmissiveIntensity,
  animalPenAtmosphereHazeOpacity,
  animalPenAtmospherePulseEnvelope,
  animalPenAtmosphereVsCityLandmarkContrast,
  animalPenAtmosphereVsReadyPadContrast,
} from "@game/shared";

/**
 * PL191.1 — Animal-pen soft atmosphere leftover.
 * Choice: quiet warm pulsing pen mist over existing animal pen on player land
 * (complements ready pad PL127.1 + City landmark PL170.2; care / cooldown SoT).
 * City kinship covered by landmark alone — distinct leftover, not duplicate stack.
 */
describe("CityLands PL191.1 animal-pen soft atmosphere leftover", () => {
  it("pulses quiet warm pen mist on player land (happy)", () => {
    const cue = animalPenAtmosphereCue("player_land");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      ANIMAL_PEN_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(ANIMAL_PEN_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(ANIMAL_PEN_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(ANIMAL_PEN_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(ANIMAL_PEN_ATMOSPHERE_CUE.hazeY);

    const peak = animalPenAtmosphereEmissiveIntensity(1);
    const floor = animalPenAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(ANIMAL_PEN_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(ANIMAL_PEN_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = animalPenAtmosphereHazeOpacity(1);
    const hazeFloor = animalPenAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off player land; mist ≠ City landmark / ready pad (edge)", () => {
    expect(animalPenAtmosphereCue("city").show).toBe(false);
    expect(animalPenAtmosphereCue("explore").show).toBe(false);
    expect(animalPenAtmosphereCue("warrior").show).toBe(false);
    expect(animalPenAtmosphereCue(null).show).toBe(false);
    expect(animalPenAtmosphereCue("city").intensity).toBe(0);

    expect(animalPenAtmosphereVsCityLandmarkContrast()).toBeGreaterThan(0);
    expect(animalPenAtmosphereVsReadyPadContrast()).toBeGreaterThan(0);
    expect(ANIMAL_PEN_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_ANIMAL_PEN_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(ANIMAL_PEN_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      ANIMAL_PEN_READY_PAD_PULSE.padEmissive.toLowerCase(),
    );

    expect(ANIMAL_PEN_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      CITY_ANIMAL_PEN_LANDMARK_CUE.hazeRadius,
    );
    expect(ANIMAL_PEN_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      CITY_ANIMAL_PEN_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(ANIMAL_PEN_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      ANIMAL_PEN_READY_PAD_PULSE.pulsePeriodMs,
    );
    expect(ANIMAL_PEN_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      CITY_ANIMAL_PEN_LANDMARK_CUE.intensityPeak,
    );
    expect(ANIMAL_PEN_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      ANIMAL_PEN_READY_PAD_PULSE.intensityPeak,
    );

    const low = animalPenAtmospherePulseEnvelope(0);
    const mid = animalPenAtmospherePulseEnvelope(
      ANIMAL_PEN_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent care / cooldown rates or NFT combat (failure)", () => {
    expect(ANIMAL_PEN.cooldownMs).toBe(45_000);
    expect(ANIMAL_PEN.feedItemId).toBe("wheat");
    expect(ANIMAL_PEN.cleanItemId).toBe("wood");

    expect(animalPenAtmosphereEmissiveIntensity(2)).toBe(
      ANIMAL_PEN_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(animalPenAtmosphereEmissiveIntensity(-1)).toBe(
      ANIMAL_PEN_ATMOSPHERE_CUE.intensityBase,
    );
    expect(animalPenAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(ANIMAL_PEN_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(ANIMAL_PEN_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(String(ANIMAL_PEN_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|yield|cooldown/i,
    );
  });
});
