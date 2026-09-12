import { describe, expect, it } from "vitest";
import { GUILD_BANK } from "@game/shared";
import {
  SUCCESS_CUE_MS,
  GUILD_BANK_DEPOSIT_SUCCESS_CUE,
  GUILD_BANK_WITHDRAW_SUCCESS_CUE,
  GUILD_CLAIM_SUCCESS_CUE,
  isCoreSuccessCueText,
  guildBankDepositSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";
import { SFX_PRESETS, sfxStepsFor } from "../../apps/web/lib/game-audio";

/**
 * PL48.2 — Guild bank deposit brief cue.
 * Ephemeral TopBar `Deposited` after successful bank deposit; rules unchanged.
 */
describe("CityLands PL48.2 guild bank deposit brief cue", () => {
  it("uses short Deposited copy distinct from Withdrew / Grove claimed (happy)", () => {
    expect(guildBankDepositSuccessCueText()).toBe(GUILD_BANK_DEPOSIT_SUCCESS_CUE);
    expect(guildBankDepositSuccessCueText()).toBe("Deposited");
    expect(isCoreSuccessCueText("Deposited")).toBe(true);
    expect(guildBankDepositSuccessCueText()).not.toBe(
      GUILD_BANK_WITHDRAW_SUCCESS_CUE,
    );
    expect(guildBankDepositSuccessCueText()).not.toBe(GUILD_CLAIM_SUCCESS_CUE);
    expect(sfxStepsFor("guild_claim").length).toBeGreaterThan(0);
    expect(SFX_PRESETS.guild_claim.length).toBeGreaterThanOrEqual(1);
  });

  it("clears quickly — reuses SUCCESS_CUE_MS (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not invent bank slots or sticky deposit prose (failure)", () => {
    expect(isCoreSuccessCueText("Deposited · 12 wheat")).toBe(false);
    expect(isCoreSuccessCueText("Could not deposit")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
    expect(GUILD_BANK.maxSlots).toBe(24);
    expect(GUILD_BANK.maxStackQty).toBe(999);
  });
});
