import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  HUNT_EXPLORE_ONLY_REFUSE_CUE,
  WARRIOR_HOMESTEAD_FORBIDDEN_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashHuntExploreOnlyRefuseCue,
  shouldFlashWarriorHomesteadForbiddenRefuseCue,
  warriorHomesteadForbiddenRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL99.2 — Warrior-homestead-forbidden refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Arena` instead of sticky long warrior prose.
 * Warrior / arena place rules unchanged; mute ok.
 */
describe("CityLands PL99.2 warrior-homestead-forbidden refuse ephemeral", () => {
  it("flashes Arena for warriorTrainingHomesteadForbidden (happy)", () => {
    expect(warriorHomesteadForbiddenRefuseCueText()).toBe(
      WARRIOR_HOMESTEAD_FORBIDDEN_REFUSE_CUE,
    );
    expect(warriorHomesteadForbiddenRefuseCueText()).toBe("Arena");
    expect(
      shouldFlashWarriorHomesteadForbiddenRefuseCue(
        ACTION_ERROR.warriorTrainingHomesteadForbidden,
      ),
    ).toBe(true);
    expect(
      isSoftRefuseError(ACTION_ERROR.warriorTrainingHomesteadForbidden),
    ).toBe(true);
    expect(isCoreSuccessCueText("Arena")).toBe(true);
    expect(
      ACTION_ERROR.warriorTrainingHomesteadForbidden.toLowerCase(),
    ).toMatch(/arena|land/);
  });

  it("stays quiet for unrelated hunt-explore-only refuse (edge)", () => {
    expect(
      shouldFlashWarriorHomesteadForbiddenRefuseCue(
        ACTION_ERROR.huntExploreOnly,
      ),
    ).toBe(false);
    expect(warriorHomesteadForbiddenRefuseCueText()).not.toBe(
      HUNT_EXPLORE_ONLY_REFUSE_CUE,
    );
    expect(
      shouldFlashHuntExploreOnlyRefuseCue(
        ACTION_ERROR.warriorTrainingHomesteadForbidden,
      ),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent arena place rules (failure)", () => {
    expect(shouldFlashWarriorHomesteadForbiddenRefuseCue(null)).toBe(false);
    expect(shouldFlashWarriorHomesteadForbiddenRefuseCue(undefined)).toBe(
      false,
    );
    expect(shouldFlashWarriorHomesteadForbiddenRefuseCue("")).toBe(false);
    expect(
      shouldFlashWarriorHomesteadForbiddenRefuseCue(
        ACTION_ERROR.buildPlayerLandOnly,
      ),
    ).toBe(false);
    expect(warriorHomesteadForbiddenRefuseCueText()).not.toMatch(/\d/);
    expect(warriorHomesteadForbiddenRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.warriorTrainingHomesteadForbidden.length,
    );
    expect(
      isCoreSuccessCueText(ACTION_ERROR.warriorTrainingHomesteadForbidden),
    ).toBe(false);
    expect(warriorHomesteadForbiddenRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
