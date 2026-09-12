import { describe, expect, it } from "vitest";
import {
  ANIMAL_PEN_READY_PAD_PULSE,
  CRAFT_COMPLETE_BENCH_FLASH,
  GATHER_SUCCESS_PAD_FLASH,
  ORE_NODE,
  WOOD_STUMP,
  gatherSuccessPadFlashEmissiveIntensity,
  gatherSuccessPadFlashEnvelope,
  gatherSuccessPadFlashOpacity,
  isGatherSuccessPadFlashBuilding,
  shouldFlashGatherSuccessPad,
  shouldShowGatherSuccessPadFlash,
} from "@game/shared";

/**
 * PL131.2 — Gather-success soft pad flash.
 * Choice: brief mint-lime pad on stump / ore / pen after gather ok (by building id)
 * so Chopped/Mined/Collected stays world-readable beside inventory flash PL128.2;
 * fishing dock splash deferred to PL132.1; yields / cooldowns unchanged; mute ok.
 */
describe("CityLands PL131.2 gather-success soft pad flash", () => {
  it("flashes settle pad on gather success for stump / ore / pen (happy)", () => {
    expect(shouldFlashGatherSuccessPad(true, "tree_stump")).toBe(true);
    expect(shouldFlashGatherSuccessPad(true, "ore_node")).toBe(true);
    expect(shouldFlashGatherSuccessPad(true, "animal_pen")).toBe(true);
    expect(isGatherSuccessPadFlashBuilding("tree_stump")).toBe(true);

    expect(GATHER_SUCCESS_PAD_FLASH.durationMs).toBeGreaterThan(0);
    expect(GATHER_SUCCESS_PAD_FLASH.intensityPeak).toBeGreaterThan(0);
    expect(GATHER_SUCCESS_PAD_FLASH.opacityPeak).toBeGreaterThan(0);

    expect(shouldShowGatherSuccessPadFlash("b1", "b1")).toBe(true);
    expect(gatherSuccessPadFlashEnvelope(0)).toBeCloseTo(1, 5);
    expect(gatherSuccessPadFlashOpacity(1)).toBeCloseTo(
      GATHER_SUCCESS_PAD_FLASH.opacityPeak,
      5,
    );
    expect(gatherSuccessPadFlashEmissiveIntensity(1)).toBeCloseTo(
      GATHER_SUCCESS_PAD_FLASH.intensityPeak,
      5,
    );
  });

  it("stays quiet on fail / dock / mismatch; distinct from craft + pen ready (edge)", () => {
    expect(shouldFlashGatherSuccessPad(false, "tree_stump")).toBe(false);
    expect(shouldFlashGatherSuccessPad(true, "fishing_dock")).toBe(false);
    expect(shouldFlashGatherSuccessPad(true, "mill")).toBe(false);
    expect(isGatherSuccessPadFlashBuilding("fishing_dock")).toBe(false);

    expect(shouldShowGatherSuccessPadFlash("b1", null)).toBe(false);
    expect(shouldShowGatherSuccessPadFlash("b1", "b2")).toBe(false);

    expect(GATHER_SUCCESS_PAD_FLASH.padColor.toLowerCase()).not.toBe(
      CRAFT_COMPLETE_BENCH_FLASH.padColor.toLowerCase(),
    );
    expect(GATHER_SUCCESS_PAD_FLASH.padColor.toLowerCase()).not.toBe(
      ANIMAL_PEN_READY_PAD_PULSE.padColor.toLowerCase(),
    );
    expect(GATHER_SUCCESS_PAD_FLASH.emissiveColor.toLowerCase()).not.toBe(
      CRAFT_COMPLETE_BENCH_FLASH.emissiveColor.toLowerCase(),
    );

    expect(
      gatherSuccessPadFlashEnvelope(GATHER_SUCCESS_PAD_FLASH.durationMs),
    ).toBe(0);
    expect(GATHER_SUCCESS_PAD_FLASH.durationMs).toBeLessThan(2000);
  });

  it("keeps yields / cooldowns; clamps envelope (failure)", () => {
    expect(WOOD_STUMP.cooldownMs).toBeGreaterThan(0);
    expect(ORE_NODE.cooldownMs).toBeGreaterThan(0);
    expect(WOOD_STUMP.yieldQty).toBeGreaterThan(0);
    expect(ORE_NODE.yieldQty).toBeGreaterThan(0);

    expect(gatherSuccessPadFlashEnvelope(-1)).toBe(0);
    expect(gatherSuccessPadFlashEnvelope(Number.NaN)).toBe(0);
    expect(gatherSuccessPadFlashOpacity(2)).toBeCloseTo(
      GATHER_SUCCESS_PAD_FLASH.opacityPeak,
      5,
    );
    expect(gatherSuccessPadFlashEmissiveIntensity(-1)).toBe(0);
    expect(shouldFlashGatherSuccessPad(true, "ore_node")).not.toBe(
      shouldFlashGatherSuccessPad(false, "ore_node"),
    );
  });
});
