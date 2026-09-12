import { describe, expect, it } from "vitest";
import {
  SUCCESS_CUE_MS,
  GUILD_INVITE_REFRESH_SUCCESS_CUE,
  GUILD_CREATE_SUCCESS_CUE,
  GUILD_JOIN_SUCCESS_CUE,
  GUILD_LEAVE_SUCCESS_CUE,
  isCoreSuccessCueText,
  guildInviteRefreshSuccessCueText,
  marketSuccessCueText,
  tradeOfferSentCueText,
} from "../../apps/web/lib/hud/success-cue";
import { SFX_PRESETS, sfxStepsFor } from "../../apps/web/lib/game-audio";

/**
 * PL56.3 — Guild invite refresh brief cue.
 * Ephemeral TopBar Refreshed after owner/officer regenerates invite code.
 * (PL56.1 / PL56.2 already shipped as PL28.1 Offer · / PL10.2 Cancelled.)
 */
describe("CityLands PL56.3 guild invite refresh brief cue", () => {
  it("uses short Refreshed copy + soft guild_claim SFX (happy)", () => {
    expect(guildInviteRefreshSuccessCueText()).toBe(
      GUILD_INVITE_REFRESH_SUCCESS_CUE,
    );
    expect(guildInviteRefreshSuccessCueText()).toBe("Refreshed");
    expect(isCoreSuccessCueText("Refreshed")).toBe(true);
    expect(guildInviteRefreshSuccessCueText()).not.toBe(GUILD_CREATE_SUCCESS_CUE);
    expect(guildInviteRefreshSuccessCueText()).not.toBe(GUILD_JOIN_SUCCESS_CUE);
    expect(guildInviteRefreshSuccessCueText()).not.toBe(GUILD_LEAVE_SUCCESS_CUE);
    expect(sfxStepsFor("guild_claim").length).toBeGreaterThan(0);
    expect(SFX_PRESETS.guild_claim.length).toBeGreaterThanOrEqual(1);
  });

  it("clears quickly — reuses SUCCESS_CUE_MS; prior create cues stay short (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
    expect(tradeOfferSentCueText("Ada")).toBe("Offer · Ada");
    expect(marketSuccessCueText("cancel")).toBe("Cancelled");
  });

  it("does not invent ranks or sticky invite prose (failure)", () => {
    expect(isCoreSuccessCueText("Refreshed · officer only")).toBe(false);
    expect(isCoreSuccessCueText("Invite code rotated forever")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
    expect(GUILD_INVITE_REFRESH_SUCCESS_CUE).not.toMatch(/rank|officer|code/i);
  });
});
