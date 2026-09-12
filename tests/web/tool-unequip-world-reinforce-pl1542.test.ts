import { describe, expect, it } from "vitest";
import {
  TOOL_UNEQUIP_WORLD_REINFORCE,
  toolUnequipWorldReinforceBackground,
  shouldFlashToolUnequipWorldReinforce,
} from "../../apps/web/lib/hud/tool-unequip-feedback";
import {
  TOOL_EQUIP_WORLD_REINFORCE,
  shouldFlashToolEquipWorldReinforce,
} from "../../apps/web/lib/hud/tool-equip-feedback";
import {
  TOOL_REPAIR_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/tool-repair-feedback";
import {
  EQUIP_TOOL_SUCCESS_CUE,
  UNEQUIP_TOOL_SUCCESS_CUE,
  equipToolSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL154.2 — Unequip soft world reinforce.
 * Brief soft rim after tool unequip ok (complements Unequipped PL20.2 +
 * equip rim PL152.1). Durability rules unchanged; mute ok; fail silent.
 * Choice: one-shot cool release-grip mist rim (not another Unequipped toast) so
 * unequip stays world-readable beside ready-grip steel equip.
 */
describe("CityLands PL154.2 unequip soft world reinforce", () => {
  it("flashes quiet cool release-grip mist rim when unequip succeeds (happy)", () => {
    expect(shouldFlashToolUnequipWorldReinforce(true, null)).toBe(true);
    expect(shouldFlashToolUnequipWorldReinforce(true, undefined)).toBe(true);
    expect(TOOL_UNEQUIP_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(TOOL_UNEQUIP_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = toolUnequipWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(TOOL_UNEQUIP_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Unequipped ephemeral.
    expect(equipToolSuccessCueText(null)).toBe(UNEQUIP_TOOL_SUCCESS_CUE);
    expect(equipToolSuccessCueText(null)).toBe("Unequipped");
  });

  it("stays quiet on fail / equip; rim ≠ equip / repair (edge)", () => {
    expect(shouldFlashToolUnequipWorldReinforce(false, null)).toBe(false);
    expect(shouldFlashToolUnequipWorldReinforce(true, "tool-stack-1")).toBe(
      false,
    );
    expect(shouldFlashToolEquipWorldReinforce(true, "tool-stack-1")).toBe(true);
    expect(shouldFlashToolEquipWorldReinforce(true, null)).toBe(false);
    expect(equipToolSuccessCueText("tool-stack-1")).toBe(EQUIP_TOOL_SUCCESS_CUE);

    expect(TOOL_UNEQUIP_WORLD_REINFORCE.outerRgba).not.toBe(
      TOOL_EQUIP_WORLD_REINFORCE.outerRgba,
    );
    expect(TOOL_UNEQUIP_WORLD_REINFORCE.outerRgba).not.toBe(
      TOOL_REPAIR_WORLD_REINFORCE.outerRgba,
    );
    expect(TOOL_UNEQUIP_WORLD_REINFORCE.midRgba).not.toBe(
      TOOL_EQUIP_WORLD_REINFORCE.midRgba,
    );
    expect(TOOL_UNEQUIP_WORLD_REINFORCE.clearPct).toBeLessThan(
      TOOL_UNEQUIP_WORLD_REINFORCE.midPct,
    );
    expect(TOOL_UNEQUIP_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent durability / NFT combat; keeps ok+null gate (failure)", () => {
    expect(toolUnequipWorldReinforceBackground()).not.toMatch(
      /durability\s*invent|cost\s*change|always.?on|nft/i,
    );
    expect(String(TOOL_UNEQUIP_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(TOOL_UNEQUIP_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashToolUnequipWorldReinforce(true, null)).not.toBe(
      shouldFlashToolUnequipWorldReinforce(false, null),
    );
  });
});
