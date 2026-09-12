import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  TRAVEL_NEED_COINS_REFUSE_CUE,
  TRAVEL_IN_PROGRESS_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashCoinsRefuseCue,
  shouldFlashTravelInProgressRefuseCue,
  shouldFlashTravelNeedCoinsRefuseCue,
  travelNeedCoinsRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL90.1 — Travel-need-coins refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Coins` instead of sticky long caravan prose.
 * Caravan costs unchanged; mute ok.
 */
describe("CityLands PL90.1 travel-need-coins refuse ephemeral", () => {
  it("flashes Coins for needCoinsTravel (happy)", () => {
    expect(travelNeedCoinsRefuseCueText()).toBe(TRAVEL_NEED_COINS_REFUSE_CUE);
    expect(travelNeedCoinsRefuseCueText()).toBe("Coins");
    expect(
      shouldFlashTravelNeedCoinsRefuseCue(ACTION_ERROR.needCoinsTravel(15)),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.needCoinsTravel(15))).toBe(true);
    expect(isCoreSuccessCueText("Coins")).toBe(true);
    expect(ACTION_ERROR.needCoinsTravel(15).toLowerCase()).toMatch(
      /caravan|coin/,
    );
  });

  it("stays quiet for place/upgrade coin refuses and road refuse (edge)", () => {
    expect(
      shouldFlashTravelNeedCoinsRefuseCue(ACTION_ERROR.needCoinsBuild(40)),
    ).toBe(false);
    expect(
      shouldFlashTravelNeedCoinsRefuseCue(ACTION_ERROR.notEnoughCoins),
    ).toBe(false);
    expect(shouldFlashCoinsRefuseCue(ACTION_ERROR.needCoinsTravel(15))).toBe(
      false,
    );
    expect(
      shouldFlashTravelNeedCoinsRefuseCue(ACTION_ERROR.travelInProgress(7)),
    ).toBe(false);
    expect(travelNeedCoinsRefuseCueText()).not.toBe(
      TRAVEL_IN_PROGRESS_REFUSE_CUE,
    );
    expect(
      shouldFlashTravelInProgressRefuseCue(ACTION_ERROR.needCoinsTravel(15)),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent travel costs (failure)", () => {
    expect(shouldFlashTravelNeedCoinsRefuseCue(null)).toBe(false);
    expect(shouldFlashTravelNeedCoinsRefuseCue(undefined)).toBe(false);
    expect(shouldFlashTravelNeedCoinsRefuseCue("")).toBe(false);
    expect(
      shouldFlashTravelNeedCoinsRefuseCue(ACTION_ERROR.travelAlreadyHere),
    ).toBe(false);
    expect(travelNeedCoinsRefuseCueText()).not.toMatch(/\d/);
    expect(travelNeedCoinsRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.needCoinsTravel(15).length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.needCoinsTravel(15))).toBe(false);
    expect(travelNeedCoinsRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
