import { describe, expect, it } from "vitest";
import {
  SOCIAL_PANEL_OPEN_ACCENT_MS,
  shouldPlayNoticeOpenAccent,
  shouldPlayTutorialNpcOpenAccent,
} from "../../apps/web/lib/hud/social-panel-open-accent";

/**
 * PL55.1 — Tutorial NPC panel open accent (brief; walk-up; XP / claim unchanged).
 */
describe("CityLands PL55.1 tutorial NPC panel open accent", () => {
  it("plays accent when tutorial_npc opens from closed (happy)", () => {
    expect(shouldPlayTutorialNpcOpenAccent(null, "tutorial_npc")).toBe(true);
    expect(shouldPlayTutorialNpcOpenAccent("inventory", "tutorial_npc")).toBe(
      true,
    );
    expect(shouldPlayTutorialNpcOpenAccent("notice", "tutorial_npc")).toBe(
      true,
    );
    expect(SOCIAL_PANEL_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(SOCIAL_PANEL_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(
      shouldPlayTutorialNpcOpenAccent("tutorial_npc", "tutorial_npc"),
    ).toBe(false);
    expect(shouldPlayTutorialNpcOpenAccent("tutorial_npc", null)).toBe(false);
    expect(shouldPlayTutorialNpcOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated panel opens; claim path stays walk-up (failure)", () => {
    expect(shouldPlayTutorialNpcOpenAccent(null, "notice")).toBe(false);
    expect(shouldPlayTutorialNpcOpenAccent("tutorial_npc", "inventory")).toBe(
      false,
    );
    expect(shouldPlayTutorialNpcOpenAccent("craft", "quests")).toBe(false);
    expect(shouldPlayNoticeOpenAccent(null, "tutorial_npc")).toBe(false);
  });
});
