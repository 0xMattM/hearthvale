import { describe, expect, it } from "vitest";
import {
  SOCIAL_PANEL_OPEN_ACCENT_MS,
  shouldPlayNoticeOpenAccent,
} from "../../apps/web/lib/hud/social-panel-open-accent";

/**
 * PL34.3 — Notice panel open accent (brief; walk-up; tips + unread PL17.1 still work).
 */
describe("CityLands PL34.3 notice panel open accent", () => {
  it("plays accent when notice opens from closed (happy)", () => {
    expect(shouldPlayNoticeOpenAccent(null, "notice")).toBe(true);
    expect(shouldPlayNoticeOpenAccent("inventory", "notice")).toBe(true);
    expect(SOCIAL_PANEL_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(SOCIAL_PANEL_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(shouldPlayNoticeOpenAccent("notice", "notice")).toBe(false);
    expect(shouldPlayNoticeOpenAccent("notice", null)).toBe(false);
    expect(shouldPlayNoticeOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated panel opens (failure)", () => {
    expect(shouldPlayNoticeOpenAccent(null, "mail")).toBe(false);
    expect(shouldPlayNoticeOpenAccent("notice", "inventory")).toBe(false);
    expect(shouldPlayNoticeOpenAccent("craft", "quests")).toBe(false);
  });
});
