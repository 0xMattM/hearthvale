import { describe, expect, it } from "vitest";
import { findKeybind } from "@game/shared";
import { GAME_DESK } from "../../apps/web/lib/hud/social-desk-chrome";
import {
  isLandEditorWorldPickable,
  kitInventoryIdAfterPickup,
  kitItemIdForHomesteadBuilding,
  landEditorBuildingLabel,
  landEditorPickupBuildings,
  landEditorPlaceableKits,
} from "../../apps/web/lib/hud/land-editor";

describe("land editor bag kits + copy (P)", () => {
  it("lists station kits from inventory and skips expand copy (happy)", () => {
    const kits = landEditorPlaceableKits([
      { id: "k1", itemId: "kitchen_kit", qty: 1 },
      { id: "k2", itemId: "planter_kit", qty: 1 },
      { id: "k3", itemId: "wheat", qty: 4 },
    ]);
    expect(kits.map((k) => k.itemId)).toEqual(["kitchen_kit", "planter_kit"]);
    expect(kits[0]?.kind).toBe("station");
    expect(kits[1]?.kind).toBe("decor");
    expect(kits[0]?.name.toLowerCase()).toContain("kitchen");
    expect(GAME_DESK.build.lede.toLowerCase()).toMatch(/place|bag/);
    expect(GAME_DESK.build.lede.toLowerCase()).toMatch(/move|pick/);
    expect(findKeybind("KeyP")?.label.toLowerCase()).toMatch(/place|move|pick/);
  });

  it("returns empty for missing bags and unknown types (edge)", () => {
    expect(landEditorPlaceableKits(null)).toEqual([]);
    expect(landEditorPlaceableKits(undefined)).toEqual([]);
    expect(landEditorPlaceableKits([])).toEqual([]);
    expect(landEditorPickupBuildings(null)).toEqual([]);
    expect(landEditorBuildingLabel(null)).toBe("");
    expect(landEditorBuildingLabel({ type: "crop_plot" })).toMatch(/plot|crop/i);
  });

  it("drops non-kits and refuses expand wording (failure)", () => {
    expect(
      landEditorPlaceableKits([
        { id: "w", itemId: "wheat", qty: 9 },
        { id: "h", itemId: "iron_hammer", qty: 1 },
      ]),
    ).toEqual([]);
    expect(GAME_DESK.build.lede.toLowerCase()).not.toContain("expand");
    expect(findKeybind("KeyP")?.label.toLowerCase()).not.toContain("expand");
  });
});

describe("land editor world pick + move-after-pickup", () => {
  it("selects placed stations and finds the new kit after pickup (happy)", () => {
    const placed = landEditorPickupBuildings([
      { id: "b1", type: "kitchen" },
      { id: "b2", type: "build_board" },
      { id: "b3", type: "decor_planter" },
    ]);
    expect(placed.map((b) => b.id)).toEqual(["b1", "b3"]);
    expect(isLandEditorWorldPickable("kitchen", false)).toBe(true);
    expect(kitItemIdForHomesteadBuilding("kitchen")).toBe("kitchen_kit");
    expect(
      kitInventoryIdAfterPickup(
        new Set(["old"]),
        [
          { id: "old", itemId: "wheat" },
          { id: "fresh", itemId: "kitchen_kit" },
        ],
        "kitchen_kit",
      ),
    ).toBe("fresh");
  });

  it("ignores world picks while placing and falls back to any matching kit (edge)", () => {
    expect(isLandEditorWorldPickable("forge", true)).toBe(false);
    expect(
      kitInventoryIdAfterPickup(
        ["a"],
        [{ id: "a", itemId: "forge_kit" }],
        "forge_kit",
      ),
    ).toBe("a");
    expect(kitItemIdForHomesteadBuilding("decor_banner")).toBe("banner_kit");
  });

  it("refuses boards, empty kit ids, and missing bags (failure)", () => {
    expect(isLandEditorWorldPickable("build_board", false)).toBe(false);
    expect(isLandEditorWorldPickable("notice_board", false)).toBe(false);
    expect(kitItemIdForHomesteadBuilding("")).toBeNull();
    expect(kitItemIdForHomesteadBuilding("portal")).toBeNull();
    expect(kitInventoryIdAfterPickup(new Set(), null, "kitchen_kit")).toBeNull();
    expect(kitInventoryIdAfterPickup(new Set(), [], "")).toBeNull();
    expect(
      landEditorPickupBuildings([{ id: "x", type: "vendor_stall" }]),
    ).toEqual([]);
    expect(
      landEditorPickupBuildings([
        { id: "stock", type: "tree_stump", slotIndex: 800 },
        { id: "mine", type: "tree_stump", slotIndex: 100 },
      ]).map((b) => b.id),
    ).toEqual(["mine"]);
    expect(isLandEditorWorldPickable("tree_stump", false, 800)).toBe(false);
    expect(isLandEditorWorldPickable("tree_stump", false, 100)).toBe(true);
  });
});
