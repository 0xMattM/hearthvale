import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GUILD_BANK_UNKNOWN_ITEM_REFUSE_CUE,
  ITEM_MISSING_REFUSE_CUE,
  UNKNOWN_STATION_REFUSE_CUE,
  isCoreSuccessCueText,
  itemMissingRefuseCueText,
  shouldFlashGuildBankUnknownItemRefuseCue,
  shouldFlashItemMissingRefuseCue,
  shouldFlashUnknownStationRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL108.1 — Item-missing refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Item` instead of sticky long inventory prose.
 * Inventory rules unchanged; mute ok.
 */
describe("CityLands PL108.1 item-missing refuse ephemeral", () => {
  it("flashes Item for itemMissing (happy)", () => {
    expect(itemMissingRefuseCueText()).toBe(ITEM_MISSING_REFUSE_CUE);
    expect(itemMissingRefuseCueText()).toBe("Item");
    expect(shouldFlashItemMissingRefuseCue(ACTION_ERROR.itemMissing)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.itemMissing)).toBe(true);
    expect(isCoreSuccessCueText("Item")).toBe(true);
    expect(ACTION_ERROR.itemMissing.toLowerCase()).toMatch(/item|inventory/);
  });

  it("stays quiet for guild-bank-item and unknown-station refuses (edge)", () => {
    expect(
      shouldFlashItemMissingRefuseCue(ACTION_ERROR.guildBankUnknownItem),
    ).toBe(false);
    expect(
      shouldFlashItemMissingRefuseCue(ACTION_ERROR.unknownStation),
    ).toBe(false);
    expect(itemMissingRefuseCueText()).toBe(GUILD_BANK_UNKNOWN_ITEM_REFUSE_CUE);
    expect(itemMissingRefuseCueText()).not.toBe(UNKNOWN_STATION_REFUSE_CUE);
    expect(
      shouldFlashGuildBankUnknownItemRefuseCue(ACTION_ERROR.itemMissing),
    ).toBe(false);
    expect(
      shouldFlashUnknownStationRefuseCue(ACTION_ERROR.itemMissing),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent inventory rules (failure)", () => {
    expect(shouldFlashItemMissingRefuseCue(null)).toBe(false);
    expect(shouldFlashItemMissingRefuseCue(undefined)).toBe(false);
    expect(shouldFlashItemMissingRefuseCue("")).toBe(false);
    expect(
      shouldFlashItemMissingRefuseCue(ACTION_ERROR.notEnoughItems),
    ).toBe(false);
    expect(itemMissingRefuseCueText()).not.toMatch(/\d/);
    expect(itemMissingRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.itemMissing.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.itemMissing)).toBe(false);
    expect(itemMissingRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
