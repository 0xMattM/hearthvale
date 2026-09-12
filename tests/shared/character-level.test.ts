import { describe, expect, it } from "vitest";
import {
  CHARACTER_LEVEL,
  characterLevelFromXp,
  characterTitleForLevel,
  characterXpProgress,
  hasExtraDecorPadUnlock,
} from "@game/shared";

describe("character level F13.1", () => {
  it("maps xp to levels and titles (happy)", () => {
    expect(characterLevelFromXp(0)).toBe(1);
    expect(characterLevelFromXp(40)).toBe(2);
    expect(characterLevelFromXp(100)).toBe(3);
    expect(characterTitleForLevel(1)).toBe("Newcomer");
    expect(characterTitleForLevel(3)).toBe("Settler");
    expect(characterTitleForLevel(5)).toBe("Homesteader");

    const mid = characterXpProgress(50);
    expect(mid.level).toBe(2);
    expect(mid.xpIntoLevel).toBe(10);
    expect(mid.xpToNext).toBe(50);
  });

  it("caps at max and unlocks decor pad at Lv 5 (edge)", () => {
    expect(hasExtraDecorPadUnlock(279)).toBe(false);
    expect(hasExtraDecorPadUnlock(280)).toBe(true);
    expect(CHARACTER_LEVEL.extraDecorPad.slotIndex).toBe(19);

    const maxed = characterXpProgress(99999);
    expect(maxed.level).toBe(CHARACTER_LEVEL.max);
    expect(maxed.xpToNext).toBeNull();
  });

  it("treats negative xp as level 1 (failure)", () => {
    expect(characterLevelFromXp(-10)).toBe(1);
    expect(characterXpProgress(-5).level).toBe(1);
    expect(hasExtraDecorPadUnlock(-1)).toBe(false);
  });
});
