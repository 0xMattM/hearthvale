import { describe, expect, it } from "vitest";
import { CHARACTER_LEVEL_THRESHOLDS, characterLevelFromXp } from "@game/shared";
import {
  COINS_GAIN_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/coins-gain-feedback";
import {
  LEVEL_UP_WORLD_REINFORCE,
  levelUpWorldReinforceBackground,
  shouldFlashLevelUpWorldReinforce,
} from "../../apps/web/lib/hud/level-up-feedback";
import {
  LEVEL_UP_SUCCESS_CUE_PREFIX,
  characterLevelUpCueText,
  shouldFlashCharacterLevelUpCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL135.2 — Level-up soft world reinforce.
 * Brief soft progress rim when characterLevel rises (complements Level N PL47.1).
 * XP curve / titles unchanged; mute ok; no XP bar invent.
 * Choice: one-shot sage rim (not another Level toast) so progress stays world-readable.
 */
describe("CityLands PL135.2 level-up soft world reinforce", () => {
  it("flashes soft progress rim only when level rises (happy)", () => {
    expect(shouldFlashLevelUpWorldReinforce(1, 2)).toBe(true);
    expect(shouldFlashLevelUpWorldReinforce(4, 5)).toBe(true);
    expect(LEVEL_UP_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(LEVEL_UP_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = levelUpWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(LEVEL_UP_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Level N ephemeral.
    expect(characterLevelUpCueText(2)).toBe(`${LEVEL_UP_SUCCESS_CUE_PREFIX}2`);
    expect(shouldFlashCharacterLevelUpCue(1, 2)).toBe(true);
    expect(characterLevelFromXp(CHARACTER_LEVEL_THRESHOLDS[2]!)).toBe(2);
  });

  it("stays quiet on hydrate / flat / drop; rim ≠ coins gold (edge)", () => {
    expect(shouldFlashLevelUpWorldReinforce(null, 3)).toBe(false);
    expect(shouldFlashLevelUpWorldReinforce(undefined, 3)).toBe(false);
    expect(shouldFlashLevelUpWorldReinforce(3, 3)).toBe(false);
    expect(shouldFlashLevelUpWorldReinforce(5, 4)).toBe(false);
    expect(shouldFlashLevelUpWorldReinforce(Number.NaN, 2)).toBe(false);
    expect(shouldFlashLevelUpWorldReinforce(1, Number.NaN)).toBe(false);

    expect(LEVEL_UP_WORLD_REINFORCE.outerRgba).not.toBe(
      COINS_GAIN_WORLD_REINFORCE.outerRgba,
    );
    expect(LEVEL_UP_WORLD_REINFORCE.clearPct).toBeLessThan(
      LEVEL_UP_WORLD_REINFORCE.midPct,
    );
    expect(LEVEL_UP_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent XP bar / titles; keeps level gate (failure)", () => {
    expect(levelUpWorldReinforceBackground()).not.toMatch(/xp\s*bar/i);
    expect(String(LEVEL_UP_WORLD_REINFORCE.durationMs)).not.toMatch(
      /nft|combat/i,
    );
    expect(LEVEL_UP_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashLevelUpWorldReinforce(1, 2)).not.toBe(
      shouldFlashLevelUpWorldReinforce(2, 1),
    );
    expect(characterLevelUpCueText(1)).toBeNull();
  });
});
