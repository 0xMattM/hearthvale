import { describe, expect, it } from "vitest";
import {
  applyDownedPenalty,
  DOWNED,
} from "../../packages/shared/src/combat.ts";

describe("downed penalty F9.5", () => {
  it("drains energy and floors health (happy)", () => {
    const result = applyDownedPenalty({ energy: 50, health: 0 });
    expect(result.health).toBe(DOWNED.healthAfter);
    expect(result.energy).toBe(50 - DOWNED.energyPenalty);
    expect(result.energyLost).toBe(DOWNED.energyPenalty);
  });

  it("does not push energy below zero (edge)", () => {
    const result = applyDownedPenalty({ energy: 5, health: 0 });
    expect(result.energy).toBe(0);
    expect(result.energyLost).toBe(5);
  });

  it("never invents inventory wipes — only energy/health fields (failure contract)", () => {
    const before = { energy: 40, health: 0, leather: 3, landId: "land-1" };
    const after = applyDownedPenalty(before);
    expect(before.leather).toBe(3);
    expect(before.landId).toBe("land-1");
    expect(after).not.toHaveProperty("leather");
    expect(Object.keys(after).sort()).toEqual([
      "energy",
      "energyLost",
      "health",
    ]);
  });
});
