import { describe, expect, it } from "vitest";
import {
  ANIMAL_PEN,
  FISHING_DOCK,
  WOOD_STUMP,
} from "@game/shared";
import {
  CRAFT_START_SUCCESS_CUE,
  PEN_CLEAN_SUCCESS_CUE,
  PEN_FEED_SUCCESS_CUE,
  biggestInventoryGain,
  biggestInventoryLoss,
  catalogItemDisplayName,
  craftCollectCueText,
  craftStartCueText,
  expectedGatherLoot,
  formatActionLootCue,
  harvestSuccessCueText,
  isActionLootCueLine,
  plantSuccessCueText,
  resolveCraftOutputLoot,
  resolveGatherLootCue,
  resolveHarvestLootCue,
} from "../../apps/web/lib/hud/action-loot-cue";
import {
  gatherSuccessCueText,
  isCoreSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * HUD-ACTION-CUE-1 — Named item on the one ephemeral TopBar line.
 * Chop / mine / craft start / collect stay min HUD (not a toast stack).
 */
describe("HUD-ACTION-CUE-1 named action loot cue", () => {
  it("names catalog loot for chop, mine, craft start, and collect (happy)", () => {
    const wood = expectedGatherLoot("tree_stump");
    expect(wood?.name).toBe("Wood");
    expect(wood?.qty).toBe(WOOD_STUMP.yieldQty);
    expect(gatherSuccessCueText("tree_stump", wood)).toBe("Chopped · Wood ×1");

    const ore = expectedGatherLoot("ore_node", "iron");
    expect(ore?.name).toBe("Iron Ore");
    expect(gatherSuccessCueText("ore_node", ore)).toBe("Mined · Iron Ore ×1");

    const copper = expectedGatherLoot("ore_node", "copper");
    expect(gatherSuccessCueText("ore_node", copper)).toBe(
      "Mined · Copper Ore ×1",
    );

    const fish = expectedGatherLoot("fishing_dock");
    expect(fish?.qty).toBe(FISHING_DOCK.yieldQty);
    expect(gatherSuccessCueText("fishing_dock", fish)).toBe("Caught · Fish ×1");

    expect(craftStartCueText("mill_flour")).toBe("Working · Flour");
    expect(craftCollectCueText(resolveCraftOutputLoot("mill_flour"))).toBe(
      "Crafted · Flour ×1",
    );
    expect(harvestSuccessCueText(resolveHarvestLootCue("wheat"))).toBe(
      "Harvested · Wheat ×2",
    );
    expect(plantSuccessCueText("wheat_seed")).toBe("Planted · Wheat Seed");

    expect(isCoreSuccessCueText("Chopped · Wood ×1")).toBe(true);
    expect(isCoreSuccessCueText("Working · Flour")).toBe(true);
    expect(isCoreSuccessCueText("Crafted · Flour ×1")).toBe(true);
    expect(isActionLootCueLine(CRAFT_START_SUCCESS_CUE)).toBe(true);
  });

  it("falls back to the short verb and prefers inventory deltas (edge)", () => {
    expect(gatherSuccessCueText("tree_stump")).toBe("Chopped");
    expect(gatherSuccessCueText("animal_pen")).toBe("Collected");
    expect(craftStartCueText(null)).toBe("Working");
    expect(craftStartCueText("not_a_recipe")).toBe("Working");
    expect(plantSuccessCueText("nope")).toBe("Planted");
    expect(harvestSuccessCueText(null)).toBe("Harvested");
    expect(formatActionLootCue("Crafted", { name: "  ", qty: 1 })).toBe(
      "Crafted",
    );
    expect(expectedGatherLoot("mill")).toBeNull();
    expect(catalogItemDisplayName(undefined)).toBeNull();

    const gain = biggestInventoryGain(
      [{ itemId: "wood", qty: 1 }],
      [{ itemId: "wood", qty: 3 }],
    );
    expect(gain).toEqual({ itemId: "wood", name: "Wood", qty: 2 });
    expect(
      resolveGatherLootCue("tree_stump", null, [{ itemId: "wood", qty: 1 }], [
        { itemId: "wood", qty: 4 },
      ])?.qty,
    ).toBe(3);

    const fed = resolveGatherLootCue(
      "animal_pen",
      null,
      [{ itemId: ANIMAL_PEN.feedItemId, qty: 2 }],
      [{ itemId: ANIMAL_PEN.feedItemId, qty: 1 }],
    );
    expect(gatherSuccessCueText("animal_pen", fed)).toBe("Fed · Wheat ×1");
    expect(gatherSuccessCueText("animal_pen", fed)).toContain(
      PEN_FEED_SUCCESS_CUE,
    );

    const bedded = resolveGatherLootCue(
      "animal_pen",
      null,
      [{ itemId: ANIMAL_PEN.cleanItemId, qty: 1 }],
      [],
    );
    expect(gatherSuccessCueText("animal_pen", bedded)).toBe("Bedded · Wood ×1");
    expect(gatherSuccessCueText("animal_pen", bedded)).toContain(
      PEN_CLEAN_SUCCESS_CUE,
    );
    expect(
      biggestInventoryLoss(
        [{ itemId: "wheat", qty: 1 }],
        [{ itemId: "wheat", qty: 1 }],
      ),
    ).toBeNull();
  });

  it("does not invent sticky yields or toast stacks (failure)", () => {
    expect(isActionLootCueLine("Chopped · +3 wood sticky")).toBe(false);
    expect(isCoreSuccessCueText("Chopped · +3 wood sticky")).toBe(false);
    expect(isActionLootCueLine("Working · Flour forever please")).toBe(false);
    expect(isActionLootCueLine(null)).toBe(false);
    expect(biggestInventoryGain(null, [{ itemId: "wood", qty: 9 }])).toBeNull();
    expect(resolveCraftOutputLoot("not_a_recipe")).toBeNull();
    expect(resolveHarvestLootCue("not_a_crop")).toBeNull();
    expect(gatherSuccessCueText("tree_stump").toLowerCase()).not.toContain(
      "always-on",
    );
    expect(craftStartCueText("mill_flour").length).toBeLessThan(28);
  });
});
