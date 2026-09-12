import { describe, expect, it } from "vitest";
import {
  MAP_CHIP_ARRIVE_PULSE_MS,
  MAP_CHIP_IDLE_GLANCE,
  formatCurrentMapChip,
  shouldPulseMapChipOnTravelArrive,
  shouldShowMapChipIdleGlance,
} from "../../apps/web/lib/hud/topbar-chrome";
import { LAND_DESTINATIONS } from "../../packages/shared/src";

/**
 * PL185.2 — Map-chip idle soft glance leftover.
 * Choice: quiet periodic TopBar map-chip breath while walking with no panel
 * open (complements arrive pulse + travel open accent; fares free; min HUD).
 */
describe("CityLands PL185.2 map-chip idle soft glance leftover", () => {
  it("breathes quietly on the map chip while walking (happy)", () => {
    expect(shouldShowMapChipIdleGlance(false)).toBe(true);
    expect(MAP_CHIP_IDLE_GLANCE.className).toBe("topbar-map-chip--idle-glance");
    expect(MAP_CHIP_IDLE_GLANCE.periodMs).toBeGreaterThan(MAP_CHIP_ARRIVE_PULSE_MS);
    expect(MAP_CHIP_IDLE_GLANCE.periodMs).toBeGreaterThanOrEqual(3000);
    expect(MAP_CHIP_IDLE_GLANCE.periodMs).toBeLessThanOrEqual(8000);

    for (const dest of LAND_DESTINATIONS) {
      const chip = formatCurrentMapChip(dest.kind);
      expect(chip.word.length).toBeGreaterThan(0);
      expect(chip.accent).toMatch(/^#/);
    }
  });

  it("clears while a panel is open; arrive pulse stays distinct (edge)", () => {
    expect(shouldShowMapChipIdleGlance(true)).toBe(false);
    expect(shouldShowMapChipIdleGlance(Boolean(1))).toBe(false);
    expect(shouldPulseMapChipOnTravelArrive(true)).toBe(true);
    expect(MAP_CHIP_IDLE_GLANCE.periodMs).not.toBe(MAP_CHIP_ARRIVE_PULSE_MS);
    expect(LAND_DESTINATIONS).toHaveLength(4);
    expect(formatCurrentMapChip("city").word).toBe("City");
    expect(formatCurrentMapChip("warrior").word).toBe("Arena");
  });

  it("does not invent fares, destinations, or HUD columns (failure)", () => {
    expect(shouldShowMapChipIdleGlance(true)).toBe(false);
    expect(LAND_DESTINATIONS.map((d) => d.kind).sort()).toEqual(
      ["city", "explore", "player_land", "warrior"].sort(),
    );
    expect(LAND_DESTINATIONS.every((d) => !("fare" in d) && !("coinCost" in d))).toBe(
      true,
    );
    expect(String(MAP_CHIP_IDLE_GLANCE.className)).not.toMatch(
      /column|fare|caravan|nft|combat/i,
    );
    expect(MAP_CHIP_IDLE_GLANCE.periodMs).toBe(4800);
  });
});
