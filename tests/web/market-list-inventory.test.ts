import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ITEMS } from "@game/shared";
import {
  MARKET_LIST_EMPTY_INVENTORY,
  clampMarketListQty,
  listableInventoryItems,
  selectedListableInventoryItem,
} from "../../apps/web/lib/hud/market-list-inventory";

const MARKET_PANEL = path.join(
  process.cwd(),
  "apps/web/components/hud/MarketPanel.tsx",
);
const REALM_PANEL = path.join(
  process.cwd(),
  "apps/web/components/hud/RealmMarketPanel.tsx",
);

/**
 * MARKET-LIST-INV-1 — Sell picker is owned stackables with bag qty.
 * Coin board and REALM stall share the helper; catalog dropdowns stay out.
 */
describe("MARKET-LIST-INV-1 listable inventory for market sell", () => {
  it("lists owned stackables with merged qty (happy)", () => {
    const rows = listableInventoryItems(
      [
        { itemId: "wheat", qty: 3 },
        { itemId: "wheat", qty: 2 },
        { itemId: "wood", qty: 4 },
      ],
      ITEMS,
    );
    expect(rows).toEqual([
      { itemId: "wheat", name: "Wheat", qty: 5 },
      { itemId: "wood", name: "Wood", qty: 4 },
    ]);
    expect(selectedListableInventoryItem(rows, "wood")?.qty).toBe(4);
    expect(clampMarketListQty(9, 4)).toBe(4);
    expect(ITEMS.wheat.stackable).toBe(true);

    const marketSrc = fs.readFileSync(MARKET_PANEL, "utf8");
    expect(marketSrc).toContain("MarketListInventoryPicker");
    expect(marketSrc).toContain("listableInventoryItems");
    expect(fs.readFileSync(REALM_PANEL, "utf8")).toContain(
      "MarketListInventoryPicker",
    );
  });

  it("falls back to the first owned row and clamps empty qty (edge)", () => {
    const rows = listableInventoryItems(
      [{ itemId: "flour", qty: 1 }],
      ITEMS,
    );
    expect(selectedListableInventoryItem(rows, "wheat")?.itemId).toBe("flour");
    expect(selectedListableInventoryItem([], "wheat")).toBeNull();
    expect(clampMarketListQty(0, 6)).toBe(1);
    expect(clampMarketListQty(2, 0)).toBe(0);
    expect(clampMarketListQty(Number.NaN, 3)).toBe(1);
    expect(listableInventoryItems(null, ITEMS)).toEqual([]);
    expect(MARKET_LIST_EMPTY_INVENTORY.toLowerCase()).toMatch(/bag|list/);
  });

  it("hides tools, empty stacks, and catalog-wide dropdowns (failure)", () => {
    const rows = listableInventoryItems(
      [
        { itemId: "wooden_hoe", qty: 1 },
        { itemId: "wheat", qty: 0 },
        { itemId: "not_an_item", qty: 9 },
      ],
      ITEMS,
    );
    expect(rows).toEqual([]);
    expect(ITEMS.wooden_hoe.stackable).toBe(false);

    const marketSrc = fs.readFileSync(MARKET_PANEL, "utf8");
    expect(marketSrc).not.toContain("stackableIds");
    expect(marketSrc).not.toMatch(/<select[\s\S]*stackable/);
    expect(fs.readFileSync(REALM_PANEL, "utf8")).not.toContain(
      "Object.values(ITEMS)",
    );
  });
});
