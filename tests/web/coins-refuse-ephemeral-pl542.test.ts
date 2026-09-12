import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  COINS_REFUSE_CUE,
  coinsRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashCoinsRefuseCue,
  shouldFlashMaterialsRefuseCue,
  shouldFlashTooFarRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL54.2 — Coins refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Coins` instead of sticky long coin-shortfall prose.
 * Prices / costs unchanged; mute ok.
 */
describe("CityLands PL54.2 coins refuse ephemeral", () => {
  it("flashes Coins for buy / place / list coin shortfalls (happy)", () => {
    expect(coinsRefuseCueText()).toBe(COINS_REFUSE_CUE);
    expect(coinsRefuseCueText()).toBe("Coins");
    expect(shouldFlashCoinsRefuseCue(ACTION_ERROR.notEnoughCoins)).toBe(true);
    expect(shouldFlashCoinsRefuseCue(ACTION_ERROR.needCoinsBuild(40))).toBe(
      true,
    );
    expect(shouldFlashCoinsRefuseCue(ACTION_ERROR.needCoinsExpand(25))).toBe(
      true,
    );
    expect(shouldFlashCoinsRefuseCue(ACTION_ERROR.needCoinsUpgrade(80))).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.notEnoughCoins)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.needCoinsBuild(40))).toBe(true);
    expect(isCoreSuccessCueText("Coins")).toBe(true);
  });

  it("stays quiet for materials, too-far, and market listing-fee refuses (edge)", () => {
    expect(shouldFlashCoinsRefuseCue(ACTION_ERROR.missingMaterials)).toBe(
      false,
    );
    expect(shouldFlashCoinsRefuseCue(ACTION_ERROR.notEnoughItems)).toBe(false);
    expect(shouldFlashCoinsRefuseCue(ACTION_ERROR.tooFar)).toBe(false);
    expect(shouldFlashCoinsRefuseCue(ACTION_ERROR.marketNeedFee(12))).toBe(
      false,
    );
    expect(shouldFlashTooFarRefuseCue(ACTION_ERROR.notEnoughCoins)).toBe(
      false,
    );
    expect(shouldFlashMaterialsRefuseCue(ACTION_ERROR.notEnoughCoins)).toBe(
      false,
    );
  });

  it("refuses unrelated errors and does not invent prices (failure)", () => {
    expect(shouldFlashCoinsRefuseCue(null)).toBe(false);
    expect(shouldFlashCoinsRefuseCue(undefined)).toBe(false);
    expect(shouldFlashCoinsRefuseCue("")).toBe(false);
    expect(shouldFlashCoinsRefuseCue(ACTION_ERROR.notEnoughEnergy)).toBe(
      false,
    );
    expect(coinsRefuseCueText()).not.toMatch(/\d/);
    expect(coinsRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.notEnoughCoins.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.notEnoughCoins)).toBe(false);
  });
});
