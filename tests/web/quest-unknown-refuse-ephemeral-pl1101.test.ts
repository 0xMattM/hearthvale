import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  MISSING_ITEM_REFUSE_CUE,
  QUEST_LOCKED_REFUSE_CUE,
  QUEST_UNKNOWN_REFUSE_CUE,
  isCoreSuccessCueText,
  questUnknownRefuseCueText,
  shouldFlashMissingItemRefuseCue,
  shouldFlashQuestLockedRefuseCue,
  shouldFlashQuestUnknownRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL110.1 — Quest-unknown refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Quest` instead of sticky long quest prose.
 * Quest catalog unchanged; mute ok.
 */
describe("CityLands PL110.1 quest-unknown refuse ephemeral", () => {
  it("flashes Quest for questUnknown (happy)", () => {
    expect(questUnknownRefuseCueText()).toBe(QUEST_UNKNOWN_REFUSE_CUE);
    expect(questUnknownRefuseCueText()).toBe("Quest");
    expect(shouldFlashQuestUnknownRefuseCue(ACTION_ERROR.questUnknown)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.questUnknown)).toBe(true);
    expect(isCoreSuccessCueText("Quest")).toBe(true);
    expect(ACTION_ERROR.questUnknown.toLowerCase()).toMatch(/quest/);
  });

  it("stays quiet for quest-locked and missing-item refuses (edge)", () => {
    expect(
      shouldFlashQuestUnknownRefuseCue(ACTION_ERROR.questLocked),
    ).toBe(false);
    expect(
      shouldFlashQuestUnknownRefuseCue(ACTION_ERROR.missingItem("Wood")),
    ).toBe(false);
    expect(questUnknownRefuseCueText()).not.toBe(QUEST_LOCKED_REFUSE_CUE);
    expect(questUnknownRefuseCueText()).not.toBe(MISSING_ITEM_REFUSE_CUE);
    expect(
      shouldFlashQuestLockedRefuseCue(ACTION_ERROR.questUnknown),
    ).toBe(false);
    expect(
      shouldFlashMissingItemRefuseCue(ACTION_ERROR.questUnknown),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent quest rules (failure)", () => {
    expect(shouldFlashQuestUnknownRefuseCue(null)).toBe(false);
    expect(shouldFlashQuestUnknownRefuseCue(undefined)).toBe(false);
    expect(shouldFlashQuestUnknownRefuseCue("")).toBe(false);
    expect(
      shouldFlashQuestUnknownRefuseCue(ACTION_ERROR.questNotReady),
    ).toBe(false);
    expect(questUnknownRefuseCueText()).not.toMatch(/\d/);
    expect(questUnknownRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.questUnknown.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.questUnknown)).toBe(false);
    expect(questUnknownRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
