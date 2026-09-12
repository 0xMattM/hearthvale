import { describe, expect, it } from "vitest";
import {
  ARENA_BOARD_LANDMARK_CUE,
  WARRIOR_ARENA_ATMOSPHERE_CUE,
  WARRIOR_ARENA_VISUAL,
  warriorArenaAtmosphereCue,
  warriorArenaAtmosphereEmissiveIntensity,
  warriorArenaAtmosphereHazeOpacity,
  warriorArenaAtmospherePulseEnvelope,
  warriorArenaAtmosphereVsBoardLandmarkContrast,
  warriorArenaAtmosphereVsStaticHazeContrast,
} from "@game/shared";

/**
 * PL177.1 — Warrior arena soft atmosphere leftover.
 * Choice: quiet warm pulsing mist over PL41.2 static arena haze while on Warrior
 * (complements arena board landmark + enter/leave rims; stub / no balance invent).
 */
describe("CityLands PL177.1 warrior arena soft atmosphere leftover", () => {
  it("pulses quiet warm arena mist while on Warrior (happy)", () => {
    const cue = warriorArenaAtmosphereCue("warrior");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      WARRIOR_ARENA_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(WARRIOR_ARENA_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(WARRIOR_ARENA_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeWidth).toBe(WARRIOR_ARENA_ATMOSPHERE_CUE.hazeWidth);
    expect(cue.hazeDepth).toBe(WARRIOR_ARENA_ATMOSPHERE_CUE.hazeDepth);

    const peak = warriorArenaAtmosphereEmissiveIntensity(1);
    const floor = warriorArenaAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(WARRIOR_ARENA_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(WARRIOR_ARENA_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = warriorArenaAtmosphereHazeOpacity(1);
    const hazeFloor = warriorArenaAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off Warrior; mist ≠ static haze / board landmark (edge)", () => {
    expect(warriorArenaAtmosphereCue("city").show).toBe(false);
    expect(warriorArenaAtmosphereCue("explore").show).toBe(false);
    expect(warriorArenaAtmosphereCue("player_land").show).toBe(false);
    expect(warriorArenaAtmosphereCue(null).show).toBe(false);
    expect(warriorArenaAtmosphereCue("").show).toBe(false);
    expect(warriorArenaAtmosphereCue("city").intensity).toBe(0);
    expect(warriorArenaAtmosphereCue("city").hazeOpacity).toBe(0);

    expect(warriorArenaAtmosphereVsStaticHazeContrast()).toBeGreaterThan(0);
    expect(warriorArenaAtmosphereVsBoardLandmarkContrast()).toBeGreaterThan(0);
    expect(WARRIOR_ARENA_ATMOSPHERE_CUE.hazeColor.toLowerCase()).not.toBe(
      WARRIOR_ARENA_VISUAL.hazeColor.toLowerCase(),
    );
    expect(WARRIOR_ARENA_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      ARENA_BOARD_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(WARRIOR_ARENA_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      WARRIOR_ARENA_VISUAL.plaqueEmissive.toLowerCase(),
    );

    const low = warriorArenaAtmospherePulseEnvelope(0);
    const mid = warriorArenaAtmospherePulseEnvelope(
      WARRIOR_ARENA_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent warrior balance or NFT combat (failure)", () => {
    expect(WARRIOR_ARENA_VISUAL.hazeOpacity).toBe(0.22);
    expect(warriorArenaAtmosphereEmissiveIntensity(2)).toBe(
      WARRIOR_ARENA_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(warriorArenaAtmosphereEmissiveIntensity(-1)).toBe(
      WARRIOR_ARENA_ATMOSPHERE_CUE.intensityBase,
    );
    expect(warriorArenaAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(WARRIOR_ARENA_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(WARRIOR_ARENA_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|recipe|xp|damage/i,
    );
    expect(WARRIOR_ARENA_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
