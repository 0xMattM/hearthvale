import { describe, expect, it } from "vitest";
import {
  VISIT_LAND_FIRST_WALKUP_WORLD_TIP,
  visitLandFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_VISIT_LAND_CUE,
  firstVisitLandCueText,
  isCoreSuccessCueText,
  shouldFlashFirstVisitLandCue,
  SUCCESS_CUE_MS,
  visitSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL53.1 — First visit land tip once.
 * One-shot ephemeral TopBar + soft banner tip on first visit;
 * complements cool visit tint; visit rules / trade hotkey unchanged; min HUD.
 */
describe("CityLands PL53.1 first visit land tip once", () => {
  it("flashes Visit · trade · T on first visit edge (happy)", () => {
    expect(firstVisitLandCueText()).toBe(FIRST_VISIT_LAND_CUE);
    expect(firstVisitLandCueText()).toBe("Visit · trade · T");
    expect(firstVisitLandCueText().toLowerCase()).toMatch(/visit|trade/);
    expect(isCoreSuccessCueText("Visit · trade · T")).toBe(true);
    expect(visitLandFirstWalkUpWorldTip()).toBe(VISIT_LAND_FIRST_WALKUP_WORLD_TIP);
    expect(visitLandFirstWalkUpWorldTip()).toMatch(/Trade/);
    expect(visitLandFirstWalkUpWorldTip()).toMatch(/\bT\b/);

    expect(shouldFlashFirstVisitLandCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstVisitLandCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstVisitLandCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstVisitLandCue(true, false, false)).toBe(false);
    // Distinct from every-visit Visiting · name confirm (PL15.1)
    expect(firstVisitLandCueText()).not.toBe(visitSuccessCueText("Alice"));
    expect(visitSuccessCueText("Alice")).toMatch(/^Visiting · /);
  });

  it("keeps trade panel closed and visit rules / min HUD unchanged (failure)", () => {
    expect(defaultClosedPanelIds()).toContain("trade");
    expect(firstVisitLandCueText().toLowerCase()).not.toContain("always-on");
    expect(visitLandFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Visit · sticky forever")).toBe(false);
    expect(shouldFlashFirstVisitLandCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstVisitLandCue(true, true, true)).toBe(false);
  });
});
