import { describe, expect, it } from "vitest";
import {
  PORTAL_ARENA_EXIT_SOFT_PULSE,
  PORTAL_FREE_ATMOSPHERE_CUE,
  PORTAL_FREE_LANDMARK_CUE,
  PORTAL_FREE_TRAVEL_SOFT_PULSE,
  portalFreeAtmosphereCue,
  portalFreeAtmosphereEmissiveIntensity,
  portalFreeAtmosphereHazeOpacity,
  portalFreeAtmospherePulseEnvelope,
  portalFreeAtmosphereVsArenaExitContrast,
  portalFreeAtmosphereVsLandmarkContrast,
  portalFreeAtmosphereVsSoftPulseContrast,
} from "@game/shared";

/**
 * PL186.1 — Portal soft atmosphere leftover.
 * Choice: quiet deeper cool pulsing mist over Free portal footing on non-Arena
 * maps (complements Free landmark PL168.2 + threshold pulse; ≠ identical Free
 * cyan landmark disc; fares free).
 */
describe("CityLands PL186.1 portal Free soft atmosphere leftover", () => {
  it("pulses quiet cool Free mist on fare-free non-Arena portals (happy)", () => {
    const cue = portalFreeAtmosphereCue("city");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      PORTAL_FREE_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(PORTAL_FREE_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(PORTAL_FREE_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(PORTAL_FREE_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(PORTAL_FREE_ATMOSPHERE_CUE.hazeY);

    expect(portalFreeAtmosphereCue("player_land").show).toBe(true);
    expect(portalFreeAtmosphereCue("explore").show).toBe(true);

    const peak = portalFreeAtmosphereEmissiveIntensity(1);
    const floor = portalFreeAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(PORTAL_FREE_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(PORTAL_FREE_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = portalFreeAtmosphereHazeOpacity(1);
    const hazeFloor = portalFreeAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet on Arena; mist ≠ landmark / soft pulse / Exit (edge)", () => {
    expect(portalFreeAtmosphereCue("warrior").show).toBe(false);
    expect(portalFreeAtmosphereCue("warrior").intensity).toBe(0);
    expect(portalFreeAtmosphereCue("warrior").hazeOpacity).toBe(0);
    expect(portalFreeAtmosphereCue(null).show).toBe(false);
    expect(portalFreeAtmosphereCue("").show).toBe(false);

    expect(portalFreeAtmosphereVsLandmarkContrast()).toBeGreaterThan(0);
    expect(portalFreeAtmosphereVsSoftPulseContrast()).toBeGreaterThan(0);
    expect(portalFreeAtmosphereVsArenaExitContrast()).toBeGreaterThan(0);
    expect(PORTAL_FREE_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      PORTAL_FREE_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(PORTAL_FREE_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      PORTAL_FREE_TRAVEL_SOFT_PULSE.emissive.toLowerCase(),
    );
    expect(PORTAL_FREE_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      PORTAL_ARENA_EXIT_SOFT_PULSE.emissive.toLowerCase(),
    );

    // Wider / slower / quieter leftover mist vs Free landmark disc (no duplicate).
    expect(PORTAL_FREE_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      PORTAL_FREE_LANDMARK_CUE.hazeRadius,
    );
    expect(PORTAL_FREE_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      PORTAL_FREE_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(PORTAL_FREE_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      PORTAL_FREE_LANDMARK_CUE.intensityPeak,
    );

    const low = portalFreeAtmospherePulseEnvelope(0);
    const mid = portalFreeAtmospherePulseEnvelope(
      PORTAL_FREE_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent fares or NFT combat (failure)", () => {
    expect(portalFreeAtmosphereEmissiveIntensity(2)).toBe(
      PORTAL_FREE_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(portalFreeAtmosphereEmissiveIntensity(-1)).toBe(
      PORTAL_FREE_ATMOSPHERE_CUE.intensityBase,
    );
    expect(portalFreeAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(PORTAL_FREE_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(PORTAL_FREE_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(PORTAL_FREE_ATMOSPHERE_CUE.hazeRadius).toBeLessThanOrEqual(2.5);
    expect(String(PORTAL_FREE_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare/i,
    );
  });
});
