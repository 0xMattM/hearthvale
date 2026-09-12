import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  BUSY_STATION_REFUSE_CUE,
  busyStationRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashBusyStationCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL42.1 — Busy scarce refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Busy` instead of sticky long station-busy prose.
 * Contention rules unchanged; mute ok.
 */
describe("CityLands PL42.1 busy scarce refuse ephemeral", () => {
  it("flashes Busy for stationBusy and keeps soft refuse SFX (happy)", () => {
    expect(busyStationRefuseCueText()).toBe(BUSY_STATION_REFUSE_CUE);
    expect(busyStationRefuseCueText()).toBe("Busy");
    expect(shouldFlashBusyStationCue(ACTION_ERROR.stationBusy)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.stationBusy)).toBe(true);
    expect(isCoreSuccessCueText("Busy")).toBe(true);
    expect(ACTION_ERROR.stationBusy.toLowerCase()).toMatch(/someone else|station/);
  });

  it("stays quiet for other soft refuses (edge)", () => {
    expect(shouldFlashBusyStationCue(ACTION_ERROR.notEnoughEnergy)).toBe(false);
    expect(shouldFlashBusyStationCue(ACTION_ERROR.travelAlreadyHere)).toBe(
      false,
    );
    expect(shouldFlashBusyStationCue(ACTION_ERROR.needHammer)).toBe(false);
    expect(shouldFlashBusyStationCue(ACTION_ERROR.needHammerBroken)).toBe(
      false,
    );
    expect(isSoftRefuseError(ACTION_ERROR.notEnoughEnergy)).toBe(true);
  });

  it("refuses unrelated errors and does not invent caps (failure)", () => {
    expect(shouldFlashBusyStationCue(null)).toBe(false);
    expect(shouldFlashBusyStationCue(undefined)).toBe(false);
    expect(shouldFlashBusyStationCue("")).toBe(false);
    expect(shouldFlashBusyStationCue(ACTION_ERROR.tooFar)).toBe(false);
    expect(shouldFlashBusyStationCue(ACTION_ERROR.missingMaterials)).toBe(
      false,
    );
    expect(busyStationRefuseCueText()).not.toMatch(/\d/);
    expect(busyStationRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.stationBusy.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.stationBusy)).toBe(false);
  });
});
