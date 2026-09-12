import { describe, expect, it } from "vitest";
import {
  EXPLORE_CANOPY_ATMOSPHERE_CUE,
  EXPLORE_MINES_LANDMARK_CUE,
  EXPLORE_SECTION_LANDMARK_CUE,
  EXPLORE_WILDS_VISUAL,
  exploreCanopyAtmosphereCue,
  exploreCanopyAtmosphereEmissiveIntensity,
  exploreCanopyAtmosphereHazeOpacity,
  exploreCanopyAtmospherePulseEnvelope,
  exploreCanopyAtmosphereVsStaticHazeContrast,
  exploreCanopyAtmosphereVsWoodlandLandmarkContrast,
} from "@game/shared";

/**
 * PL178.1 — Explore canopy soft atmosphere leftover.
 * Choice: quiet cool pulsing mist over PL36.2 static wilds haze while on Explore
 * (complements woodland/mines section landmarks + wilds palette; spawns unchanged).
 */
describe("CityLands PL178.1 explore canopy soft atmosphere leftover", () => {
  it("pulses quiet cool canopy mist while on Explore (happy)", () => {
    const cue = exploreCanopyAtmosphereCue("explore");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      EXPLORE_CANOPY_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(EXPLORE_CANOPY_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(EXPLORE_CANOPY_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeWidth).toBe(EXPLORE_CANOPY_ATMOSPHERE_CUE.hazeWidth);
    expect(cue.hazeDepth).toBe(EXPLORE_CANOPY_ATMOSPHERE_CUE.hazeDepth);

    const peak = exploreCanopyAtmosphereEmissiveIntensity(1);
    const floor = exploreCanopyAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(EXPLORE_CANOPY_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(EXPLORE_CANOPY_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = exploreCanopyAtmosphereHazeOpacity(1);
    const hazeFloor = exploreCanopyAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off Explore; mist ≠ static haze / woodland landmark (edge)", () => {
    expect(exploreCanopyAtmosphereCue("city").show).toBe(false);
    expect(exploreCanopyAtmosphereCue("warrior").show).toBe(false);
    expect(exploreCanopyAtmosphereCue("player_land").show).toBe(false);
    expect(exploreCanopyAtmosphereCue(null).show).toBe(false);
    expect(exploreCanopyAtmosphereCue("").show).toBe(false);
    expect(exploreCanopyAtmosphereCue("city").intensity).toBe(0);
    expect(exploreCanopyAtmosphereCue("city").hazeOpacity).toBe(0);

    expect(exploreCanopyAtmosphereVsStaticHazeContrast()).toBeGreaterThan(0);
    expect(
      exploreCanopyAtmosphereVsWoodlandLandmarkContrast(),
    ).toBeGreaterThan(0);
    expect(EXPLORE_CANOPY_ATMOSPHERE_CUE.hazeColor.toLowerCase()).not.toBe(
      EXPLORE_WILDS_VISUAL.hazeColor.toLowerCase(),
    );
    expect(EXPLORE_CANOPY_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      EXPLORE_SECTION_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(EXPLORE_CANOPY_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      EXPLORE_MINES_LANDMARK_CUE.emissive.toLowerCase(),
    );

    const low = exploreCanopyAtmospherePulseEnvelope(0);
    const mid = exploreCanopyAtmospherePulseEnvelope(
      EXPLORE_CANOPY_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent spawns or NFT combat (failure)", () => {
    expect(EXPLORE_WILDS_VISUAL.hazeOpacity).toBe(0.2);
    expect(EXPLORE_WILDS_VISUAL.canopyColor).toBe("#243a38");
    expect(exploreCanopyAtmosphereEmissiveIntensity(2)).toBe(
      EXPLORE_CANOPY_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(exploreCanopyAtmosphereEmissiveIntensity(-1)).toBe(
      EXPLORE_CANOPY_ATMOSPHERE_CUE.intensityBase,
    );
    expect(exploreCanopyAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(EXPLORE_CANOPY_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(EXPLORE_CANOPY_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|recipe|xp|damage|spawn/i,
    );
    expect(EXPLORE_CANOPY_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
