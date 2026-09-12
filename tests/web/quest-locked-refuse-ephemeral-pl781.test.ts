import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  QUEST_LOCKED_REFUSE_CUE,
  QUEST_NOT_READY_REFUSE_CUE,
  isCoreSuccessCueText,
  questLockedRefuseCueText,
  shouldFlashQuestLockedRefuseCue,
  shouldFlashQuestNotReadyRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL78.1 — Quest-locked refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Locked` instead of sticky long quest prose.
 * Quest / XP rules unchanged; mute ok.
 */
describe("CityLands PL78.1 quest-locked refuse ephemeral", () => {
  it("flashes Locked for questLocked (happy)", () => {
    expect(questLockedRefuseCueText()).toBe(QUEST_LOCKED_REFUSE_CUE);
    expect(questLockedRefuseCueText()).toBe("Locked");
    expect(shouldFlashQuestLockedRefuseCue(ACTION_ERROR.questLocked)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.questLocked)).toBe(true);
    expect(isCoreSuccessCueText("Locked")).toBe(true);
    expect(ACTION_ERROR.questLocked.toLowerCase()).toMatch(
      /previous|complete|first/,
    );
  });

  it("stays quiet for other quest claim refuses (edge)", () => {
    expect(
      shouldFlashQuestLockedRefuseCue(ACTION_ERROR.questNotReady),
    ).toBe(false);
    expect(
      shouldFlashQuestLockedRefuseCue(ACTION_ERROR.questAlreadyClaimed),
    ).toBe(false);
    expect(questLockedRefuseCueText()).not.toBe(QUEST_NOT_READY_REFUSE_CUE);
    expect(
      shouldFlashQuestNotReadyRefuseCue(ACTION_ERROR.questLocked),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent XP rules (failure)", () => {
    expect(shouldFlashQuestLockedRefuseCue(null)).toBe(false);
    expect(shouldFlashQuestLockedRefuseCue(undefined)).toBe(false);
    expect(shouldFlashQuestLockedRefuseCue("")).toBe(false);
    expect(
      shouldFlashQuestLockedRefuseCue(ACTION_ERROR.unknownStation),
    ).toBe(false);
    expect(questLockedRefuseCueText()).not.toMatch(/\d/);
    expect(questLockedRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.questLocked.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.questLocked)).toBe(false);
    expect(questLockedRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat/,
    );
  });
});
