import { describe, expect, it } from "vitest";
import { GUILD_BANK } from "@game/shared";
import {
  SUCCESS_CUE_MS,
  GUILD_BANK_DEPOSIT_SUCCESS_CUE,
  GUILD_BANK_WITHDRAW_SUCCESS_CUE,
  GUILD_CLAIM_SUCCESS_CUE,
  isCoreSuccessCueText,
  guildBankWithdrawSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";
import { SFX_PRESETS, sfxStepsFor } from "../../apps/web/lib/game-audio";

/**
 * PL48.3 — Guild bank withdraw brief cue.
 * Ephemeral TopBar `Withdrew` after successful bank withdraw; rules unchanged.
 */
describe("CityLands PL48.3 guild bank withdraw brief cue", () => {
  it("uses short Withdrew copy distinct from Deposited / Grove claimed (happy)", () => {
    expect(guildBankWithdrawSuccessCueText()).toBe(
      GUILD_BANK_WITHDRAW_SUCCESS_CUE,
    );
    expect(guildBankWithdrawSuccessCueText()).toBe("Withdrew");
    expect(isCoreSuccessCueText("Withdrew")).toBe(true);
    expect(guildBankWithdrawSuccessCueText()).not.toBe(
      GUILD_BANK_DEPOSIT_SUCCESS_CUE,
    );
    expect(guildBankWithdrawSuccessCueText()).not.toBe(GUILD_CLAIM_SUCCESS_CUE);
    expect(sfxStepsFor("guild_claim").length).toBeGreaterThan(0);
    expect(SFX_PRESETS.guild_claim.length).toBeGreaterThanOrEqual(1);
  });

  it("clears quickly — reuses SUCCESS_CUE_MS (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not invent bank slots or sticky withdraw prose (failure)", () => {
    expect(isCoreSuccessCueText("Withdrew · all")).toBe(false);
    expect(isCoreSuccessCueText("Could not withdraw")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
    expect(GUILD_BANK.maxSlots).toBe(24);
    expect(GUILD_BANK.maxStackQty).toBe(999);
  });
});
