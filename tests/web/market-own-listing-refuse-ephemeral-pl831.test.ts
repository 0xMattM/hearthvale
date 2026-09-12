import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  MARKET_EXPIRED_REFUSE_CUE,
  MARKET_OWN_LISTING_REFUSE_CUE,
  isCoreSuccessCueText,
  marketOwnListingRefuseCueText,
  shouldFlashMarketExpiredRefuseCue,
  shouldFlashMarketOwnListingRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL83.1 — Market-own-listing refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Yours` instead of sticky long market prose.
 * Market fee / escrow unchanged; mute ok.
 */
describe("CityLands PL83.1 market-own-listing refuse ephemeral", () => {
  it("flashes Yours for marketOwnListing (happy)", () => {
    expect(marketOwnListingRefuseCueText()).toBe(MARKET_OWN_LISTING_REFUSE_CUE);
    expect(marketOwnListingRefuseCueText()).toBe("Yours");
    expect(
      shouldFlashMarketOwnListingRefuseCue(ACTION_ERROR.marketOwnListing),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.marketOwnListing)).toBe(true);
    expect(isCoreSuccessCueText("Yours")).toBe(true);
    expect(ACTION_ERROR.marketOwnListing.toLowerCase()).toMatch(/own|yourself/);
  });

  it("stays quiet for unrelated market expired refuse (edge)", () => {
    expect(
      shouldFlashMarketOwnListingRefuseCue(ACTION_ERROR.marketExpired),
    ).toBe(false);
    expect(marketOwnListingRefuseCueText()).not.toBe(MARKET_EXPIRED_REFUSE_CUE);
    expect(
      shouldFlashMarketExpiredRefuseCue(ACTION_ERROR.marketOwnListing),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent market rules (failure)", () => {
    expect(shouldFlashMarketOwnListingRefuseCue(null)).toBe(false);
    expect(shouldFlashMarketOwnListingRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMarketOwnListingRefuseCue("")).toBe(false);
    expect(
      shouldFlashMarketOwnListingRefuseCue(ACTION_ERROR.marketNotFound),
    ).toBe(false);
    expect(marketOwnListingRefuseCueText()).not.toMatch(/\d/);
    expect(marketOwnListingRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.marketOwnListing.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.marketOwnListing)).toBe(false);
    expect(marketOwnListingRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
