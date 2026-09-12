import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  ALREADY_UPGRADED_REFUSE_CUE,
  CANNOT_UPGRADE_BUILDING_REFUSE_CUE,
  cannotUpgradeBuildingRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashAlreadyUpgradedRefuseCue,
  shouldFlashCannotUpgradeBuildingRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL89.2 — Cannot-upgrade refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Fixed` instead of sticky long upgrade prose.
 * Upgrade rules unchanged; mute ok.
 */
describe("CityLands PL89.2 cannot-upgrade refuse ephemeral", () => {
  it("flashes Fixed for cannotUpgradeBuilding (happy)", () => {
    expect(cannotUpgradeBuildingRefuseCueText()).toBe(
      CANNOT_UPGRADE_BUILDING_REFUSE_CUE,
    );
    expect(cannotUpgradeBuildingRefuseCueText()).toBe("Fixed");
    expect(
      shouldFlashCannotUpgradeBuildingRefuseCue(
        ACTION_ERROR.cannotUpgradeBuilding,
      ),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.cannotUpgradeBuilding)).toBe(true);
    expect(isCoreSuccessCueText("Fixed")).toBe(true);
    expect(ACTION_ERROR.cannotUpgradeBuilding.toLowerCase()).toMatch(
      /cannot|upgrade/,
    );
  });

  it("stays quiet for unrelated already-upgraded refuse (edge)", () => {
    expect(
      shouldFlashCannotUpgradeBuildingRefuseCue(ACTION_ERROR.alreadyUpgraded),
    ).toBe(false);
    expect(cannotUpgradeBuildingRefuseCueText()).not.toBe(
      ALREADY_UPGRADED_REFUSE_CUE,
    );
    expect(
      shouldFlashAlreadyUpgradedRefuseCue(ACTION_ERROR.cannotUpgradeBuilding),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent upgrade rules (failure)", () => {
    expect(shouldFlashCannotUpgradeBuildingRefuseCue(null)).toBe(false);
    expect(shouldFlashCannotUpgradeBuildingRefuseCue(undefined)).toBe(false);
    expect(shouldFlashCannotUpgradeBuildingRefuseCue("")).toBe(false);
    expect(
      shouldFlashCannotUpgradeBuildingRefuseCue(
        ACTION_ERROR.needMatsUpgrade(2, "wood"),
      ),
    ).toBe(false);
    expect(cannotUpgradeBuildingRefuseCueText()).not.toMatch(/\d/);
    expect(cannotUpgradeBuildingRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.cannotUpgradeBuilding.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.cannotUpgradeBuilding)).toBe(
      false,
    );
    expect(cannotUpgradeBuildingRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
