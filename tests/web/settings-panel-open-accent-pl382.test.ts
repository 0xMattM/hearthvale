import { describe, expect, it } from "vitest";
import {
  INVENTORY_OPEN_ACCENT_MS,
  shouldPlaySettingsOpenAccent,
} from "../../apps/web/lib/hud/inventory-open-accent";
import { muteToggleSuccessCueText } from "../../apps/web/lib/hud/success-cue";

/**
 * PL38.2 — Settings panel open accent (brief; H; prefs / mute PL37.2 unchanged).
 */
describe("CityLands PL38.2 settings panel open accent", () => {
  it("plays accent when settings opens from closed (happy)", () => {
    expect(shouldPlaySettingsOpenAccent(null, "settings")).toBe(true);
    expect(shouldPlaySettingsOpenAccent("inventory", "settings")).toBe(true);
    expect(INVENTORY_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(INVENTORY_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);
  });

  it("skips accent when already open or closing (edge)", () => {
    expect(shouldPlaySettingsOpenAccent("settings", "settings")).toBe(false);
    expect(shouldPlaySettingsOpenAccent("settings", null)).toBe(false);
    expect(shouldPlaySettingsOpenAccent(null, null)).toBe(false);
  });

  it("refuses accent for unrelated panel opens; mute cue copy unchanged (failure)", () => {
    expect(shouldPlaySettingsOpenAccent(null, "chat")).toBe(false);
    expect(shouldPlaySettingsOpenAccent("settings", "inventory")).toBe(false);
    expect(shouldPlaySettingsOpenAccent("mail", "notice")).toBe(false);
    expect(muteToggleSuccessCueText(true)).toBe("Muted");
    expect(muteToggleSuccessCueText(false)).toBe("Unmuted");
  });
});
