import { describe, expect, it } from "vitest";
import {
  FISHING_DOCK,
  FISHING_DOCK_READY_WATER_SHIMMER,
  FISH_CATCH_SPLASH_FLASH,
  GATHER_SUCCESS_PAD_FLASH,
  fishCatchSplashFlashEmissiveIntensity,
  fishCatchSplashFlashEnvelope,
  fishCatchSplashFlashOpacity,
  shouldFlashFishCatchSplash,
  shouldFlashGatherSuccessPad,
  shouldShowFishCatchSplashFlash,
} from "@game/shared";

/**
 * PL132.1 — Fish-catch soft splash reinforce.
 * Choice: brief cool water splash on dock after catch ok (by building id),
 * distinct from mint-lime gather pad PL131.2 and continuous ready shimmer PL118.2;
 * catch rates / cooldown unchanged; mute ok.
 */
describe("CityLands PL132.1 fish-catch soft splash reinforce", () => {
  it("splashes water pad on dock catch success (happy)", () => {
    expect(shouldFlashFishCatchSplash(true, "fishing_dock")).toBe(true);
    expect(FISH_CATCH_SPLASH_FLASH.durationMs).toBeGreaterThan(0);
    expect(FISH_CATCH_SPLASH_FLASH.intensityPeak).toBeGreaterThan(0);
    expect(FISH_CATCH_SPLASH_FLASH.opacityPeak).toBeGreaterThan(0);

    expect(shouldShowFishCatchSplashFlash("dock1", "dock1")).toBe(true);
    expect(fishCatchSplashFlashEnvelope(0)).toBeCloseTo(1, 5);
    expect(fishCatchSplashFlashOpacity(1)).toBeCloseTo(
      FISH_CATCH_SPLASH_FLASH.opacityPeak,
      5,
    );
    expect(fishCatchSplashFlashEmissiveIntensity(1)).toBeCloseTo(
      FISH_CATCH_SPLASH_FLASH.intensityPeak,
      5,
    );
  });

  it("stays quiet on fail / non-dock; distinct from gather + ready shimmer (edge)", () => {
    expect(shouldFlashFishCatchSplash(false, "fishing_dock")).toBe(false);
    expect(shouldFlashFishCatchSplash(true, "tree_stump")).toBe(false);
    expect(shouldFlashFishCatchSplash(true, "ore_node")).toBe(false);
    expect(shouldFlashGatherSuccessPad(true, "fishing_dock")).toBe(false);

    expect(shouldShowFishCatchSplashFlash("dock1", null)).toBe(false);
    expect(shouldShowFishCatchSplashFlash("dock1", "dock2")).toBe(false);

    expect(FISH_CATCH_SPLASH_FLASH.padColor.toLowerCase()).not.toBe(
      GATHER_SUCCESS_PAD_FLASH.padColor.toLowerCase(),
    );
    expect(FISH_CATCH_SPLASH_FLASH.padColor.toLowerCase()).not.toBe(
      FISHING_DOCK_READY_WATER_SHIMMER.padColor.toLowerCase(),
    );
    expect(FISH_CATCH_SPLASH_FLASH.emissiveColor.toLowerCase()).not.toBe(
      GATHER_SUCCESS_PAD_FLASH.emissiveColor.toLowerCase(),
    );

    expect(
      fishCatchSplashFlashEnvelope(FISH_CATCH_SPLASH_FLASH.durationMs),
    ).toBe(0);
    expect(FISH_CATCH_SPLASH_FLASH.durationMs).toBeLessThan(2000);
  });

  it("keeps catch rates / cooldown; clamps envelope (failure)", () => {
    expect(FISHING_DOCK.cooldownMs).toBeGreaterThan(0);
    expect(FISHING_DOCK.yieldQty).toBeGreaterThan(0);
    expect(FISHING_DOCK.yieldItemId).toBe("fish");

    expect(fishCatchSplashFlashEnvelope(-1)).toBe(0);
    expect(fishCatchSplashFlashEnvelope(Number.NaN)).toBe(0);
    expect(fishCatchSplashFlashOpacity(2)).toBeCloseTo(
      FISH_CATCH_SPLASH_FLASH.opacityPeak,
      5,
    );
    expect(fishCatchSplashFlashEmissiveIntensity(-1)).toBe(0);
    expect(shouldFlashFishCatchSplash(true, "fishing_dock")).not.toBe(
      shouldFlashFishCatchSplash(false, "fishing_dock"),
    );
  });
});
