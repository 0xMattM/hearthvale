import { describe, expect, it } from "vitest";
import {
  COMBAT,
  resolveEncounter,
} from "../../packages/shared/src/combat.ts";
import {
  EDGE_CREATURE,
  TRAIL_CREATURE,
} from "../../packages/shared/src/catalog.ts";

describe("edge creature F9.3", () => {
  it("brush boar is tougher than forest hare (happy)", () => {
    expect(EDGE_CREATURE.health).toBeGreaterThan(TRAIL_CREATURE.health);
    expect(EDGE_CREATURE.damage).toBeGreaterThan(TRAIL_CREATURE.damage);
  });

  it("starter player still beats brush boar (edge)", () => {
    const result = resolveEncounter(
      {
        health: COMBAT.maxHealthStart,
        maxHealth: COMBAT.maxHealthStart,
        damage: COMBAT.damageStart,
        defense: COMBAT.defenseStart,
      },
      EDGE_CREATURE,
    );
    expect(result.won).toBe(true);
    expect(result.rounds).toBeGreaterThan(TRAIL_CREATURE.health / 20);
  });

  it("weak player can lose to boar (failure)", () => {
    const result = resolveEncounter(
      { health: 8, maxHealth: 100, damage: 5, defense: 0 },
      EDGE_CREATURE,
    );
    expect(result.won).toBe(false);
  });
});
