import { describe, expect, it } from "vitest";
import {
  CITY_BUILDINGS,
  CITY_HUB_VISUAL,
  CITY_NOTICE_BOARD_LANDMARK_CUE,
  CITY_PLAZA_LANDMARK_CUE,
  NOTICE_UNREAD_WORLD_CUE,
  cityNoticeBoardLandmarkCue,
  cityNoticeBoardLandmarkEmissiveIntensity,
  cityNoticeBoardLandmarkHazeOpacity,
  cityNoticeBoardLandmarkPulseEnvelope,
  cityNoticeBoardLandmarkVsCivicPadContrast,
  cityNoticeBoardLandmarkVsPlazaContrast,
  cityNoticeBoardLandmarkVsUnreadContrast,
  cityNoticeTipIds,
} from "@game/shared";

/**
 * PL153.2 — Notice-board soft landmark cue.
 * Choice: quiet cool civic haze/emissive on the existing city notice_board so
 * hub notices read at glance (complements unread flicker PL117.2 + tip PL36.1);
 * layouts / tip ids unchanged; no board invent.
 */
describe("CityLands PL153.2 notice-board soft landmark cue", () => {
  it("pulses cool civic haze on City notice board (happy)", () => {
    const cue = cityNoticeBoardLandmarkCue("city");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_NOTICE_BOARD_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_NOTICE_BOARD_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(CITY_NOTICE_BOARD_LANDMARK_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(CITY_NOTICE_BOARD_LANDMARK_CUE.hazeRadius);

    const peak = cityNoticeBoardLandmarkEmissiveIntensity(1);
    const floor = cityNoticeBoardLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_NOTICE_BOARD_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_NOTICE_BOARD_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityNoticeBoardLandmarkHazeOpacity(1);
    const hazeFloor = cityNoticeBoardLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; cool slate ≠ unread gold / plaza / pad alone (edge)", () => {
    expect(cityNoticeBoardLandmarkCue("explore").show).toBe(false);
    expect(cityNoticeBoardLandmarkCue("player_land").show).toBe(false);
    expect(cityNoticeBoardLandmarkCue("warrior").show).toBe(false);
    expect(cityNoticeBoardLandmarkCue("explore").intensity).toBe(0);
    expect(cityNoticeBoardLandmarkCue("explore").hazeOpacity).toBe(0);

    expect(cityNoticeBoardLandmarkVsUnreadContrast()).toBeGreaterThan(0);
    expect(cityNoticeBoardLandmarkVsPlazaContrast()).toBeGreaterThan(0);
    expect(cityNoticeBoardLandmarkVsCivicPadContrast()).toBeGreaterThan(0);
    expect(CITY_NOTICE_BOARD_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      NOTICE_UNREAD_WORLD_CUE.haloColor.toLowerCase(),
    );
    expect(CITY_NOTICE_BOARD_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_PLAZA_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(CITY_NOTICE_BOARD_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_HUB_VISUAL.civicPadColor.toLowerCase(),
    );

    const low = cityNoticeBoardLandmarkPulseEnvelope(0);
    const mid = cityNoticeBoardLandmarkPulseEnvelope(
      CITY_NOTICE_BOARD_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent boards or change tip ids (failure)", () => {
    expect(CITY_BUILDINGS.some((b) => b.type === "notice_board")).toBe(true);
    expect(
      CITY_BUILDINGS.filter((b) => b.type === "notice_board"),
    ).toHaveLength(1);

    const tipIds = cityNoticeTipIds();
    expect(tipIds.length).toBeGreaterThan(0);
    expect(tipIds).toContain("travel_circuit");

    expect(cityNoticeBoardLandmarkEmissiveIntensity(2)).toBe(
      CITY_NOTICE_BOARD_LANDMARK_CUE.intensityPeak,
    );
    expect(cityNoticeBoardLandmarkEmissiveIntensity(-1)).toBe(
      CITY_NOTICE_BOARD_LANDMARK_CUE.intensityBase,
    );
    expect(cityNoticeBoardLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_NOTICE_BOARD_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(
      1,
    );
    expect(String(CITY_NOTICE_BOARD_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat/i,
    );
  });
});
