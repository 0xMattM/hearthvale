import { describe, expect, it } from "vitest";
import {
  INVENTORY_OPEN_ACCENT_MS,
  shouldPlayInventoryOpenAccent,
} from "../../apps/web/lib/hud/inventory-open-accent";

/**
 * PL9.2 — Inventory open accent (brief; same panel; hotkey open).
 */
describe("CityLands PL9.2 inventory open accent", () => {
  it("plays accent when bag opens from closed (happy)", () => {
    expect(shouldPlayInventoryOpenAccent(null, "inventory")).toBe(true);
    expect(shouldPlayInventoryOpenAccent("craft", "inventory")).toBe(true);
    expect(INVENTORY_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(INVENTORY_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(shouldPlayInventoryOpenAccent("inventory", "inventory")).toBe(
      false,
    );
    expect(shouldPlayInventoryOpenAccent("inventory", null)).toBe(false);
    expect(shouldPlayInventoryOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated panel opens (failure)", () => {
    expect(shouldPlayInventoryOpenAccent(null, "travel")).toBe(false);
    expect(shouldPlayInventoryOpenAccent("inventory", "market")).toBe(false);
    expect(shouldPlayInventoryOpenAccent("craft", "vendor")).toBe(false);
  });
});
