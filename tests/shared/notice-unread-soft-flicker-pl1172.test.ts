import { describe, expect, it } from "vitest";
import {
  NOTICE_UNREAD_WORLD_CUE,
  cityNoticeTipIds,
  hasUnreadNoticeTips,
  noticeUnreadFlickerEnvelope,
  noticeUnreadPlaqueEmissiveIntensity,
} from "@game/shared";

/**
 * PL117.2 — Notice-board unread soft flicker.
 * Choice: continuous soft sine on plaque emissive while tips unread (PL17.1 New
 * accent stays); tip ids / localStorage unchanged; min HUD.
 */
describe("CityLands PL117.2 notice unread soft flicker", () => {
  it("flickers plaque intensity while unread (happy)", () => {
    expect(NOTICE_UNREAD_WORLD_CUE.flickerPeriodMs).toBeGreaterThan(0);
    expect(NOTICE_UNREAD_WORLD_CUE.intensityPeak).toBeGreaterThan(
      NOTICE_UNREAD_WORLD_CUE.intensityBase,
    );

    const low = noticeUnreadFlickerEnvelope(0);
    const mid = noticeUnreadFlickerEnvelope(
      NOTICE_UNREAD_WORLD_CUE.flickerPeriodMs / 4,
    );
    expect(low).toBeGreaterThanOrEqual(0);
    expect(low).toBeLessThanOrEqual(1);
    expect(mid).toBeGreaterThan(low);

    const peak = noticeUnreadPlaqueEmissiveIntensity(true, 1);
    const floor = noticeUnreadPlaqueEmissiveIntensity(true, 0);
    expect(peak).toBe(NOTICE_UNREAD_WORLD_CUE.intensityPeak);
    expect(floor).toBe(NOTICE_UNREAD_WORLD_CUE.intensityBase);
    expect(peak).toBeGreaterThan(floor);
  });

  it("stays quiet when tips are read; tip ids unchanged (edge)", () => {
    const tipIds = cityNoticeTipIds();
    expect(tipIds.length).toBeGreaterThan(0);
    expect(hasUnreadNoticeTips(tipIds)).toBe(false);
    expect(noticeUnreadPlaqueEmissiveIntensity(false, 1)).toBe(0);
    expect(noticeUnreadPlaqueEmissiveIntensity(false, 0.5)).toBe(0);
    expect(NOTICE_UNREAD_WORLD_CUE.worldLabel).toBe("New");
  });

  it("clamps envelope and keeps unread gate (failure)", () => {
    expect(noticeUnreadPlaqueEmissiveIntensity(true, 2)).toBe(
      NOTICE_UNREAD_WORLD_CUE.intensityPeak,
    );
    expect(noticeUnreadPlaqueEmissiveIntensity(true, -1)).toBe(
      NOTICE_UNREAD_WORLD_CUE.intensityBase,
    );
    expect(noticeUnreadFlickerEnvelope(Number.NaN)).toBe(0);
    expect(hasUnreadNoticeTips([])).toBe(true);
    expect(NOTICE_UNREAD_WORLD_CUE.padColor.length).toBeGreaterThan(0);
  });
});
