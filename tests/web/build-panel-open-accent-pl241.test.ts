import { describe, expect, it } from "vitest";
import {
  WORKSPACE_PANEL_OPEN_ACCENT_MS,
  shouldPlayBuildOpenAccent,
} from "../../apps/web/lib/hud/workspace-panel-open-accent";

/**
 * PL24.1 — Build panel open accent (brief; same panel; walk-up open).
 */
describe("CityLands PL24.1 build panel open accent", () => {
  it("plays accent when build opens from closed (happy)", () => {
    expect(shouldPlayBuildOpenAccent(null, "build")).toBe(true);
    expect(shouldPlayBuildOpenAccent("inventory", "build")).toBe(true);
    expect(WORKSPACE_PANEL_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(WORKSPACE_PANEL_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(shouldPlayBuildOpenAccent("build", "build")).toBe(false);
    expect(shouldPlayBuildOpenAccent("build", null)).toBe(false);
    expect(shouldPlayBuildOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated panel opens (failure)", () => {
    expect(shouldPlayBuildOpenAccent(null, "craft")).toBe(false);
    expect(shouldPlayBuildOpenAccent("build", "travel")).toBe(false);
    expect(shouldPlayBuildOpenAccent("craft", "inventory")).toBe(false);
  });
});
