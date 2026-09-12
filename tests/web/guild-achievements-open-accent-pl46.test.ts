import { describe, expect, it } from "vitest";
import {
  INVENTORY_OPEN_ACCENT_MS,
  shouldPlayAchievementsOpenAccent,
  shouldPlayGuildOpenAccent,
  shouldPlaySettingsOpenAccent,
} from "../../apps/web/lib/hud/inventory-open-accent";

/**
 * PL46.1 — Guild panel open accent (brief; G; claim/war rules unchanged).
 */
describe("CityLands PL46.1 guild panel open accent", () => {
  it("plays accent when guild opens from closed (happy)", () => {
    expect(shouldPlayGuildOpenAccent(null, "guild")).toBe(true);
    expect(shouldPlayGuildOpenAccent("inventory", "guild")).toBe(true);
    expect(INVENTORY_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(INVENTORY_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(shouldPlayGuildOpenAccent("guild", "guild")).toBe(false);
    expect(shouldPlayGuildOpenAccent("guild", null)).toBe(false);
    expect(shouldPlayGuildOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated panel opens (failure)", () => {
    expect(shouldPlayGuildOpenAccent(null, "settings")).toBe(false);
    expect(shouldPlayGuildOpenAccent("guild", "achievements")).toBe(false);
    expect(shouldPlayGuildOpenAccent(null, "achievements")).toBe(false);
    expect(shouldPlaySettingsOpenAccent(null, "guild")).toBe(false);
  });
});

/**
 * PL46.2 — Achievements panel open accent (brief; A; stub counters unchanged).
 */
describe("CityLands PL46.2 achievements panel open accent", () => {
  it("plays accent when achievements opens from closed (happy)", () => {
    expect(shouldPlayAchievementsOpenAccent(null, "achievements")).toBe(true);
    expect(shouldPlayAchievementsOpenAccent("guild", "achievements")).toBe(
      true,
    );
    expect(INVENTORY_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(INVENTORY_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(shouldPlayAchievementsOpenAccent("achievements", "achievements")).toBe(
      false,
    );
    expect(shouldPlayAchievementsOpenAccent("achievements", null)).toBe(false);
    expect(shouldPlayAchievementsOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated panel opens (failure)", () => {
    expect(shouldPlayAchievementsOpenAccent(null, "guild")).toBe(false);
    expect(shouldPlayAchievementsOpenAccent("achievements", "settings")).toBe(
      false,
    );
    expect(shouldPlayGuildOpenAccent(null, "achievements")).toBe(false);
  });
});
