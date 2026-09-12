import { describe, expect, it } from "vitest";
import {
  DEFAULT_DAY_PHASE_LABEL,
  formatQuietHudExtras,
  shouldShowDayPhaseInHud,
  shouldShowNearbyInHud,
} from "../../apps/web/lib/hud/topbar-chrome";

/**
 * PL2.2 — TopBar declutter: day-phase + nearby demoted until non-default.
 */
describe("CityLands PL2.2 TopBar quiet chrome", () => {
  it("hides default Day phase and zero nearby (happy default walk)", () => {
    expect(shouldShowDayPhaseInHud(DEFAULT_DAY_PHASE_LABEL)).toBe(false);
    expect(shouldShowNearbyInHud(0)).toBe(false);
    expect(formatQuietHudExtras(0, "Day")).toBeNull();
  });

  it("shows dusk / night and nearby peers on the quiet line (happy non-default)", () => {
    expect(shouldShowDayPhaseInHud("Dusk")).toBe(true);
    expect(shouldShowDayPhaseInHud("Night")).toBe(true);
    expect(shouldShowDayPhaseInHud("Dawn")).toBe(true);
    expect(shouldShowNearbyInHud(2)).toBe(true);
    expect(formatQuietHudExtras(2, "Dusk")).toBe("nearby 2 · Dusk");
  });

  it("ignores null / empty day label (edge)", () => {
    expect(shouldShowDayPhaseInHud(null)).toBe(false);
    expect(shouldShowDayPhaseInHud("")).toBe(false);
    expect(shouldShowDayPhaseInHud("   ")).toBe(false);
    expect(formatQuietHudExtras(0, null)).toBeNull();
  });

  it("refuses non-positive nearby counts (failure)", () => {
    expect(shouldShowNearbyInHud(-1)).toBe(false);
    expect(shouldShowNearbyInHud(Number.NaN)).toBe(false);
    expect(formatQuietHudExtras(-3, "Day")).toBeNull();
  });
});
