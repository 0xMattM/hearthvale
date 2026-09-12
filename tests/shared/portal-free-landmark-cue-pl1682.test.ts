import { describe, expect, it } from "vitest";
import {
  PORTAL_ARENA_EXIT_SOFT_PULSE,
  PORTAL_FREE_LANDMARK_CUE,
  PORTAL_FREE_TRAVEL_SOFT_PULSE,
  PORTAL_HIGHLIGHT_FREE_PULSE,
  portalFreeLandmarkCue,
  portalFreeLandmarkEmissiveIntensity,
  portalFreeLandmarkHazeOpacity,
  portalFreeLandmarkPulseEnvelope,
  portalFreeLandmarkVsArenaExitContrast,
  portalFreeLandmarkVsSoftPulseContrast,
} from "@game/shared";

/**
 * PL168.2 — Portal Free soft landmark cue leftover.
 * Choice: quiet cool Free cyan haze/emissive on existing portal while Free
 * (complements Free portal pulse PL144.1 + travel rim PL164.1; fares free).
 * Continuous landmark on non-Arena portals; Arena keeps Exit pulse as primary.
 */
describe("CityLands PL168.2 portal Free soft landmark cue leftover", () => {
  it("pulses quiet Free cyan haze on fare-free non-Arena portals (happy)", () => {
    const cue = portalFreeLandmarkCue("city");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      PORTAL_FREE_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(PORTAL_FREE_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(PORTAL_FREE_LANDMARK_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(PORTAL_FREE_LANDMARK_CUE.hazeRadius);

    expect(portalFreeLandmarkCue("player_land").show).toBe(true);
    expect(portalFreeLandmarkCue("explore").show).toBe(true);

    const peak = portalFreeLandmarkEmissiveIntensity(1);
    const floor = portalFreeLandmarkEmissiveIntensity(0);
    expect(peak).toBe(PORTAL_FREE_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(PORTAL_FREE_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = portalFreeLandmarkHazeOpacity(1);
    const hazeFloor = portalFreeLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet on Arena; Free cyan ≠ soft pulse / Exit (edge)", () => {
    expect(portalFreeLandmarkCue("warrior").show).toBe(false);
    expect(portalFreeLandmarkCue("warrior").intensity).toBe(0);
    expect(portalFreeLandmarkCue("warrior").hazeOpacity).toBe(0);
    expect(portalFreeLandmarkCue(null).show).toBe(false);
    expect(portalFreeLandmarkCue("").show).toBe(false);

    expect(portalFreeLandmarkVsSoftPulseContrast()).toBeGreaterThan(0);
    expect(portalFreeLandmarkVsArenaExitContrast()).toBeGreaterThan(0);
    expect(PORTAL_FREE_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      PORTAL_FREE_TRAVEL_SOFT_PULSE.emissive.toLowerCase(),
    );
    expect(PORTAL_FREE_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      PORTAL_ARENA_EXIT_SOFT_PULSE.emissive.toLowerCase(),
    );

    // Continuous landmark stays quieter / slower than interact Free pulse.
    expect(PORTAL_FREE_LANDMARK_CUE.intensityPeak).toBeLessThan(
      PORTAL_FREE_TRAVEL_SOFT_PULSE.emissivePeak,
    );
    expect(PORTAL_FREE_LANDMARK_CUE.pulsePeriodMs).toBeGreaterThan(
      PORTAL_HIGHLIGHT_FREE_PULSE.periodMs,
    );

    const low = portalFreeLandmarkPulseEnvelope(0);
    const mid = portalFreeLandmarkPulseEnvelope(
      PORTAL_FREE_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent fares or NFT combat (failure)", () => {
    expect(portalFreeLandmarkEmissiveIntensity(2)).toBe(
      PORTAL_FREE_LANDMARK_CUE.intensityPeak,
    );
    expect(portalFreeLandmarkEmissiveIntensity(-1)).toBe(
      PORTAL_FREE_LANDMARK_CUE.intensityBase,
    );
    expect(portalFreeLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(PORTAL_FREE_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(PORTAL_FREE_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat|fare/i,
    );
    expect(PORTAL_FREE_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
