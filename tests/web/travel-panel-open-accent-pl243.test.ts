import { describe, expect, it } from "vitest";
import {
  WORKSPACE_PANEL_OPEN_ACCENT_MS,
  shouldPlayTravelOpenAccent,
} from "../../apps/web/lib/hud/workspace-panel-open-accent";

/**
 * PL24.3 — Travel panel open accent (brief; N / portal; fare-free unchanged).
 */
describe("CityLands PL24.3 travel panel open accent", () => {
  it("plays accent when travel opens from closed (happy)", () => {
    expect(shouldPlayTravelOpenAccent(null, "travel")).toBe(true);
    expect(shouldPlayTravelOpenAccent("notice", "travel")).toBe(true);
    expect(WORKSPACE_PANEL_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(WORKSPACE_PANEL_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(shouldPlayTravelOpenAccent("travel", "travel")).toBe(false);
    expect(shouldPlayTravelOpenAccent("travel", null)).toBe(false);
    expect(shouldPlayTravelOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated panel opens (failure)", () => {
    expect(shouldPlayTravelOpenAccent(null, "build")).toBe(false);
    expect(shouldPlayTravelOpenAccent("travel", "craft")).toBe(false);
    expect(shouldPlayTravelOpenAccent("craft", "market")).toBe(false);
  });
});
