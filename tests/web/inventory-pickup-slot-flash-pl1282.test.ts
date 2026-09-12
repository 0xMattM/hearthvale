import { describe, expect, it } from "vitest";
import {
  INVENTORY_PICKUP_SLOT_FLASH,
  inventoryPickupFlashStackIds,
  inventoryPickupSlotFlashClassName,
  shouldFlashInventoryPickupSlots,
} from "../../apps/web/lib/hud/inventory-pickup-slot-flash";
import { INVENTORY_OPEN_ACCENT_MS } from "../../apps/web/lib/hud/inventory-open-accent";
import {
  gatherSuccessCueText,
  coreSuccessCueText,
  vendorBuySuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL128.2 — Inventory pickup soft slot flash.
 * Brief slot/border flash when a stack qty rises or a new stack appears
 * after gather/craft/buy (complements success SFX). Capacity rules unchanged;
 * mute ok; min HUD.
 * Choice: detect rising/new stacks in applyState (not only three call sites)
 * so bag inflow stays readable for gather·craft·buy and kinship harvest/claim
 * inflows without inventing a second Got toast.
 */
describe("CityLands PL128.2 inventory pickup soft slot flash", () => {
  it("flashes risen qty and new stacks (happy)", () => {
    const ids = inventoryPickupFlashStackIds(
      [
        { id: "a", qty: 2 },
        { id: "b", qty: 1 },
      ],
      [
        { id: "a", qty: 5 },
        { id: "b", qty: 1 },
        { id: "c", qty: 1 },
      ],
    );
    expect(ids).toEqual(["a", "c"]);
    expect(shouldFlashInventoryPickupSlots(true, ids)).toBe(true);
    expect(inventoryPickupSlotFlashClassName("a", ids)).toBe(
      INVENTORY_PICKUP_SLOT_FLASH.slotClassName,
    );
    expect(INVENTORY_PICKUP_SLOT_FLASH.durationMs).toBeGreaterThanOrEqual(300);
    expect(INVENTORY_PICKUP_SLOT_FLASH.durationMs).toBeLessThanOrEqual(800);
    expect(INVENTORY_PICKUP_SLOT_FLASH.backgroundRgba).toMatch(/^rgba/);

    // Complements — does not replace — gather / craft / buy cues.
    expect(gatherSuccessCueText("ore_node")).toBeTruthy();
    expect(coreSuccessCueText("craft")).toBe("Crafted");
    expect(vendorBuySuccessCueText()).toBe("Bought");
  });

  it("stays quiet on decrease / flat / first hydrate / fail (edge)", () => {
    expect(
      inventoryPickupFlashStackIds(
        [{ id: "a", qty: 5 }],
        [{ id: "a", qty: 2 }],
      ),
    ).toEqual([]);
    expect(
      inventoryPickupFlashStackIds(
        [{ id: "a", qty: 2 }],
        [{ id: "a", qty: 2 }],
      ),
    ).toEqual([]);
    expect(
      inventoryPickupFlashStackIds(null, [{ id: "a", qty: 9 }]),
    ).toEqual([]);
    expect(shouldFlashInventoryPickupSlots(false, ["a"])).toBe(false);
    expect(shouldFlashInventoryPickupSlots(true, [])).toBe(false);
    expect(inventoryPickupSlotFlashClassName("missing", ["a"])).toBe("");
    expect(INVENTORY_PICKUP_SLOT_FLASH.durationMs).not.toBe(
      INVENTORY_OPEN_ACCENT_MS,
    );
  });

  it("does not invent capacity rules or combat loot (failure)", () => {
    expect(String(INVENTORY_PICKUP_SLOT_FLASH.slotClassName)).not.toMatch(
      /nft|combat/i,
    );
    expect(INVENTORY_PICKUP_SLOT_FLASH.borderRgba).not.toBe(
      INVENTORY_PICKUP_SLOT_FLASH.backgroundRgba,
    );
    expect(
      shouldFlashInventoryPickupSlots(true, ["x"]),
    ).not.toBe(shouldFlashInventoryPickupSlots(false, ["x"]));
    expect(
      inventoryPickupFlashStackIds(
        [{ id: "a", qty: 1 }],
        [{ id: "a", qty: Number.NaN }],
      ),
    ).toEqual([]);
  });
});
