import { describe, expect, it } from "vitest";

import {
  GUILD_LEAVE_WORLD_REINFORCE,
  guildLeaveWorldReinforceBackground,
  shouldFlashGuildLeaveWorldReinforce,
} from "../../apps/web/lib/hud/guild-leave-feedback";
import {
  GUILD_CREATE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/guild-create-feedback";
import {
  INVITE_ACCEPT_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/invite-accept-feedback";
import {
  TRADE_CANCEL_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/trade-cancel-feedback";
import {
  GUILD_LEAVE_SUCCESS_CUE,
  guildLeaveSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL158.2 — Guild-leave soft world reinforce.
 * Brief soft rim after guild leave ok (complements Left PL50.2 +
 * membership open PL140.2). Guild rules unchanged; mute ok; fail silent.
 * Choice: one-shot cool membership-release mist (not another Left toast /
 * create founding teal) so leave stays world-readable beside membership chrome.
 */
describe("CityLands PL158.2 guild-leave soft world reinforce", () => {
  it("flashes quiet cool membership-release rim when leave succeeds (happy)", () => {
    expect(shouldFlashGuildLeaveWorldReinforce(true)).toBe(true);
    expect(GUILD_LEAVE_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(GUILD_LEAVE_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = guildLeaveWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(GUILD_LEAVE_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Left ephemeral.
    expect(guildLeaveSuccessCueText()).toBe(GUILD_LEAVE_SUCCESS_CUE);
    expect(guildLeaveSuccessCueText()).toBe("Left");
  });

  it("stays quiet on fail; rim ≠ create founding / invite / trade cancel (edge)", () => {
    expect(shouldFlashGuildLeaveWorldReinforce(false)).toBe(false);

    expect(GUILD_LEAVE_WORLD_REINFORCE.outerRgba).not.toBe(
      GUILD_CREATE_WORLD_REINFORCE.outerRgba,
    );
    expect(GUILD_LEAVE_WORLD_REINFORCE.midRgba).not.toBe(
      GUILD_CREATE_WORLD_REINFORCE.midRgba,
    );
    expect(GUILD_LEAVE_WORLD_REINFORCE.outerRgba).not.toBe(
      INVITE_ACCEPT_WORLD_REINFORCE.outerRgba,
    );
    expect(GUILD_LEAVE_WORLD_REINFORCE.outerRgba).not.toBe(
      TRADE_CANCEL_WORLD_REINFORCE.outerRgba,
    );
    expect(GUILD_LEAVE_WORLD_REINFORCE.clearPct).toBeLessThan(
      GUILD_LEAVE_WORLD_REINFORCE.midPct,
    );
    expect(GUILD_LEAVE_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent ranks / NFT combat; keeps ok gate (failure)", () => {
    expect(guildLeaveWorldReinforceBackground()).not.toMatch(
      /rank\s*change|always.?on|nft/i,
    );
    expect(String(GUILD_LEAVE_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(GUILD_LEAVE_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashGuildLeaveWorldReinforce(true)).not.toBe(
      shouldFlashGuildLeaveWorldReinforce(false),
    );
  });
});
