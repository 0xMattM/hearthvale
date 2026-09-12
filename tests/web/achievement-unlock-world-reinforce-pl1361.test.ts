import { describe, expect, it } from "vitest";
import {
  ACHIEVEMENT_UNLOCK_WORLD_REINFORCE,
  achievementUnlockWorldReinforceBackground,
  shouldFlashAchievementUnlockWorldReinforce,
} from "../../apps/web/lib/hud/achievement-unlock-feedback";
import {
  LEVEL_UP_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/level-up-feedback";
import {
  COINS_GAIN_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/coins-gain-feedback";
import {
  ACHIEVEMENT_UNLOCK_SUCCESS_CUE_PREFIX,
  achievementUnlockSuccessCueText,
  newlyUnlockedAchievementTitles,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL136.1 — Achievement unlock soft world reinforce.
 * Brief soft unlock rim when an achievement unlocks (complements Unlocked · PL47.2).
 * Unlock rules unchanged; mute ok; hydrate quiet.
 * Choice: one-shot violet rim (not another Unlocked toast) so unlock stays world-readable.
 */
describe("CityLands PL136.1 achievement unlock soft world reinforce", () => {
  it("flashes soft unlock rim when titles newly unlock (happy)", () => {
    expect(shouldFlashAchievementUnlockWorldReinforce(["First Chop"])).toBe(
      true,
    );
    expect(ACHIEVEMENT_UNLOCK_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(ACHIEVEMENT_UNLOCK_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = achievementUnlockWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(ACHIEVEMENT_UNLOCK_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Unlocked · ephemeral.
    expect(achievementUnlockSuccessCueText("First Chop")).toBe(
      `${ACHIEVEMENT_UNLOCK_SUCCESS_CUE_PREFIX}First Chop`,
    );
    const titles = newlyUnlockedAchievementTitles(
      [{ id: "a", title: "First Chop", unlocked: false }],
      [{ id: "a", title: "First Chop", unlocked: true }],
    );
    expect(titles).toEqual(["First Chop"]);
    expect(shouldFlashAchievementUnlockWorldReinforce(titles)).toBe(true);
  });

  it("stays quiet on hydrate / empty; rim ≠ level-up or coins (edge)", () => {
    expect(shouldFlashAchievementUnlockWorldReinforce([])).toBe(false);
    expect(
      newlyUnlockedAchievementTitles(null, [
        { id: "a", title: "First Chop", unlocked: true },
      ]),
    ).toEqual([]);

    expect(ACHIEVEMENT_UNLOCK_WORLD_REINFORCE.outerRgba).not.toBe(
      LEVEL_UP_WORLD_REINFORCE.outerRgba,
    );
    expect(ACHIEVEMENT_UNLOCK_WORLD_REINFORCE.outerRgba).not.toBe(
      COINS_GAIN_WORLD_REINFORCE.outerRgba,
    );
    expect(ACHIEVEMENT_UNLOCK_WORLD_REINFORCE.clearPct).toBeLessThan(
      ACHIEVEMENT_UNLOCK_WORLD_REINFORCE.midPct,
    );
    expect(ACHIEVEMENT_UNLOCK_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent HUD columns; keeps unlock gate (failure)", () => {
    expect(achievementUnlockWorldReinforceBackground()).not.toMatch(
      /hud\s*column/i,
    );
    expect(String(ACHIEVEMENT_UNLOCK_WORLD_REINFORCE.durationMs)).not.toMatch(
      /nft|combat/i,
    );
    expect(ACHIEVEMENT_UNLOCK_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(
      1,
    );
    expect(shouldFlashAchievementUnlockWorldReinforce(["x"])).not.toBe(
      shouldFlashAchievementUnlockWorldReinforce([]),
    );
  });
});
