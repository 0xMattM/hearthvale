import { describe, expect, it } from "vitest";
import {
  HOMESTEAD_YARD_VISUAL,
  VISIT_HOST_NAMEPLATE,
  VISIT_LAND_ATMOSPHERE_CUE,
  VISIT_LAND_FIRST_WALKUP_WORLD_TIP,
  homesteadYardPresenceFor,
  visitLandAtmosphereCue,
  visitLandAtmosphereEmissiveIntensity,
  visitLandAtmosphereHazeOpacity,
  visitLandAtmospherePulseEnvelope,
  visitLandAtmosphereVsHomePathContrast,
  visitLandAtmosphereVsStaticHazeContrast,
} from "@game/shared";

/**
 * PL175.2 — Visit land soft atmosphere leftover.
 * Choice: quiet cool pulsing mist over PL51.2 static visit haze while visiting
 * another player's land (complements visit tip + leave cue; visit rules unchanged).
 */
describe("CityLands PL175.2 visit land soft atmosphere leftover", () => {
  it("pulses quiet cool visit mist while presence is visit (happy)", () => {
    const cue = visitLandAtmosphereCue("visit");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      VISIT_LAND_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(VISIT_LAND_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(VISIT_LAND_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeWidth).toBe(VISIT_LAND_ATMOSPHERE_CUE.hazeWidth);
    expect(cue.hazeDepth).toBe(VISIT_LAND_ATMOSPHERE_CUE.hazeDepth);

    const peak = visitLandAtmosphereEmissiveIntensity(1);
    const floor = visitLandAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(VISIT_LAND_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(VISIT_LAND_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = visitLandAtmosphereHazeOpacity(1);
    const hazeFloor = visitLandAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet on home; mist ≠ static haze / home path (edge)", () => {
    expect(visitLandAtmosphereCue("home").show).toBe(false);
    expect(visitLandAtmosphereCue("home").intensity).toBe(0);
    expect(visitLandAtmosphereCue("home").hazeOpacity).toBe(0);

    expect(homesteadYardPresenceFor(true, "player_land")).toBe("visit");
    expect(homesteadYardPresenceFor(false, "player_land")).toBe("home");
    expect(visitLandAtmosphereCue(homesteadYardPresenceFor(true, "city")).show).toBe(
      false,
    );

    expect(visitLandAtmosphereVsStaticHazeContrast()).toBeGreaterThan(0);
    expect(visitLandAtmosphereVsHomePathContrast()).toBeGreaterThan(0);
    expect(VISIT_LAND_ATMOSPHERE_CUE.hazeColor.toLowerCase()).not.toBe(
      HOMESTEAD_YARD_VISUAL.visit.hazeColor.toLowerCase(),
    );
    expect(VISIT_LAND_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      HOMESTEAD_YARD_VISUAL.lived.pathColor.toLowerCase(),
    );
    expect(VISIT_LAND_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      VISIT_HOST_NAMEPLATE.padColor.toLowerCase(),
    );

    const low = visitLandAtmospherePulseEnvelope(0);
    const mid = visitLandAtmospherePulseEnvelope(
      VISIT_LAND_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent visit rules or NFT combat (failure)", () => {
    expect(VISIT_LAND_FIRST_WALKUP_WORLD_TIP).toBe("Trade · T");
    expect(HOMESTEAD_YARD_VISUAL.visit.hazeOpacity).toBe(0.14);
    expect(visitLandAtmosphereEmissiveIntensity(2)).toBe(
      VISIT_LAND_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(visitLandAtmosphereEmissiveIntensity(-1)).toBe(
      VISIT_LAND_ATMOSPHERE_CUE.intensityBase,
    );
    expect(visitLandAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(VISIT_LAND_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(VISIT_LAND_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|recipe/i,
    );
    expect(VISIT_LAND_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
