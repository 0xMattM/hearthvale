import { describe, expect, it } from "vitest";
import {
  ENERGY,
  EXPAND_PAD_AFFORD_CUE,
  SLOT_EXPANSIONS,
  expandPadAffordMode,
  expandPadMeshColors,
  expandRefuseClarityText,
  expandSlotShortfall,
} from "@game/shared";

/**
 * PL26.1 — Expand pad afford tint SoT (affordable vs short funds/energy).
 * Choice: shared shortfall order with server expand (coins → mats → energy);
 * quiet pad palette only — costs unchanged, no HUD column.
 */
describe("CityLands PL26.1 expand pad afford tint", () => {
  const first = SLOT_EXPANSIONS[0]!;

  function qty(map: Record<string, number>) {
    return (itemId: string) => map[itemId] ?? 0;
  }

  it("tints affordable when coins + mats + energy cover next slot (happy)", () => {
    const mode = expandPadAffordMode({
      occupiedSlotIndexes: [],
      softCurrency: first.coinCost,
      energy: first.energyCost,
      inventoryQty: qty({ iron_bar: 1 }),
    });
    expect(mode).toBe("affordable");
    expect(expandSlotShortfall({
      occupiedSlotIndexes: [],
      softCurrency: first.coinCost,
      energy: first.energyCost,
      inventoryQty: qty({ iron_bar: 1 }),
    })).toBeNull();

    const idle = expandPadMeshColors("affordable", false);
    const lit = expandPadMeshColors("affordable", true);
    expect(idle.padColor).toBe(EXPAND_PAD_AFFORD_CUE.affordablePad);
    expect(lit.padColor).toBe(EXPAND_PAD_AFFORD_CUE.affordablePadLit);
    expect(lit.emissiveIntensity).toBeGreaterThan(idle.emissiveIntensity);
    expect(EXPAND_PAD_AFFORD_CUE.affordablePad).not.toBe(
      EXPAND_PAD_AFFORD_CUE.shortPad,
    );
  });

  it("marks short for coins, mats, or energy; null when slots exhausted (edge)", () => {
    expect(
      expandPadAffordMode({
        occupiedSlotIndexes: [],
        softCurrency: first.coinCost - 1,
        energy: 99,
        inventoryQty: qty({ iron_bar: 9 }),
      }),
    ).toBe("short");
    expect(
      expandSlotShortfall({
        occupiedSlotIndexes: [],
        softCurrency: first.coinCost - 1,
        energy: 99,
        inventoryQty: qty({ iron_bar: 9 }),
      }),
    ).toEqual({ kind: "coins", need: first.coinCost });

    expect(
      expandSlotShortfall({
        occupiedSlotIndexes: [],
        softCurrency: first.coinCost,
        energy: 99,
        inventoryQty: qty({ iron_bar: 0 }),
      })?.kind,
    ).toBe("materials");

    expect(
      expandSlotShortfall({
        occupiedSlotIndexes: [],
        softCurrency: first.coinCost,
        energy: ENERGY.costs.build - 1,
        inventoryQty: qty({ iron_bar: 1 }),
      }),
    ).toEqual({ kind: "energy", need: first.energyCost });

    const shortLook = expandPadMeshColors("short", true);
    expect(shortLook.padColor).toBe(EXPAND_PAD_AFFORD_CUE.shortPadLit);
    expect(shortLook.emissiveIntensity).toBe(0);

    expect(
      expandPadAffordMode({
        occupiedSlotIndexes: SLOT_EXPANSIONS.map((s) => s.slotIndex),
        softCurrency: 999,
        energy: 999,
        inventoryQty: qty({ iron_bar: 99 }),
      }),
    ).toBeNull();
  });

  it("keeps SLOT_EXPANSIONS costs unchanged and refuses inventing free expand (failure)", () => {
    expect(first.coinCost).toBe(25);
    expect(first.energyCost).toBe(ENERGY.costs.build);
    expect(first.materials).toEqual([{ itemId: "iron_bar", qty: 1 }]);
    expect(SLOT_EXPANSIONS[1]!.coinCost).toBe(40);

    expect(
      expandPadAffordMode({
        occupiedSlotIndexes: [],
        softCurrency: 0,
        energy: 0,
        inventoryQty: qty({}),
      }),
    ).toBe("short");
    expect(
      expandRefuseClarityText(
        expandSlotShortfall({
          occupiedSlotIndexes: [],
          softCurrency: 0,
          energy: 0,
          inventoryQty: qty({}),
        }),
      ),
    ).toBe(`Need ${first.coinCost} coins`);
  });
});
