import { describe, expect, it } from "vitest";
import {
  ALCHEMY_BENCH_FIRST_WALKUP_WORLD_TIP,
  PLAYER_LAND_STATIONS,
  alchemyBenchFirstWalkUpWorldTip,
  getRecipe,
} from "@game/shared";
import {
  FIRST_ALCHEMY_BENCH_WALKUP_CUE,
  firstAlchemyBenchWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstAlchemyBenchWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL77.2 — First alchemy-bench walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near alchemy bench;
 * craft recipes unchanged; min HUD.
 */
describe("CityLands PL77.2 first alchemy-bench walk-up tip once", () => {
  it("flashes Alchemy · brew tonic on first alchemy bench proximity (happy)", () => {
    expect(firstAlchemyBenchWalkUpCueText()).toBe(FIRST_ALCHEMY_BENCH_WALKUP_CUE);
    expect(firstAlchemyBenchWalkUpCueText()).toBe("Alchemy · brew tonic");
    expect(firstAlchemyBenchWalkUpCueText().toLowerCase()).toMatch(/brew/);
    expect(isCoreSuccessCueText("Alchemy · brew tonic")).toBe(true);
    expect(alchemyBenchFirstWalkUpWorldTip()).toBe(
      ALCHEMY_BENCH_FIRST_WALKUP_WORLD_TIP,
    );
    expect(alchemyBenchFirstWalkUpWorldTip()).toMatch(/Brew/);
    expect(alchemyBenchFirstWalkUpWorldTip()).toMatch(/\bE\b/);

    expect(shouldFlashFirstAlchemyBenchWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstAlchemyBenchWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstAlchemyBenchWalkUpCue(false, false, true)).toBe(
      false,
    );
    expect(shouldFlashFirstAlchemyBenchWalkUpCue(true, false, false)).toBe(
      false,
    );
    expect(shouldFlashFirstAlchemyBenchWalkUpCue(false, true, false)).toBe(
      false,
    );
  });

  it("keeps craft recipes and min HUD (failure)", () => {
    const tonic = getRecipe("brew_herbal_tonic");
    expect(tonic?.station).toBe("alchemy_bench");
    expect(tonic?.inputs).toEqual([
      { itemId: "wheat", qty: 2 },
      { itemId: "leather", qty: 1 },
    ]);
    expect(tonic?.output).toEqual({ itemId: "herbal_tonic", qty: 1 });
    expect(PLAYER_LAND_STATIONS.alchemy_bench.kitItemId).toBe("alchemy_bench_kit");
    expect(defaultClosedPanelIds()).toContain("craft");
    expect(firstAlchemyBenchWalkUpCueText().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(alchemyBenchFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Alchemy · sticky forever")).toBe(false);
    expect(shouldFlashFirstAlchemyBenchWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstAlchemyBenchWalkUpCue(true, true, true)).toBe(false);
  });
});
