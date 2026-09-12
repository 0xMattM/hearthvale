import { describe, expect, it } from "vitest";
import {
  ECONOMY_PANEL_OPEN_ACCENT_MS,
  shouldPlayVendorOpenAccent,
} from "../../apps/web/lib/hud/economy-panel-open-accent";

/**
 * PL19.1 — Vendor panel open accent (brief; same panel; walk-up open).
 */
describe("CityLands PL19.1 vendor panel open accent", () => {
  it("plays accent when vendor opens from closed (happy)", () => {
    expect(shouldPlayVendorOpenAccent(null, "vendor")).toBe(true);
    expect(shouldPlayVendorOpenAccent("inventory", "vendor")).toBe(true);
    expect(ECONOMY_PANEL_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(ECONOMY_PANEL_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(shouldPlayVendorOpenAccent("vendor", "vendor")).toBe(false);
    expect(shouldPlayVendorOpenAccent("vendor", null)).toBe(false);
    expect(shouldPlayVendorOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated panel opens (failure)", () => {
    expect(shouldPlayVendorOpenAccent(null, "market")).toBe(false);
    expect(shouldPlayVendorOpenAccent("vendor", "inventory")).toBe(false);
    expect(shouldPlayVendorOpenAccent("craft", "trade")).toBe(false);
  });
});
