import { describe, expect, it } from "vitest";
import { BUILDING_UPGRADES } from "@game/shared";
import {
  SUCCESS_CUE_MS,
  STATION_BUILT_SUCCESS_CUE,
  STATION_UPGRADE_SUCCESS_CUE,
  isCoreSuccessCueText,
  stationUpgradeSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";
import { SFX_PRESETS, sfxStepsFor } from "../../apps/web/lib/game-audio";

/**
 * PL48.1 — Craft station upgrade success cue.
 * Ephemeral TopBar `Upgraded` after T2 upgrade; costs unchanged.
 */
describe("CityLands PL48.1 craft station upgrade success cue", () => {
  it("uses short Upgraded copy distinct from Built / Crafted (happy)", () => {
    expect(stationUpgradeSuccessCueText()).toBe(STATION_UPGRADE_SUCCESS_CUE);
    expect(stationUpgradeSuccessCueText()).toBe("Upgraded");
    expect(isCoreSuccessCueText("Upgraded")).toBe(true);
    expect(stationUpgradeSuccessCueText()).not.toBe(STATION_BUILT_SUCCESS_CUE);
    expect(stationUpgradeSuccessCueText()).not.toBe("Crafted");
    expect(sfxStepsFor("craft").length).toBeGreaterThan(0);
    expect(SFX_PRESETS.craft.length).toBeGreaterThanOrEqual(1);
  });

  it("clears quickly — reuses SUCCESS_CUE_MS (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not invent upgrade costs or sticky tier prose (failure)", () => {
    expect(isCoreSuccessCueText("Upgraded · T2 · −50c")).toBe(false);
    expect(isCoreSuccessCueText("Could not upgrade")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
    expect(Object.keys(BUILDING_UPGRADES).length).toBeGreaterThan(0);
  });
});
