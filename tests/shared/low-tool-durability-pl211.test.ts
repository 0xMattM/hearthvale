import { describe, expect, it } from "vitest";
import { ITEMS, TOOL, isToolDurabilityLow } from "@game/shared";
import { ENERGY_LOW_TEXT_COLOR } from "../../apps/web/lib/hud/topbar-chrome";

/**
 * PL21.1 — Low tool durability accent (inventory + equipped TopBar; SoT threshold).
 */
describe("CityLands PL21.1 low tool durability accent", () => {
  it("warns at or below TOOL.lowWarnPct of max (happy)", () => {
    expect(TOOL.lowWarnPct).toBe(20);
    // Wooden hoe max 25 → ≤5 matches prior inventory hardcode
    expect(ITEMS.wooden_hoe.maxDurability).toBe(25);
    expect(isToolDurabilityLow(5, 25)).toBe(true);
    expect(isToolDurabilityLow(0, 25)).toBe(true);
    expect(isToolDurabilityLow(1, 25)).toBe(true);
    // Iron hammer max 50 → ≤10
    expect(ITEMS.iron_hammer.maxDurability).toBe(50);
    expect(isToolDurabilityLow(10, 50)).toBe(true);
    expect(ENERGY_LOW_TEXT_COLOR.length).toBeGreaterThan(0);
  });

  it("clears when repaired / healthier tool above threshold (edge)", () => {
    expect(isToolDurabilityLow(6, 25)).toBe(false);
    expect(isToolDurabilityLow(25, 25)).toBe(false);
    expect(isToolDurabilityLow(11, 50)).toBe(false);
    expect(isToolDurabilityLow(20, 100)).toBe(true);
    expect(isToolDurabilityLow(21, 100)).toBe(false);
  });

  it("refuses missing max / non-finite / non-tools (failure)", () => {
    expect(isToolDurabilityLow(null, 25)).toBe(false);
    expect(isToolDurabilityLow(5, null)).toBe(false);
    expect(isToolDurabilityLow(undefined, 25)).toBe(false);
    expect(isToolDurabilityLow(5, 0)).toBe(false);
    expect(isToolDurabilityLow(5, -10)).toBe(false);
    expect(isToolDurabilityLow(Number.NaN, 25)).toBe(false);
    expect(isToolDurabilityLow(5, Number.NaN)).toBe(false);
  });
});
