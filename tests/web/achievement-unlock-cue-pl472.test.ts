import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS } from "@game/shared";
import {
  ACHIEVEMENT_UNLOCK_SUCCESS_CUE,
  ACHIEVEMENT_UNLOCK_SUCCESS_CUE_PREFIX,
  SUCCESS_CUE_MS,
  achievementUnlockSuccessCueText,
  isCoreSuccessCueText,
  newlyUnlockedAchievementTitles,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL47.2 — Achievement unlock brief cue.
 * Ephemeral confirm when a stub flips unlocked; unlock rules unchanged; mute ok.
 */
describe("CityLands PL47.2 achievement unlock brief cue", () => {
  it("flashes Unlocked · title when a row flips unlocked (happy)", () => {
    const title = ACHIEVEMENTS[0]!.title;
    expect(achievementUnlockSuccessCueText(title)).toBe(
      `${ACHIEVEMENT_UNLOCK_SUCCESS_CUE_PREFIX}${title}`,
    );
    expect(achievementUnlockSuccessCueText(title)).toBe(`Unlocked · ${title}`);
    expect(isCoreSuccessCueText(`Unlocked · ${title}`)).toBe(true);

    const prev = ACHIEVEMENTS.map((a) => ({
      id: a.id,
      title: a.title,
      unlocked: false,
    }));
    const next = prev.map((a, i) =>
      i === 0 ? { ...a, unlocked: true } : a,
    );
    expect(newlyUnlockedAchievementTitles(prev, next)).toEqual([title]);
  });

  it("skips hydrate and already-unlocked rows (edge)", () => {
    expect(achievementUnlockSuccessCueText(null)).toBe(
      ACHIEVEMENT_UNLOCK_SUCCESS_CUE,
    );
    expect(achievementUnlockSuccessCueText("  ")).toBe(
      ACHIEVEMENT_UNLOCK_SUCCESS_CUE,
    );
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);

    const unlocked = ACHIEVEMENTS.map((a) => ({
      id: a.id,
      title: a.title,
      unlocked: true,
    }));
    expect(newlyUnlockedAchievementTitles(null, unlocked)).toEqual([]);
    expect(newlyUnlockedAchievementTitles(undefined, unlocked)).toEqual([]);
    expect(newlyUnlockedAchievementTitles(unlocked, unlocked)).toEqual([]);
  });

  it("does not invent unlock rules or sticky reward prose (failure)", () => {
    expect(
      isCoreSuccessCueText("Unlocked · Green Thumb · +10 coins"),
    ).toBe(false);
    expect(isCoreSuccessCueText("Achievement unlocked forever")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
    expect(ACHIEVEMENTS.every((a) => a.target > 0)).toBe(true);
    expect(ACHIEVEMENTS.some((a) => a.derived)).toBe(true);
  });
});
