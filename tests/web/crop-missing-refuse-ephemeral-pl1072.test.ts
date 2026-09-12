import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  CROP_MISSING_REFUSE_CUE,
  PLOT_MISSING_REFUSE_CUE,
  UNKNOWN_SEED_REFUSE_CUE,
  cropMissingRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashCropMissingRefuseCue,
  shouldFlashPlotMissingRefuseCue,
  shouldFlashUnknownSeedRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL107.2 — Crop-missing refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Gone` instead of sticky long crop prose.
 * Crop rules unchanged; mute ok.
 */
describe("CityLands PL107.2 crop-missing refuse ephemeral", () => {
  it("flashes Gone for cropMissing (happy)", () => {
    expect(cropMissingRefuseCueText()).toBe(CROP_MISSING_REFUSE_CUE);
    expect(cropMissingRefuseCueText()).toBe("Gone");
    expect(shouldFlashCropMissingRefuseCue(ACTION_ERROR.cropMissing)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.cropMissing)).toBe(true);
    expect(isCoreSuccessCueText("Gone")).toBe(true);
    expect(ACTION_ERROR.cropMissing.toLowerCase()).toMatch(/crop|wrong/);
  });

  it("stays quiet for plot-missing and unknown-seed refuses (edge)", () => {
    expect(shouldFlashCropMissingRefuseCue(ACTION_ERROR.plotMissing)).toBe(
      false,
    );
    expect(shouldFlashCropMissingRefuseCue(ACTION_ERROR.unknownSeed)).toBe(
      false,
    );
    expect(shouldFlashCropMissingRefuseCue(ACTION_ERROR.cropNotReady)).toBe(
      false,
    );
    expect(cropMissingRefuseCueText()).toBe(PLOT_MISSING_REFUSE_CUE);
    expect(cropMissingRefuseCueText()).not.toBe(UNKNOWN_SEED_REFUSE_CUE);
    expect(shouldFlashPlotMissingRefuseCue(ACTION_ERROR.cropMissing)).toBe(
      false,
    );
    expect(shouldFlashUnknownSeedRefuseCue(ACTION_ERROR.cropMissing)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and does not invent crop rules (failure)", () => {
    expect(shouldFlashCropMissingRefuseCue(null)).toBe(false);
    expect(shouldFlashCropMissingRefuseCue(undefined)).toBe(false);
    expect(shouldFlashCropMissingRefuseCue("")).toBe(false);
    expect(shouldFlashCropMissingRefuseCue(ACTION_ERROR.missingSeed)).toBe(
      false,
    );
    expect(cropMissingRefuseCueText()).not.toMatch(/\d/);
    expect(cropMissingRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.cropMissing.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.cropMissing)).toBe(false);
    expect(cropMissingRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
