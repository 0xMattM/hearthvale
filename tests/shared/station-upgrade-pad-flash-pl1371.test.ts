import { describe, expect, it } from "vitest";
import {
  BUILDING_UPGRADES,
  CRAFT_COMPLETE_BENCH_FLASH,
  BUILD_PLACE_SPAWN_FLASH,
  STATION_UPGRADE_PAD_FLASH,
  shouldFlashStationUpgradePad,
  shouldShowStationUpgradePadFlash,
  stationUpgradePadFlashEmissiveIntensity,
  stationUpgradePadFlashEnvelope,
  stationUpgradePadFlashOpacity,
} from "@game/shared";
import { stationUpgradeSuccessCueText } from "../../apps/web/lib/hud/success-cue";

/**
 * PL137.1 — Station-upgrade soft pad flash.
 * Choice: brief copper pad settle on the upgraded mill/forge after ok upgrade
 * (id-scoped; not another Upgraded toast) so upgrade stays world-readable beside
 * craft olive PL131.1; costs / tiers unchanged; mute ok; fail silent.
 */
describe("CityLands PL137.1 station-upgrade soft pad flash", () => {
  it("flashes copper settle on upgrade ok for mill/forge (happy)", () => {
    expect(shouldFlashStationUpgradePad(true, "mill")).toBe(true);
    expect(shouldFlashStationUpgradePad(true, "forge")).toBe(true);
    expect(STATION_UPGRADE_PAD_FLASH.durationMs).toBeGreaterThan(0);
    expect(STATION_UPGRADE_PAD_FLASH.intensityPeak).toBeGreaterThan(0);
    expect(STATION_UPGRADE_PAD_FLASH.opacityPeak).toBeGreaterThan(0);

    expect(shouldShowStationUpgradePadFlash("b1", "b1")).toBe(true);
    expect(stationUpgradePadFlashEnvelope(0)).toBeCloseTo(1, 5);
    expect(stationUpgradePadFlashOpacity(1)).toBeCloseTo(
      STATION_UPGRADE_PAD_FLASH.opacityPeak,
      5,
    );
    expect(stationUpgradePadFlashEmissiveIntensity(1)).toBeCloseTo(
      STATION_UPGRADE_PAD_FLASH.intensityPeak,
      5,
    );

    // Complements — does not replace — Upgraded ephemeral.
    expect(stationUpgradeSuccessCueText()).toBe("Upgraded");
  });

  it("stays quiet on fail / mismatch; pad ≠ craft olive or spawn amber (edge)", () => {
    expect(shouldFlashStationUpgradePad(false, "mill")).toBe(false);
    expect(shouldFlashStationUpgradePad(true, "workshop")).toBe(false);
    expect(shouldFlashStationUpgradePad(true, "loom")).toBe(false);
    expect(shouldShowStationUpgradePadFlash("b1", null)).toBe(false);
    expect(shouldShowStationUpgradePadFlash("b1", "b2")).toBe(false);

    expect(STATION_UPGRADE_PAD_FLASH.padColor.toLowerCase()).not.toBe(
      CRAFT_COMPLETE_BENCH_FLASH.padColor.toLowerCase(),
    );
    expect(STATION_UPGRADE_PAD_FLASH.padColor.toLowerCase()).not.toBe(
      BUILD_PLACE_SPAWN_FLASH.padColor.toLowerCase(),
    );
    expect(
      stationUpgradePadFlashEnvelope(STATION_UPGRADE_PAD_FLASH.durationMs),
    ).toBe(0);
    expect(STATION_UPGRADE_PAD_FLASH.durationMs).toBeLessThan(2000);
  });

  it("keeps upgrade costs / tiers; clamps envelope (failure)", () => {
    expect(BUILDING_UPGRADES.mill.fromTier).toBe(1);
    expect(BUILDING_UPGRADES.mill.toTier).toBe(2);
    expect(BUILDING_UPGRADES.mill.coinCost).toBe(60);
    expect(BUILDING_UPGRADES.forge.coinCost).toBe(60);

    expect(stationUpgradePadFlashEnvelope(-1)).toBe(0);
    expect(stationUpgradePadFlashEnvelope(Number.NaN)).toBe(0);
    expect(stationUpgradePadFlashOpacity(2)).toBeCloseTo(
      STATION_UPGRADE_PAD_FLASH.opacityPeak,
      5,
    );
    expect(stationUpgradePadFlashEmissiveIntensity(-1)).toBe(0);
    expect(shouldFlashStationUpgradePad(true, "mill")).not.toBe(
      shouldFlashStationUpgradePad(false, "mill"),
    );
  });
});
