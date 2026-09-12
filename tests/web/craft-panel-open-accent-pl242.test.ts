import { describe, expect, it } from "vitest";
import {
  WORKSPACE_PANEL_OPEN_ACCENT_MS,
  shouldPlayCraftOpenAccent,
} from "../../apps/web/lib/hud/workspace-panel-open-accent";

/**
 * PL24.2 — Craft panel open accent (brief; walk-up station open).
 */
describe("CityLands PL24.2 craft panel open accent", () => {
  it("plays accent when craft opens from closed (happy)", () => {
    expect(shouldPlayCraftOpenAccent(null, "craft")).toBe(true);
    expect(shouldPlayCraftOpenAccent("build", "craft")).toBe(true);
    expect(WORKSPACE_PANEL_OPEN_ACCENT_MS).toBe(450);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(shouldPlayCraftOpenAccent("craft", "craft")).toBe(false);
    expect(shouldPlayCraftOpenAccent("craft", null)).toBe(false);
    expect(shouldPlayCraftOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated panel opens (failure)", () => {
    expect(shouldPlayCraftOpenAccent(null, "build")).toBe(false);
    expect(shouldPlayCraftOpenAccent("craft", "travel")).toBe(false);
    expect(shouldPlayCraftOpenAccent("travel", "vendor")).toBe(false);
  });
});
