import { describe, expect, it } from "vitest";
import {
  ENERGY_LOW_WORLD_VIGNETTE,
  HEALTH_LOW_WORLD_VIGNETTE,
} from "../../apps/web/lib/hud/energy-food-feedback";
import {
  TOOL_LOW_WORLD_VIGNETTE,
  shouldShowToolLowWorldVignette,
  toolLowWorldVignetteBackground,
} from "../../apps/web/lib/hud/tool-low-feedback";
import { ITEMS, TOOL, isToolDurabilityLow } from "@game/shared";

/**
 * PL132.2 — Tool-low soft world leftover.
 * Quiet cool steel edge vignette while equipped tool stays in TOOL.lowWarnPct
 * (complements TopBar PL61.1 + inventory accent PL21.1; not a HUD column).
 * Durability / break rules unchanged; clears when repaired/replaced; mute ok.
 * Choice: continuous soft edge tint while low (not one-shot) so worn tools stay
 * world-readable beside TopBar until repair/replace — distinct from energy/HP rims.
 */
describe("CityLands PL132.2 tool-low soft world leftover", () => {
  const max = ITEMS.iron_hammer.maxDurability!;
  const lowDur = Math.floor((TOOL.lowWarnPct / 100) * max);

  function stateWithTool(durability: number | null, equipped = true) {
    return {
      equippedToolInventoryId: equipped ? "inv-hammer-1" : null,
      inventory: [
        {
          id: "inv-hammer-1",
          itemId: "iron_hammer",
          qty: 1,
          durability,
        },
      ],
    };
  }

  it("shows soft edge vignette while equipped tool is in the low band (happy)", () => {
    expect(TOOL.lowWarnPct).toBe(20);
    expect(max).toBeGreaterThan(0);
    expect(isToolDurabilityLow(lowDur, max)).toBe(true);
    expect(shouldShowToolLowWorldVignette(stateWithTool(lowDur))).toBe(true);
    expect(shouldShowToolLowWorldVignette(stateWithTool(0))).toBe(true);

    expect(TOOL_LOW_WORLD_VIGNETTE.opacity).toBeGreaterThan(0);
    expect(TOOL_LOW_WORLD_VIGNETTE.clearPct).toBeLessThan(
      TOOL_LOW_WORLD_VIGNETTE.midPct,
    );
    const bg = toolLowWorldVignetteBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(TOOL_LOW_WORLD_VIGNETTE.outerRgba);
    expect(bg).toContain("transparent");
  });

  it("clears when repaired / unequipped / above threshold; distinct from energy·HP (edge)", () => {
    expect(shouldShowToolLowWorldVignette(stateWithTool(max))).toBe(false);
    expect(
      shouldShowToolLowWorldVignette(stateWithTool(lowDur + 1)),
    ).toBe(false);
    expect(
      shouldShowToolLowWorldVignette(stateWithTool(lowDur, false)),
    ).toBe(false);
    expect(
      shouldShowToolLowWorldVignette({
        equippedToolInventoryId: null,
        inventory: [],
      }),
    ).toBe(false);

    expect(TOOL_LOW_WORLD_VIGNETTE.outerRgba).not.toBe(
      ENERGY_LOW_WORLD_VIGNETTE.outerRgba,
    );
    expect(TOOL_LOW_WORLD_VIGNETTE.outerRgba).not.toBe(
      HEALTH_LOW_WORLD_VIGNETTE.outerRgba,
    );
    expect(TOOL_LOW_WORLD_VIGNETTE.midRgba).not.toBe(
      TOOL_LOW_WORLD_VIGNETTE.outerRgba,
    );
  });

  it("refuses missing stack / non-tool; keeps durability SoT (failure)", () => {
    expect(
      shouldShowToolLowWorldVignette({
        equippedToolInventoryId: "missing",
        inventory: [],
      }),
    ).toBe(false);
    expect(
      shouldShowToolLowWorldVignette({
        equippedToolInventoryId: "inv-wheat",
        inventory: [
          { id: "inv-wheat", itemId: "wheat", qty: 3, durability: null },
        ],
      }),
    ).toBe(false);
    expect(TOOL.lowWarnPct).toBe(20);
    expect(TOOL_LOW_WORLD_VIGNETTE.opacity).toBeLessThanOrEqual(1);
    expect(toolLowWorldVignetteBackground()).not.toMatch(/\bHUD\b/i);
  });
});
