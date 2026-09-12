import { describe, expect, it } from "vitest";
import { BUILDING_UPGRADES, ENERGY } from "@game/shared";
import {
  craftUpgradeAffordMode,
  craftUpgradeShortFundsHint,
  craftUpgradeShortfall,
} from "../../apps/web/lib/hud/craft-afford";

/**
 * PL39.1 — Craft upgrade afford clarity (soft Need … on T2 Upgrade when short).
 * Choice: shared shortfall order with server upgradeBuilding (coins → mats → energy);
 * muted/disabled Upgrade row — costs + recipes unchanged; no HUD column.
 */
describe("CityLands PL39.1 craft upgrade afford clarity", () => {
  const mill = BUILDING_UPGRADES.mill;
  const forge = BUILDING_UPGRADES.forge;

  function qty(map: Record<string, number>) {
    return (itemId: string) => map[itemId] ?? 0;
  }

  it("hides short hint when coins + mats + energy cover mill T2 (happy)", () => {
    const input = {
      buildingType: "mill" as const,
      softCurrency: mill.coinCost,
      energy: mill.energyCost,
      inventoryQty: qty({ plank: 4, iron_bar: 2 }),
    };
    expect(craftUpgradeAffordMode(input)).toBe("affordable");
    expect(craftUpgradeShortFundsHint(input)).toBeNull();
    expect(craftUpgradeShortfall(input)).toBeNull();
  });

  it("shows Need … for coins, mats, or energy; forge edge (edge)", () => {
    expect(
      craftUpgradeShortFundsHint({
        buildingType: "mill",
        softCurrency: mill.coinCost - 1,
        energy: 99,
        inventoryQty: qty({ plank: 9, iron_bar: 9 }),
      }),
    ).toBe(`Need ${mill.coinCost}c`);

    expect(
      craftUpgradeShortFundsHint({
        buildingType: "mill",
        softCurrency: mill.coinCost,
        energy: 99,
        inventoryQty: qty({ plank: 0, iron_bar: 9 }),
      }),
    ).toBe("Need 4× Plank");

    expect(
      craftUpgradeShortFundsHint({
        buildingType: "mill",
        softCurrency: mill.coinCost,
        energy: mill.energyCost - 1,
        inventoryQty: qty({ plank: 4, iron_bar: 2 }),
      }),
    ).toBe(`Need ${mill.energyCost} energy`);

    expect(
      craftUpgradeShortfall({
        buildingType: "forge",
        softCurrency: forge.coinCost,
        energy: 99,
        inventoryQty: qty({ iron_bar: 0, plank: 9 }),
      }),
    ).toEqual({
      kind: "materials",
      itemId: "iron_bar",
      qty: 3,
      name: "Iron Bar",
    });
    expect(
      craftUpgradeAffordMode({
        buildingType: "forge",
        softCurrency: forge.coinCost,
        energy: forge.energyCost,
        inventoryQty: qty({ iron_bar: 3, plank: 2 }),
      }),
    ).toBe("affordable");
  });

  it("keeps upgrade costs unchanged and refuses inventing free T2 (failure)", () => {
    expect(mill.coinCost).toBe(60);
    expect(mill.energyCost).toBe(ENERGY.costs.build);
    expect(mill.materials).toEqual([
      { itemId: "plank", qty: 4 },
      { itemId: "iron_bar", qty: 2 },
    ]);
    expect(forge.coinCost).toBe(60);
    expect(forge.toTier).toBe(2);
    expect(
      craftUpgradeAffordMode({
        buildingType: "mill",
        softCurrency: 0,
        energy: 0,
        inventoryQty: qty({}),
      }),
    ).toBe("short");
    expect(
      craftUpgradeShortFundsHint({
        buildingType: "mill",
        softCurrency: 0,
        energy: 0,
        inventoryQty: qty({}),
      }),
    ).toBe(`Need ${mill.coinCost}c`);
  });
});
