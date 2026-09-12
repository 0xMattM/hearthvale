import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  MARKET_NEED_FEE_REFUSE_CUE,
  MARKET_NOT_STACKABLE_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashMarketNeedFeeRefuseCue,
  shouldFlashMarketNotStackableRefuseCue,
  marketNotStackableRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL97.2 — Market-not-stackable refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Stack` instead of sticky long market prose.
 * Market stack rules unchanged; mute ok.
 */
describe("CityLands PL97.2 market-not-stackable refuse ephemeral", () => {
  it("flashes Stack for marketNotStackable (happy)", () => {
    expect(marketNotStackableRefuseCueText()).toBe(
      MARKET_NOT_STACKABLE_REFUSE_CUE,
    );
    expect(marketNotStackableRefuseCueText()).toBe("Stack");
    expect(
      shouldFlashMarketNotStackableRefuseCue(ACTION_ERROR.marketNotStackable),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.marketNotStackable)).toBe(true);
    expect(isCoreSuccessCueText("Stack")).toBe(true);
    expect(ACTION_ERROR.marketNotStackable.toLowerCase()).toMatch(/stackable/);
  });

  it("stays quiet for unrelated market need-fee refuse (edge)", () => {
    expect(
      shouldFlashMarketNotStackableRefuseCue(ACTION_ERROR.marketNeedFee(12)),
    ).toBe(false);
    expect(marketNotStackableRefuseCueText()).not.toBe(
      MARKET_NEED_FEE_REFUSE_CUE,
    );
    expect(
      shouldFlashMarketNeedFeeRefuseCue(ACTION_ERROR.marketNotStackable),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent stack rules (failure)", () => {
    expect(shouldFlashMarketNotStackableRefuseCue(null)).toBe(false);
    expect(shouldFlashMarketNotStackableRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMarketNotStackableRefuseCue("")).toBe(false);
    expect(
      shouldFlashMarketNotStackableRefuseCue(ACTION_ERROR.mailNotStackable),
    ).toBe(false);
    expect(marketNotStackableRefuseCueText()).not.toMatch(/\d/);
    expect(marketNotStackableRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.marketNotStackable.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.marketNotStackable)).toBe(false);
    expect(marketNotStackableRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
