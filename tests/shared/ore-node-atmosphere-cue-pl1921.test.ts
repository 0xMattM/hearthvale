import { describe, expect, it } from "vitest";
import {
  CITY_ORE_NODE_LANDMARK_CUE,
  EXPLORE_PREMIUM_NODE_GLOW,
  GATHER_NODE_DEPLETED_CUE,
  ORE_NODE,
  ORE_NODE_ATMOSPHERE_CUE,
  oreNodeAtmosphereCue,
  oreNodeAtmosphereEmissiveIntensity,
  oreNodeAtmosphereHazeOpacity,
  oreNodeAtmospherePulseEnvelope,
  oreNodeAtmosphereVsCityLandmarkContrast,
  oreNodeAtmosphereVsExplorePremiumContrast,
  oreNodeAtmosphereVsReadyRockContrast,
} from "@game/shared";

/**
 * PL192.1 — Ore-node soft atmosphere leftover.
 * Choice: quiet cool pulsing ore mist over existing ore node on player land
 * (complements ready / depleted + City landmark PL172.1 + Explore premium PL116.2;
 * mine cooldown SoT). City kinship covered by landmark alone — distinct leftover,
 * not duplicate stack; Explore premium keeps its own ready glow.
 */
describe("CityLands PL192.1 ore-node soft atmosphere leftover", () => {
  it("pulses quiet cool ore mist on player land (happy)", () => {
    const cue = oreNodeAtmosphereCue("player_land");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      ORE_NODE_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(ORE_NODE_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(ORE_NODE_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(ORE_NODE_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(ORE_NODE_ATMOSPHERE_CUE.hazeY);

    const peak = oreNodeAtmosphereEmissiveIntensity(1);
    const floor = oreNodeAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(ORE_NODE_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(ORE_NODE_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = oreNodeAtmosphereHazeOpacity(1);
    const hazeFloor = oreNodeAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off player land; mist ≠ City landmark / ready / premium (edge)", () => {
    expect(oreNodeAtmosphereCue("city").show).toBe(false);
    expect(oreNodeAtmosphereCue("explore").show).toBe(false);
    expect(oreNodeAtmosphereCue("warrior").show).toBe(false);
    expect(oreNodeAtmosphereCue(null).show).toBe(false);
    expect(oreNodeAtmosphereCue("city").intensity).toBe(0);

    expect(oreNodeAtmosphereVsCityLandmarkContrast()).toBeGreaterThan(0);
    expect(oreNodeAtmosphereVsReadyRockContrast()).toBeGreaterThan(0);
    expect(oreNodeAtmosphereVsExplorePremiumContrast()).toBeGreaterThan(0);
    expect(ORE_NODE_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_ORE_NODE_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(ORE_NODE_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      GATHER_NODE_DEPLETED_CUE.oreReadyRock.toLowerCase(),
    );
    expect(ORE_NODE_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      EXPLORE_PREMIUM_NODE_GLOW.ore.emissive.toLowerCase(),
    );

    expect(ORE_NODE_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      CITY_ORE_NODE_LANDMARK_CUE.hazeRadius,
    );
    expect(ORE_NODE_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      CITY_ORE_NODE_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(ORE_NODE_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      CITY_ORE_NODE_LANDMARK_CUE.intensityPeak,
    );

    const low = oreNodeAtmospherePulseEnvelope(0);
    const mid = oreNodeAtmospherePulseEnvelope(
      ORE_NODE_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent mine cooldown / yields or NFT combat (failure)", () => {
    expect(ORE_NODE.cooldownMs).toBe(90_000);
    expect(ORE_NODE.yieldItemId).toBe("iron_ore");
    expect(ORE_NODE.yieldQty).toBe(1);

    expect(oreNodeAtmosphereEmissiveIntensity(2)).toBe(
      ORE_NODE_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(oreNodeAtmosphereEmissiveIntensity(-1)).toBe(
      ORE_NODE_ATMOSPHERE_CUE.intensityBase,
    );
    expect(oreNodeAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(ORE_NODE_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(ORE_NODE_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(String(ORE_NODE_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|yield|cooldown/i,
    );
  });
});
