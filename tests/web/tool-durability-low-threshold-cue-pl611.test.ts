import { describe, expect, it } from "vitest";
import { ITEMS, TOOL, isToolDurabilityLow } from "@game/shared";
import {
  ENERGY_LOW_SUCCESS_CUE,
  SUCCESS_CUE_MS,
  TOOL_BROKE_SUCCESS_CUE,
  TOOL_DURABILITY_LOW_SUCCESS_CUE,
  equippedToolDurabilitySnapshot,
  isCoreSuccessCueText,
  shouldFlashToolDurabilityLowBetweenStates,
  shouldFlashToolDurabilityLowCue,
  toolDurabilityLowThresholdCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL61.1 — Tool durability low threshold cue.
 * Brief TopBar `Tool low` when equipped tool first crosses into low band;
 * meter · low accent (PL21.1) stays; durability / break rules unchanged; mute ok.
 */
describe("CityLands PL61.1 tool durability low threshold cue", () => {
  it("flashes Tool low only when crossing into the low band (happy)", () => {
    expect(TOOL.lowWarnPct).toBe(20);
    expect(toolDurabilityLowThresholdCueText()).toBe(
      TOOL_DURABILITY_LOW_SUCCESS_CUE,
    );
    expect(toolDurabilityLowThresholdCueText()).toBe("Tool low");
    expect(isCoreSuccessCueText("Tool low")).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);

    // Wooden hoe max 25 → ≤5; 6 → 5 crosses
    expect(ITEMS.wooden_hoe.maxDurability).toBe(25);
    expect(isToolDurabilityLow(6, 25)).toBe(false);
    expect(isToolDurabilityLow(5, 25)).toBe(true);
    expect(shouldFlashToolDurabilityLowCue("t1", 6, 25, "t1", 5, 25)).toBe(
      true,
    );

    // Iron hammer max 50 → ≤10; 11 → 10 crosses
    expect(ITEMS.iron_hammer.maxDurability).toBe(50);
    expect(shouldFlashToolDurabilityLowCue("h1", 11, 50, "h1", 10, 50)).toBe(
      true,
    );

    const prev = {
      equippedToolInventoryId: "hoe-1",
      inventory: [
        { id: "hoe-1", itemId: "wooden_hoe", durability: 6 },
      ],
    };
    const next = {
      equippedToolInventoryId: "hoe-1",
      inventory: [
        { id: "hoe-1", itemId: "wooden_hoe", durability: 5 },
      ],
    };
    expect(shouldFlashToolDurabilityLowBetweenStates(prev, next)).toBe(true);
    expect(equippedToolDurabilitySnapshot(next.inventory, "hoe-1")).toEqual({
      inventoryId: "hoe-1",
      durability: 5,
      maxDurability: 25,
    });
  });

  it("stays quiet while already low, on repair, swap, or hydrate (edge)", () => {
    expect(shouldFlashToolDurabilityLowCue("t1", 5, 25, "t1", 4, 25)).toBe(
      false,
    );
    expect(shouldFlashToolDurabilityLowCue("t1", 5, 25, "t1", 5, 25)).toBe(
      false,
    );
    expect(shouldFlashToolDurabilityLowCue("t1", 4, 25, "t1", 25, 25)).toBe(
      false,
    );
    expect(shouldFlashToolDurabilityLowCue("t1", 6, 25, "t1", 20, 25)).toBe(
      false,
    );
    // Tool swap into an already-low stack stays quiet (equip cue owns that).
    expect(shouldFlashToolDurabilityLowCue("a", 25, 25, "b", 5, 25)).toBe(
      false,
    );
    expect(shouldFlashToolDurabilityLowCue(null, 6, 25, "t1", 5, 25)).toBe(
      false,
    );
    expect(
      shouldFlashToolDurabilityLowBetweenStates(null, {
        equippedToolInventoryId: "hoe-1",
        inventory: [{ id: "hoe-1", itemId: "wooden_hoe", durability: 5 }],
      }),
    ).toBe(false);
    expect(
      shouldFlashToolDurabilityLowBetweenStates(
        {
          equippedToolInventoryId: "hoe-1",
          inventory: [{ id: "hoe-1", itemId: "wooden_hoe", durability: 5 }],
        },
        {
          equippedToolInventoryId: "hoe-1",
          inventory: [{ id: "hoe-1", itemId: "wooden_hoe", durability: 4 }],
        },
      ),
    ).toBe(false);
  });

  it("refuses invalid numbers and does not invent durability rules (failure)", () => {
    expect(
      shouldFlashToolDurabilityLowCue("t1", Number.NaN, 25, "t1", 5, 25),
    ).toBe(false);
    expect(
      shouldFlashToolDurabilityLowCue("t1", 6, 25, "t1", Number.NaN, 25),
    ).toBe(false);
    expect(shouldFlashToolDurabilityLowCue("t1", 6, 0, "t1", 5, 25)).toBe(
      false,
    );
    expect(shouldFlashToolDurabilityLowCue("t1", 6, 25, "t1", 5, null)).toBe(
      false,
    );
    expect(toolDurabilityLowThresholdCueText()).not.toMatch(/\d/);
    expect(toolDurabilityLowThresholdCueText()).not.toBe(
      ENERGY_LOW_SUCCESS_CUE,
    );
    expect(toolDurabilityLowThresholdCueText()).not.toBe(
      TOOL_BROKE_SUCCESS_CUE,
    );
    expect(TOOL.lowWarnPct).toBe(20);
    expect(isCoreSuccessCueText("Tool low · always on")).toBe(false);
    expect(isCoreSuccessCueText("nearly broken")).toBe(false);
  });
});
