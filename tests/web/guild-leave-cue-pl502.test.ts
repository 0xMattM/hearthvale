import { describe, expect, it } from "vitest";
import {
  SUCCESS_CUE_MS,
  GUILD_LEAVE_SUCCESS_CUE,
  GUILD_CREATE_SUCCESS_CUE,
  GUILD_JOIN_SUCCESS_CUE,
  isCoreSuccessCueText,
  guildLeaveSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";
import { SFX_PRESETS, sfxStepsFor } from "../../apps/web/lib/game-audio";

/**
 * PL50.2 — Guild leave brief cue.
 * Ephemeral TopBar Left after successful leave.
 */
describe("CityLands PL50.2 guild leave brief cue", () => {
  it("uses short Left copy distinct from create / join (happy)", () => {
    expect(guildLeaveSuccessCueText()).toBe(GUILD_LEAVE_SUCCESS_CUE);
    expect(guildLeaveSuccessCueText()).toBe("Left");
    expect(isCoreSuccessCueText("Left")).toBe(true);
    expect(guildLeaveSuccessCueText()).not.toBe(GUILD_CREATE_SUCCESS_CUE);
    expect(guildLeaveSuccessCueText()).not.toBe(GUILD_JOIN_SUCCESS_CUE);
    expect(sfxStepsFor("guild_claim").length).toBeGreaterThan(0);
    expect(SFX_PRESETS.guild_claim.length).toBeGreaterThanOrEqual(1);
  });

  it("clears quickly — reuses SUCCESS_CUE_MS (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not invent leave penalties or sticky prose (failure)", () => {
    expect(isCoreSuccessCueText("Left · cooldown 24h")).toBe(false);
    expect(isCoreSuccessCueText("Could not leave")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
    expect(GUILD_LEAVE_SUCCESS_CUE).toBe("Left");
  });
});
