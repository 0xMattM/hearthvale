import { describe, expect, it } from "vitest";
import {
  CITY_HUB_VISUAL,
  CITY_PLAZA_LANDMARK_CUE,
  CITY_SCARCE_STATION_BUSY_CUE,
  CITY_SCARCE_STATION_FREE_CUE,
  CITY_SCARCE_YARD_ATMOSPHERE_CUE,
  cityScarceYardAtmosphereCue,
  cityScarceYardAtmosphereEmissiveIntensity,
  cityScarceYardAtmosphereHazeOpacity,
  cityScarceYardAtmospherePulseEnvelope,
  cityScarceYardAtmosphereVsBusyPadContrast,
  cityScarceYardAtmosphereVsFloorContrast,
  cityScarceYardAtmosphereVsFreePadContrast,
  isStationContendedByPresence,
  CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED,
} from "@game/shared";

/**
 * PL177.2 — City scarce-yard soft atmosphere leftover.
 * Choice: quiet warm pulsing mist over existing scarce yard floor while on City
 * (complements station landmarks + Free/Busy pads; contention unchanged).
 */
describe("CityLands PL177.2 city scarce-yard soft atmosphere leftover", () => {
  it("pulses quiet warm yard mist while on City (happy)", () => {
    const cue = cityScarceYardAtmosphereCue("city");
    expect(cue.show).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_SCARCE_YARD_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED ? CITY_SCARCE_YARD_ATMOSPHERE_CUE.intensityBase : 0);
    expect(cue.hazeOpacity).toBe(
      CITY_SCARCE_STATION_FLOOR_CHROME_ENABLED
        ? CITY_SCARCE_YARD_ATMOSPHERE_CUE.hazeOpacityBase
        : 0,
    );
    expect(cue.hazeWidth).toBe(CITY_SCARCE_YARD_ATMOSPHERE_CUE.hazeWidth);
    expect(cue.hazeDepth).toBe(CITY_SCARCE_YARD_ATMOSPHERE_CUE.hazeDepth);
    expect(cue.yardCenterX).toBe(CITY_SCARCE_YARD_ATMOSPHERE_CUE.yardCenterX);
    expect(cue.yardCenterZ).toBe(CITY_SCARCE_YARD_ATMOSPHERE_CUE.yardCenterZ);

    const peak = cityScarceYardAtmosphereEmissiveIntensity(1);
    const floor = cityScarceYardAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(CITY_SCARCE_YARD_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(CITY_SCARCE_YARD_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityScarceYardAtmosphereHazeOpacity(1);
    const hazeFloor = cityScarceYardAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; mist ≠ floor / Free / Busy (edge)", () => {
    expect(cityScarceYardAtmosphereCue("warrior").show).toBe(false);
    expect(cityScarceYardAtmosphereCue("explore").show).toBe(false);
    expect(cityScarceYardAtmosphereCue("player_land").show).toBe(false);
    expect(cityScarceYardAtmosphereCue(null).show).toBe(false);
    expect(cityScarceYardAtmosphereCue("").show).toBe(false);
    expect(cityScarceYardAtmosphereCue("warrior").intensity).toBe(0);
    expect(cityScarceYardAtmosphereCue("warrior").hazeOpacity).toBe(0);

    expect(cityScarceYardAtmosphereVsFloorContrast()).toBeGreaterThan(0);
    expect(cityScarceYardAtmosphereVsFreePadContrast()).toBeGreaterThan(0);
    expect(cityScarceYardAtmosphereVsBusyPadContrast()).toBeGreaterThan(0);
    expect(CITY_SCARCE_YARD_ATMOSPHERE_CUE.hazeColor.toLowerCase()).not.toBe(
      CITY_HUB_VISUAL.scarceYardColor.toLowerCase(),
    );
    expect(CITY_SCARCE_YARD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_SCARCE_STATION_FREE_CUE.padColor.toLowerCase(),
    );
    expect(CITY_SCARCE_YARD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_SCARCE_STATION_BUSY_CUE.padColor.toLowerCase(),
    );
    expect(CITY_SCARCE_YARD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_PLAZA_LANDMARK_CUE.emissive.toLowerCase(),
    );

    const low = cityScarceYardAtmospherePulseEnvelope(0);
    const mid = cityScarceYardAtmospherePulseEnvelope(
      CITY_SCARCE_YARD_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent contention or NFT combat (failure)", () => {
    expect(CITY_HUB_VISUAL.scarceYardColor).toBe("#9a7a58");
    expect(CITY_SCARCE_STATION_FREE_CUE.worldLabel).toBe("Free");
    expect(CITY_SCARCE_STATION_BUSY_CUE.worldLabel).toBe("Busy");
    expect(isStationContendedByPresence(0, 0, [])).toBe(false);
    expect(
      isStationContendedByPresence(0, 0, [{ x: 0, z: 0 }]),
    ).toBe(true);
    expect(cityScarceYardAtmosphereEmissiveIntensity(2)).toBe(
      CITY_SCARCE_YARD_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(cityScarceYardAtmosphereEmissiveIntensity(-1)).toBe(
      CITY_SCARCE_YARD_ATMOSPHERE_CUE.intensityBase,
    );
    expect(cityScarceYardAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_SCARCE_YARD_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(
      1,
    );
    expect(String(CITY_SCARCE_YARD_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|recipe|xp|damage/i,
    );
    expect(CITY_SCARCE_YARD_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
  });
});
