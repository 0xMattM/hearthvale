import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  CROP_MISSING_REFUSE_CUE,
  MISSING_SEED_REFUSE_CUE,
  UNKNOWN_SEED_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashCropMissingRefuseCue,
  shouldFlashMissingSeedRefuseCue,
  shouldFlashUnknownSeedRefuseCue,
  unknownSeedRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL107.1 — Unknown-seed refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Plant` instead of sticky long plant prose.
 * Plant rules unchanged; mute ok; distinct from missing-seed Seed.
 */
describe("CityLands PL107.1 unknown-seed refuse ephemeral", () => {
  it("flashes Plant for unknownSeed (happy)", () => {
    expect(unknownSeedRefuseCueText()).toBe(UNKNOWN_SEED_REFUSE_CUE);
    expect(unknownSeedRefuseCueText()).toBe("Plant");
    expect(shouldFlashUnknownSeedRefuseCue(ACTION_ERROR.unknownSeed)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.unknownSeed)).toBe(true);
    expect(isCoreSuccessCueText("Plant")).toBe(true);
    expect(ACTION_ERROR.unknownSeed.toLowerCase()).toMatch(/plant/);
  });

  it("stays quiet for missing-seed and crop-missing refuses (edge)", () => {
    expect(shouldFlashUnknownSeedRefuseCue(ACTION_ERROR.missingSeed)).toBe(
      false,
    );
    expect(shouldFlashUnknownSeedRefuseCue(ACTION_ERROR.cropMissing)).toBe(
      false,
    );
    expect(shouldFlashUnknownSeedRefuseCue(ACTION_ERROR.plotNotEmpty)).toBe(
      false,
    );
    expect(unknownSeedRefuseCueText()).not.toBe(MISSING_SEED_REFUSE_CUE);
    expect(unknownSeedRefuseCueText()).not.toBe(CROP_MISSING_REFUSE_CUE);
    expect(shouldFlashMissingSeedRefuseCue(ACTION_ERROR.unknownSeed)).toBe(
      false,
    );
    expect(shouldFlashCropMissingRefuseCue(ACTION_ERROR.unknownSeed)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and does not invent plant rules (failure)", () => {
    expect(shouldFlashUnknownSeedRefuseCue(null)).toBe(false);
    expect(shouldFlashUnknownSeedRefuseCue(undefined)).toBe(false);
    expect(shouldFlashUnknownSeedRefuseCue("")).toBe(false);
    expect(shouldFlashUnknownSeedRefuseCue(ACTION_ERROR.cropNotReady)).toBe(
      false,
    );
    expect(unknownSeedRefuseCueText()).not.toMatch(/\d/);
    expect(unknownSeedRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.unknownSeed.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.unknownSeed)).toBe(false);
    expect(unknownSeedRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
