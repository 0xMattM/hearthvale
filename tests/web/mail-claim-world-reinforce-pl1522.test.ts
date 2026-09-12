import { describe, expect, it } from "vitest";
import {
  MAIL_CLAIM_WORLD_REINFORCE,
  mailClaimWorldReinforceBackground,
  shouldFlashMailClaimWorldReinforce,
} from "../../apps/web/lib/hud/mail-claim-feedback";
import {
  MAIL_SEND_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/mail-send-feedback";
import {
  MAIL_CLAIM_SUCCESS_CUE,
  mailClaimSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL152.2 — Mail-claim soft world reinforce.
 * Brief soft rim after mail claim ok (complements Parcel claimed PL17.2 +
 * send rim PL149.1). Escrow unchanged; mute ok; fail silent.
 * Choice: one-shot cool sage-parchment rim (not another Parcel claimed toast)
 * so claim stays world-readable beside send parchment-gold.
 */
describe("CityLands PL152.2 mail-claim soft world reinforce", () => {
  it("flashes quiet cool sage-parchment rim when claim succeeds (happy)", () => {
    expect(shouldFlashMailClaimWorldReinforce(true)).toBe(true);
    expect(MAIL_CLAIM_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(MAIL_CLAIM_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = mailClaimWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(MAIL_CLAIM_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Parcel claimed ephemeral.
    expect(mailClaimSuccessCueText()).toBe(MAIL_CLAIM_SUCCESS_CUE);
    expect(mailClaimSuccessCueText()).toBe("Parcel claimed");
  });

  it("stays quiet on fail; rim ≠ send parchment-gold (edge)", () => {
    expect(shouldFlashMailClaimWorldReinforce(false)).toBe(false);

    expect(MAIL_CLAIM_WORLD_REINFORCE.outerRgba).not.toBe(
      MAIL_SEND_WORLD_REINFORCE.outerRgba,
    );
    expect(MAIL_CLAIM_WORLD_REINFORCE.midRgba).not.toBe(
      MAIL_SEND_WORLD_REINFORCE.midRgba,
    );
    expect(MAIL_CLAIM_WORLD_REINFORCE.clearPct).toBeLessThan(
      MAIL_CLAIM_WORLD_REINFORCE.midPct,
    );
    expect(MAIL_CLAIM_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent escrow / NFT combat; keeps ok gate (failure)", () => {
    expect(mailClaimWorldReinforceBackground()).not.toMatch(
      /escrow\s*invent|always.?on|nft/i,
    );
    expect(String(MAIL_CLAIM_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(MAIL_CLAIM_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashMailClaimWorldReinforce(true)).not.toBe(
      shouldFlashMailClaimWorldReinforce(false),
    );
  });
});
