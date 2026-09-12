import { describe, expect, it } from "vitest";
import {
  TREE_STUMP_FIRST_WALKUP_WORLD_TIP,
  WOOD_STUMP,
  treeStumpFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_TREE_STUMP_WALKUP_CUE,
  GATHER_CHOP_SUCCESS_CUE,
  firstTreeStumpWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstTreeStumpWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL68.1 — First tree stump walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near tree stump;
 * chop rules / cooldown unchanged; min HUD.
 */
describe("CityLands PL68.1 first tree stump walk-up tip once", () => {
  it("flashes Stump · chop wood on first stump proximity (happy)", () => {
    expect(firstTreeStumpWalkUpCueText()).toBe(FIRST_TREE_STUMP_WALKUP_CUE);
    expect(firstTreeStumpWalkUpCueText()).toBe("Stump · chop wood");
    expect(firstTreeStumpWalkUpCueText().toLowerCase()).toMatch(/chop|wood/);
    expect(isCoreSuccessCueText("Stump · chop wood")).toBe(true);
    expect(treeStumpFirstWalkUpWorldTip()).toBe(
      TREE_STUMP_FIRST_WALKUP_WORLD_TIP,
    );
    expect(treeStumpFirstWalkUpWorldTip()).toMatch(/Chop/);
    expect(treeStumpFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstTreeStumpWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstTreeStumpWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstTreeStumpWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstTreeStumpWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstTreeStumpWalkUpCue(false, true, false)).toBe(false);
  });

  it("keeps chop cooldown / yields and min HUD (failure)", () => {
    expect(WOOD_STUMP.cooldownMs).toBe(75_000);
    expect(WOOD_STUMP.yieldQty).toBe(1);
    expect(WOOD_STUMP.yieldItemId).toBe("wood");
    expect(firstTreeStumpWalkUpCueText()).not.toBe(GATHER_CHOP_SUCCESS_CUE);
    expect(firstTreeStumpWalkUpCueText().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(treeStumpFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Stump · sticky forever")).toBe(false);
    expect(shouldFlashFirstTreeStumpWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstTreeStumpWalkUpCue(true, true, true)).toBe(false);
  });
});
