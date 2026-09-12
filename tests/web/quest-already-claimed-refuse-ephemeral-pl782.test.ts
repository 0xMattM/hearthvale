import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  QUEST_ALREADY_CLAIMED_REFUSE_CUE,
  QUEST_LOCKED_REFUSE_CUE,
  isCoreSuccessCueText,
  questAlreadyClaimedRefuseCueText,
  shouldFlashQuestAlreadyClaimedRefuseCue,
  shouldFlashQuestLockedRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL78.2 — Quest-already-claimed refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Claimed` instead of sticky long quest prose.
 * Quest / XP rules unchanged; mute ok.
 */
describe("CityLands PL78.2 quest-already-claimed refuse ephemeral", () => {
  it("flashes Claimed for questAlreadyClaimed (happy)", () => {
    expect(questAlreadyClaimedRefuseCueText()).toBe(
      QUEST_ALREADY_CLAIMED_REFUSE_CUE,
    );
    expect(questAlreadyClaimedRefuseCueText()).toBe("Claimed");
    expect(
      shouldFlashQuestAlreadyClaimedRefuseCue(ACTION_ERROR.questAlreadyClaimed),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.questAlreadyClaimed)).toBe(true);
    expect(isCoreSuccessCueText("Claimed")).toBe(true);
    expect(ACTION_ERROR.questAlreadyClaimed.toLowerCase()).toMatch(
      /already|claim/,
    );
  });

  it("stays quiet for other quest claim refuses (edge)", () => {
    expect(
      shouldFlashQuestAlreadyClaimedRefuseCue(ACTION_ERROR.questNotReady),
    ).toBe(false);
    expect(
      shouldFlashQuestAlreadyClaimedRefuseCue(ACTION_ERROR.questLocked),
    ).toBe(false);
    expect(questAlreadyClaimedRefuseCueText()).not.toBe(QUEST_LOCKED_REFUSE_CUE);
    expect(
      shouldFlashQuestLockedRefuseCue(ACTION_ERROR.questAlreadyClaimed),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent XP rules (failure)", () => {
    expect(shouldFlashQuestAlreadyClaimedRefuseCue(null)).toBe(false);
    expect(shouldFlashQuestAlreadyClaimedRefuseCue(undefined)).toBe(false);
    expect(shouldFlashQuestAlreadyClaimedRefuseCue("")).toBe(false);
    expect(
      shouldFlashQuestAlreadyClaimedRefuseCue(ACTION_ERROR.unknownStation),
    ).toBe(false);
    expect(questAlreadyClaimedRefuseCueText()).not.toMatch(/\d/);
    expect(questAlreadyClaimedRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.questAlreadyClaimed.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.questAlreadyClaimed)).toBe(false);
    expect(questAlreadyClaimedRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat/,
    );
  });
});
