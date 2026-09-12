import { describe, expect, it } from "vitest";
import {
  GUILD_BANK_DEPOSIT_WORLD_REINFORCE,
  guildBankDepositWorldReinforceBackground,
  shouldFlashGuildBankDepositWorldReinforce,
} from "../../apps/web/lib/hud/guild-bank-deposit-feedback";
import {
  TRADE_ACCEPT_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/trade-accept-feedback";
import {
  MARKET_LIST_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/market-list-feedback";
import {
  GUILD_BANK_DEPOSIT_SUCCESS_CUE,
  guildBankDepositSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL143.2 — Guild-bank deposit soft confirm leftover.
 * Brief quiet confirm rim after bank deposit ok (complements Deposited PL48.2 +
 * membership open PL140.2). Bank caps unchanged; mute ok; fail silent.
 * Choice: one-shot membership-blue rim (not another Deposited toast) so deposit
 * stays world-readable beside the existing ephemeral.
 */
describe("CityLands PL143.2 guild-bank deposit soft confirm leftover", () => {
  it("flashes quiet membership rim when deposit succeeds (happy)", () => {
    expect(shouldFlashGuildBankDepositWorldReinforce(true)).toBe(true);
    expect(GUILD_BANK_DEPOSIT_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(GUILD_BANK_DEPOSIT_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = guildBankDepositWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(GUILD_BANK_DEPOSIT_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Deposited ephemeral.
    expect(guildBankDepositSuccessCueText()).toBe(GUILD_BANK_DEPOSIT_SUCCESS_CUE);
    expect(guildBankDepositSuccessCueText()).toBe("Deposited");
  });

  it("stays quiet on fail; rim ≠ trade sage / market teal (edge)", () => {
    expect(shouldFlashGuildBankDepositWorldReinforce(false)).toBe(false);

    expect(GUILD_BANK_DEPOSIT_WORLD_REINFORCE.outerRgba).not.toBe(
      TRADE_ACCEPT_WORLD_REINFORCE.outerRgba,
    );
    expect(GUILD_BANK_DEPOSIT_WORLD_REINFORCE.outerRgba).not.toBe(
      MARKET_LIST_WORLD_REINFORCE.outerRgba,
    );
    expect(GUILD_BANK_DEPOSIT_WORLD_REINFORCE.clearPct).toBeLessThan(
      GUILD_BANK_DEPOSIT_WORLD_REINFORCE.midPct,
    );
    expect(GUILD_BANK_DEPOSIT_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent bank caps / columns; keeps ok gate (failure)", () => {
    expect(guildBankDepositWorldReinforceBackground()).not.toMatch(
      /bank\s*cap|always.?on|nft/i,
    );
    expect(String(GUILD_BANK_DEPOSIT_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(GUILD_BANK_DEPOSIT_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashGuildBankDepositWorldReinforce(true)).not.toBe(
      shouldFlashGuildBankDepositWorldReinforce(false),
    );
  });
});
