import { describe, expect, it } from "vitest";
import {
  SUCCESS_CUE_MS,
  isCoreSuccessCueText,
  questClaimSuccessCueText,
  QUEST_CLAIM_SUCCESS_CUE,
  TUTOR_CLAIM_SUCCESS_CUE,
} from "../../apps/web/lib/hud/success-cue";
import { SFX_PRESETS, sfxStepsFor } from "../../apps/web/lib/game-audio";

/**
 * PL29.3 — Quest claim success cue (ephemeral; distinct from tutor Claimed).
 */
describe("CityLands PL29.3 quest claim success cue", () => {
  it("uses short Quest claimed copy — not sticky XP prose (happy)", () => {
    expect(questClaimSuccessCueText()).toBe(QUEST_CLAIM_SUCCESS_CUE);
    expect(questClaimSuccessCueText()).toBe("Quest claimed");
    expect(isCoreSuccessCueText(questClaimSuccessCueText())).toBe(true);
    expect(questClaimSuccessCueText()).not.toBe(TUTOR_CLAIM_SUCCESS_CUE);
    expect(sfxStepsFor("quest_claim").length).toBeGreaterThan(0);
    expect(SFX_PRESETS.quest_claim.length).toBeGreaterThanOrEqual(2);
  });

  it("clears quickly — reuses SUCCESS_CUE_MS (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not treat fail / sticky quest prose as ephemeral cues (failure)", () => {
    expect(
      isCoreSuccessCueText(
        "Quest claimed · +10 coins · +25 XP",
      ),
    ).toBe(false);
    expect(isCoreSuccessCueText("Could not claim quest")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
    expect(isCoreSuccessCueText(TUTOR_CLAIM_SUCCESS_CUE)).toBe(true);
  });
});
