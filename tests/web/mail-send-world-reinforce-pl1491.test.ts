import { describe, expect, it } from "vitest";
import {
  MAIL_SEND_WORLD_REINFORCE,
  mailSendWorldReinforceBackground,
  shouldFlashMailSendWorldReinforce,
} from "../../apps/web/lib/hud/mail-send-feedback";
import {
  CHAT_SEND_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/chat-send-feedback";
import {
  COINS_GAIN_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/coins-gain-feedback";
import {
  INVITE_ACCEPT_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/invite-accept-feedback";
import {
  MAIL_SEND_SUCCESS_CUE,
  mailSendSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL149.1 — Mail-send soft world reinforce.
 * Brief soft rim after mail send ok (complements Parcel sent PL28.2 +
 * mail pending glance PL133.1). Escrow unchanged; mute ok; fail silent.
 * Choice: one-shot warm parchment rim (not another Sent toast / mail column)
 * so send stays world-readable beside the existing ephemeral.
 */
describe("CityLands PL149.1 mail-send soft world reinforce", () => {
  it("flashes quiet warm parchment rim when mail send succeeds (happy)", () => {
    expect(shouldFlashMailSendWorldReinforce(true)).toBe(true);
    expect(MAIL_SEND_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(MAIL_SEND_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = mailSendWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(MAIL_SEND_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Parcel sent ephemeral.
    expect(mailSendSuccessCueText()).toBe(MAIL_SEND_SUCCESS_CUE);
    expect(mailSendSuccessCueText()).toBe("Parcel sent");
  });

  it("stays quiet on fail; rim ≠ coins / chat / invite (edge)", () => {
    expect(shouldFlashMailSendWorldReinforce(false)).toBe(false);

    expect(MAIL_SEND_WORLD_REINFORCE.outerRgba).not.toBe(
      COINS_GAIN_WORLD_REINFORCE.outerRgba,
    );
    expect(MAIL_SEND_WORLD_REINFORCE.outerRgba).not.toBe(
      CHAT_SEND_WORLD_REINFORCE.outerRgba,
    );
    expect(MAIL_SEND_WORLD_REINFORCE.outerRgba).not.toBe(
      INVITE_ACCEPT_WORLD_REINFORCE.outerRgba,
    );
    expect(MAIL_SEND_WORLD_REINFORCE.clearPct).toBeLessThan(
      MAIL_SEND_WORLD_REINFORCE.midPct,
    );
    expect(MAIL_SEND_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent mail columns; keeps ok gate (failure)", () => {
    expect(mailSendWorldReinforceBackground()).not.toMatch(
      /mail\s*column|always.?on|escrow\s*change|nft/i,
    );
    expect(String(MAIL_SEND_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(MAIL_SEND_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashMailSendWorldReinforce(true)).not.toBe(
      shouldFlashMailSendWorldReinforce(false),
    );
  });
});
