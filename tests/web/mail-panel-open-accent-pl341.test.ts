import { describe, expect, it } from "vitest";
import {
  SOCIAL_PANEL_OPEN_ACCENT_MS,
  shouldPlayMailOpenAccent,
} from "../../apps/web/lib/hud/social-panel-open-accent";

/**
 * PL34.1 — Mail panel open accent (brief; L; escrow unchanged; unread PL17.1 still works).
 */
describe("CityLands PL34.1 mail panel open accent", () => {
  it("plays accent when mail opens from closed (happy)", () => {
    expect(shouldPlayMailOpenAccent(null, "mail")).toBe(true);
    expect(shouldPlayMailOpenAccent("inventory", "mail")).toBe(true);
    expect(SOCIAL_PANEL_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(SOCIAL_PANEL_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(shouldPlayMailOpenAccent("mail", "mail")).toBe(false);
    expect(shouldPlayMailOpenAccent("mail", null)).toBe(false);
    expect(shouldPlayMailOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated panel opens (failure)", () => {
    expect(shouldPlayMailOpenAccent(null, "trade")).toBe(false);
    expect(shouldPlayMailOpenAccent("mail", "inventory")).toBe(false);
    expect(shouldPlayMailOpenAccent("craft", "notice")).toBe(false);
  });
});
