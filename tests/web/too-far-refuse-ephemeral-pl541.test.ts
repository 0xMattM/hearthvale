import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  TOO_FAR_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashBusyStationCue,
  shouldFlashEnergyRefuseCue,
  shouldFlashTooFarRefuseCue,
  shouldFlashTravelAlreadyHereCue,
  tooFarRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL54.1 — Too-far refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Closer` instead of sticky long tooFar prose.
 * Interact ranges unchanged; mute ok.
 */
describe("CityLands PL54.1 too-far refuse ephemeral", () => {
  it("flashes Closer for tooFar and keeps soft refuse SFX (happy)", () => {
    expect(tooFarRefuseCueText()).toBe(TOO_FAR_REFUSE_CUE);
    expect(tooFarRefuseCueText()).toBe("Closer");
    expect(shouldFlashTooFarRefuseCue(ACTION_ERROR.tooFar)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.tooFar)).toBe(true);
    expect(isCoreSuccessCueText("Closer")).toBe(true);
    expect(ACTION_ERROR.tooFar.toLowerCase()).toMatch(/closer|walk/);
  });

  it("stays quiet for other soft refuses (edge)", () => {
    expect(shouldFlashTooFarRefuseCue(ACTION_ERROR.stationBusy)).toBe(false);
    expect(shouldFlashTooFarRefuseCue(ACTION_ERROR.notEnoughEnergy)).toBe(
      false,
    );
    expect(shouldFlashTooFarRefuseCue(ACTION_ERROR.travelAlreadyHere)).toBe(
      false,
    );
    expect(shouldFlashBusyStationCue(ACTION_ERROR.tooFar)).toBe(false);
    expect(shouldFlashEnergyRefuseCue(ACTION_ERROR.tooFar)).toBe(false);
    expect(shouldFlashTravelAlreadyHereCue(ACTION_ERROR.tooFar)).toBe(false);
  });

  it("refuses unrelated errors and stays shorter than sticky prose (failure)", () => {
    expect(shouldFlashTooFarRefuseCue(null)).toBe(false);
    expect(shouldFlashTooFarRefuseCue(undefined)).toBe(false);
    expect(shouldFlashTooFarRefuseCue("")).toBe(false);
    expect(shouldFlashTooFarRefuseCue(ACTION_ERROR.missingMaterials)).toBe(
      false,
    );
    expect(tooFarRefuseCueText()).not.toMatch(/\d/);
    expect(tooFarRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.tooFar.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.tooFar)).toBe(false);
  });
});
