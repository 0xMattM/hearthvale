import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  DECOR_ALREADY_PLACED_REFUSE_CUE,
  DECOR_PAD_MISSING_REFUSE_CUE,
  DECOR_STARTER_ONLY_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashDecorAlreadyPlacedRefuseCue,
  shouldFlashDecorPadMissingRefuseCue,
  shouldFlashDecorStarterOnlyRefuseCue,
  decorPadMissingRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL105.1 — Decor-pad-missing refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Pad` instead of sticky long housing prose.
 * Decor pad rules unchanged; mute ok.
 */
describe("CityLands PL105.1 decor-pad-missing refuse ephemeral", () => {
  it("flashes Pad for decorPadMissing (happy)", () => {
    expect(decorPadMissingRefuseCueText()).toBe(DECOR_PAD_MISSING_REFUSE_CUE);
    expect(decorPadMissingRefuseCueText()).toBe("Pad");
    expect(
      shouldFlashDecorPadMissingRefuseCue(ACTION_ERROR.decorPadMissing),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.decorPadMissing)).toBe(true);
    expect(isCoreSuccessCueText("Pad")).toBe(true);
    expect(ACTION_ERROR.decorPadMissing.toLowerCase()).toMatch(
      /decor|homestead|spot/,
    );
  });

  it("stays quiet for other decor refuses (edge)", () => {
    expect(
      shouldFlashDecorPadMissingRefuseCue(ACTION_ERROR.decorStarterOnly),
    ).toBe(false);
    expect(
      shouldFlashDecorPadMissingRefuseCue(ACTION_ERROR.decorAlreadyPlaced),
    ).toBe(false);
    expect(decorPadMissingRefuseCueText()).not.toBe(
      DECOR_STARTER_ONLY_REFUSE_CUE,
    );
    expect(decorPadMissingRefuseCueText()).not.toBe(
      DECOR_ALREADY_PLACED_REFUSE_CUE,
    );
    expect(
      shouldFlashDecorStarterOnlyRefuseCue(ACTION_ERROR.decorPadMissing),
    ).toBe(false);
    expect(
      shouldFlashDecorAlreadyPlacedRefuseCue(ACTION_ERROR.decorPadMissing),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent pad rules (failure)", () => {
    expect(shouldFlashDecorPadMissingRefuseCue(null)).toBe(false);
    expect(shouldFlashDecorPadMissingRefuseCue(undefined)).toBe(false);
    expect(shouldFlashDecorPadMissingRefuseCue("")).toBe(false);
    expect(
      shouldFlashDecorPadMissingRefuseCue(ACTION_ERROR.noExpandSlots),
    ).toBe(false);
    expect(decorPadMissingRefuseCueText()).not.toMatch(/\d/);
    expect(decorPadMissingRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.decorPadMissing.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.decorPadMissing)).toBe(false);
    expect(decorPadMissingRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
