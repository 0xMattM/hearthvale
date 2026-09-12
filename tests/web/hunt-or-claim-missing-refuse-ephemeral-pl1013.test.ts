import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  HUNT_OR_CLAIM_MISSING_REFUSE_CUE,
  PLOT_MISSING_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashHuntOrClaimMissingRefuseCue,
  shouldFlashPlotMissingRefuseCue,
  huntOrClaimMissingRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL101.3 — Hunt-or-claim-missing refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Gone` instead of sticky long hunt/claim-missing prose.
 * Hunt / claim node rules unchanged; mute ok.
 */
describe("CityLands PL101.3 hunt-or-claim-missing refuse ephemeral", () => {
  it("flashes Gone for huntMissing / claimNodeMissing (happy)", () => {
    expect(huntOrClaimMissingRefuseCueText()).toBe(
      HUNT_OR_CLAIM_MISSING_REFUSE_CUE,
    );
    expect(huntOrClaimMissingRefuseCueText()).toBe("Gone");
    expect(
      shouldFlashHuntOrClaimMissingRefuseCue(ACTION_ERROR.huntMissing),
    ).toBe(true);
    expect(
      shouldFlashHuntOrClaimMissingRefuseCue(ACTION_ERROR.claimNodeMissing),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.huntMissing)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.claimNodeMissing)).toBe(true);
    expect(isCoreSuccessCueText("Gone")).toBe(true);
    expect(ACTION_ERROR.huntMissing.toLowerCase()).toMatch(/hunt|land/);
    expect(ACTION_ERROR.claimNodeMissing.toLowerCase()).toMatch(
      /claim|beacon|land/,
    );
  });

  it("stays quiet for plot-missing refuse (edge)", () => {
    expect(
      shouldFlashHuntOrClaimMissingRefuseCue(ACTION_ERROR.plotMissing),
    ).toBe(false);
    expect(huntOrClaimMissingRefuseCueText()).toBe(PLOT_MISSING_REFUSE_CUE);
    expect(
      shouldFlashPlotMissingRefuseCue(ACTION_ERROR.huntMissing),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent hunt/claim rules (failure)", () => {
    expect(shouldFlashHuntOrClaimMissingRefuseCue(null)).toBe(false);
    expect(shouldFlashHuntOrClaimMissingRefuseCue(undefined)).toBe(false);
    expect(shouldFlashHuntOrClaimMissingRefuseCue("")).toBe(false);
    expect(
      shouldFlashHuntOrClaimMissingRefuseCue(ACTION_ERROR.oreNodeMissing),
    ).toBe(false);
    expect(
      shouldFlashHuntOrClaimMissingRefuseCue(ACTION_ERROR.huntExploreOnly),
    ).toBe(false);
    expect(huntOrClaimMissingRefuseCueText()).not.toMatch(/\d/);
    expect(huntOrClaimMissingRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.huntMissing.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.huntMissing)).toBe(false);
    expect(huntOrClaimMissingRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
