import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  INVALID_QTY_REFUSE_CUE,
  MARKET_INVALID_REFUSE_CUE,
  MARKET_NOT_STACKABLE_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashInvalidQtyRefuseCue,
  shouldFlashMarketInvalidRefuseCue,
  shouldFlashMarketNotStackableRefuseCue,
  marketInvalidRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL103.2 — Market-invalid refuse ephemeral.
 * Soft refuse SFX + brief TopBar `List` instead of sticky long market prose.
 * Market list validation unchanged; mute ok.
 */
describe("CityLands PL103.2 market-invalid refuse ephemeral", () => {
  it("flashes List for marketInvalid (happy)", () => {
    expect(marketInvalidRefuseCueText()).toBe(MARKET_INVALID_REFUSE_CUE);
    expect(marketInvalidRefuseCueText()).toBe("List");
    expect(
      shouldFlashMarketInvalidRefuseCue(ACTION_ERROR.marketInvalid),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.marketInvalid)).toBe(true);
    expect(isCoreSuccessCueText("List")).toBe(true);
    expect(ACTION_ERROR.marketInvalid.toLowerCase()).toMatch(
      /valid|item|amount|price/,
    );
  });

  it("stays quiet for market-not-stackable refuse (edge)", () => {
    expect(
      shouldFlashMarketInvalidRefuseCue(ACTION_ERROR.marketNotStackable),
    ).toBe(false);
    expect(marketInvalidRefuseCueText()).not.toBe(
      MARKET_NOT_STACKABLE_REFUSE_CUE,
    );
    expect(marketInvalidRefuseCueText()).not.toBe(INVALID_QTY_REFUSE_CUE);
    expect(
      shouldFlashMarketNotStackableRefuseCue(ACTION_ERROR.marketInvalid),
    ).toBe(false);
    expect(shouldFlashInvalidQtyRefuseCue(ACTION_ERROR.marketInvalid)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and does not invent list rules (failure)", () => {
    expect(shouldFlashMarketInvalidRefuseCue(null)).toBe(false);
    expect(shouldFlashMarketInvalidRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMarketInvalidRefuseCue("")).toBe(false);
    expect(
      shouldFlashMarketInvalidRefuseCue(ACTION_ERROR.mailNotStackable),
    ).toBe(false);
    expect(marketInvalidRefuseCueText()).not.toMatch(/\d/);
    expect(marketInvalidRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.marketInvalid.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.marketInvalid)).toBe(false);
    expect(marketInvalidRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
