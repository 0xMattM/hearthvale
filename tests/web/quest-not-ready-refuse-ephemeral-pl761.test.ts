import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  QUEST_NOT_READY_REFUSE_CUE,
  TUTOR_CLAIM_READY_EDGE_CUE,
  isCoreSuccessCueText,
  questNotReadyRefuseCueText,
  shouldFlashQuestNotReadyRefuseCue,
  shouldFlashTutorClaimReadyEdgeCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL76.1 — Quest-not-ready refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Objective` instead of sticky long quest prose.
 * Quest / XP rules unchanged; mute ok.
 */
describe("CityLands PL76.1 quest-not-ready refuse ephemeral", () => {
  it("flashes Objective for questNotReady (happy)", () => {
    expect(questNotReadyRefuseCueText()).toBe(QUEST_NOT_READY_REFUSE_CUE);
    expect(questNotReadyRefuseCueText()).toBe("Objective");
    expect(
      shouldFlashQuestNotReadyRefuseCue(ACTION_ERROR.questNotReady),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.questNotReady)).toBe(true);
    expect(isCoreSuccessCueText("Objective")).toBe(true);
    expect(ACTION_ERROR.questNotReady.toLowerCase()).toMatch(
      /objective|claim|reward/,
    );
  });

  it("stays quiet for unrelated claim-ready edges and other errors (edge)", () => {
    expect(
      shouldFlashQuestNotReadyRefuseCue(ACTION_ERROR.toolAlreadyRepaired),
    ).toBe(false);
    expect(
      shouldFlashQuestNotReadyRefuseCue(ACTION_ERROR.decorAlreadyPlaced),
    ).toBe(false);
    expect(questNotReadyRefuseCueText()).not.toBe(TUTOR_CLAIM_READY_EDGE_CUE);
    // Tutor claim edge still requires id sets — refuse cue stays orthogonal.
    expect(
      shouldFlashTutorClaimReadyEdgeCue(null, new Set(["farmer"])),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent XP rules (failure)", () => {
    expect(shouldFlashQuestNotReadyRefuseCue(null)).toBe(false);
    expect(shouldFlashQuestNotReadyRefuseCue(undefined)).toBe(false);
    expect(shouldFlashQuestNotReadyRefuseCue("")).toBe(false);
    expect(
      shouldFlashQuestNotReadyRefuseCue(ACTION_ERROR.unknownStation),
    ).toBe(false);
    expect(questNotReadyRefuseCueText()).not.toMatch(/\d/);
    expect(questNotReadyRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.questNotReady.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.questNotReady)).toBe(false);
    expect(questNotReadyRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat/,
    );
  });
});
