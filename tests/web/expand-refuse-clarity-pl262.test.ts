import { describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ENERGY,
  SLOT_EXPANSIONS,
  expandRefuseClarityText,
  expandSlotShortfall,
} from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import { resolveInteractPrompt } from "../../apps/web/lib/hud/interact-prompt";

/**
 * PL26.2 — Expand refuse clarity names missing coins / mats / energy.
 * Soft refuse SFX stays PL16.1-narrow (energy / busy / already-here); coin shortfalls silent.
 */
describe("CityLands PL26.2 expand refuse clarity", () => {
  const first = SLOT_EXPANSIONS[0]!;

  function qty(map: Record<string, number>) {
    return (itemId: string) => map[itemId] ?? 0;
  }

  it("walk-up prompt names first shortfall; affordable keeps full cost (happy)", () => {
    const shortCoins = resolveInteractPrompt({
      target: { kind: "expand", dist: 0.5 },
      visiting: false,
      gameNow: 1,
      occupiedSlotIndexes: [],
      softCurrency: 0,
      energy: 99,
      inventoryQty: qty({ iron_bar: 9 }),
    });
    expect(shortCoins?.label).toBe(
      `Expand field · Need ${first.coinCost} coins`,
    );
    expect(shortCoins?.showKey).toBe(true);

    const shortEnergy = resolveInteractPrompt({
      target: { kind: "expand", dist: 0.5 },
      visiting: false,
      gameNow: 1,
      occupiedSlotIndexes: [],
      softCurrency: first.coinCost,
      energy: ENERGY.costs.build - 1,
      inventoryQty: qty({ iron_bar: 1 }),
    });
    expect(shortEnergy?.label).toBe(
      `Expand field · Need ${first.energyCost} energy`,
    );

    const affordable = resolveInteractPrompt({
      target: { kind: "expand", dist: 0.5 },
      visiting: false,
      gameNow: 1,
      occupiedSlotIndexes: [],
      softCurrency: first.coinCost,
      energy: first.energyCost,
      inventoryQty: qty({ iron_bar: 1 }),
    });
    expect(affordable?.label).toContain(`${first.coinCost} coins`);
    expect(affordable?.label).toContain("Iron Bar");
    expect(affordable?.label).toContain(`${first.energyCost} energy`);
    expect(affordable?.label).not.toContain("Need ");
  });

  it("clarity helpers name mats; server coin/mat strings stay specific (edge)", () => {
    expect(
      expandRefuseClarityText(
        expandSlotShortfall({
          occupiedSlotIndexes: [],
          softCurrency: first.coinCost,
          energy: 99,
          inventoryQty: qty({ iron_bar: 0 }),
        }),
      ),
    ).toBe("Need 1× Iron Bar");

    expect(ACTION_ERROR.needCoinsExpand(first.coinCost)).toContain(
      String(first.coinCost),
    );
    expect(ACTION_ERROR.needCoinsExpand(first.coinCost).toLowerCase()).toContain(
      "coin",
    );
    expect(ACTION_ERROR.needMatsExpand(1, "Iron Bar")).toContain("Iron Bar");
    expect(ACTION_ERROR.notEnoughEnergy.toLowerCase()).toContain("energy");
  });

  it("keeps PL16.1 soft refuse narrow — energy yes, coin/mat expand no (failure)", () => {
    expect(isSoftRefuseError(ACTION_ERROR.notEnoughEnergy)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.needCoinsExpand(25))).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.needMatsExpand(1, "Iron Bar"))).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.noExpandSlots)).toBe(false);

    const noSlots = resolveInteractPrompt({
      target: { kind: "expand", dist: 0.5 },
      visiting: false,
      gameNow: 1,
      occupiedSlotIndexes: SLOT_EXPANSIONS.map((s) => s.slotIndex),
      softCurrency: 999,
      energy: 999,
      inventoryQty: qty({ iron_bar: 99 }),
    });
    expect(noSlots?.label).toBe("No expand slots left");
    expect(noSlots?.showKey).toBe(false);
  });
});
