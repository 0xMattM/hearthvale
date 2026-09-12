import { describe, expect, it } from "vitest";
import { ITEMS, TOOL_HUNT_DAMAGE, type ItemId } from "@game/shared";

/**
 * RF6.1 — items live in catalog-items.ts and re-export via catalog.
 */
describe("catalog-items RF6.1", () => {
  it("exports stackable wheat and tool hoe (happy)", () => {
    expect(ITEMS.wheat.stackable).toBe(true);
    expect(ITEMS.iron_hoe.equipSlot).toBe("tool");
    expect(TOOL_HUNT_DAMAGE.iron_hammer).toBe(4);
  });

  it("covers every ItemId key (edge)", () => {
    const ids = Object.keys(ITEMS) as ItemId[];
    expect(ids.length).toBeGreaterThanOrEqual(20);
    for (const id of ids) {
      expect(ITEMS[id].id).toBe(id);
    }
  });

  it("rejects unknown item lookup shape (fail)", () => {
    expect((ITEMS as Record<string, unknown>)["not_an_item"]).toBeUndefined();
  });
});
