import { describe, expect, it } from "vitest";
import {
  SOCIAL_PANEL_OPEN_ACCENT_MS,
  shouldPlayTradeOpenAccent,
} from "../../apps/web/lib/hud/social-panel-open-accent";

/**
 * PL29.1 — Trade panel open accent (brief; T / invite review; escrow unchanged).
 */
describe("CityLands PL29.1 trade panel open accent", () => {
  it("plays accent when trade opens from closed (happy)", () => {
    expect(shouldPlayTradeOpenAccent(null, "trade")).toBe(true);
    expect(shouldPlayTradeOpenAccent("inventory", "trade")).toBe(true);
    expect(SOCIAL_PANEL_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(SOCIAL_PANEL_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(shouldPlayTradeOpenAccent("trade", "trade")).toBe(false);
    expect(shouldPlayTradeOpenAccent("trade", null)).toBe(false);
    expect(shouldPlayTradeOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated panel opens (failure)", () => {
    expect(shouldPlayTradeOpenAccent(null, "quests")).toBe(false);
    expect(shouldPlayTradeOpenAccent("trade", "inventory")).toBe(false);
    expect(shouldPlayTradeOpenAccent("craft", "market")).toBe(false);
  });
});
