import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  TRAVEL_ALREADY_HERE_CUE,
  isCoreSuccessCueText,
  shouldFlashBusyStationCue,
  shouldFlashEnergyRefuseCue,
  shouldFlashTravelAlreadyHereCue,
  travelAlreadyHereRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL44.2 — Travel already-here ephemeral.
 * Soft refuse SFX + brief TopBar `Already here` instead of sticky long prose.
 * Fare-free destinations unchanged; mute ok.
 */
describe("CityLands PL44.2 travel already-here ephemeral", () => {
  it("flashes Already here for travelAlreadyHere and keeps soft refuse SFX (happy)", () => {
    expect(travelAlreadyHereRefuseCueText()).toBe(TRAVEL_ALREADY_HERE_CUE);
    expect(travelAlreadyHereRefuseCueText()).toBe("Already here");
    expect(
      shouldFlashTravelAlreadyHereCue(ACTION_ERROR.travelAlreadyHere),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.travelAlreadyHere)).toBe(true);
    expect(isCoreSuccessCueText("Already here")).toBe(true);
    expect(ACTION_ERROR.travelAlreadyHere.toLowerCase()).toMatch(/already/);
  });

  it("stays quiet for other soft refuses (edge)", () => {
    expect(shouldFlashTravelAlreadyHereCue(ACTION_ERROR.stationBusy)).toBe(
      false,
    );
    expect(
      shouldFlashTravelAlreadyHereCue(ACTION_ERROR.notEnoughEnergy),
    ).toBe(false);
    expect(
      shouldFlashBusyStationCue(ACTION_ERROR.travelAlreadyHere),
    ).toBe(false);
    expect(
      shouldFlashEnergyRefuseCue(ACTION_ERROR.travelAlreadyHere),
    ).toBe(false);
    expect(isSoftRefuseError(ACTION_ERROR.notEnoughEnergy)).toBe(true);
  });

  it("refuses unrelated errors and does not invent fares (failure)", () => {
    expect(shouldFlashTravelAlreadyHereCue(null)).toBe(false);
    expect(shouldFlashTravelAlreadyHereCue(undefined)).toBe(false);
    expect(shouldFlashTravelAlreadyHereCue("")).toBe(false);
    expect(shouldFlashTravelAlreadyHereCue(ACTION_ERROR.tooFar)).toBe(false);
    expect(
      shouldFlashTravelAlreadyHereCue(ACTION_ERROR.needCoinsTravel(12)),
    ).toBe(false);
    expect(travelAlreadyHereRefuseCueText()).not.toMatch(/\d/);
    expect(travelAlreadyHereRefuseCueText().toLowerCase()).not.toContain(
      "fare",
    );
    expect(travelAlreadyHereRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.travelAlreadyHere.length + 8,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.travelAlreadyHere)).toBe(false);
  });
});
