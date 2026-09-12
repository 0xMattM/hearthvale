import { describe, expect, it } from "vitest";
import {
  MAIL_UNREAD_PANEL_ACCENT,
  hasUnreadMailParcels,
} from "@game/shared";
import {
  MAIL_PENDING_CLOSED_GLANCE,
  mailPendingClosedGlanceLabel,
  shouldShowMailPendingClosedGlance,
} from "../../apps/web/lib/hud/mail-pending-closed-glance";

/**
 * PL133.1 — Mail-pending closed glance.
 * Soft min-HUD TopBar/L chip while inbox has pending parcels and Mail is closed
 * (complements panel unread PL17.1 + open accent PL34.1; no always-on mail column).
 * Mailbox rules unchanged; clears when inbox empty or panel open.
 * Choice: continuous quiet L · Mail chip (not a toast / not a column) so pending
 * parcels stay glanceable while walking until L opens the panel.
 */
describe("CityLands PL133.1 mail-pending closed glance", () => {
  const pending = [
    { direction: "inbox", status: "pending" },
    { direction: "sent", status: "pending" },
  ];
  const twoPending = [
    { direction: "inbox", status: "pending" },
    { direction: "inbox", status: "pending" },
  ];
  const empty = [
    { direction: "inbox", status: "claimed" },
    { direction: "sent", status: "pending" },
  ];

  it("shows quiet L · Mail chip while pending and Mail closed (happy)", () => {
    expect(hasUnreadMailParcels(pending)).toBe(true);
    expect(shouldShowMailPendingClosedGlance(pending, false)).toBe(true);
    expect(mailPendingClosedGlanceLabel(pending)).toBe("L · Mail");
    expect(mailPendingClosedGlanceLabel(twoPending)).toBe("L · Mail · 2");

    expect(MAIL_PENDING_CLOSED_GLANCE.hotkey).toBe("L");
    expect(MAIL_PENDING_CLOSED_GLANCE.word).toBe("Mail");
    expect(MAIL_PENDING_CLOSED_GLANCE.borderColor).toBe(
      MAIL_UNREAD_PANEL_ACCENT.borderColor,
    );
    expect(MAIL_PENDING_CLOSED_GLANCE.textColor).toBe(
      MAIL_UNREAD_PANEL_ACCENT.headerColor,
    );
    expect(MAIL_PENDING_CLOSED_GLANCE.className).toBe("topbar-mail-glance");
  });

  it("clears when inbox empty or Mail panel open (edge)", () => {
    expect(shouldShowMailPendingClosedGlance(empty, false)).toBe(false);
    expect(shouldShowMailPendingClosedGlance([], false)).toBe(false);
    expect(shouldShowMailPendingClosedGlance(pending, true)).toBe(false);
    expect(mailPendingClosedGlanceLabel(empty)).toBe("");
    expect(mailPendingClosedGlanceLabel([])).toBe("");
  });

  it("refuses always-on column invent; keeps mailbox SoT (failure)", () => {
    expect(MAIL_PENDING_CLOSED_GLANCE.className).not.toMatch(/column|hud-mail-column/i);
    expect(mailPendingClosedGlanceLabel(pending)).not.toMatch(/nft|combat/i);
    expect(shouldShowMailPendingClosedGlance(pending, false)).not.toBe(
      shouldShowMailPendingClosedGlance(pending, true),
    );
    // Sent-only pending does not arm the closed glance (inbox SoT).
    expect(
      shouldShowMailPendingClosedGlance(
        [{ direction: "sent", status: "pending" }],
        false,
      ),
    ).toBe(false);
  });
});
