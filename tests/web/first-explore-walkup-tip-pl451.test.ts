import { describe, expect, it } from "vitest";
import {
  EXPLORE_FIRST_WALKUP_WORLD_TIP,
  exploreFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_EXPLORE_WALKUP_CUE,
  firstExploreWalkUpCueText,
  isCoreSuccessCueText,
  isEnteringExploreMap,
  shouldFlashFirstExploreWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL45.1 — First Explore walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip on first Explore map presence;
 * spawn rates unchanged; dismissible / not sticky forever; min HUD.
 */
describe("CityLands PL45.1 first Explore walk-up tip once", () => {
  it("flashes Explore · hunt + gather on first map presence (happy)", () => {
    expect(firstExploreWalkUpCueText()).toBe(FIRST_EXPLORE_WALKUP_CUE);
    expect(firstExploreWalkUpCueText()).toBe("Explore · hunt + gather");
    expect(firstExploreWalkUpCueText().toLowerCase()).toMatch(/hunt|gather/);
    expect(isCoreSuccessCueText("Explore · hunt + gather")).toBe(true);
    expect(exploreFirstWalkUpWorldTip()).toBe(EXPLORE_FIRST_WALKUP_WORLD_TIP);
    expect(exploreFirstWalkUpWorldTip()).toMatch(/Hunt|gather/i);

    expect(isEnteringExploreMap("city", "explore")).toBe(true);
    expect(isEnteringExploreMap(null, "explore")).toBe(true);
    expect(isEnteringExploreMap(null, "forest")).toBe(true);
    expect(shouldFlashFirstExploreWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen, tips off, or not entering (edge)", () => {
    expect(shouldFlashFirstExploreWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstExploreWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstExploreWalkUpCue(true, false, false)).toBe(false);
    expect(isEnteringExploreMap("explore", "explore")).toBe(false);
    expect(isEnteringExploreMap("forest", "explore")).toBe(false);
    expect(isEnteringExploreMap("explore", "city")).toBe(false);
    expect(isEnteringExploreMap("city", "city")).toBe(false);
  });

  it("keeps panels closed and spawn rates / min HUD unchanged (failure)", () => {
    expect(defaultClosedPanelIds()).not.toContain("explore");
    expect(firstExploreWalkUpCueText().toLowerCase()).not.toContain("always-on");
    expect(exploreFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Explore · sticky forever")).toBe(false);
    expect(shouldFlashFirstExploreWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstExploreWalkUpCue(true, true, true)).toBe(false);
  });
});
