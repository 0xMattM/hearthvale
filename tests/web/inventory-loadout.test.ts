import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  INVENTORY_PANE_LABELS,
  INVENTORY_PANE_TABS,
  inventoryFindEquippedStack,
  inventoryLoadoutRows,
  isInventoryPaneTab,
} from "../../apps/web/lib/hud/inventory-loadout";

const bag = [
  { id: "t1", itemId: "iron_hammer", qty: 1, durability: 40 },
  { id: "w1", itemId: "iron_sword", qty: 1, durability: 70 },
  { id: "a1", itemId: "leather_armor", qty: 1, durability: 60 },
  { id: "s1", itemId: "wooden_shield", qty: 1, durability: 50 },
];

/**
 * Loadout tab splits work tools from combat weapon / armor / shield.
 */
describe("inventory loadout", () => {
  it("lists work tool apart from combat gear (happy)", () => {
    const rows = inventoryLoadoutRows({
      inventory: bag,
      equippedToolInventoryId: "t1",
      equippedWeaponInventoryId: "w1",
      equippedArmorInventoryId: "a1",
      equippedShieldInventoryId: "s1",
    });
    expect(rows.map((r) => r.slot)).toEqual([
      "work",
      "weapon",
      "armor",
      "shield",
    ]);
    expect(rows[0]!.group).toBe("work");
    expect(rows[0]!.stack?.itemId).toBe("iron_hammer");
    expect(rows[1]!.group).toBe("combat");
    expect(rows[1]!.stack?.itemId).toBe("iron_sword");
    expect(rows[2]!.stack?.itemId).toBe("leather_armor");
    expect(rows[3]!.stack?.itemId).toBe("wooden_shield");
    expect(INVENTORY_PANE_TABS).toEqual(["bag", "loadout"]);
    expect(INVENTORY_PANE_LABELS.loadout).toBe("Loadout");
  });

  it("keeps empty combat slots when only a work tool is on (edge)", () => {
    const rows = inventoryLoadoutRows({
      inventory: bag,
      equippedToolInventoryId: "t1",
    });
    expect(rows[0]!.stack?.id).toBe("t1");
    expect(rows[1]!.stack).toBeNull();
    expect(rows[2]!.stack).toBeNull();
    expect(rows[3]!.stack).toBeNull();
    expect(isInventoryPaneTab("bag")).toBe(true);
    expect(isInventoryPaneTab("loadout")).toBe(true);
  });

  it("returns empty rows on missing bag or unknown equipped ids (failure)", () => {
    expect(inventoryFindEquippedStack(null, "t1")).toBeNull();
    expect(inventoryFindEquippedStack(bag, null)).toBeNull();
    expect(inventoryFindEquippedStack(bag, "missing")).toBeNull();
    const rows = inventoryLoadoutRows({
      inventory: null,
      equippedToolInventoryId: "t1",
      equippedWeaponInventoryId: "w1",
    });
    expect(rows.every((r) => r.stack === null)).toBe(true);
    expect(isInventoryPaneTab("gear")).toBe(false);
    expect(isInventoryPaneTab("")).toBe(false);
  });
});

describe("inventory loadout panel chrome", () => {
  const panel = fs.readFileSync(
    path.join(process.cwd(), "apps/web/components/hud/InventoryPanel.tsx"),
    "utf8",
  );

  it("shows slot names and a Loadout tab (happy)", () => {
    expect(panel).toContain("inventory-panel__slot-name");
    expect(panel).toContain("inventory-pane-${id}");
    expect(panel).toContain("InventoryLoadout");
    expect(panel).toContain("INVENTORY_PANE_TABS");
  });

  it("keeps bag search and work/fight pips (edge)", () => {
    expect(panel).toContain("inventory-search");
    expect(panel).toContain("inventoryEquippedPip");
    expect(panel).toContain('"bag"');
  });

  it("rejects hover-only raw ids without a painted name (failure)", () => {
    expect(panel).toContain("inventorySlotLabel(def?.name, stack.itemId)");
    expect(panel).not.toContain("const name = def?.name ?? stack.itemId");
  });
});
