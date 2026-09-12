import { describe, expect, it } from "vitest";
import {
  FISHING_DOCK,
  FISHING_DOCK_FIRST_WALKUP_WORLD_TIP,
  fishingDockFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_FISHING_DOCK_WALKUP_CUE,
  firstFishingDockWalkUpCueText,
  GATHER_FISH_SUCCESS_CUE,
  isCoreSuccessCueText,
  shouldFlashFirstFishingDockWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL66.1 — First fishing dock walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near fishing dock;
 * catch rules / cooldown unchanged; min HUD.
 */
describe("CityLands PL66.1 first fishing dock walk-up tip once", () => {
  it("flashes Dock · catch fish on first dock proximity (happy)", () => {
    expect(firstFishingDockWalkUpCueText()).toBe(FIRST_FISHING_DOCK_WALKUP_CUE);
    expect(firstFishingDockWalkUpCueText()).toBe("Dock · catch fish");
    expect(firstFishingDockWalkUpCueText().toLowerCase()).toMatch(/catch|fish/);
    expect(isCoreSuccessCueText("Dock · catch fish")).toBe(true);
    expect(fishingDockFirstWalkUpWorldTip()).toBe(
      FISHING_DOCK_FIRST_WALKUP_WORLD_TIP,
    );
    expect(fishingDockFirstWalkUpWorldTip()).toMatch(/Catch/);
    expect(fishingDockFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstFishingDockWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstFishingDockWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstFishingDockWalkUpCue(false, false, true)).toBe(
      false,
    );
    expect(shouldFlashFirstFishingDockWalkUpCue(true, false, false)).toBe(
      false,
    );
    expect(shouldFlashFirstFishingDockWalkUpCue(false, true, false)).toBe(
      false,
    );
  });

  it("keeps catch cooldown / yields and min HUD (failure)", () => {
    expect(FISHING_DOCK.cooldownMs).toBe(60_000);
    expect(FISHING_DOCK.yieldQty).toBe(1);
    expect(FISHING_DOCK.yieldItemId).toBe("fish");
    expect(firstFishingDockWalkUpCueText()).not.toBe(GATHER_FISH_SUCCESS_CUE);
    expect(firstFishingDockWalkUpCueText().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(fishingDockFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Dock · sticky forever")).toBe(false);
    expect(shouldFlashFirstFishingDockWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstFishingDockWalkUpCue(true, true, true)).toBe(false);
  });
});
