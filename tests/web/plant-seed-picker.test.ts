import { describe, expect, it } from "vitest";
import { plantableSeedsFromInventory } from "@game/shared";
import { cropVisual, oreVisual } from "../../apps/web/lib/resource-visuals";

/**
 * Seed picker + distinct crop/ore world tints.
 */
describe("plant seed picker and crop/ore visuals", () => {
  it("opens picker only when the bag holds more than one seed type (happy)", () => {
    const one = plantableSeedsFromInventory([{ itemId: "wheat_seed", qty: 3 }]);
    expect(one).toHaveLength(1);
    const many = plantableSeedsFromInventory([
      { itemId: "wheat_seed", qty: 1 },
      { itemId: "herb_seed", qty: 2 },
    ]);
    expect(many).toHaveLength(2);
  });

  it("tints ready corn vs wheat and copper vs iron veins (edge)", () => {
    const now = 1_000_000;
    const wheat = cropVisual("ready", now - 1, now, false, now - 1, "wheat");
    const corn = cropVisual("ready", now - 1, now, false, now - 1, "corn");
    expect(corn.headColor).not.toBe(wheat.headColor);
    const potatoGrow = cropVisual(
      "planted",
      now + 4 * 60 * 1000,
      now,
      false,
      now,
      "potato",
    );
    expect(potatoGrow.progress).toBeLessThan(0.1);
    const iron = oreVisual(true, false, "iron");
    const copper = oreVisual(true, false, "copper");
    expect(copper.veinColor).not.toBe(iron.veinColor);
  });

  it("does not invent a seed row for non-seed stacks (failure)", () => {
    expect(
      plantableSeedsFromInventory([{ itemId: "iron_ore", qty: 9 }]),
    ).toEqual([]);
    const empty = cropVisual("empty", null, 1, false, null, "herb");
    expect(empty.headColor).toBeNull();
    expect(empty.stemHeight).toBe(0);
  });
});
