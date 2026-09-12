import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  HUNT_EXPLORE_ONLY_REFUSE_CUE,
  WARRIOR_HOMESTEAD_FORBIDDEN_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashHuntExploreOnlyRefuseCue,
  shouldFlashWarriorHomesteadForbiddenRefuseCue,
  huntExploreOnlyRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL99.1 — Hunt-explore-only refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Explore` instead of sticky long hunt-gate prose.
 * Hunt map gate unchanged; mute ok.
 */
describe("CityLands PL99.1 hunt-explore-only refuse ephemeral", () => {
  it("flashes Explore for huntExploreOnly (happy)", () => {
    expect(huntExploreOnlyRefuseCueText()).toBe(HUNT_EXPLORE_ONLY_REFUSE_CUE);
    expect(huntExploreOnlyRefuseCueText()).toBe("Explore");
    expect(
      shouldFlashHuntExploreOnlyRefuseCue(ACTION_ERROR.huntExploreOnly),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.huntExploreOnly)).toBe(true);
    expect(isCoreSuccessCueText("Explore")).toBe(true);
    expect(ACTION_ERROR.huntExploreOnly.toLowerCase()).toMatch(/exploration|hunt/);
  });

  it("stays quiet for unrelated warrior-homestead refuse (edge)", () => {
    expect(
      shouldFlashHuntExploreOnlyRefuseCue(
        ACTION_ERROR.warriorTrainingHomesteadForbidden,
      ),
    ).toBe(false);
    expect(huntExploreOnlyRefuseCueText()).not.toBe(
      WARRIOR_HOMESTEAD_FORBIDDEN_REFUSE_CUE,
    );
    expect(
      shouldFlashWarriorHomesteadForbiddenRefuseCue(
        ACTION_ERROR.huntExploreOnly,
      ),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent hunt map rules (failure)", () => {
    expect(shouldFlashHuntExploreOnlyRefuseCue(null)).toBe(false);
    expect(shouldFlashHuntExploreOnlyRefuseCue(undefined)).toBe(false);
    expect(shouldFlashHuntExploreOnlyRefuseCue("")).toBe(false);
    expect(
      shouldFlashHuntExploreOnlyRefuseCue(ACTION_ERROR.huntCooldown),
    ).toBe(false);
    expect(huntExploreOnlyRefuseCueText()).not.toMatch(/\d/);
    expect(huntExploreOnlyRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.huntExploreOnly.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.huntExploreOnly)).toBe(false);
    expect(huntExploreOnlyRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
