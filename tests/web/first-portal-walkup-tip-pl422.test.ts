import { describe, expect, it } from "vitest";
import {
  PORTAL_FIRST_WALKUP_WORLD_TIP,
  firstFreeTravelTip,
  portalFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_PORTAL_WALKUP_CUE,
  firstPortalWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstPortalWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL42.2 — First portal walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip on first portal proximity;
 * fare-free circuit unchanged; dismissible / not sticky forever; min HUD.
 */
describe("CityLands PL42.2 first portal walk-up tip once", () => {
  it("flashes Portal · fare-free on first proximity edge (happy)", () => {
    expect(firstPortalWalkUpCueText()).toBe(FIRST_PORTAL_WALKUP_CUE);
    expect(firstPortalWalkUpCueText()).toBe("Portal · fare-free");
    expect(firstPortalWalkUpCueText().toLowerCase()).toMatch(/fare-free|free/);
    expect(isCoreSuccessCueText("Portal · fare-free")).toBe(true);
    expect(portalFirstWalkUpWorldTip()).toBe(PORTAL_FIRST_WALKUP_WORLD_TIP);
    expect(portalFirstWalkUpWorldTip()).toMatch(/Fare-free/);
    expect(portalFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstPortalWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstPortalWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstPortalWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstPortalWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstPortalWalkUpCue(false, true, false)).toBe(false);
    // Distinct from PL13.1 longer free_travel onboarding tip
    expect(firstPortalWalkUpCueText()).not.toBe(firstFreeTravelTip());
    expect(firstPortalWalkUpCueText().length).toBeLessThan(
      firstFreeTravelTip().length,
    );
  });

  it("keeps travel panel closed and free travel unchanged (failure)", () => {
    expect(defaultClosedPanelIds()).toContain("travel");
    expect(firstPortalWalkUpCueText().toLowerCase()).not.toContain("always-on");
    expect(portalFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Portal · fare-free · sticky forever")).toBe(
      false,
    );
    expect(shouldFlashFirstPortalWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstPortalWalkUpCue(true, true, true)).toBe(false);
  });
});
