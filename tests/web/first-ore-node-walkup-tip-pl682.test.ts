import { describe, expect, it } from "vitest";
import {
  ORE_NODE,
  ORE_NODE_FIRST_WALKUP_WORLD_TIP,
  oreNodeFirstWalkUpWorldTip,
} from "@game/shared";
import {
  FIRST_ORE_NODE_WALKUP_CUE,
  GATHER_MINE_SUCCESS_CUE,
  firstOreNodeWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstOreNodeWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL68.2 — First ore node walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near ore node;
 * chip / hammer rules unchanged; min HUD.
 */
describe("CityLands PL68.2 first ore node walk-up tip once", () => {
  it("flashes Ore · chip ore on first ore proximity (happy)", () => {
    expect(firstOreNodeWalkUpCueText()).toBe(FIRST_ORE_NODE_WALKUP_CUE);
    expect(firstOreNodeWalkUpCueText()).toBe("Ore · chip ore");
    expect(firstOreNodeWalkUpCueText().toLowerCase()).toMatch(/chip|ore/);
    expect(isCoreSuccessCueText("Ore · chip ore")).toBe(true);
    expect(oreNodeFirstWalkUpWorldTip()).toBe(ORE_NODE_FIRST_WALKUP_WORLD_TIP);
    expect(oreNodeFirstWalkUpWorldTip()).toMatch(/Chip/);
    expect(oreNodeFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstOreNodeWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstOreNodeWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstOreNodeWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstOreNodeWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstOreNodeWalkUpCue(false, true, false)).toBe(false);
  });

  it("keeps chip cooldown / hammer gate and min HUD (failure)", () => {
    expect(ORE_NODE.cooldownMs).toBe(90_000);
    expect(ORE_NODE.yieldQty).toBe(1);
    expect(ORE_NODE.requiredTool).toBe("iron_hammer");
    expect(firstOreNodeWalkUpCueText()).not.toBe(GATHER_MINE_SUCCESS_CUE);
    expect(firstOreNodeWalkUpCueText().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(oreNodeFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Ore · sticky forever")).toBe(false);
    expect(shouldFlashFirstOreNodeWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstOreNodeWalkUpCue(true, true, true)).toBe(false);
  });
});
