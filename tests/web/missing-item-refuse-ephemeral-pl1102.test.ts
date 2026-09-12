import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  ITEM_MISSING_REFUSE_CUE,
  MISSING_ITEM_REFUSE_CUE,
  NEEDS_STATION_REFUSE_CUE,
  isCoreSuccessCueText,
  missingItemRefuseCueText,
  shouldFlashItemMissingRefuseCue,
  shouldFlashMissingItemRefuseCue,
  shouldFlashNeedsStationRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL110.2 — Missing-item refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Need` instead of sticky long missing-item prose.
 * Item requirements unchanged; mute ok.
 */
describe("CityLands PL110.2 missing-item refuse ephemeral", () => {
  it("flashes Need for missingItem(name) (happy)", () => {
    expect(missingItemRefuseCueText()).toBe(MISSING_ITEM_REFUSE_CUE);
    expect(missingItemRefuseCueText()).toBe("Need");
    expect(
      shouldFlashMissingItemRefuseCue(ACTION_ERROR.missingItem("Wood")),
    ).toBe(true);
    expect(
      shouldFlashMissingItemRefuseCue(ACTION_ERROR.missingItem("Wheat")),
    ).toBe(true);
    expect(
      shouldFlashMissingItemRefuseCue(ACTION_ERROR.missingItem("Iron Ore")),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.missingItem("Wood"))).toBe(true);
    expect(isCoreSuccessCueText("Need")).toBe(true);
    expect(ACTION_ERROR.missingItem("Wood").toLowerCase()).toMatch(/need|wood/);
  });

  it("stays quiet for item-missing / needs-station / other You-need* (edge)", () => {
    expect(
      shouldFlashMissingItemRefuseCue(ACTION_ERROR.itemMissing),
    ).toBe(false);
    expect(
      shouldFlashMissingItemRefuseCue(ACTION_ERROR.needsStation("Kitchen")),
    ).toBe(false);
    expect(
      shouldFlashMissingItemRefuseCue(ACTION_ERROR.missingSeed),
    ).toBe(false);
    expect(
      shouldFlashMissingItemRefuseCue(ACTION_ERROR.needCoinsBuild(50)),
    ).toBe(false);
    expect(
      shouldFlashMissingItemRefuseCue(ACTION_ERROR.needsXp("cook", 25)),
    ).toBe(false);
    expect(
      shouldFlashMissingItemRefuseCue(ACTION_ERROR.unauthorized),
    ).toBe(false);
    expect(missingItemRefuseCueText()).not.toBe(ITEM_MISSING_REFUSE_CUE);
    expect(missingItemRefuseCueText()).not.toBe(NEEDS_STATION_REFUSE_CUE);
    expect(
      shouldFlashItemMissingRefuseCue(ACTION_ERROR.missingItem("Wood")),
    ).toBe(false);
    expect(
      shouldFlashNeedsStationRefuseCue(ACTION_ERROR.missingItem("Wood")),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent item rules (failure)", () => {
    expect(shouldFlashMissingItemRefuseCue(null)).toBe(false);
    expect(shouldFlashMissingItemRefuseCue(undefined)).toBe(false);
    expect(shouldFlashMissingItemRefuseCue("")).toBe(false);
    expect(
      shouldFlashMissingItemRefuseCue(ACTION_ERROR.missingMaterials),
    ).toBe(false);
    expect(missingItemRefuseCueText()).not.toMatch(/\d/);
    expect(missingItemRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.missingItem("Wood").length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.missingItem("Wood"))).toBe(false);
    expect(missingItemRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
