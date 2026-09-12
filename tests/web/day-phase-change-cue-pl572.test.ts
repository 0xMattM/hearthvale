import { describe, expect, it } from "vitest";
import {
  DAY_PHASE_DAWN_CUE,
  DAY_PHASE_DUSK_CUE,
  DAY_PHASE_NIGHT_CUE,
  dayPhaseChangeCueText,
  isCoreSuccessCueText,
  shouldFlashDayPhaseChangeCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import {
  DEFAULT_DAY_PHASE_LABEL,
  shouldShowDayPhaseInHud,
} from "../../apps/web/lib/hud/topbar-chrome";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL57.2 — Day-phase change soft cue.
 * Brief TopBar when cosmetic phase edges into Dawn / Dusk / Night;
 * midday Day stays quiet; cosmetics only.
 */
describe("CityLands PL57.2 day-phase change soft cue", () => {
  it("flashes Dawn / Dusk / Night on phase edge (happy)", () => {
    expect(dayPhaseChangeCueText("Dawn")).toBe(DAY_PHASE_DAWN_CUE);
    expect(dayPhaseChangeCueText("Dusk")).toBe(DAY_PHASE_DUSK_CUE);
    expect(dayPhaseChangeCueText("Night")).toBe(DAY_PHASE_NIGHT_CUE);
    expect(isCoreSuccessCueText("Dawn")).toBe(true);
    expect(isCoreSuccessCueText("Dusk")).toBe(true);
    expect(isCoreSuccessCueText("Night")).toBe(true);

    expect(shouldFlashDayPhaseChangeCue("Day", "Dawn", true)).toBe(true);
    expect(shouldFlashDayPhaseChangeCue("Day", "Dusk", true)).toBe(true);
    expect(shouldFlashDayPhaseChangeCue("Dusk", "Night", true)).toBe(true);
    expect(shouldFlashDayPhaseChangeCue("Night", "Dawn", true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
    // Quiet secondary still shows while non-Day (existing PL2.2 chrome).
    expect(shouldShowDayPhaseInHud("Dawn")).toBe(true);
    expect(shouldShowDayPhaseInHud(DEFAULT_DAY_PHASE_LABEL)).toBe(false);
  });

  it("stays quiet on Day, hydrate seed, cycle off, or same phase (edge)", () => {
    expect(dayPhaseChangeCueText("Day")).toBeNull();
    expect(dayPhaseChangeCueText(DEFAULT_DAY_PHASE_LABEL)).toBeNull();
    expect(shouldFlashDayPhaseChangeCue("Dawn", "Day", true)).toBe(false);
    expect(shouldFlashDayPhaseChangeCue(null, "Night", true)).toBe(false);
    expect(shouldFlashDayPhaseChangeCue("", "Dusk", true)).toBe(false);
    expect(shouldFlashDayPhaseChangeCue("Day", "Dusk", false)).toBe(false);
    expect(shouldFlashDayPhaseChangeCue("Night", "Night", true)).toBe(false);
    expect(shouldFlashDayPhaseChangeCue("Day", "Day", true)).toBe(false);
  });

  it("keeps cosmetics-only and min HUD unchanged (failure)", () => {
    expect(defaultClosedPanelIds()).toContain("settings");
    expect(DAY_PHASE_DAWN_CUE.toLowerCase()).not.toContain("always-on");
    expect(DAY_PHASE_NIGHT_CUE.toLowerCase()).not.toMatch(
      /combat|power|buff|stat/,
    );
    expect(isCoreSuccessCueText("Day")).toBe(false);
    expect(isCoreSuccessCueText("Sticky forever")).toBe(false);
    expect(shouldFlashDayPhaseChangeCue("Day", "Night", true)).toBe(true);
    expect(shouldFlashDayPhaseChangeCue("Day", "Night", false)).toBe(false);
  });
});
