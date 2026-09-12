import { describe, expect, it } from "vitest";
import {
  MAIL_UNREAD_PANEL_ACCENT,
  NOTICE_UNREAD_WORLD_CUE,
  UNREAD_CONTENT_PROMPT_TAG,
  cityNoticeTipIds,
  countPendingInboxMail,
  hasUnreadMailParcels,
  hasUnreadNoticeTips,
  withUnreadContentPrompt,
} from "@game/shared";

/**
 * PL17.1 — Unread mail / notice accent SoT (world + prompt helpers).
 * Choice: soft · New / warm notice pad over a TopBar mail column (min HUD).
 */
describe("CityLands PL17.1 unread mail / notice accent", () => {
  it("flags unread notice tips and pending inbox mail (happy)", () => {
    const tipIds = cityNoticeTipIds();
    expect(tipIds.length).toBeGreaterThan(0);
    expect(hasUnreadNoticeTips([])).toBe(true);
    expect(hasUnreadNoticeTips(tipIds)).toBe(false);

    const mail = [
      { direction: "inbox", status: "pending" },
      { direction: "sent", status: "pending" },
      { direction: "inbox", status: "claimed" },
    ];
    expect(countPendingInboxMail(mail)).toBe(1);
    expect(hasUnreadMailParcels(mail)).toBe(true);
    expect(withUnreadContentPrompt("City notice board", true)).toBe(
      `City notice board · ${UNREAD_CONTENT_PROMPT_TAG}`,
    );
    expect(NOTICE_UNREAD_WORLD_CUE.worldLabel).toBe("New");
    expect(NOTICE_UNREAD_WORLD_CUE.haloColor.length).toBeGreaterThan(0);
    expect(MAIL_UNREAD_PANEL_ACCENT.borderColor.length).toBeGreaterThan(0);
  });

  it("stays quiet when tips are seen and inbox is empty (edge)", () => {
    const tipIds = cityNoticeTipIds();
    expect(hasUnreadNoticeTips(tipIds, tipIds)).toBe(false);
    expect(hasUnreadMailParcels([])).toBe(false);
    expect(
      hasUnreadMailParcels([{ direction: "sent", status: "pending" }]),
    ).toBe(false);
    expect(withUnreadContentPrompt("City notice board", false)).toBe(
      "City notice board",
    );
    expect(withUnreadContentPrompt("", true)).toBe("");
  });

  it("re-arms notice unread for new tip ids; prompt tag is idempotent (failure)", () => {
    const known = cityNoticeTipIds();
    expect(hasUnreadNoticeTips(known, [...known, "brand_new_tip"])).toBe(true);
    expect(hasUnreadNoticeTips(known, ["missing_only"])).toBe(true);
    expect(hasUnreadNoticeTips(["missing_only"], known)).toBe(true);

    const once = withUnreadContentPrompt("City notice board", true);
    expect(withUnreadContentPrompt(once, true)).toBe(once);
    expect(UNREAD_CONTENT_PROMPT_TAG).toBe("New");
    expect(NOTICE_UNREAD_WORLD_CUE.worldLabel).not.toBe(
      MAIL_UNREAD_PANEL_ACCENT.headerColor,
    );
  });
});
