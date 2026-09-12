import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  DEED_MISSING_REFUSE_CUE,
  DEED_NOT_YOURS_REFUSE_CUE,
  TRADE_NOT_FOUND_REFUSE_CUE,
  TRADE_NOT_YOURS_REFUSE_CUE,
  isCoreSuccessCueText,
  deedMissingRefuseCueText,
  deedNotYoursRefuseCueText,
  shouldFlashDeedMissingRefuseCue,
  shouldFlashDeedNotYoursRefuseCue,
  shouldFlashDeedNeedMintRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL112.1 — Deed-missing / not-yours refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Gone` / `Yours` instead of sticky long deed prose.
 * Deed rules unchanged; settings/deed surface only; mute ok.
 */
describe("CityLands PL112.1 deed-missing / not-yours refuse ephemeral", () => {
  it("flashes Gone / Yours for deedMissing / deedNotYours (happy)", () => {
    expect(deedMissingRefuseCueText()).toBe(DEED_MISSING_REFUSE_CUE);
    expect(deedMissingRefuseCueText()).toBe("Gone");
    expect(shouldFlashDeedMissingRefuseCue(ACTION_ERROR.deedMissing)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.deedMissing)).toBe(true);
    expect(isCoreSuccessCueText("Gone")).toBe(true);
    expect(ACTION_ERROR.deedMissing.toLowerCase()).toMatch(/deed|not found/);

    expect(deedNotYoursRefuseCueText()).toBe(DEED_NOT_YOURS_REFUSE_CUE);
    expect(deedNotYoursRefuseCueText()).toBe("Yours");
    expect(shouldFlashDeedNotYoursRefuseCue(ACTION_ERROR.deedNotYours)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.deedNotYours)).toBe(true);
    expect(isCoreSuccessCueText("Yours")).toBe(true);
    expect(ACTION_ERROR.deedNotYours.toLowerCase()).toMatch(/not yours/);
  });

  it("stays quiet across sibling deed / trade refuses (edge)", () => {
    expect(shouldFlashDeedMissingRefuseCue(ACTION_ERROR.deedNotYours)).toBe(
      false,
    );
    expect(shouldFlashDeedNotYoursRefuseCue(ACTION_ERROR.deedMissing)).toBe(
      false,
    );
    expect(shouldFlashDeedMissingRefuseCue(ACTION_ERROR.deedNeedMint)).toBe(
      false,
    );
    expect(shouldFlashDeedNeedMintRefuseCue(ACTION_ERROR.deedMissing)).toBe(
      false,
    );
    expect(deedMissingRefuseCueText()).toBe(TRADE_NOT_FOUND_REFUSE_CUE);
    expect(deedNotYoursRefuseCueText()).toBe(TRADE_NOT_YOURS_REFUSE_CUE);
    expect(deedMissingRefuseCueText()).not.toBe(DEED_NOT_YOURS_REFUSE_CUE);
  });

  it("refuses unrelated errors and does not invent deed rules (failure)", () => {
    expect(shouldFlashDeedMissingRefuseCue(null)).toBe(false);
    expect(shouldFlashDeedMissingRefuseCue(undefined)).toBe(false);
    expect(shouldFlashDeedMissingRefuseCue("")).toBe(false);
    expect(shouldFlashDeedNotYoursRefuseCue(null)).toBe(false);
    expect(
      shouldFlashDeedMissingRefuseCue(ACTION_ERROR.deedAlreadyOwned),
    ).toBe(false);
    expect(deedMissingRefuseCueText()).not.toMatch(/\d/);
    expect(deedNotYoursRefuseCueText()).not.toMatch(/\d/);
    expect(deedMissingRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.deedMissing.length,
    );
    expect(deedNotYoursRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.deedNotYours.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.deedMissing)).toBe(false);
    expect(isCoreSuccessCueText(ACTION_ERROR.deedNotYours)).toBe(false);
    expect(deedMissingRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
