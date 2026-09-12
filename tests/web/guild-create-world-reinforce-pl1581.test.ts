import { describe, expect, it } from "vitest";

import {
  GUILD_CREATE_WORLD_REINFORCE,
  guildCreateWorldReinforceBackground,
  shouldFlashGuildCreateWorldReinforce,
} from "../../apps/web/lib/hud/guild-create-feedback";
import {
  INVITE_ACCEPT_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/invite-accept-feedback";
import {
  GUILD_BANK_DEPOSIT_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/guild-bank-deposit-feedback";
import {
  GUILD_CREATE_SUCCESS_CUE,
  guildCreateSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL158.1 — Guild-create soft world reinforce.
 * Brief soft rim after guild create ok (complements Created PL50.1 +
 * membership open PL140.2). Guild rules unchanged; mute ok; fail silent.
 * Choice: one-shot warm founding crest teal (not another Created toast /
 * invite welcome) so create stays world-readable beside membership chrome.
 */
describe("CityLands PL158.1 guild-create soft world reinforce", () => {
  it("flashes quiet warm founding crest rim when create succeeds (happy)", () => {
    expect(shouldFlashGuildCreateWorldReinforce(true)).toBe(true);
    expect(GUILD_CREATE_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(GUILD_CREATE_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = guildCreateWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(GUILD_CREATE_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Created ephemeral.
    expect(guildCreateSuccessCueText()).toBe(GUILD_CREATE_SUCCESS_CUE);
    expect(guildCreateSuccessCueText()).toBe("Created");
  });

  it("stays quiet on fail; rim ≠ invite welcome / bank deposit (edge)", () => {
    expect(shouldFlashGuildCreateWorldReinforce(false)).toBe(false);

    expect(GUILD_CREATE_WORLD_REINFORCE.outerRgba).not.toBe(
      INVITE_ACCEPT_WORLD_REINFORCE.outerRgba,
    );
    expect(GUILD_CREATE_WORLD_REINFORCE.midRgba).not.toBe(
      INVITE_ACCEPT_WORLD_REINFORCE.midRgba,
    );
    expect(GUILD_CREATE_WORLD_REINFORCE.outerRgba).not.toBe(
      GUILD_BANK_DEPOSIT_WORLD_REINFORCE.outerRgba,
    );
    expect(GUILD_CREATE_WORLD_REINFORCE.midRgba).not.toBe(
      GUILD_BANK_DEPOSIT_WORLD_REINFORCE.midRgba,
    );
    expect(GUILD_CREATE_WORLD_REINFORCE.clearPct).toBeLessThan(
      GUILD_CREATE_WORLD_REINFORCE.midPct,
    );
    expect(GUILD_CREATE_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent ranks / NFT combat; keeps ok gate (failure)", () => {
    expect(guildCreateWorldReinforceBackground()).not.toMatch(
      /rank\s*change|always.?on|nft/i,
    );
    expect(String(GUILD_CREATE_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(GUILD_CREATE_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashGuildCreateWorldReinforce(true)).not.toBe(
      shouldFlashGuildCreateWorldReinforce(false),
    );
  });
});
