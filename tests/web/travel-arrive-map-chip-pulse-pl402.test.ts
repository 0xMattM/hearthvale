import { describe, expect, it } from "vitest";
import {
  MAP_CHIP_ARRIVE_PULSE_MS,
  formatCurrentMapChip,
  shouldPulseMapChipOnTravelArrive,
} from "../../apps/web/lib/hud/topbar-chrome";
import { LAND_DESTINATIONS } from "../../packages/shared/src";

/**
 * PL40.2 — Travel arrive map-chip pulse (brief TopBar accent; fare-free unchanged).
 */
describe("CityLands PL40.2 travel arrive map-chip pulse", () => {
  it("pulses map chip on successful free travel arrive (happy)", () => {
    expect(shouldPulseMapChipOnTravelArrive(true)).toBe(true);
    expect(MAP_CHIP_ARRIVE_PULSE_MS).toBeGreaterThanOrEqual(300);
    expect(MAP_CHIP_ARRIVE_PULSE_MS).toBeLessThanOrEqual(800);

    for (const dest of LAND_DESTINATIONS) {
      const chip = formatCurrentMapChip(dest.kind);
      expect(chip.word.length).toBeGreaterThan(0);
      expect(chip.accent).toMatch(/^#/);
    }
  });

  it("keeps pulse brief and destinations fare-free (edge)", () => {
    expect(MAP_CHIP_ARRIVE_PULSE_MS).toBe(450);
    expect(LAND_DESTINATIONS).toHaveLength(4);
    expect(formatCurrentMapChip("city").word).toBe("City");
    expect(formatCurrentMapChip("warrior").word).toBe("Arena");
    // Pulse confirms arrive only — does not invent fares or new destinations.
    expect(LAND_DESTINATIONS.map((d) => d.kind).sort()).toEqual(
      ["city", "explore", "player_land", "warrior"].sort(),
    );
  });

  it("stays quiet on refuse / failed travel (failure)", () => {
    expect(shouldPulseMapChipOnTravelArrive(false)).toBe(false);
    expect(shouldPulseMapChipOnTravelArrive(Boolean(null))).toBe(false);
    expect(shouldPulseMapChipOnTravelArrive(Boolean(0))).toBe(false);
  });
});
