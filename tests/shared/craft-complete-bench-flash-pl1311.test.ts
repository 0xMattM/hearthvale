import { describe, expect, it } from "vitest";
import {
  CRAFT_COMPLETE_BENCH_FLASH,
  PROCESS_STATION_TYPES,
  PROCESS_STATION_WORKING_EMISSIVE,
  RECIPES,
  craftCompleteBenchFlashEmissiveIntensity,
  craftCompleteBenchFlashEnvelope,
  craftCompleteBenchFlashOpacity,
  shouldFlashCraftCompleteBench,
  shouldShowCraftCompleteBenchFlash,
  shouldShowProcessStationWorkingEmissive,
} from "@game/shared";

/**
 * PL131.1 — Craft-complete soft bench flash.
 * Choice: brief sprout-olive pad settle on the active process station after
 * craft success (not a queue) so Crafted stays world-readable beside working
 * gold emissive PL121.2; recipes / XP unchanged; mute ok; fail silent.
 */
describe("CityLands PL131.1 craft-complete soft bench flash", () => {
  it("flashes settle pad on craft success for matching station (happy)", () => {
    expect(shouldFlashCraftCompleteBench(true)).toBe(true);
    expect(CRAFT_COMPLETE_BENCH_FLASH.durationMs).toBeGreaterThan(0);
    expect(CRAFT_COMPLETE_BENCH_FLASH.intensityPeak).toBeGreaterThan(0);
    expect(CRAFT_COMPLETE_BENCH_FLASH.opacityPeak).toBeGreaterThan(0);

    for (const type of PROCESS_STATION_TYPES) {
      expect(shouldShowCraftCompleteBenchFlash(type, type)).toBe(true);
    }

    expect(craftCompleteBenchFlashEnvelope(0)).toBeCloseTo(1, 5);
    expect(
      craftCompleteBenchFlashOpacity(1),
    ).toBeCloseTo(CRAFT_COMPLETE_BENCH_FLASH.opacityPeak, 5);
    expect(
      craftCompleteBenchFlashEmissiveIntensity(1),
    ).toBeCloseTo(CRAFT_COMPLETE_BENCH_FLASH.intensityPeak, 5);
  });

  it("stays quiet on fail / mismatch; distinct from working gold (edge)", () => {
    expect(shouldFlashCraftCompleteBench(false)).toBe(false);
    expect(shouldShowCraftCompleteBenchFlash("mill", null)).toBe(false);
    expect(shouldShowCraftCompleteBenchFlash("mill", "forge")).toBe(false);
    expect(shouldShowCraftCompleteBenchFlash("tree_stump", "mill")).toBe(false);

    expect(
      CRAFT_COMPLETE_BENCH_FLASH.padColor.toLowerCase(),
    ).not.toBe(PROCESS_STATION_WORKING_EMISSIVE.padColor.toLowerCase());
    expect(
      CRAFT_COMPLETE_BENCH_FLASH.emissiveColor.toLowerCase(),
    ).not.toBe(PROCESS_STATION_WORKING_EMISSIVE.emissiveColor.toLowerCase());

    expect(
      craftCompleteBenchFlashEnvelope(CRAFT_COMPLETE_BENCH_FLASH.durationMs),
    ).toBe(0);
    expect(CRAFT_COMPLETE_BENCH_FLASH.durationMs).toBeLessThan(2000);

    // Working panel glow still independent.
    expect(shouldShowProcessStationWorkingEmissive("mill", "mill")).toBe(true);
  });

  it("keeps recipes / XP; clamps envelope (failure)", () => {
    const flour = RECIPES.find((r) => r.id === "mill_flour");
    expect(flour).toBeDefined();
    expect(flour!.station).toBe("mill");
    expect(flour!.energyCost).toBeGreaterThan(0);
    expect(typeof flour!.minProfessionXp).toBe("number");

    expect(craftCompleteBenchFlashEnvelope(-1)).toBe(0);
    expect(craftCompleteBenchFlashEnvelope(Number.NaN)).toBe(0);
    expect(craftCompleteBenchFlashOpacity(2)).toBeCloseTo(
      CRAFT_COMPLETE_BENCH_FLASH.opacityPeak,
      5,
    );
    expect(craftCompleteBenchFlashEmissiveIntensity(-1)).toBe(0);
    expect(shouldFlashCraftCompleteBench(true)).not.toBe(
      shouldFlashCraftCompleteBench(false),
    );
  });
});
