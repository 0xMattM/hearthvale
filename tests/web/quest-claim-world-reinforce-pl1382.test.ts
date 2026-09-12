import { describe, expect, it } from "vitest";
import {
  COINS_GAIN_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/coins-gain-feedback";
import {
  MARKET_LIST_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/market-list-feedback";
import {
  QUEST_CLAIM_WORLD_REINFORCE,
  questClaimWorldReinforceBackground,
  shouldFlashQuestClaimWorldReinforce,
} from "../../apps/web/lib/hud/quest-claim-feedback";
import {
  QUEST_CLAIM_SUCCESS_CUE,
  questClaimSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL138.2 — Quest-claim soft world reinforce.
 * Brief soft quest rim on claim ok (complements Quest claimed PL29.3 + coins PL126.2).
 * Rewards / catalog unchanged; mute ok; fail silent.
 * Choice: one-shot verdant rim (not another Quest claimed toast) so claim stays
 * world-readable beside coins gold when rewards include coins.
 */
describe("CityLands PL138.2 quest-claim soft world reinforce", () => {
  it("flashes soft quest rim when claim succeeds (happy)", () => {
    expect(shouldFlashQuestClaimWorldReinforce(true)).toBe(true);
    expect(QUEST_CLAIM_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(QUEST_CLAIM_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = questClaimWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(QUEST_CLAIM_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Quest claimed ephemeral.
    expect(questClaimSuccessCueText()).toBe(QUEST_CLAIM_SUCCESS_CUE);
    expect(questClaimSuccessCueText()).toBe("Quest claimed");
  });

  it("stays quiet on fail; rim ≠ coins gold / market teal (edge)", () => {
    expect(shouldFlashQuestClaimWorldReinforce(false)).toBe(false);

    expect(QUEST_CLAIM_WORLD_REINFORCE.outerRgba).not.toBe(
      COINS_GAIN_WORLD_REINFORCE.outerRgba,
    );
    expect(QUEST_CLAIM_WORLD_REINFORCE.outerRgba).not.toBe(
      MARKET_LIST_WORLD_REINFORCE.outerRgba,
    );
    expect(QUEST_CLAIM_WORLD_REINFORCE.clearPct).toBeLessThan(
      QUEST_CLAIM_WORLD_REINFORCE.midPct,
    );
    expect(QUEST_CLAIM_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent rewards / catalog; keeps ok gate (failure)", () => {
    expect(questClaimWorldReinforceBackground()).not.toMatch(
      /xp\s*bar|catalog/i,
    );
    expect(String(QUEST_CLAIM_WORLD_REINFORCE.durationMs)).not.toMatch(
      /nft|combat/i,
    );
    expect(QUEST_CLAIM_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashQuestClaimWorldReinforce(true)).not.toBe(
      shouldFlashQuestClaimWorldReinforce(false),
    );
  });
});
