import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  ALREADY_UPGRADED_REFUSE_CUE,
  CANNOT_UPGRADE_BUILDING_REFUSE_CUE,
  alreadyUpgradedRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashAlreadyUpgradedRefuseCue,
  shouldFlashCannotUpgradeBuildingRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL89.1 — Already-upgraded refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Max` instead of sticky long upgrade prose.
 * Upgrade rules unchanged; mute ok.
 */
describe("CityLands PL89.1 already-upgraded refuse ephemeral", () => {
  it("flashes Max for alreadyUpgraded (happy)", () => {
    expect(alreadyUpgradedRefuseCueText()).toBe(ALREADY_UPGRADED_REFUSE_CUE);
    expect(alreadyUpgradedRefuseCueText()).toBe("Max");
    expect(
      shouldFlashAlreadyUpgradedRefuseCue(ACTION_ERROR.alreadyUpgraded),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.alreadyUpgraded)).toBe(true);
    expect(isCoreSuccessCueText("Max")).toBe(true);
    expect(ACTION_ERROR.alreadyUpgraded.toLowerCase()).toMatch(
      /already|upgrade/,
    );
  });

  it("stays quiet for unrelated cannot-upgrade refuse (edge)", () => {
    expect(
      shouldFlashAlreadyUpgradedRefuseCue(ACTION_ERROR.cannotUpgradeBuilding),
    ).toBe(false);
    expect(alreadyUpgradedRefuseCueText()).not.toBe(
      CANNOT_UPGRADE_BUILDING_REFUSE_CUE,
    );
    expect(
      shouldFlashCannotUpgradeBuildingRefuseCue(ACTION_ERROR.alreadyUpgraded),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent upgrade rules (failure)", () => {
    expect(shouldFlashAlreadyUpgradedRefuseCue(null)).toBe(false);
    expect(shouldFlashAlreadyUpgradedRefuseCue(undefined)).toBe(false);
    expect(shouldFlashAlreadyUpgradedRefuseCue("")).toBe(false);
    expect(
      shouldFlashAlreadyUpgradedRefuseCue(ACTION_ERROR.needCoinsUpgrade(80)),
    ).toBe(false);
    expect(alreadyUpgradedRefuseCueText()).not.toMatch(/\d/);
    expect(alreadyUpgradedRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.alreadyUpgraded.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.alreadyUpgraded)).toBe(false);
    expect(alreadyUpgradedRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
