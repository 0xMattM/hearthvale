import { describe, expect, it } from "vitest";
import {
  TOOL_REPAIR_WORLD_REINFORCE,
  toolRepairWorldReinforceBackground,
  shouldFlashToolRepairWorldReinforce,
} from "../../apps/web/lib/hud/tool-repair-feedback";
import {
  TOOL_LOW_WORLD_VIGNETTE,
} from "../../apps/web/lib/hud/tool-low-feedback";
import {
  MAIL_SEND_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/mail-send-feedback";
import {
  DECOR_PLACE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/decor-place-feedback";
import {
  REPAIR_TOOL_SUCCESS_CUE,
  repairToolSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL150.1 — Tool-repair soft world reinforce.
 * Brief soft rim after tool repair ok (complements Repaired PL25.1 +
 * tool-low vignette clear PL132.2). Mats unchanged; mute ok; fail silent.
 * Choice: one-shot warm forge-pewter rim (not another Repaired toast) so
 * repair stays world-readable beside the existing ephemeral + vignette clear.
 */
describe("CityLands PL150.1 tool-repair soft world reinforce", () => {
  it("flashes quiet warm forge-pewter rim when repair succeeds (happy)", () => {
    expect(shouldFlashToolRepairWorldReinforce(true)).toBe(true);
    expect(TOOL_REPAIR_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(TOOL_REPAIR_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = toolRepairWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(TOOL_REPAIR_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Repaired ephemeral.
    expect(repairToolSuccessCueText()).toBe(REPAIR_TOOL_SUCCESS_CUE);
    expect(repairToolSuccessCueText()).toBe("Repaired");
  });

  it("stays quiet on fail; rim ≠ tool-low slate / mail / decor (edge)", () => {
    expect(shouldFlashToolRepairWorldReinforce(false)).toBe(false);

    expect(TOOL_REPAIR_WORLD_REINFORCE.outerRgba).not.toBe(
      TOOL_LOW_WORLD_VIGNETTE.outerRgba,
    );
    expect(TOOL_REPAIR_WORLD_REINFORCE.outerRgba).not.toBe(
      MAIL_SEND_WORLD_REINFORCE.outerRgba,
    );
    expect(TOOL_REPAIR_WORLD_REINFORCE.outerRgba).not.toBe(
      DECOR_PLACE_WORLD_REINFORCE.outerRgba,
    );
    expect(TOOL_REPAIR_WORLD_REINFORCE.clearPct).toBeLessThan(
      TOOL_REPAIR_WORLD_REINFORCE.midPct,
    );
    expect(TOOL_REPAIR_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent repair mats / costs; keeps ok gate (failure)", () => {
    expect(toolRepairWorldReinforceBackground()).not.toMatch(
      /mat\s*invent|cost\s*change|always.?on|nft/i,
    );
    expect(String(TOOL_REPAIR_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(TOOL_REPAIR_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashToolRepairWorldReinforce(true)).not.toBe(
      shouldFlashToolRepairWorldReinforce(false),
    );
  });
});
