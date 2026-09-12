import { describe, expect, it } from "vitest";
import {
  COMBAT,
  resolveEncounter,
  strikeDamage,
} from "../../packages/shared/src/combat.ts";
import { TRAIL_CREATURE } from "../../packages/shared/src/catalog.ts";

describe("hunt encounter F9.2", () => {
  it("starter player beats forest hare (happy)", () => {
    const result = resolveEncounter(
      {
        health: COMBAT.maxHealthStart,
        maxHealth: COMBAT.maxHealthStart,
        damage: COMBAT.damageStart,
        defense: COMBAT.defenseStart,
      },
      TRAIL_CREATURE,
    );
    expect(result.won).toBe(true);
    expect(result.foeHealth).toBe(0);
    expect(result.playerHealth).toBeGreaterThan(0);
    expect(result.rounds).toBeGreaterThan(0);
  });

  it("defense reduces damage but always at least 1 (edge)", () => {
    expect(strikeDamage(10, 5)).toBe(8);
    expect(strikeDamage(2, 100)).toBe(1);
  });

  it("low-health player can lose (failure)", () => {
    const result = resolveEncounter(
      {
        health: 3,
        maxHealth: 100,
        damage: 4,
        defense: 0,
      },
      {
        name: "Tough Beast",
        health: 40,
        damage: 12,
        defense: 4,
      },
    );
    expect(result.won).toBe(false);
    expect(result.playerHealth).toBe(0);
  });
});
