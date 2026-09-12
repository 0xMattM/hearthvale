import { describe, expect, it } from "vitest";

import {
  STATION_UPGRADE_WORLD_REINFORCE,
  shouldFlashStationUpgradeWorldReinforce,
  stationUpgradeWorldReinforceBackground,
} from "../../apps/web/lib/hud/station-upgrade-feedback";
import { EXPAND_FIELD_WORLD_REINFORCE } from "../../apps/web/lib/hud/expand-field-feedback";
import { CRAFT_COMPLETE_WORLD_REINFORCE } from "../../apps/web/lib/hud/craft-complete-feedback";
import { STATION_UPGRADE_PAD_FLASH } from "@game/shared";

/**
 * PL162.1 — Station-upgrade soft world reinforce leftover.
 * Brief soft rim after station upgrade ok (complements Upgraded PL48.1 +
 * copper pad PL137.1). Costs / tiers unchanged; mute ok; fail silent.
 * Choice: one-shot warm copper rim (not another Upgraded toast / pad-only) so
 * upgrade stays world-readable beside copper settle.
 */
describe("CityLands PL162.1 station-upgrade soft world reinforce", () => {
  it("flashes quiet warm copper rim when upgrade succeeds (happy)", () => {
    expect(shouldFlashStationUpgradeWorldReinforce(true, "mill")).toBe(true);
    expect(shouldFlashStationUpgradeWorldReinforce(true, "forge")).toBe(true);
    expect(STATION_UPGRADE_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(STATION_UPGRADE_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = stationUpgradeWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(STATION_UPGRADE_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — copper settle pad.
    expect(STATION_UPGRADE_PAD_FLASH.durationMs).toBeGreaterThan(0);
    expect(STATION_UPGRADE_PAD_FLASH.padColor).toMatch(/^#/);
  });

  it("stays quiet on fail / non-upgradable; rim ≠ craft olive / expand gold (edge)", () => {
    expect(shouldFlashStationUpgradeWorldReinforce(false, "mill")).toBe(false);
    expect(shouldFlashStationUpgradeWorldReinforce(true, "workshop")).toBe(
      false,
    );
    expect(shouldFlashStationUpgradeWorldReinforce(true, "loom")).toBe(false);

    expect(STATION_UPGRADE_WORLD_REINFORCE.outerRgba).not.toBe(
      CRAFT_COMPLETE_WORLD_REINFORCE.outerRgba,
    );
    expect(STATION_UPGRADE_WORLD_REINFORCE.midRgba).not.toBe(
      CRAFT_COMPLETE_WORLD_REINFORCE.midRgba,
    );
    expect(STATION_UPGRADE_WORLD_REINFORCE.outerRgba).not.toBe(
      EXPAND_FIELD_WORLD_REINFORCE.outerRgba,
    );
    expect(STATION_UPGRADE_WORLD_REINFORCE.midRgba).not.toBe(
      EXPAND_FIELD_WORLD_REINFORCE.midRgba,
    );
    expect(STATION_UPGRADE_WORLD_REINFORCE.clearPct).toBeLessThan(
      STATION_UPGRADE_WORLD_REINFORCE.midPct,
    );
    expect(STATION_UPGRADE_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent costs / NFT combat; keeps ok + type gate (failure)", () => {
    expect(stationUpgradeWorldReinforceBackground()).not.toMatch(
      /cost\s*change|always.?on|nft/i,
    );
    expect(String(STATION_UPGRADE_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(STATION_UPGRADE_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashStationUpgradeWorldReinforce(true, "mill")).not.toBe(
      shouldFlashStationUpgradeWorldReinforce(false, "mill"),
    );
  });
});
