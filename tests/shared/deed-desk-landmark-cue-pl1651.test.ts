import { describe, expect, it } from "vitest";
import {
  CITY_BUILDINGS,
  CITY_DEED_DESK_LANDMARK_CUE,
  CITY_HUB_VISUAL,
  CITY_NOTICE_BOARD_LANDMARK_CUE,
  CITY_PLAZA_LANDMARK_CUE,
  LAND_DEED,
  cityDeedDeskLandmarkCue,
  cityDeedDeskLandmarkEmissiveIntensity,
  cityDeedDeskLandmarkHazeOpacity,
  cityDeedDeskLandmarkPulseEnvelope,
  cityDeedDeskLandmarkVsNoticeContrast,
  cityDeedDeskLandmarkVsPlazaContrast,
  cityDeedDeskLandmarkVsScarceYardContrast,
} from "@game/shared";

/**
 * PL165.1 — Deed-desk soft landmark cue leftover.
 * Choice: add a civic atmosphere deed desk (no BuildingType) with quiet cool
 * system-slate haze/emissive on City so the B / CreditcoinPanel wallet path reads in
 * the hub — complements open accent PL55.2; wallet path unchanged; no NFT combat.
 */
describe("CityLands PL165.1 deed-desk soft landmark cue leftover", () => {
  it("pulses cool system-slate haze on City deed desk (happy)", () => {
    const cue = cityDeedDeskLandmarkCue("city");
    expect(cue.show).toBe(true);
    expect(cue.emissive.toLowerCase()).toBe(
      CITY_DEED_DESK_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(cue.intensity).toBe(CITY_DEED_DESK_LANDMARK_CUE.intensityBase);
    expect(cue.hazeOpacity).toBe(CITY_DEED_DESK_LANDMARK_CUE.hazeOpacityBase);
    expect(cue.hazeRadius).toBe(CITY_DEED_DESK_LANDMARK_CUE.hazeRadius);
    expect(cue.deskX).toBe(CITY_DEED_DESK_LANDMARK_CUE.deskX);
    expect(cue.deskZ).toBe(CITY_DEED_DESK_LANDMARK_CUE.deskZ);
    expect(cue.worldLabel).toBe(CITY_DEED_DESK_LANDMARK_CUE.worldLabel);
    expect(cue.worldLabel).toMatch(/deed/i);
    expect(cue.worldLabel).toMatch(/B/);

    const peak = cityDeedDeskLandmarkEmissiveIntensity(1);
    const floor = cityDeedDeskLandmarkEmissiveIntensity(0);
    expect(peak).toBe(CITY_DEED_DESK_LANDMARK_CUE.intensityPeak);
    expect(floor).toBe(CITY_DEED_DESK_LANDMARK_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);

    const hazePeak = cityDeedDeskLandmarkHazeOpacity(1);
    const hazeFloor = cityDeedDeskLandmarkHazeOpacity(0);
    expect(hazePeak).toBeGreaterThan(hazeFloor);
  });

  it("stays quiet off City; slate ≠ notice / plaza / scarce (edge)", () => {
    expect(cityDeedDeskLandmarkCue("explore").show).toBe(false);
    expect(cityDeedDeskLandmarkCue("player_land").show).toBe(false);
    expect(cityDeedDeskLandmarkCue("warrior").show).toBe(false);
    expect(cityDeedDeskLandmarkCue("explore").intensity).toBe(0);
    expect(cityDeedDeskLandmarkCue("explore").hazeOpacity).toBe(0);

    expect(cityDeedDeskLandmarkVsNoticeContrast()).toBeGreaterThan(0);
    expect(cityDeedDeskLandmarkVsPlazaContrast()).toBeGreaterThan(0);
    expect(cityDeedDeskLandmarkVsScarceYardContrast()).toBeGreaterThan(40);
    expect(CITY_DEED_DESK_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_NOTICE_BOARD_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(CITY_DEED_DESK_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_PLAZA_LANDMARK_CUE.emissive.toLowerCase(),
    );
    expect(CITY_DEED_DESK_LANDMARK_CUE.emissive.toLowerCase()).not.toBe(
      CITY_HUB_VISUAL.scarceYardColor.toLowerCase(),
    );

    const low = cityDeedDeskLandmarkPulseEnvelope(0);
    const mid = cityDeedDeskLandmarkPulseEnvelope(
      CITY_DEED_DESK_LANDMARK_CUE.pulsePeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(mid).toBeGreaterThan(low);
  });

  it("does not invent BuildingType / NFT combat; clamps stay soft (failure)", () => {
    expect(
      CITY_BUILDINGS.some((b) => (b.type as string) === "deed_desk"),
    ).toBe(false);
    expect(LAND_DEED.disclaimer.toLowerCase()).toMatch(
      /cosmetic|optional|not|combat|power|gate/,
    );

    expect(cityDeedDeskLandmarkEmissiveIntensity(2)).toBe(
      CITY_DEED_DESK_LANDMARK_CUE.intensityPeak,
    );
    expect(cityDeedDeskLandmarkEmissiveIntensity(-1)).toBe(
      CITY_DEED_DESK_LANDMARK_CUE.intensityBase,
    );
    expect(cityDeedDeskLandmarkPulseEnvelope(Number.NaN)).toBe(0);
    expect(CITY_DEED_DESK_LANDMARK_CUE.hazeOpacityPeak).toBeLessThanOrEqual(1);
    expect(String(CITY_DEED_DESK_LANDMARK_CUE.emissive)).not.toMatch(
      /nft|combat/i,
    );
    expect(CITY_DEED_DESK_LANDMARK_CUE.intensityPeak).toBeLessThanOrEqual(
      CITY_PLAZA_LANDMARK_CUE.intensityPeak,
    );
  });
});
