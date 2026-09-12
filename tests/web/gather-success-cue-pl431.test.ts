import { describe, expect, it } from "vitest";
import {
  GATHER_CHOP_SUCCESS_CUE,
  GATHER_FISH_SUCCESS_CUE,
  GATHER_MINE_SUCCESS_CUE,
  GATHER_PEN_SUCCESS_CUE,
  GATHER_SUCCESS_CUE,
  gatherSuccessCueText,
  isCoreSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL43.1 — Gather success ephemeral.
 * Brief TopBar after chop / mine / dock / pen; SFX already plays; yields unchanged.
 */
describe("CityLands PL43.1 gather success ephemeral", () => {
  it("maps station types to short confirm copy (happy)", () => {
    expect(gatherSuccessCueText("tree_stump")).toBe(GATHER_CHOP_SUCCESS_CUE);
    expect(gatherSuccessCueText("tree_stump")).toBe("Chopped");
    expect(gatherSuccessCueText("ore_node")).toBe(GATHER_MINE_SUCCESS_CUE);
    expect(gatherSuccessCueText("ore_node")).toBe("Mined");
    expect(gatherSuccessCueText("fishing_dock")).toBe(GATHER_FISH_SUCCESS_CUE);
    expect(gatherSuccessCueText("fishing_dock")).toBe("Caught");
    expect(gatherSuccessCueText("animal_pen")).toBe(GATHER_PEN_SUCCESS_CUE);
    expect(gatherSuccessCueText("animal_pen")).toBe("Collected");
    expect(isCoreSuccessCueText("Chopped")).toBe(true);
    expect(isCoreSuccessCueText("Mined")).toBe(true);
    expect(isCoreSuccessCueText("Caught")).toBe(true);
    expect(isCoreSuccessCueText("Collected")).toBe(true);
  });

  it("falls back quietly for unknown / empty types (edge)", () => {
    expect(gatherSuccessCueText(null)).toBe(GATHER_SUCCESS_CUE);
    expect(gatherSuccessCueText(undefined)).toBe(GATHER_SUCCESS_CUE);
    expect(gatherSuccessCueText("")).toBe(GATHER_SUCCESS_CUE);
    expect(gatherSuccessCueText("crop_plot")).toBe(GATHER_SUCCESS_CUE);
    expect(gatherSuccessCueText("mill")).toBe("Gathered");
    expect(isCoreSuccessCueText("Gathered")).toBe(true);
  });

  it("does not invent sticky yields or always-on HUD (failure)", () => {
    expect(gatherSuccessCueText("tree_stump")).not.toMatch(/\d/);
    expect(gatherSuccessCueText("ore_node").toLowerCase()).not.toContain(
      "cooldown",
    );
    expect(gatherSuccessCueText("fishing_dock").toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Chopped · +3 wood sticky")).toBe(false);
    expect(gatherSuccessCueText("tree_stump").length).toBeLessThan(16);
  });
});
