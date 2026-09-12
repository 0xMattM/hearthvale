import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  MARKET_EXPIRED_REFUSE_CUE,
  MARKET_OWN_LISTING_REFUSE_CUE,
  isCoreSuccessCueText,
  marketExpiredRefuseCueText,
  shouldFlashMarketExpiredRefuseCue,
  shouldFlashMarketOwnListingRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL83.2 — Market-expired refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Expired` instead of sticky long market prose.
 * TTL / return rules unchanged; mute ok.
 */
describe("CityLands PL83.2 market-expired refuse ephemeral", () => {
  it("flashes Expired for marketExpired (happy)", () => {
    expect(marketExpiredRefuseCueText()).toBe(MARKET_EXPIRED_REFUSE_CUE);
    expect(marketExpiredRefuseCueText()).toBe("Expired");
    expect(shouldFlashMarketExpiredRefuseCue(ACTION_ERROR.marketExpired)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.marketExpired)).toBe(true);
    expect(isCoreSuccessCueText("Expired")).toBe(true);
    expect(ACTION_ERROR.marketExpired.toLowerCase()).toMatch(/expir/);
  });

  it("stays quiet for unrelated market own-listing refuse (edge)", () => {
    expect(
      shouldFlashMarketExpiredRefuseCue(ACTION_ERROR.marketOwnListing),
    ).toBe(false);
    expect(marketExpiredRefuseCueText()).not.toBe(MARKET_OWN_LISTING_REFUSE_CUE);
    expect(
      shouldFlashMarketOwnListingRefuseCue(ACTION_ERROR.marketExpired),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent market rules (failure)", () => {
    expect(shouldFlashMarketExpiredRefuseCue(null)).toBe(false);
    expect(shouldFlashMarketExpiredRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMarketExpiredRefuseCue("")).toBe(false);
    expect(
      shouldFlashMarketExpiredRefuseCue(ACTION_ERROR.marketNotFound),
    ).toBe(false);
    expect(marketExpiredRefuseCueText()).not.toMatch(/\d/);
    expect(marketExpiredRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.marketExpired.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.marketExpired)).toBe(false);
    expect(marketExpiredRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
