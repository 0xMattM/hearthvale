import { describe, expect, it } from "vitest";
import {
  INVITE_ACCEPT_WORLD_REINFORCE,
  inviteAcceptWorldReinforceBackground,
  shouldFlashInviteAcceptWorldReinforce,
} from "../../apps/web/lib/hud/invite-accept-feedback";
import {
  GUILD_BANK_DEPOSIT_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/guild-bank-deposit-feedback";
import {
  GUILD_BANK_WITHDRAW_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/guild-bank-withdraw-feedback";
import {
  TRADE_ACCEPT_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/trade-accept-feedback";
import {
  GUILD_JOIN_SUCCESS_CUE,
  guildJoinSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL148.2 — Invite-accept soft world reinforce.
 * Brief soft rim when a guild invite accept succeeds (complements Joined PL50.1 +
 * membership open PL140.2). Invite rules unchanged; mute ok; fail silent.
 * Choice: one-shot welcome kinship rim (not another Joined toast / invite column)
 * so accept stays world-readable beside the existing ephemeral.
 */
describe("CityLands PL148.2 invite-accept soft world reinforce", () => {
  it("flashes quiet welcome kinship rim when invite accept succeeds (happy)", () => {
    expect(shouldFlashInviteAcceptWorldReinforce(true)).toBe(true);
    expect(INVITE_ACCEPT_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(INVITE_ACCEPT_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = inviteAcceptWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(INVITE_ACCEPT_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Joined ephemeral.
    expect(guildJoinSuccessCueText()).toBe(GUILD_JOIN_SUCCESS_CUE);
    expect(guildJoinSuccessCueText()).toBe("Joined");
  });

  it("stays quiet on fail; rim ≠ bank / trade (edge)", () => {
    expect(shouldFlashInviteAcceptWorldReinforce(false)).toBe(false);

    expect(INVITE_ACCEPT_WORLD_REINFORCE.outerRgba).not.toBe(
      GUILD_BANK_DEPOSIT_WORLD_REINFORCE.outerRgba,
    );
    expect(INVITE_ACCEPT_WORLD_REINFORCE.outerRgba).not.toBe(
      GUILD_BANK_WITHDRAW_WORLD_REINFORCE.outerRgba,
    );
    expect(INVITE_ACCEPT_WORLD_REINFORCE.outerRgba).not.toBe(
      TRADE_ACCEPT_WORLD_REINFORCE.outerRgba,
    );
    expect(INVITE_ACCEPT_WORLD_REINFORCE.clearPct).toBeLessThan(
      INVITE_ACCEPT_WORLD_REINFORCE.midPct,
    );
    expect(INVITE_ACCEPT_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent invite columns; keeps ok gate (failure)", () => {
    expect(inviteAcceptWorldReinforceBackground()).not.toMatch(
      /invite\s*column|always.?on|nft/i,
    );
    expect(String(INVITE_ACCEPT_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(INVITE_ACCEPT_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashInviteAcceptWorldReinforce(true)).not.toBe(
      shouldFlashInviteAcceptWorldReinforce(false),
    );
  });
});
