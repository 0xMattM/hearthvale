import { describe, expect, it } from "vitest";
import { NOTICE_UNREAD_WORLD_CUE } from "../../packages/shared/src/catalog";
import {
  NOTICE_UNREAD_CLOSED_GLANCE,
  countUnreadNoticeTips,
  noticeUnreadClosedGlanceLabel,
  shouldShowNoticeUnreadClosedGlance,
} from "../../apps/web/lib/hud/notice-unread-closed-glance";

/**
 * PL197.2 — Notice-unread closed glance leftover.
 * Choice: quiet TopBar Notice chip while unread tip ids pending and Notice
 * panel closed (complements unread flicker + open accent; no notice column).
 * Tip ids SoT unchanged.
 */
describe("CityLands PL197.2 notice-unread closed glance leftover", () => {
  const tips = ["tip-a", "tip-b"];

  it("shows quiet Notice chip while unread tips pending and Notice closed (happy)", () => {
    expect(shouldShowNoticeUnreadClosedGlance([], false, tips)).toBe(true);
    expect(noticeUnreadClosedGlanceLabel([], tips)).toBe("Notice · 2");
    expect(noticeUnreadClosedGlanceLabel(["tip-a"], tips)).toBe("Notice");
    expect(countUnreadNoticeTips([], tips)).toBe(2);
    expect(countUnreadNoticeTips(["tip-a"], tips)).toBe(1);

    expect(NOTICE_UNREAD_CLOSED_GLANCE.word).toBe("Notice");
    expect(NOTICE_UNREAD_CLOSED_GLANCE.borderColor).toBe(
      NOTICE_UNREAD_WORLD_CUE.labelBorder,
    );
    expect(NOTICE_UNREAD_CLOSED_GLANCE.textColor).toBe(
      NOTICE_UNREAD_WORLD_CUE.haloColor,
    );
    expect(NOTICE_UNREAD_CLOSED_GLANCE.className).toBe("topbar-notice-glance");
  });

  it("clears when all tips seen or Notice panel open (edge)", () => {
    expect(shouldShowNoticeUnreadClosedGlance(tips, false, tips)).toBe(false);
    expect(shouldShowNoticeUnreadClosedGlance([], true, tips)).toBe(false);
    expect(noticeUnreadClosedGlanceLabel(tips, tips)).toBe("");
    expect(countUnreadNoticeTips(tips, tips)).toBe(0);
    expect(shouldShowNoticeUnreadClosedGlance([], false, [])).toBe(false);
  });

  it("does not invent notice column or change tip ids (failure)", () => {
    expect(NOTICE_UNREAD_CLOSED_GLANCE.className).not.toMatch(
      /column|hud-notice-column|always-on/i,
    );
    expect(noticeUnreadClosedGlanceLabel([], tips)).not.toMatch(/nft|combat/i);
    expect(shouldShowNoticeUnreadClosedGlance([], false, tips)).not.toBe(
      shouldShowNoticeUnreadClosedGlance([], true, tips),
    );
    expect(String(NOTICE_UNREAD_CLOSED_GLANCE.word)).not.toMatch(
      /toast|stack|fare/i,
    );
    // Walk-up board — chip must not claim Travel hotkey N.
    expect(noticeUnreadClosedGlanceLabel(["tip-a"], tips)).not.toMatch(
      /^N\s*·/,
    );
  });
});
