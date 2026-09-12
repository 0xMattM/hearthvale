import { describe, expect, it } from "vitest";
import { nextSlotExpansion, SLOT_EXPANSIONS } from "@game/shared";

describe("land slot expansion P0.3", () => {
  it("offers slot 6 first", () => {
    expect(nextSlotExpansion([0, 1, 2, 3, 4, 5])?.slotIndex).toBe(6);
  });

  it("offers slot 7 after 6 is built", () => {
    expect(nextSlotExpansion([0, 1, 2, 3, 4, 5, 6])?.slotIndex).toBe(7);
  });

  it("returns undefined when fully expanded", () => {
    expect(nextSlotExpansion([0, 1, 2, 3, 4, 5, 6, 7])).toBeUndefined();
  });

  it("locks coin and material sinks", () => {
    expect(SLOT_EXPANSIONS[0].coinCost).toBe(25);
    expect(SLOT_EXPANSIONS[1].materials[0]).toEqual({ itemId: "iron_bar", qty: 2 });
  });
});
