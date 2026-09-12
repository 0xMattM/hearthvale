import { describe, expect, it } from "vitest";
import {
  INVENTORY_OPEN_ACCENT_MS,
  shouldPlayDeedOpenAccent,
  shouldPlaySettingsOpenAccent,
} from "../../apps/web/lib/hud/inventory-open-accent";
import { LAND_DEED } from "@game/shared";

/**
 * PL55.2 — Deed panel open accent (brief; B; no combat power; wallet path).
 */
describe("CityLands PL55.2 deed panel open accent", () => {
  it("plays accent when deeds opens from closed (happy)", () => {
    expect(shouldPlayDeedOpenAccent(null, "deeds")).toBe(true);
    expect(shouldPlayDeedOpenAccent("settings", "deeds")).toBe(true);
    expect(shouldPlayDeedOpenAccent("inventory", "deeds")).toBe(true);
    expect(INVENTORY_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(INVENTORY_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(shouldPlayDeedOpenAccent("deeds", "deeds")).toBe(false);
    expect(shouldPlayDeedOpenAccent("deeds", null)).toBe(false);
    expect(shouldPlayDeedOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated opens; deed stays cosmetic / no combat (failure)", () => {
    expect(shouldPlayDeedOpenAccent(null, "settings")).toBe(false);
    expect(shouldPlayDeedOpenAccent("deeds", "settings")).toBe(false);
    expect(shouldPlaySettingsOpenAccent(null, "deeds")).toBe(false);
    expect(LAND_DEED.disclaimer.toLowerCase()).toMatch(
      /cosmetic|optional|not|combat|power|gate/,
    );
  });
});
