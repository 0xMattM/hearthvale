import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  CROP_NOT_READY_REFUSE_CUE,
  cropNotReadyRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashCropNotReadyRefuseCue,
  shouldFlashHammerRefuseCue,
  shouldFlashPlotOccupiedRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL58.2 — Crop-not-ready refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Growing` instead of sticky long crop prose.
 * Grow timers unchanged; mute ok.
 */
describe("CityLands PL58.2 crop-not-ready refuse ephemeral", () => {
  it("flashes Growing for cropNotReady (happy)", () => {
    expect(cropNotReadyRefuseCueText()).toBe(CROP_NOT_READY_REFUSE_CUE);
    expect(cropNotReadyRefuseCueText()).toBe("Growing");
    expect(shouldFlashCropNotReadyRefuseCue(ACTION_ERROR.cropNotReady)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.cropNotReady)).toBe(true);
    expect(isCoreSuccessCueText("Growing")).toBe(true);
    expect(ACTION_ERROR.cropNotReady.toLowerCase()).toMatch(/grow|crop/);
  });

  it("stays quiet for other soft refuses (edge)", () => {
    expect(shouldFlashCropNotReadyRefuseCue(ACTION_ERROR.plotNotEmpty)).toBe(
      false,
    );
    expect(shouldFlashCropNotReadyRefuseCue(ACTION_ERROR.needHammer)).toBe(
      false,
    );
    expect(shouldFlashCropNotReadyRefuseCue(ACTION_ERROR.stationBusy)).toBe(
      false,
    );
    expect(shouldFlashCropNotReadyRefuseCue(ACTION_ERROR.notEnoughEnergy)).toBe(
      false,
    );
    expect(shouldFlashHammerRefuseCue(ACTION_ERROR.cropNotReady)).toBe(false);
    expect(shouldFlashPlotOccupiedRefuseCue(ACTION_ERROR.cropNotReady)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and keeps grow timers unchanged (failure)", () => {
    expect(shouldFlashCropNotReadyRefuseCue(null)).toBe(false);
    expect(shouldFlashCropNotReadyRefuseCue(undefined)).toBe(false);
    expect(shouldFlashCropNotReadyRefuseCue("")).toBe(false);
    expect(shouldFlashCropNotReadyRefuseCue(ACTION_ERROR.cropMissing)).toBe(
      false,
    );
    expect(cropNotReadyRefuseCueText()).not.toMatch(/\d/);
    expect(cropNotReadyRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.cropNotReady.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.cropNotReady)).toBe(false);
    expect(cropNotReadyRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat/,
    );
  });
});
