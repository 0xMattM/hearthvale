import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  CROP_NOT_READY_REFUSE_CUE,
  isCoreSuccessCueText,
  MISSING_SEED_REFUSE_CUE,
  missingSeedRefuseCueText,
  PLOT_OCCUPIED_REFUSE_CUE,
  shouldFlashCropNotReadyRefuseCue,
  shouldFlashMissingSeedRefuseCue,
  shouldFlashPlotOccupiedRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL64.2 — Missing seed soft refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Seed` instead of sticky long missing-seed prose.
 * Plant rules unchanged; mute ok.
 */
describe("CityLands PL64.2 missing seed refuse ephemeral", () => {
  it("flashes Seed for missingSeed (happy)", () => {
    expect(missingSeedRefuseCueText()).toBe(MISSING_SEED_REFUSE_CUE);
    expect(missingSeedRefuseCueText()).toBe("Seed");
    expect(shouldFlashMissingSeedRefuseCue(ACTION_ERROR.missingSeed)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.missingSeed)).toBe(true);
    expect(isCoreSuccessCueText("Seed")).toBe(true);
    expect(ACTION_ERROR.missingSeed.toLowerCase()).toMatch(/seed/);
  });

  it("stays quiet for other plant / crop soft refuses (edge)", () => {
    expect(shouldFlashMissingSeedRefuseCue(ACTION_ERROR.cropNotReady)).toBe(
      false,
    );
    expect(shouldFlashMissingSeedRefuseCue(ACTION_ERROR.plotNotEmpty)).toBe(
      false,
    );
    expect(shouldFlashMissingSeedRefuseCue(ACTION_ERROR.unknownSeed)).toBe(
      false,
    );
    expect(shouldFlashMissingSeedRefuseCue(ACTION_ERROR.notEnoughEnergy)).toBe(
      false,
    );
    expect(shouldFlashCropNotReadyRefuseCue(ACTION_ERROR.missingSeed)).toBe(
      false,
    );
    expect(shouldFlashPlotOccupiedRefuseCue(ACTION_ERROR.missingSeed)).toBe(
      false,
    );
    expect(missingSeedRefuseCueText()).not.toBe(CROP_NOT_READY_REFUSE_CUE);
    expect(missingSeedRefuseCueText()).not.toBe(PLOT_OCCUPIED_REFUSE_CUE);
  });

  it("refuses unrelated errors and does not invent plant rules (failure)", () => {
    expect(shouldFlashMissingSeedRefuseCue(null)).toBe(false);
    expect(shouldFlashMissingSeedRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMissingSeedRefuseCue("")).toBe(false);
    expect(shouldFlashMissingSeedRefuseCue(ACTION_ERROR.plotMissing)).toBe(
      false,
    );
    expect(missingSeedRefuseCueText()).not.toMatch(/\d/);
    expect(missingSeedRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.missingSeed.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.missingSeed)).toBe(false);
    expect(missingSeedRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat/,
    );
  });
});
