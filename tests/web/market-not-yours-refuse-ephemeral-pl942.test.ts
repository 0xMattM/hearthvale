import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  MARKET_NOT_FOUND_REFUSE_CUE,
  MARKET_NOT_YOURS_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashMarketNotFoundRefuseCue,
  shouldFlashMarketNotYoursRefuseCue,
  marketNotYoursRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL94.2 — Market-not-yours refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Yours` instead of sticky long market prose.
 * Market ownership unchanged; mute ok.
 */
describe("CityLands PL94.2 market-not-yours refuse ephemeral", () => {
  it("flashes Yours for marketNotYours (happy)", () => {
    expect(marketNotYoursRefuseCueText()).toBe(MARKET_NOT_YOURS_REFUSE_CUE);
    expect(marketNotYoursRefuseCueText()).toBe("Yours");
    expect(
      shouldFlashMarketNotYoursRefuseCue(ACTION_ERROR.marketNotYours),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.marketNotYours)).toBe(true);
    expect(isCoreSuccessCueText("Yours")).toBe(true);
    expect(ACTION_ERROR.marketNotYours.toLowerCase()).toMatch(/not yours/);
  });

  it("stays quiet for unrelated market not-found refuse (edge)", () => {
    expect(
      shouldFlashMarketNotYoursRefuseCue(ACTION_ERROR.marketNotFound),
    ).toBe(false);
    expect(marketNotYoursRefuseCueText()).not.toBe(MARKET_NOT_FOUND_REFUSE_CUE);
    expect(
      shouldFlashMarketNotFoundRefuseCue(ACTION_ERROR.marketNotYours),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent ownership rules (failure)", () => {
    expect(shouldFlashMarketNotYoursRefuseCue(null)).toBe(false);
    expect(shouldFlashMarketNotYoursRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMarketNotYoursRefuseCue("")).toBe(false);
    expect(
      shouldFlashMarketNotYoursRefuseCue(ACTION_ERROR.marketOwnListing),
    ).toBe(false);
    expect(marketNotYoursRefuseCueText()).not.toMatch(/\d/);
    expect(marketNotYoursRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.marketNotYours.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.marketNotYours)).toBe(false);
    expect(marketNotYoursRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
