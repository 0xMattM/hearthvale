import { describe, expect, it } from "vitest";
import {
  FORGE_FIRST_WALKUP_WORLD_TIP,
  PLAYER_LAND_STATIONS,
  forgeFirstWalkUpWorldTip,
  getRecipe,
} from "@game/shared";
import {
  FIRST_FORGE_WALKUP_CUE,
  firstForgeWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstForgeWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL74.3 — First forge walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near forge;
 * craft recipes unchanged; min HUD.
 */
describe("CityLands PL74.3 first forge walk-up tip once", () => {
  it("flashes Forge · smelt iron on first forge proximity (happy)", () => {
    expect(firstForgeWalkUpCueText()).toBe(FIRST_FORGE_WALKUP_CUE);
    expect(firstForgeWalkUpCueText()).toBe("Forge · smelt iron");
    expect(firstForgeWalkUpCueText().toLowerCase()).toMatch(/smelt/);
    expect(isCoreSuccessCueText("Forge · smelt iron")).toBe(true);
    expect(forgeFirstWalkUpWorldTip()).toBe(FORGE_FIRST_WALKUP_WORLD_TIP);
    expect(forgeFirstWalkUpWorldTip()).toMatch(/Smelt/);
    expect(forgeFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstForgeWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstForgeWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstForgeWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstForgeWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstForgeWalkUpCue(false, true, false)).toBe(false);
  });

  it("keeps craft recipes and min HUD (failure)", () => {
    const bar = getRecipe("smelt_iron_bar");
    expect(bar?.station).toBe("forge");
    expect(bar?.inputs).toEqual([{ itemId: "iron_ore", qty: 2 }]);
    expect(bar?.output).toEqual({ itemId: "iron_bar", qty: 1 });
    expect(PLAYER_LAND_STATIONS.forge.kitItemId).toBe("forge_kit");
    expect(defaultClosedPanelIds()).toContain("craft");
    expect(firstForgeWalkUpCueText().toLowerCase()).not.toContain("always-on");
    expect(forgeFirstWalkUpWorldTip().toLowerCase()).not.toContain("always-on");
    expect(isCoreSuccessCueText("Forge · sticky forever")).toBe(false);
    expect(shouldFlashFirstForgeWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstForgeWalkUpCue(true, true, true)).toBe(false);
  });
});
