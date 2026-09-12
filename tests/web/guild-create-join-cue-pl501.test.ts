import { describe, expect, it } from "vitest";
import {
  SUCCESS_CUE_MS,
  GUILD_CREATE_SUCCESS_CUE,
  GUILD_JOIN_SUCCESS_CUE,
  GUILD_LEAVE_SUCCESS_CUE,
  GUILD_CLAIM_SUCCESS_CUE,
  isCoreSuccessCueText,
  guildCreateSuccessCueText,
  guildJoinSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";
import { SFX_PRESETS, sfxStepsFor } from "../../apps/web/lib/game-audio";

/**
 * PL50.1 — Guild create / join brief cue.
 * Ephemeral TopBar Created / Joined after successful create or join.
 */
describe("CityLands PL50.1 guild create / join brief cue", () => {
  it("uses short Created / Joined copy distinct from leave / claim (happy)", () => {
    expect(guildCreateSuccessCueText()).toBe(GUILD_CREATE_SUCCESS_CUE);
    expect(guildCreateSuccessCueText()).toBe("Created");
    expect(guildJoinSuccessCueText()).toBe(GUILD_JOIN_SUCCESS_CUE);
    expect(guildJoinSuccessCueText()).toBe("Joined");
    expect(isCoreSuccessCueText("Created")).toBe(true);
    expect(isCoreSuccessCueText("Joined")).toBe(true);
    expect(guildCreateSuccessCueText()).not.toBe(GUILD_JOIN_SUCCESS_CUE);
    expect(guildCreateSuccessCueText()).not.toBe(GUILD_LEAVE_SUCCESS_CUE);
    expect(guildJoinSuccessCueText()).not.toBe(GUILD_CLAIM_SUCCESS_CUE);
    expect(sfxStepsFor("guild_claim").length).toBeGreaterThan(0);
    expect(SFX_PRESETS.guild_claim.length).toBeGreaterThanOrEqual(1);
  });

  it("clears quickly — reuses SUCCESS_CUE_MS (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not invent invite ranks or sticky membership prose (failure)", () => {
    expect(isCoreSuccessCueText("Created · rank Leader")).toBe(false);
    expect(isCoreSuccessCueText("Joined guild forever")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
    expect(GUILD_CREATE_SUCCESS_CUE).not.toMatch(/invite/i);
    expect(GUILD_JOIN_SUCCESS_CUE).not.toMatch(/rank/i);
  });
});
