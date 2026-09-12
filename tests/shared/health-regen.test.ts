import { describe, expect, it } from "vitest";
import {
  COMBAT,
  ENERGY,
  FOOD_HEAL,
  FOOD_RESTORE,
  nextHealthAfterRegen,
} from "@game/shared";

describe("passive health regen", () => {
  it("ticks HP from a downed floor after elapsed intervals (happy)", () => {
    const now = 1_000_000;
    const result = nextHealthAfterRegen({
      health: COMBAT.maxHealthStart > 0 ? 1 : 0,
      maxHealth: COMBAT.maxHealthStart,
      healthUpdatedAt: now - 2 * COMBAT.regenIntervalMs,
      now,
    });
    expect(result.health).toBe(1 + 2 * COMBAT.regenAmount);
    expect(result.healthUpdatedAt).toBe(now);
  });

  it("does not dump ticks when the watermark is unset (edge)", () => {
    const now = 5_000_000;
    const result = nextHealthAfterRegen({
      health: 1,
      maxHealth: COMBAT.maxHealthStart,
      healthUpdatedAt: 0,
      now,
    });
    expect(result.health).toBe(1);
    expect(result.healthUpdatedAt).toBe(now);
  });

  it("freezes HP while a fight is open (failure / pause)", () => {
    const now = 9_000_000;
    const result = nextHealthAfterRegen({
      health: 1,
      maxHealth: COMBAT.maxHealthStart,
      healthUpdatedAt: now - 10 * COMBAT.regenIntervalMs,
      now,
      pause: true,
    });
    expect(result.health).toBe(1);
    expect(result.healthUpdatedAt).toBe(now);
  });
});

describe("food HP heal catalog", () => {
  it("matches energy restore tiers for every edible (happy)", () => {
    expect(FOOD_HEAL).toEqual(FOOD_RESTORE);
    expect(FOOD_HEAL.bread).toBe(ENERGY.breadRestore);
    expect(FOOD_HEAL.stew).toBe(ENERGY.stewRestore);
  });

  it("keeps bandage below bread and ration at the top (edge)", () => {
    expect(FOOD_HEAL.cloth_bandage).toBeLessThan(FOOD_HEAL.bread);
    expect(FOOD_HEAL.travel_ration).toBeGreaterThan(FOOD_HEAL.stew);
  });

  it("never heals more than starter max HP from a single bread (failure bound)", () => {
    expect(FOOD_HEAL.bread).toBeLessThan(COMBAT.maxHealthStart);
    expect(FOOD_HEAL.travel_ration).toBeLessThan(COMBAT.maxHealthStart);
  });
});
