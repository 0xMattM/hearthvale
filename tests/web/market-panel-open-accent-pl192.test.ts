import { describe, expect, it } from "vitest";
import {
  ECONOMY_PANEL_OPEN_ACCENT_MS,
  shouldPlayMarketOpenAccent,
} from "../../apps/web/lib/hud/economy-panel-open-accent";

/**
 * PL19.2 — Market panel open accent (brief; same panel; board/hotkey open).
 */
describe("CityLands PL19.2 market panel open accent", () => {
  it("plays accent when market opens from closed (happy)", () => {
    expect(shouldPlayMarketOpenAccent(null, "market")).toBe(true);
    expect(shouldPlayMarketOpenAccent("vendor", "market")).toBe(true);
    expect(ECONOMY_PANEL_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(ECONOMY_PANEL_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(shouldPlayMarketOpenAccent("market", "market")).toBe(false);
    expect(shouldPlayMarketOpenAccent("market", null)).toBe(false);
    expect(shouldPlayMarketOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated panel opens (failure)", () => {
    expect(shouldPlayMarketOpenAccent(null, "vendor")).toBe(false);
    expect(shouldPlayMarketOpenAccent("market", "inventory")).toBe(false);
    expect(shouldPlayMarketOpenAccent("trade", "craft")).toBe(false);
  });
});
