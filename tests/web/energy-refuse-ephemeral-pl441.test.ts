import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  ENERGY_REFUSE_CUE,
  energyRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashBusyStationCue,
  shouldFlashEnergyRefuseCue,
  shouldFlashTravelAlreadyHereCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL44.1 — Energy refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Energy` instead of sticky long not-enough-energy prose.
 * Energy numbers unchanged; mute ok.
 */
describe("CityLands PL44.1 energy refuse ephemeral", () => {
  it("flashes Energy for notEnoughEnergy and keeps soft refuse SFX (happy)", () => {
    expect(energyRefuseCueText()).toBe(ENERGY_REFUSE_CUE);
    expect(energyRefuseCueText()).toBe("Energy");
    expect(shouldFlashEnergyRefuseCue(ACTION_ERROR.notEnoughEnergy)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.notEnoughEnergy)).toBe(true);
    expect(isCoreSuccessCueText("Energy")).toBe(true);
    expect(ACTION_ERROR.notEnoughEnergy.toLowerCase()).toMatch(/energy/);
  });

  it("stays quiet for other soft refuses (edge)", () => {
    expect(shouldFlashEnergyRefuseCue(ACTION_ERROR.stationBusy)).toBe(false);
    expect(shouldFlashEnergyRefuseCue(ACTION_ERROR.travelAlreadyHere)).toBe(
      false,
    );
    expect(shouldFlashBusyStationCue(ACTION_ERROR.notEnoughEnergy)).toBe(false);
    expect(
      shouldFlashTravelAlreadyHereCue(ACTION_ERROR.notEnoughEnergy),
    ).toBe(false);
    expect(isSoftRefuseError(ACTION_ERROR.stationBusy)).toBe(true);
  });

  it("refuses unrelated errors and does not invent caps (failure)", () => {
    expect(shouldFlashEnergyRefuseCue(null)).toBe(false);
    expect(shouldFlashEnergyRefuseCue(undefined)).toBe(false);
    expect(shouldFlashEnergyRefuseCue("")).toBe(false);
    expect(shouldFlashEnergyRefuseCue(ACTION_ERROR.tooFar)).toBe(false);
    expect(shouldFlashEnergyRefuseCue(ACTION_ERROR.missingMaterials)).toBe(
      false,
    );
    expect(energyRefuseCueText()).not.toMatch(/\d/);
    expect(energyRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.notEnoughEnergy.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.notEnoughEnergy)).toBe(false);
  });
});
