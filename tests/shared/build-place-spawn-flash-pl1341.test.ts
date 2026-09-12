import { describe, expect, it } from "vitest";
import {
  BUILD_PLACE_SPAWN_FLASH,
  CRAFT_COMPLETE_BENCH_FLASH,
  FISH_CATCH_SPLASH_FLASH,
  GATHER_SUCCESS_PAD_FLASH,
  PLAYER_LAND_STATIONS,
  buildPlaceSpawnFlashEmissiveIntensity,
  buildPlaceSpawnFlashEnvelope,
  buildPlaceSpawnFlashOpacity,
  newlyPlacedStationBuildingId,
  shouldFlashBuildPlaceSpawn,
  shouldShowBuildPlaceSpawnFlash,
} from "@game/shared";

/**
 * PL134.1 — Build-place soft spawn flash.
 * Choice: brief warm timber-amber pad on the newly placed station id so
 * Homestead/Built stays world-readable beside beacon hide; place costs /
 * slots unchanged; mute ok; fail silent.
 */
describe("CityLands PL134.1 build-place soft spawn flash", () => {
  it("flashes spawn pad on place success for land stations (happy)", () => {
    expect(shouldFlashBuildPlaceSpawn(true, "mill")).toBe(true);
    expect(shouldFlashBuildPlaceSpawn(true, "tree_stump")).toBe(true);
    expect(shouldFlashBuildPlaceSpawn(true, "crop_plot")).toBe(true);
    expect(shouldFlashBuildPlaceSpawn(true, "alchemy_bench")).toBe(true);

    expect(BUILD_PLACE_SPAWN_FLASH.durationMs).toBeGreaterThan(0);
    expect(BUILD_PLACE_SPAWN_FLASH.intensityPeak).toBeGreaterThan(0);
    expect(BUILD_PLACE_SPAWN_FLASH.opacityPeak).toBeGreaterThan(0);

    expect(shouldShowBuildPlaceSpawnFlash("b9", "b9")).toBe(true);
    expect(buildPlaceSpawnFlashEnvelope(0)).toBeCloseTo(1, 5);
    expect(buildPlaceSpawnFlashOpacity(1)).toBeCloseTo(
      BUILD_PLACE_SPAWN_FLASH.opacityPeak,
      5,
    );
    expect(buildPlaceSpawnFlashEmissiveIntensity(1)).toBeCloseTo(
      BUILD_PLACE_SPAWN_FLASH.intensityPeak,
      5,
    );

    expect(
      newlyPlacedStationBuildingId(
        new Set(["a"]),
        [
          { id: "a", type: "mill" },
          { id: "b", type: "forge" },
        ],
        "forge",
      ),
    ).toBe("b");
  });

  it("stays quiet on fail / decor / mismatch; distinct from gather·craft·fish (edge)", () => {
    expect(shouldFlashBuildPlaceSpawn(false, "mill")).toBe(false);
    expect(shouldFlashBuildPlaceSpawn(true, "decor_pad")).toBe(false);
    expect(shouldFlashBuildPlaceSpawn(true, "planter")).toBe(false);
    expect(shouldFlashBuildPlaceSpawn(true, "portal")).toBe(false);

    expect(shouldShowBuildPlaceSpawnFlash("b1", null)).toBe(false);
    expect(shouldShowBuildPlaceSpawnFlash("b1", "b2")).toBe(false);

    expect(BUILD_PLACE_SPAWN_FLASH.padColor.toLowerCase()).not.toBe(
      CRAFT_COMPLETE_BENCH_FLASH.padColor.toLowerCase(),
    );
    expect(BUILD_PLACE_SPAWN_FLASH.padColor.toLowerCase()).not.toBe(
      GATHER_SUCCESS_PAD_FLASH.padColor.toLowerCase(),
    );
    expect(BUILD_PLACE_SPAWN_FLASH.padColor.toLowerCase()).not.toBe(
      FISH_CATCH_SPLASH_FLASH.padColor.toLowerCase(),
    );
    expect(BUILD_PLACE_SPAWN_FLASH.emissiveColor.toLowerCase()).not.toBe(
      GATHER_SUCCESS_PAD_FLASH.emissiveColor.toLowerCase(),
    );

    expect(
      buildPlaceSpawnFlashEnvelope(BUILD_PLACE_SPAWN_FLASH.durationMs),
    ).toBe(0);
    expect(BUILD_PLACE_SPAWN_FLASH.durationMs).toBeLessThan(2000);

    expect(
      newlyPlacedStationBuildingId(new Set(["a"]), [{ id: "a", type: "mill" }], "mill"),
    ).toBeNull();
  });

  it("keeps place costs / slots; clamps envelope (failure)", () => {
    expect(PLAYER_LAND_STATIONS.mill.kitItemId).toBe("mill_kit");
    expect(PLAYER_LAND_STATIONS.crop_plot.energyCost).toBeGreaterThan(0);
    expect(PLAYER_LAND_STATIONS.tree_stump.materials.length).toBeGreaterThan(0);

    expect(buildPlaceSpawnFlashEnvelope(-1)).toBe(0);
    expect(buildPlaceSpawnFlashEnvelope(Number.NaN)).toBe(0);
    expect(buildPlaceSpawnFlashOpacity(2)).toBeCloseTo(
      BUILD_PLACE_SPAWN_FLASH.opacityPeak,
      5,
    );
    expect(buildPlaceSpawnFlashEmissiveIntensity(-1)).toBe(0);
    expect(shouldFlashBuildPlaceSpawn(true, "mill")).not.toBe(
      shouldFlashBuildPlaceSpawn(false, "mill"),
    );
    expect(
      newlyPlacedStationBuildingId(
        ["x"],
        [{ id: "y", type: "notice_board" }],
        "notice_board",
      ),
    ).toBeNull();
  });
});
