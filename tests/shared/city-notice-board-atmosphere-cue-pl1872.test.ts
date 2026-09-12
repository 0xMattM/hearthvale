import { describe, expect, it } from "vitest";
import {
  CITY_HUB_VISUAL,
  CITY_NOTICE_BOARD_ATMOSPHERE_CUE,
  CITY_NOTICE_BOARD_LANDMARK_CUE,
  CITY_PLAZA_LANDMARK_CUE,
  NOTICE_UNREAD_WORLD_CUE,
  cityNoticeBoardAtmosphereCue,
  cityNoticeBoardAtmosphereEmissiveIntensity,
  cityNoticeBoardAtmosphereHazeOpacity,
  cityNoticeBoardAtmospherePulseEnvelope,
  cityNoticeBoardAtmosphereVsCivicPadContrast,
  cityNoticeBoardAtmosphereVsLandmarkContrast,
  cityNoticeBoardAtmosphereVsPlazaContrast,
  cityNoticeBoardAtmosphereVsUnreadContrast,
  cityNoticeTipIds,
} from "@game/shared";

/**
 * PL187.2 — City notice soft atmosphere leftover.
 * Choice: quiet cool pulsing civic mist over existing notice board pad while on
 * City (complements board landmark PL153.2 + unread flicker; tip ids unchanged).
 */
describe("CityLands PL187.2 city notice soft atmosphere leftover", () => {
  it("pulses quiet cool civic mist while on City (happy)", () => {
    const cue = cityNoticeBoardAtmosphereCue("city");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_NOTICE_BOARD_ATMOSPHERE_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_NOTICE_BOARD_ATMOSPHERE_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(
      CITY_NOTICE_BOARD_ATMOSPHERE_CUE.hazeOpacityBase,
    );
    expect(cue.hazeRadius).toBe(CITY_NOTICE_BOARD_ATMOSPHERE_CUE.hazeRadius);
    expect(cue.hazeY).toBe(CITY_NOTICE_BOARD_ATMOSPHERE_CUE.hazeY);

    const peak = cityNoticeBoardAtmosphereEmissiveIntensity(1);
    const floor = cityNoticeBoardAtmosphereEmissiveIntensity(0);
    expect(peak).toBe(CITY_NOTICE_BOARD_ATMOSPHERE_CUE.intensityPeak);
    expect(floor).toBe(CITY_NOTICE_BOARD_ATMOSPHERE_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityNoticeBoardAtmosphereHazeOpacity(1);
    const hazeFloor = cityNoticeBoardAtmosphereHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; mist ≠ landmark / unread / plaza / pad (edge)", () => {
    expect(cityNoticeBoardAtmosphereCue("warrior").show).toBe(false);
    expect(cityNoticeBoardAtmosphereCue("explore").show).toBe(false);
    expect(cityNoticeBoardAtmosphereCue("player_land").show).toBe(false);
    expect(cityNoticeBoardAtmosphereCue(null).show).toBe(false);
    expect(cityNoticeBoardAtmosphereCue("").show).toBe(false);
    expect(cityNoticeBoardAtmosphereCue("warrior").intensity).toBe(0);
    expect(cityNoticeBoardAtmosphereCue("warrior").hazeOpacity).toBe(0);

    expect(cityNoticeBoardAtmosphereVsLandmarkContrast()).toBeGreaterThan(0);
    expect(cityNoticeBoardAtmosphereVsUnreadContrast()).toBeGreaterThan(0);
    expect(cityNoticeBoardAtmosphereVsPlazaContrast()).toBeGreaterThan(0);
    expect(cityNoticeBoardAtmosphereVsCivicPadContrast()).toBeGreaterThan(0);
    expect(CITY_NOTICE_BOARD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_NOTICE_BOARD_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(CITY_NOTICE_BOARD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      NOTICE_UNREAD_WORLD_CUE.haloColor.toLowerCase(),
    );
    expect(CITY_NOTICE_BOARD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_PLAZA_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(CITY_NOTICE_BOARD_ATMOSPHERE_CUE.emissive.toLowerCase()).not.toBe(
      CITY_HUB_VISUAL.civicPadColor.toLowerCase(),
    );

    // Wider / slower / quieter leftover mist vs notice landmark disc.
    expect(CITY_NOTICE_BOARD_ATMOSPHERE_CUE.hazeRadius).toBeGreaterThan(
      CITY_NOTICE_BOARD_LANDMARK_CUE.hazeRadius,
    );
    expect(CITY_NOTICE_BOARD_ATMOSPHERE_CUE.pulsePeriodMs).toBeGreaterThan(
      CITY_NOTICE_BOARD_LANDMARK_CUE.pulsePeriodMs,
    );
    expect(CITY_NOTICE_BOARD_ATMOSPHERE_CUE.intensityPeak).toBeLessThan(
      CITY_NOTICE_BOARD_LANDMARK_CUE.intensityPeak,
    );

    const low = cityNoticeBoardAtmospherePulseEnvelope(0);
    const mid = cityNoticeBoardAtmospherePulseEnvelope(
      CITY_NOTICE_BOARD_ATMOSPHERE_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent tip ids or NFT combat (failure)", () => {
    const tipIds = cityNoticeTipIds();
    expect(tipIds.length).toBeGreaterThan(0);

    expect(cityNoticeBoardAtmosphereEmissiveIntensity(2)).toBe(
      CITY_NOTICE_BOARD_ATMOSPHERE_CUE.intensityPeak,
    );
    expect(cityNoticeBoardAtmosphereEmissiveIntensity(-1)).toBe(
      CITY_NOTICE_BOARD_ATMOSPHERE_CUE.intensityBase,
    );
    expect(cityNoticeBoardAtmospherePulseEnvelope(Number.NaN)).toBe(0);
    expect(
      CITY_NOTICE_BOARD_ATMOSPHERE_CUE.hazeOpacityPeak,
    ).toBeLessThanOrEqual(1);
    expect(CITY_NOTICE_BOARD_ATMOSPHERE_CUE.intensityPeak).toBeLessThanOrEqual(
      1,
    );
    expect(CITY_NOTICE_BOARD_ATMOSPHERE_CUE.hazeRadius).toBeLessThanOrEqual(2.5);
    expect(String(CITY_NOTICE_BOARD_ATMOSPHERE_CUE.emissive)).not.toMatch(
      /nft|combat|tip|price/i,
    );
  });
});
