import { describe, expect, it } from "vitest";
import {
  huntDamageBonus,
  TOOL_HUNT_DAMAGE,
} from "../../packages/shared/src/catalog.ts";
import {
  COMBAT,
  resolveEncounter,
  strikeDamage,
} from "../../packages/shared/src/combat.ts";
import { EDGE_CREATURE } from "../../packages/shared/src/catalog.ts";

describe("tool hunt damage F9.4", () => {
  it("iron hammer grants the strongest soft bonus (happy)", () => {
    expect(huntDamageBonus("iron_hammer")).toBe(TOOL_HUNT_DAMAGE.iron_hammer);
    expect(huntDamageBonus("iron_hammer")).toBeGreaterThan(
      huntDamageBonus("wooden_hoe"),
    );
  });

  it("unknown or empty tools grant zero (edge)", () => {
    expect(huntDamageBonus(null)).toBe(0);
    expect(huntDamageBonus("wheat")).toBe(0);
  });

  it("hammer bonus helps beat tough foes faster (failure path without tool)", () => {
    const bare = resolveEncounter(
      {
        health: 20,
        maxHealth: 100,
        damage: COMBAT.damageStart,
        defense: 0,
      },
      EDGE_CREATURE,
    );
    const armed = resolveEncounter(
      {
        health: 20,
        maxHealth: 100,
        damage: COMBAT.damageStart + huntDamageBonus("iron_hammer"),
        defense: 0,
      },
      EDGE_CREATURE,
    );
    expect(strikeDamage(COMBAT.damageStart + 4, EDGE_CREATURE.defense)).toBeGreaterThan(
      strikeDamage(COMBAT.damageStart, EDGE_CREATURE.defense),
    );
    expect(armed.rounds).toBeLessThanOrEqual(bare.rounds);
  });
});
