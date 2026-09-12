import { describe, expect, it } from "vitest";
import {
  TOOL_EQUIP_WORLD_REINFORCE,
  toolEquipWorldReinforceBackground,
  shouldFlashToolEquipWorldReinforce,
} from "../../apps/web/lib/hud/tool-equip-feedback";
import {
  TOOL_REPAIR_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/tool-repair-feedback";
import {
  TOOL_LOW_WORLD_VIGNETTE,
} from "../../apps/web/lib/hud/tool-low-feedback";
import {
  EQUIP_TOOL_SUCCESS_CUE,
  UNEQUIP_TOOL_SUCCESS_CUE,
  equipToolSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL152.1 — Equip soft world reinforce.
 * Brief soft rim after tool equip ok (complements Equipped PL20.2 +
 * repair rim PL150.1). Durability rules unchanged; mute ok; fail silent.
 * Choice: one-shot cool ready-grip steel rim (not another Equipped toast) so
 * equip stays world-readable beside repair; unequip has its own rim (PL154.2).
 */
describe("CityLands PL152.1 equip soft world reinforce", () => {
  it("flashes quiet cool ready-grip steel rim when equip succeeds (happy)", () => {
    expect(shouldFlashToolEquipWorldReinforce(true, "tool-stack-1")).toBe(true);
    expect(TOOL_EQUIP_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(TOOL_EQUIP_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = toolEquipWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(TOOL_EQUIP_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Equipped ephemeral.
    expect(equipToolSuccessCueText("tool-stack-1")).toBe(EQUIP_TOOL_SUCCESS_CUE);
    expect(equipToolSuccessCueText("tool-stack-1")).toBe("Equipped");
  });

  it("stays quiet on fail / unequip; rim ≠ repair / tool-low (edge)", () => {
    expect(shouldFlashToolEquipWorldReinforce(false, "tool-stack-1")).toBe(false);
    expect(shouldFlashToolEquipWorldReinforce(true, null)).toBe(false);
    expect(shouldFlashToolEquipWorldReinforce(true, undefined)).toBe(false);
    expect(equipToolSuccessCueText(null)).toBe(UNEQUIP_TOOL_SUCCESS_CUE);

    expect(TOOL_EQUIP_WORLD_REINFORCE.outerRgba).not.toBe(
      TOOL_REPAIR_WORLD_REINFORCE.outerRgba,
    );
    expect(TOOL_EQUIP_WORLD_REINFORCE.outerRgba).not.toBe(
      TOOL_LOW_WORLD_VIGNETTE.outerRgba,
    );
    expect(TOOL_EQUIP_WORLD_REINFORCE.midRgba).not.toBe(
      TOOL_REPAIR_WORLD_REINFORCE.midRgba,
    );
    expect(TOOL_EQUIP_WORLD_REINFORCE.clearPct).toBeLessThan(
      TOOL_EQUIP_WORLD_REINFORCE.midPct,
    );
    expect(TOOL_EQUIP_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent durability / NFT combat; keeps ok+id gate (failure)", () => {
    expect(toolEquipWorldReinforceBackground()).not.toMatch(
      /durability\s*invent|cost\s*change|always.?on|nft/i,
    );
    expect(String(TOOL_EQUIP_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(TOOL_EQUIP_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashToolEquipWorldReinforce(true, "a")).not.toBe(
      shouldFlashToolEquipWorldReinforce(false, "a"),
    );
  });
});
