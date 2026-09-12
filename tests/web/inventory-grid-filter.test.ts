import { describe, expect, it } from "vitest";
import { ITEMS, type ItemDefinition, type ItemId } from "@game/shared";
import {
  INVENTORY_FILTER_CATEGORIES,
  filterInventoryStacks,
  inventoryItemCategory,
  inventoryStackMatchesQuery,
  normalizeInventorySearch,
} from "../../apps/web/lib/hud/inventory-filter";
import {
  ITEM_ICON_SPECS,
  inventoryIconsCoverCatalog,
  inventoryItemIconSpec,
} from "../../apps/web/lib/hud/inventory-item-icons";

const ITEMS_MAP = ITEMS as Record<string, ItemDefinition>;

/**
 * Inventory grid icons + search/filter (bag chrome).
 * Capacity / stack / durability rules unchanged.
 */
describe("inventory grid icons + filter", () => {
  it("matches name/id search and paints a unique icon per catalog item (happy)", () => {
    const stacks = [
      { id: "a", itemId: "wheat" },
      { id: "b", itemId: "iron_ore" },
      { id: "c", itemId: "bread" },
      { id: "d", itemId: "wooden_hoe" },
    ];
    const byName = filterInventoryStacks(stacks, ITEMS_MAP, "wheat", "all");
    expect(byName.map((s) => s.itemId)).toEqual(["wheat"]);
    const byId = filterInventoryStacks(stacks, ITEMS_MAP, "iron ore", "all");
    expect(byId.map((s) => s.itemId)).toEqual(["iron_ore"]);
    const food = filterInventoryStacks(stacks, ITEMS_MAP, "", "food");
    expect(food.map((s) => s.itemId)).toEqual(["bread"]);

    expect(inventoryIconsCoverCatalog()).toBe(true);
    expect(inventoryItemIconSpec("wheat").shapes.length).toBeGreaterThan(0);
    const signatures = (Object.keys(ITEMS) as ItemId[]).map((id) =>
      JSON.stringify(ITEM_ICON_SPECS[id]),
    );
    expect(new Set(signatures).size).toBe(signatures.length);
  });

  it("keeps empty query as show-all and classifies cook-chain food (edge)", () => {
    expect(normalizeInventorySearch("  Iron_Ore  ")).toBe("iron ore");
    expect(normalizeInventorySearch("")).toBe("");
    expect(inventoryItemCategory("raw_meat", ITEMS.raw_meat)).toBe("food");
    expect(inventoryItemCategory("fish", ITEMS.fish)).toBe("food");
    expect(inventoryItemCategory("wooden_hoe", ITEMS.wooden_hoe)).toBe("tools");
    expect(inventoryItemCategory("iron_sword", ITEMS.iron_sword)).toBe("gear");
    expect(inventoryItemCategory("workshop_kit", ITEMS.workshop_kit)).toBe(
      "kits",
    );
    expect(inventoryItemCategory("wheat", ITEMS.wheat)).toBe("materials");
    expect(
      inventoryStackMatchesQuery(
        { id: "x", itemId: "iron_hoe" },
        ITEMS.iron_hoe,
        "",
      ),
    ).toBe(true);

    const stacks = [
      { id: "1", itemId: "wheat" },
      { id: "2", itemId: "bread" },
    ];
    expect(filterInventoryStacks(stacks, ITEMS_MAP, "   ", "all")).toHaveLength(
      2,
    );
    expect(INVENTORY_FILTER_CATEGORIES).toContain("all");
  });

  it("returns empty on no match and falls back for unknown ids (failure)", () => {
    const stacks = [{ id: "a", itemId: "wheat" }];
    expect(filterInventoryStacks(stacks, ITEMS_MAP, "zzz-nope", "all")).toEqual(
      [],
    );
    expect(filterInventoryStacks(stacks, ITEMS_MAP, "wheat", "tools")).toEqual(
      [],
    );
    expect(filterInventoryStacks(null, ITEMS_MAP, "wheat", "all")).toEqual([]);
    expect(
      filterInventoryStacks(stacks, ITEMS_MAP, "wheat", "not-a-category"),
    ).toHaveLength(1);
    expect(inventoryItemCategory("unknown_sku", undefined)).toBe("materials");
    expect(inventoryItemIconSpec("not_an_item").bg).toBe(
      inventoryItemIconSpec("also_missing").bg,
    );
    expect(inventoryItemIconSpec("not_an_item")).not.toEqual(
      inventoryItemIconSpec("wheat"),
    );
    expect(
      inventoryStackMatchesQuery(
        { id: "x", itemId: "wheat" },
        ITEMS.wheat,
        "nft combat",
      ),
    ).toBe(false);
  });
});
