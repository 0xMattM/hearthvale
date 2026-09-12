import { describe, expect, it } from "vitest";
import {
  SOCIAL_PANEL_OPEN_ACCENT_MS,
  shouldPlayQuestOpenAccent,
} from "../../apps/web/lib/hud/social-panel-open-accent";

/**
 * PL29.2 — Quest panel open accent (brief; Q; rewards unchanged).
 */
describe("CityLands PL29.2 quest panel open accent", () => {
  it("plays accent when quests open from closed (happy)", () => {
    expect(shouldPlayQuestOpenAccent(null, "quests")).toBe(true);
    expect(shouldPlayQuestOpenAccent("trade", "quests")).toBe(true);
    expect(SOCIAL_PANEL_OPEN_ACCENT_MS).toBe(450);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(shouldPlayQuestOpenAccent("quests", "quests")).toBe(false);
    expect(shouldPlayQuestOpenAccent("quests", null)).toBe(false);
    expect(shouldPlayQuestOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated panel opens (failure)", () => {
    expect(shouldPlayQuestOpenAccent(null, "trade")).toBe(false);
    expect(shouldPlayQuestOpenAccent("quests", "trade")).toBe(false);
    expect(shouldPlayQuestOpenAccent("inventory", "market")).toBe(false);
  });
});
