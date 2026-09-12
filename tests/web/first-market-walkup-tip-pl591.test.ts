import { describe, expect, it } from "vitest";
import {
  MARKET,
  MARKET_FIRST_WALKUP_WORLD_TIP,
  marketFirstWalkUpWorldTip,
  postCraftMarketTip,
} from "@game/shared";
import {
  FIRST_MARKET_WALKUP_CUE,
  firstMarketWalkUpCueText,
  isCoreSuccessCueText,
  shouldFlashFirstMarketWalkUpCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

/**
 * PL59.1 — First market walk-up tip once.
 * One-shot ephemeral TopBar + soft world tip near market board;
 * complements sticky post_craft_market; list / buy / fee rules unchanged.
 */
describe("CityLands PL59.1 first market walk-up tip once", () => {
  it("flashes Market · list + buy on first board proximity (happy)", () => {
    expect(firstMarketWalkUpCueText()).toBe(FIRST_MARKET_WALKUP_CUE);
    expect(firstMarketWalkUpCueText()).toBe("Market · list + buy");
    expect(firstMarketWalkUpCueText().toLowerCase()).toMatch(/list|buy/);
    expect(isCoreSuccessCueText("Market · list + buy")).toBe(true);
    expect(marketFirstWalkUpWorldTip()).toBe(MARKET_FIRST_WALKUP_WORLD_TIP);
    expect(marketFirstWalkUpWorldTip()).toMatch(/List/);
    expect(marketFirstWalkUpWorldTip()).toMatch(/\bE\b/);
    expect(postCraftMarketTip().toLowerCase()).toMatch(/market/);

    expect(shouldFlashFirstMarketWalkUpCue(true, false, true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);
  });

  it("stays one-shot and quiet when already seen or tips off (edge)", () => {
    expect(shouldFlashFirstMarketWalkUpCue(true, true, true)).toBe(false);
    expect(shouldFlashFirstMarketWalkUpCue(false, false, true)).toBe(false);
    expect(shouldFlashFirstMarketWalkUpCue(true, false, false)).toBe(false);
    expect(shouldFlashFirstMarketWalkUpCue(false, true, false)).toBe(false);
  });

  it("keeps list fee / buy rules and min HUD (failure)", () => {
    expect(MARKET.listFeeCoins).toBe(2);
    expect(MARKET.listingTtlMs).toBe(10 * 60 * 1000);
    expect(defaultClosedPanelIds()).toContain("market");
    expect(firstMarketWalkUpCueText().toLowerCase()).not.toContain("always-on");
    expect(marketFirstWalkUpWorldTip().toLowerCase()).not.toContain(
      "always-on",
    );
    expect(isCoreSuccessCueText("Market · sticky forever")).toBe(false);
    expect(shouldFlashFirstMarketWalkUpCue(true, false, true)).toBe(true);
    expect(shouldFlashFirstMarketWalkUpCue(true, true, true)).toBe(false);
  });
});
