import { describe, expect, it } from "vitest";
import { CHARACTER_LEVEL_THRESHOLDS, characterLevelFromXp } from "@game/shared";
import {
  LEVEL_UP_SUCCESS_CUE,
  LEVEL_UP_SUCCESS_CUE_PREFIX,
  characterLevelUpCueText,
  isCoreSuccessCueText,
  shouldFlashCharacterLevelUpCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL47.1 — Character level-up ephemeral.
 * Brief TopBar `Level N` when characterLevel increases; XP curve unchanged.
 */
describe("CityLands PL47.1 character level-up ephemeral", () => {
  it("flashes Level N only when characterLevel rises (happy)", () => {
    expect(characterLevelUpCueText(2)).toBe(`${LEVEL_UP_SUCCESS_CUE_PREFIX}2`);
    expect(characterLevelUpCueText(2)).toBe("Level 2");
    expect(isCoreSuccessCueText("Level 2")).toBe(true);
    expect(isCoreSuccessCueText(LEVEL_UP_SUCCESS_CUE)).toBe(true);

    expect(shouldFlashCharacterLevelUpCue(1, 2)).toBe(true);
    expect(shouldFlashCharacterLevelUpCue(4, 5)).toBe(true);
    expect(characterLevelFromXp(CHARACTER_LEVEL_THRESHOLDS[2]!)).toBe(2);
  });

  it("stays quiet on hydrate, same level, or level drop (edge)", () => {
    expect(shouldFlashCharacterLevelUpCue(null, 3)).toBe(false);
    expect(shouldFlashCharacterLevelUpCue(undefined, 3)).toBe(false);
    expect(shouldFlashCharacterLevelUpCue(3, 3)).toBe(false);
    expect(shouldFlashCharacterLevelUpCue(5, 4)).toBe(false);
    expect(characterLevelUpCueText(1)).toBeNull();
    expect(characterLevelUpCueText(null)).toBeNull();
  });

  it("refuses invalid levels and does not invent XP thresholds (failure)", () => {
    expect(shouldFlashCharacterLevelUpCue(Number.NaN, 2)).toBe(false);
    expect(shouldFlashCharacterLevelUpCue(1, Number.NaN)).toBe(false);
    expect(characterLevelUpCueText(Number.NaN)).toBeNull();
    expect(characterLevelUpCueText(0)).toBeNull();
    expect(isCoreSuccessCueText("Level 2 · +40 XP")).toBe(false);
    expect(CHARACTER_LEVEL_THRESHOLDS[2]).toBe(40);
  });
});
