import { describe, expect, it } from "vitest";
import { COMBAT, normalizeCombatStats } from "../../packages/shared/src/combat.ts";

describe("combat stats F9.1", () => {
  it("uses starter defaults when missing (happy)", () => {
    expect(normalizeCombatStats({})).toEqual({
      health: COMBAT.maxHealthStart,
      maxHealth: COMBAT.maxHealthStart,
      damage: COMBAT.damageStart,
      defense: COMBAT.defenseStart,
    });
  });

  it("clamps health to maxHealth (edge)", () => {
    const stats = normalizeCombatStats({
      health: 999,
      maxHealth: 50,
      damage: 3,
      defense: 1,
    });
    expect(stats.health).toBe(50);
    expect(stats.maxHealth).toBe(50);
  });

  it("floors negative values (failure)", () => {
    const stats = normalizeCombatStats({
      health: -5,
      maxHealth: 0,
      damage: -2,
      defense: -1,
    });
    expect(stats.maxHealth).toBe(1);
    expect(stats.health).toBe(0);
    expect(stats.damage).toBe(0);
    expect(stats.defense).toBe(0);
  });
});
