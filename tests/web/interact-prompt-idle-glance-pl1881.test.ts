import { describe, expect, it } from "vitest";
import {
  INTERACT_PROMPT_IDLE_GLANCE,
  INTERACT_PROMPT_SUCCESS_PULSE_MS,
  shouldShowInteractPromptIdleGlance,
} from "../../apps/web/lib/hud/interact-prompt-idle-glance";
import { buildInteractPromptHierarchy } from "../../apps/web/lib/hud/interact-prompt-hierarchy";

/**
 * PL188.1 — Interact-prompt idle soft glance leftover.
 * Choice: quiet periodic prompt chrome breath while in interact range with no
 * panel open (complements hierarchy + success pulse; no HUD column; mute ok).
 */
describe("CityLands PL188.1 interact-prompt idle soft glance leftover", () => {
  it("breathes quietly on prompt chrome while in range (happy)", () => {
    expect(shouldShowInteractPromptIdleGlance(true, false, false)).toBe(true);
    expect(INTERACT_PROMPT_IDLE_GLANCE.className).toBe(
      "interact-prompt--idle-glance",
    );
    expect(INTERACT_PROMPT_IDLE_GLANCE.periodMs).toBeGreaterThan(
      INTERACT_PROMPT_SUCCESS_PULSE_MS,
    );
    expect(INTERACT_PROMPT_IDLE_GLANCE.periodMs).toBeGreaterThanOrEqual(3000);
    expect(INTERACT_PROMPT_IDLE_GLANCE.periodMs).toBeLessThanOrEqual(8000);

    const hierarchy = buildInteractPromptHierarchy("Plant seed", true);
    expect(hierarchy.verb).toBe("Plant");
    expect(hierarchy.keyLabel).toBe("E");
  });

  it("clears when far, panel open, or success pulse wins (edge)", () => {
    expect(shouldShowInteractPromptIdleGlance(false, false, false)).toBe(false);
    expect(shouldShowInteractPromptIdleGlance(true, true, false)).toBe(false);
    expect(shouldShowInteractPromptIdleGlance(true, false, true)).toBe(false);
    expect(shouldShowInteractPromptIdleGlance(true, true, true)).toBe(false);
    expect(INTERACT_PROMPT_IDLE_GLANCE.periodMs).not.toBe(
      INTERACT_PROMPT_SUCCESS_PULSE_MS,
    );
    expect(INTERACT_PROMPT_SUCCESS_PULSE_MS).toBe(400);
  });

  it("does not invent HUD columns or change hierarchy chrome (failure)", () => {
    expect(shouldShowInteractPromptIdleGlance(false, false)).toBe(false);
    expect(String(INTERACT_PROMPT_IDLE_GLANCE.className)).not.toMatch(
      /column|toast|stack|fare|nft|combat/i,
    );
    expect(INTERACT_PROMPT_IDLE_GLANCE.periodMs).toBe(5200);
    const parts = buildInteractPromptHierarchy("Travel · free · City", true);
    expect(parts.verb).toBe("Travel");
    expect(parts.keyLabel).toBe("E");
  });
});
