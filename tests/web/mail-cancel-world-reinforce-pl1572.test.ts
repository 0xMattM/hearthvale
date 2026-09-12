import { describe, expect, it } from "vitest";

import {
  MAIL_CANCEL_WORLD_REINFORCE,
  mailCancelWorldReinforceBackground,
  shouldFlashMailCancelWorldReinforce,
} from "../../apps/web/lib/hud/mail-cancel-feedback";
import {
  MAIL_CLAIM_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/mail-claim-feedback";
import {
  MAIL_SEND_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/mail-send-feedback";
import {
  MAIL_CANCEL_SUCCESS_CUE,
  mailCancelSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL157.2 — Mail-cancel soft world reinforce.
 * Brief soft rim after mail cancel ok (complements Parcel cancelled +
 * send/claim rims PL149.1 / PL152.2). Escrow unchanged; mute ok; fail silent.
 * Choice: one-shot cool dusty parchment-ash (not another Parcel cancelled
 * toast / send gold / claim sage) so cancel stays world-readable.
 */
describe("CityLands PL157.2 mail-cancel soft world reinforce", () => {
  it("flashes quiet cool dusty parchment-ash rim when cancel succeeds (happy)", () => {
    expect(shouldFlashMailCancelWorldReinforce(true)).toBe(true);
    expect(MAIL_CANCEL_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(MAIL_CANCEL_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = mailCancelWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(MAIL_CANCEL_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Parcel cancelled ephemeral.
    expect(mailCancelSuccessCueText()).toBe(MAIL_CANCEL_SUCCESS_CUE);
    expect(mailCancelSuccessCueText()).toBe("Parcel cancelled");
  });

  it("stays quiet on fail; rim ≠ send parchment / claim sage (edge)", () => {
    expect(shouldFlashMailCancelWorldReinforce(false)).toBe(false);

    expect(MAIL_CANCEL_WORLD_REINFORCE.outerRgba).not.toBe(
      MAIL_SEND_WORLD_REINFORCE.outerRgba,
    );
    expect(MAIL_CANCEL_WORLD_REINFORCE.midRgba).not.toBe(
      MAIL_SEND_WORLD_REINFORCE.midRgba,
    );
    expect(MAIL_CANCEL_WORLD_REINFORCE.outerRgba).not.toBe(
      MAIL_CLAIM_WORLD_REINFORCE.outerRgba,
    );
    expect(MAIL_CANCEL_WORLD_REINFORCE.midRgba).not.toBe(
      MAIL_CLAIM_WORLD_REINFORCE.midRgba,
    );
    expect(MAIL_CANCEL_WORLD_REINFORCE.clearPct).toBeLessThan(
      MAIL_CANCEL_WORLD_REINFORCE.midPct,
    );
    expect(MAIL_CANCEL_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent escrow / NFT combat; keeps ok gate (failure)", () => {
    expect(mailCancelWorldReinforceBackground()).not.toMatch(
      /escrow\s*change|always.?on|nft/i,
    );
    expect(String(MAIL_CANCEL_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(MAIL_CANCEL_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashMailCancelWorldReinforce(true)).not.toBe(
      shouldFlashMailCancelWorldReinforce(false),
    );
  });
});
