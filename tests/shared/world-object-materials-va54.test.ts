import { describe, expect, it } from "vitest";
import {
  BUILD_PLACE_SPAWN_FLASH,
  CRAFT_COMPLETE_BENCH_FLASH,
  EXPAND_FIELD_PAD_FLASH,
  FISH_CATCH_SPLASH_FLASH,
  GATHER_SUCCESS_PAD_FLASH,
  STATION_UPGRADE_PAD_FLASH,
  buildPlaceSpawnFlashEnvelope,
  craftCompleteBenchFlashEnvelope,
  expandFieldPadFlashEnvelope,
  fishCatchSplashFlashEnvelope,
  gatherSuccessPadFlashEnvelope,
  gatherSuccessPadFlashOpacity,
  stationUpgradePadFlashEnvelope,
} from "../../packages/shared/src/catalog";
import {
  cuePadFlashMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA5.4", () => {
  it("water splash disc reads smoother than land flash discs (happy)", () => {
    const kit = cuePadFlashMaterials();
    expect(kit.waterDisc.roughness).toBeLessThan(kit.disc.roughness);
    expect(kit.waterDisc.metalness).toBeGreaterThan(kit.disc.metalness);
    expect(worldObjectSurfacesDiffer(kit.disc, kit.waterDisc)).toBe(true);
  });

  it("land disc stays matte under gather/expand/build envelopes (edge)", () => {
    const kit = cuePadFlashMaterials();
    expect(kit.disc.roughness).toBeGreaterThan(0.7);
    expect(kit.disc.metalness).toBeLessThan(0.2);
    expect(gatherSuccessPadFlashEnvelope(0)).toBe(1);
    expect(gatherSuccessPadFlashOpacity(1)).toBe(
      GATHER_SUCCESS_PAD_FLASH.opacityPeak,
    );
    expect(expandFieldPadFlashEnvelope(0)).toBe(1);
    expect(buildPlaceSpawnFlashEnvelope(0)).toBe(1);
    expect(craftCompleteBenchFlashEnvelope(0)).toBe(1);
    expect(stationUpgradePadFlashEnvelope(0)).toBe(1);
    expect(fishCatchSplashFlashEnvelope(0)).toBe(1);
  });

  it("flash pad RGB + peaks stay intact across catalogs (failure)", () => {
    const kit = cuePadFlashMaterials();
    expect(GATHER_SUCCESS_PAD_FLASH.padColor).toBe("#7ec478");
    expect(FISH_CATCH_SPLASH_FLASH.padColor).toMatch(/^#/);
    expect(EXPAND_FIELD_PAD_FLASH.padColor).toMatch(/^#/);
    expect(BUILD_PLACE_SPAWN_FLASH.padColor).toMatch(/^#/);
    expect(CRAFT_COMPLETE_BENCH_FLASH.padColor).toBe("#9cbc58");
    expect(STATION_UPGRADE_PAD_FLASH.padColor).toBe("#c89058");
    expect(GATHER_SUCCESS_PAD_FLASH.opacityPeak).toBeGreaterThan(0.5);
    expect(STATION_UPGRADE_PAD_FLASH.intensityPeak).toBeGreaterThan(0.5);
    // Kit never invents pad colors — PBR only.
    expect(kit.disc.roughness).toBeGreaterThan(0.5);
    expect(kit.waterDisc.roughness).toBeLessThan(kit.disc.roughness);
    expect(GATHER_SUCCESS_PAD_FLASH.padColor).not.toBe(
      CRAFT_COMPLETE_BENCH_FLASH.padColor,
    );
    expect(FISH_CATCH_SPLASH_FLASH.padColor).not.toBe(
      GATHER_SUCCESS_PAD_FLASH.padColor,
    );
  });
});
