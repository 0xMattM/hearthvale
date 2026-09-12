import { describe, expect, it } from "vitest";
import {
  GUILD_BANK_WITHDRAW_WORLD_REINFORCE,
  guildBankWithdrawWorldReinforceBackground,
  shouldFlashGuildBankWithdrawWorldReinforce,
} from "../../apps/web/lib/hud/guild-bank-withdraw-feedback";
import {
  GUILD_BANK_DEPOSIT_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/guild-bank-deposit-feedback";
import {
  TRADE_ACCEPT_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/trade-accept-feedback";
import {
  GUILD_BANK_WITHDRAW_SUCCESS_CUE,
  guildBankWithdrawSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL148.1 — Guild-bank withdraw soft confirm leftover.
 * Brief quiet confirm rim after bank withdraw ok (complements Withdrew PL48.3 +
 * deposit rim PL143.2). Bank caps unchanged; mute ok; fail silent.
 * Choice: one-shot steel-slate rim (not another Withdrew toast) so withdraw
 * stays world-readable beside the existing ephemeral + deposit rim.
 */
describe("CityLands PL148.1 guild-bank withdraw soft confirm leftover", () => {
  it("flashes quiet steel-slate rim when withdraw succeeds (happy)", () => {
    expect(shouldFlashGuildBankWithdrawWorldReinforce(true)).toBe(true);
    expect(GUILD_BANK_WITHDRAW_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(GUILD_BANK_WITHDRAW_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = guildBankWithdrawWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(GUILD_BANK_WITHDRAW_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Withdrew ephemeral.
    expect(guildBankWithdrawSuccessCueText()).toBe(GUILD_BANK_WITHDRAW_SUCCESS_CUE);
    expect(guildBankWithdrawSuccessCueText()).toBe("Withdrew");
  });

  it("stays quiet on fail; rim ≠ deposit / trade (edge)", () => {
    expect(shouldFlashGuildBankWithdrawWorldReinforce(false)).toBe(false);

    expect(GUILD_BANK_WITHDRAW_WORLD_REINFORCE.outerRgba).not.toBe(
      GUILD_BANK_DEPOSIT_WORLD_REINFORCE.outerRgba,
    );
    expect(GUILD_BANK_WITHDRAW_WORLD_REINFORCE.outerRgba).not.toBe(
      TRADE_ACCEPT_WORLD_REINFORCE.outerRgba,
    );
    expect(GUILD_BANK_WITHDRAW_WORLD_REINFORCE.clearPct).toBeLessThan(
      GUILD_BANK_WITHDRAW_WORLD_REINFORCE.midPct,
    );
    expect(GUILD_BANK_WITHDRAW_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent bank caps / columns; keeps ok gate (failure)", () => {
    expect(guildBankWithdrawWorldReinforceBackground()).not.toMatch(
      /bank\s*cap|always.?on|nft/i,
    );
    expect(String(GUILD_BANK_WITHDRAW_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(GUILD_BANK_WITHDRAW_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashGuildBankWithdrawWorldReinforce(true)).not.toBe(
      shouldFlashGuildBankWithdrawWorldReinforce(false),
    );
  });
});
