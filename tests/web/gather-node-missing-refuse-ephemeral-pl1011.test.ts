import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  GATHER_NODE_MISSING_REFUSE_CUE,
  HUNT_EXPLORE_ONLY_REFUSE_CUE,
  isCoreSuccessCueText,
  shouldFlashGatherNodeMissingRefuseCue,
  shouldFlashHuntExploreOnlyRefuseCue,
  gatherNodeMissingRefuseCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL101.1 — Gather-node-missing refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Gone` instead of sticky long node-missing prose.
 * Gather node rules unchanged; mute ok.
 */
describe("CityLands PL101.1 gather-node-missing refuse ephemeral", () => {
  it("flashes Gone for ore/stump/dock/pen missing (happy)", () => {
    expect(gatherNodeMissingRefuseCueText()).toBe(
      GATHER_NODE_MISSING_REFUSE_CUE,
    );
    expect(gatherNodeMissingRefuseCueText()).toBe("Gone");
    expect(
      shouldFlashGatherNodeMissingRefuseCue(ACTION_ERROR.oreNodeMissing),
    ).toBe(true);
    expect(
      shouldFlashGatherNodeMissingRefuseCue(ACTION_ERROR.woodStumpMissing),
    ).toBe(true);
    expect(
      shouldFlashGatherNodeMissingRefuseCue(ACTION_ERROR.fishingDockMissing),
    ).toBe(true);
    expect(
      shouldFlashGatherNodeMissingRefuseCue(ACTION_ERROR.animalPenMissing),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.oreNodeMissing)).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.woodStumpMissing)).toBe(true);
    expect(isCoreSuccessCueText("Gone")).toBe(true);
    expect(ACTION_ERROR.oreNodeMissing.toLowerCase()).toMatch(/ore|land/);
  });

  it("stays quiet for unrelated hunt-explore-only refuse (edge)", () => {
    expect(
      shouldFlashGatherNodeMissingRefuseCue(ACTION_ERROR.huntExploreOnly),
    ).toBe(false);
    expect(gatherNodeMissingRefuseCueText()).not.toBe(
      HUNT_EXPLORE_ONLY_REFUSE_CUE,
    );
    expect(
      shouldFlashHuntExploreOnlyRefuseCue(ACTION_ERROR.oreNodeMissing),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent node rules (failure)", () => {
    expect(shouldFlashGatherNodeMissingRefuseCue(null)).toBe(false);
    expect(shouldFlashGatherNodeMissingRefuseCue(undefined)).toBe(false);
    expect(shouldFlashGatherNodeMissingRefuseCue("")).toBe(false);
    expect(
      shouldFlashGatherNodeMissingRefuseCue(ACTION_ERROR.plotMissing),
    ).toBe(false);
    expect(
      shouldFlashGatherNodeMissingRefuseCue(ACTION_ERROR.huntMissing),
    ).toBe(false);
    expect(gatherNodeMissingRefuseCueText()).not.toMatch(/\d/);
    expect(gatherNodeMissingRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.oreNodeMissing.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.oreNodeMissing)).toBe(false);
    expect(gatherNodeMissingRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
