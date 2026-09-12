import { describe, expect, it } from "vitest";
import {
  WORKSPACE_PANEL_OPEN_ACCENT_MS,
  shouldPlayDecorOpenAccent,
} from "../../apps/web/lib/hud/workspace-panel-open-accent";

/**
 * PL34.2 — Decor panel open accent (brief; walk-up; coin costs unchanged).
 */
describe("CityLands PL34.2 decor panel open accent", () => {
  it("plays accent when decor opens from closed (happy)", () => {
    expect(shouldPlayDecorOpenAccent(null, "decor")).toBe(true);
    expect(shouldPlayDecorOpenAccent("inventory", "decor")).toBe(true);
    expect(WORKSPACE_PANEL_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(WORKSPACE_PANEL_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(shouldPlayDecorOpenAccent("decor", "decor")).toBe(false);
    expect(shouldPlayDecorOpenAccent("decor", null)).toBe(false);
    expect(shouldPlayDecorOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated panel opens (failure)", () => {
    expect(shouldPlayDecorOpenAccent(null, "build")).toBe(false);
    expect(shouldPlayDecorOpenAccent("decor", "inventory")).toBe(false);
    expect(shouldPlayDecorOpenAccent("craft", "mail")).toBe(false);
  });
});
