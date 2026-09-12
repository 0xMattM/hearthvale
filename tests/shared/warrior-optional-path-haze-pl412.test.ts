import { describe, expect, it } from "vitest";
import {
  EXPLORE_WILDS_VISUAL,
  WARRIOR_ARENA_VISUAL,
  WARRIOR_BUILDINGS,
  arenaPlaqueCopy,
  cssHexRgbDistance,
  warriorArenaAtmosphere,
  warriorVsExploreHazeContrast,
} from "@game/shared";

/**
 * PL41.2 — Warrior optional-path soft haze.
 * Warm haze / plaque polish so Arena reads apart from Explore cool canopy (PL36.2).
 * No balance / gear ladder; free enter/exit.
 */
describe("CityLands PL41.2 warrior optional-path soft haze", () => {
  it("keeps warm arena haze apart from explore cool haze (happy)", () => {
    const arena = warriorArenaAtmosphere();
    expect(arena.hazeColor.toLowerCase()).toBe(
      WARRIOR_ARENA_VISUAL.hazeColor.toLowerCase(),
    );
    expect(arena.hazeColor.toLowerCase()).not.toBe(
      EXPLORE_WILDS_VISUAL.hazeColor.toLowerCase(),
    );
    expect(warriorVsExploreHazeContrast()).toBeGreaterThan(40);
    expect(arena.hazeOpacity).toBeGreaterThan(0);
    expect(arena.hazeOpacity).toBeLessThan(0.5);
    expect(arena.plaqueEmissive.toLowerCase()).toBe("#c03828");
    expect(arena.plaqueEmissiveIntensity).toBeGreaterThan(0);
    expect(arena.plaqueEmissiveIntensityLit).toBeGreaterThan(
      arena.plaqueEmissiveIntensity,
    );
  });

  it("keeps plaque optional-path copy and warm emissive vs face (edge)", () => {
    const plaque = arenaPlaqueCopy();
    const copy = `${plaque.title} ${plaque.lead} ${plaque.body}`;
    expect(copy.toLowerCase()).toMatch(/optional/);
    expect(copy).not.toMatch(/\d+\s*(dmg|hp|defense|dps)/i);
    expect(
      cssHexRgbDistance(
        WARRIOR_ARENA_VISUAL.plaqueFace,
        WARRIOR_ARENA_VISUAL.plaqueEmissive,
      ),
    ).toBeGreaterThan(20);
    expect(WARRIOR_BUILDINGS.some((b) => b.type === "portal")).toBe(true);
    expect(plaque.exitHint.toLowerCase()).toMatch(/free|portal/);
  });

  it("refuses inventing combat ladder fields on atmosphere SoT (failure)", () => {
    const keys = Object.keys(WARRIOR_ARENA_VISUAL);
    expect(keys.every((k) => !/dmg|hp|ladder|gear|damage|defense/i.test(k))).toBe(
      true,
    );
    expect(WARRIOR_ARENA_VISUAL.hazeColor).not.toBe(
      EXPLORE_WILDS_VISUAL.hazeColor,
    );
    expect(warriorVsExploreHazeContrast()).not.toBe(0);
    expect(warriorArenaAtmosphere().groundsColor).toBe(
      WARRIOR_ARENA_VISUAL.groundsColor,
    );
  });
});
