import { describe, expect, it } from "vitest";
import {
  CITY_BUILDINGS,
  CITY_DEED_DESK_ATMOSPHERE_CUE,
  CITY_DEED_DESK_LANDMARK_CUE,
  CITY_NOTICE_BOARD_ATMOSPHERE_CUE,
  CITY_PLAZA_LANDMARK_CUE,
  LAND_DEED,
  cityDeedDeskAtmosphereCue,
  cityDeedDeskAtmosphereEmissiveIntensity,
  cityDeedDeskAtmosphereHazeOpacity,
  cityDeedDeskAtmospherePulseEnvelope,
  cityDeedDeskAtmosphereVsLandmarkContrast,
  cityDeedDeskAtmosphereVsNoticeAtmosphereContrast,
  cityDeedDeskAtmosphereVsPlazaContrast,
} from "@game/shared";

/**
 * PL199.1 — Deed-desk soft atmosphere leftover.
 * Choice: quiet cool pulsing civic mist over existing deed desk while on City
 * (complements desk landmark PL165.1 + mint/link rims; stub path SoT; no NFT combat).
 * Landmark system-slate stays identity rim — distinct wider/slower/quieter leftover.
 */
describe("CityLands PL199.1 deed-desk soft atmosphere leftover", () => {
  it("pulses quiet cool civic mist while on City (happy)", () => {
    const cue = cityDeedDeskAtmosphereCue("city");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_DEED_DESK_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_DEED_DESK_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(CITY_DEED_DESK_ATMOSPHERE_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(CITY_DEED_DESK_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(CITY_DEED_DESK_ATMOSPHERE_CUE.hazeY);

    const peak = cityDeedDeskAtmosphereEmissiveIntensity(1);
    const floor = cityDeedDeskAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(CITY_DEED_DESK_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(CITY_DEED_DESK_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityDeedDeskAtmosphereHazeOpacity(1);
    const hazeFloor = cityDeedDeskAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; mist ≠ landmark / notice / plaza (edge)", () => {
    expect(cityDeedDeskAtmosphereCue("player_land").show).toBe(false);
    expect(cityDeedDeskAtmosphereCue("explore").show).toBe(false);
    expect(cityDeedDeskAtmosphereCue("warrior").show).toBe(false);
    expect(cityDeedDeskAtmosphereCue(null).show).toBe(false);
    expect(cityDeedDeskAtmosphereCue("").show).toBe(false);
    expect(cityDeedDeskAtmosphereCue("player_land").intensity).toBe(0);
    expect(cityDeedDeskAtmosphereCue("player_land").hazeOpacity).toBe(0);

    expect(cityDeedDeskAtmosphereVsLandmarkContrast()).toBeGreaterThan(0);
    expect(cityDeedDeskAtmosphereVsNoticeAtmosphereContrast()).toBeGreaterThan(
      0,
    );
    expect(cityDeedDeskAtmosphereVsPlazaContrast()).toBeGreaterThan(0);
    expect(CITY_DEED_DESK_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_DEED_DESK_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(CITY_DEED_DESK_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_NOTICE_BOARD_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(CITY_DEED_DESK_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_PLAZA_LANDMARK_CUE.emissive.toLowerCase(),
    );

    // Wider / slower / quieter leftover mist vs deed landmark disc.
    expect(CITY_DEED_DESK_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      CITY_DEED_DESK_LANDMARK_CUE.hazeRadius,
    );
    expect(CITY_DEED_DESK_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      CITY_DEED_DESK_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(CITY_DEED_DESK_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      CITY_DEED_DESK_LANDMARK_CUE.intensityPeak,
    );

    const low = cityDeedDeskAtmospherePulseEnvelope(0);
    const mid = cityDeedDeskAtmospherePulseEnvelope(
      CITY_DEED_DESK_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent BuildingType / NFT combat; stub path SoT (failure)", () => {
    expect(
      CITY_BUILDINGS.some((b) => (b.type as string) === "deed_desk"),
    ).toBe(false);
    expect(LAND_DEED.disclaimer.toLowerCase()).toMatch(
      /cosmetic|optional|not|combat|power|gate/,
    );
    expect(LAND_DEED.disclaimer.toLowerCase()).toMatch(/mint|stub|mock/);

    expect(cityDeedDeskAtmosphereEmissiveIntensity(2)).toBe(
      CITY_DEED_DESK_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(cityDeedDeskAtmosphereEmissiveIntensity(-1)).toBe(
      CITY_DEED_DESK_ATMOSPHERE_CUE.intensityBase,
    );
    expect(cityDeedDeskAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_DEED_DESK_ATMOSPHERE_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(CITY_DEED_DESK_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(1);
    expect(CITY_DEED_DESK_ATMOSPHERE_CUE.hazeRadius).toBeLessThanOrEqual(2.5);
    expect(String(CITY_DEED_DESK_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|fare|recipe|yield/i,
    );
  });
});
