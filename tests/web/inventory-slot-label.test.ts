import { describe, expect, it } from "vitest";
import {
  inventoryEquippedPip,
  inventorySlotLabel,
} from "../../apps/web/lib/hud/inventory-slot-label";

/**
 * Bag slot names so items read without hovering.
 */
describe("inventory slot labels", () => {
  it("uses catalog names on bag slots (happy)", () => {
    expect(inventorySlotLabel("Wheat", "wheat")).toBe("Wheat");
    expect(inventorySlotLabel("Iron Hammer", "iron_hammer")).toBe("Iron Hammer");
    expect(inventoryEquippedPip("tool")).toBe("Work");
    expect(inventoryEquippedPip("gear")).toBe("Fight");
  });

  it("falls back to spaced ids and trims names (edge)", () => {
    expect(inventorySlotLabel("  Bread  ", "bread")).toBe("Bread");
    expect(inventorySlotLabel("", "wheat_seed")).toBe("wheat seed");
    expect(inventorySlotLabel(undefined, "iron_ore")).toBe("iron ore");
    expect(inventoryEquippedPip("other")).toBe("E");
  });

  it("rejects blank ids as a generic Item (failure)", () => {
    expect(inventorySlotLabel("", "")).toBe("Item");
    expect(inventorySlotLabel("   ", "  ")).toBe("Item");
    expect(inventorySlotLabel(undefined, "")).toBe("Item");
  });
});
