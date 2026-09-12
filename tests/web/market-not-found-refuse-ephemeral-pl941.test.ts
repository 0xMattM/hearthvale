import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  MARKET_NOT_FOUND_REFUSE_CUE,
  MARKET_NOT_YOURS_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashMarketNotFoundRefuseCue,
  shouldFlashMarketNotYoursRefuseCue,
  marketNotFoundRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL94.1 — Market-not-found refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Gone` instead of sticky long market prose.
 * Market listings unchanged; mute ok.
 */
describe("CityLands PL94.1 market-not-found refuse ephemeral", () => {
  it("flashes Gone for marketNotFound (happy)", () => {
    expect(marketNotFoundRefuseCueText()).toBe(MARKET_NOT_FOUND_REFUSE_CUE);
    expect(marketNotFoundRefuseCueText()).toBe("Gone");
    expect(
      shouldFlashMarketNotFoundRefuseCue(ACTION_ERROR.marketNotFound),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.marketNotFound)).toBe(true);
    expect(isCoreSuccessCueText("Gone")).toBe(true);
    expect(ACTION_ERROR.marketNotFound.toLowerCase()).toMatch(
      /no longer|available/,
    );
  });

  it("stays quiet for unrelated market not-yours refuse (edge)", () => {
    expect(
      shouldFlashMarketNotFoundRefuseCue(ACTION_ERROR.marketNotYours),
    ).toBe(false);
    expect(marketNotFoundRefuseCueText()).not.toBe(MARKET_NOT_YOURS_REFUSE_CUE);
    expect(
      shouldFlashMarketNotYoursRefuseCue(ACTION_ERROR.marketNotFound),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent listing rules (failure)", () => {
    expect(shouldFlashMarketNotFoundRefuseCue(null)).toBe(false);
    expect(shouldFlashMarketNotFoundRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMarketNotFoundRefuseCue("")).toBe(false);
    expect(
      shouldFlashMarketNotFoundRefuseCue(ACTION_ERROR.marketExpired),
    ).toBe(false);
    expect(marketNotFoundRefuseCueText()).not.toMatch(/\d/);
    expect(marketNotFoundRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.marketNotFound.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.marketNotFound)).toBe(false);
    expect(marketNotFoundRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
