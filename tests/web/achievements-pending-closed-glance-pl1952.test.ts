import { describe, expect, it } from "vitest";
import {
  ACHIEVEMENTS_PENDING_CLOSED_GLANCE,
  achievementsPendingClosedGlanceLabel,
  clearPendingAchievementUnlocks,
  countPendingAchievementUnlocks,
  hasPendingAchievementUnlock,
  mergePendingAchievementUnlocks,
  newlyUnlockedAchievementGlanceRows,
  shouldShowAchievementsPendingClosedGlance,
  type PendingAchievementUnlock,
} from "../../apps/web/lib/hud/achievements-pending-closed-glance";

/**
 * PL195.2 — Achievements-pending closed glance leftover.
 * Choice: quiet TopBar A · Unlock chip while a new unlock is pending review
 * and Achievements panel closed (complements unlock rim + open accent; no
 * achievements column). Unlock rules SoT unchanged.
 */
describe("CityLands PL195.2 achievements-pending closed glance leftover", () => {
  const one: PendingAchievementUnlock[] = [
    { id: "first_harvest", title: "First Harvest" },
  ];
  const two: PendingAchievementUnlock[] = [
    { id: "first_harvest", title: "First Harvest" },
    { id: "first_trade", title: "First Trade" },
  ];

  it("shows quiet A · Unlock chip while new unlock pending and panel closed (happy)", () => {
    expect(hasPendingAchievementUnlock(one)).toBe(true);
    expect(shouldShowAchievementsPendingClosedGlance(one, false)).toBe(true);
    expect(achievementsPendingClosedGlanceLabel(one)).toBe("J · Unlock");
    expect(achievementsPendingClosedGlanceLabel(two)).toBe("J · Unlock · 2");
    expect(countPendingAchievementUnlocks(two)).toBe(2);

    expect(ACHIEVEMENTS_PENDING_CLOSED_GLANCE.hotkey).toBe("J");
    expect(ACHIEVEMENTS_PENDING_CLOSED_GLANCE.word).toBe("Unlock");
    expect(ACHIEVEMENTS_PENDING_CLOSED_GLANCE.borderColor).toBe("#9078a8");
    expect(ACHIEVEMENTS_PENDING_CLOSED_GLANCE.textColor).toBe("#b8a0c8");
    expect(ACHIEVEMENTS_PENDING_CLOSED_GLANCE.className).toBe(
      "topbar-achievements-glance",
    );

    const merged = mergePendingAchievementUnlocks(one, [
      { id: "first_trade", title: "First Trade" },
    ]);
    expect(merged).toHaveLength(2);
    expect(merged[1]?.id).toBe("first_trade");

    const flipped = newlyUnlockedAchievementGlanceRows(
      [{ id: "first_harvest", title: "First Harvest", unlocked: false }],
      [{ id: "first_harvest", title: "First Harvest", unlocked: true }],
    );
    expect(flipped).toEqual([{ id: "first_harvest", title: "First Harvest" }]);
  });

  it("clears when none pending or Achievements panel open (edge)", () => {
    expect(shouldShowAchievementsPendingClosedGlance([], false)).toBe(false);
    expect(shouldShowAchievementsPendingClosedGlance(one, true)).toBe(false);
    expect(achievementsPendingClosedGlanceLabel([])).toBe("");
    expect(hasPendingAchievementUnlock([])).toBe(false);
    expect(clearPendingAchievementUnlocks()).toEqual([]);
    expect(
      mergePendingAchievementUnlocks(one, [{ id: "  ", title: "x" }]),
    ).toEqual(one);
    expect(
      newlyUnlockedAchievementGlanceRows(null, [
        { id: "x", title: "X", unlocked: true },
      ]),
    ).toEqual([]);
  });

  it("does not invent achievements column or change unlock rules (failure)", () => {
    expect(ACHIEVEMENTS_PENDING_CLOSED_GLANCE.className).not.toMatch(
      /column|hud-achievements-column|always-on/i,
    );
    expect(achievementsPendingClosedGlanceLabel(one)).not.toMatch(
      /nft|combat/i,
    );
    expect(shouldShowAchievementsPendingClosedGlance(one, false)).not.toBe(
      shouldShowAchievementsPendingClosedGlance(one, true),
    );
    expect(
      countPendingAchievementUnlocks([{ id: "", title: "x" }]),
    ).toBe(0);
    expect(String(ACHIEVEMENTS_PENDING_CLOSED_GLANCE.word)).not.toMatch(
      /toast|stack|fare/i,
    );
  });
});
