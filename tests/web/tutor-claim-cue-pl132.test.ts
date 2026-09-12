import { describe, expect, it } from "vitest";
import {
  SUCCESS_CUE_MS,
  isCoreSuccessCueText,
  tutorClaimSuccessCueText,
  TUTOR_CLAIM_SUCCESS_CUE,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL13.2 — Tutor claim brief ephemeral TopBar cue (PL6.2 style).
 */
describe("CityLands PL13.2 tutor claim brief success cue", () => {
  it("uses short Claimed copy — not sticky XP prose (happy)", () => {
    expect(tutorClaimSuccessCueText()).toBe(TUTOR_CLAIM_SUCCESS_CUE);
    expect(tutorClaimSuccessCueText()).toBe("Claimed");
    expect(isCoreSuccessCueText(tutorClaimSuccessCueText())).toBe(true);
  });

  it("clears quickly — reuses SUCCESS_CUE_MS (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not treat fail / sticky tutorial prose as ephemeral cues (failure)", () => {
    expect(
      isCoreSuccessCueText(
        "Tutorial claimed · +10 coins · +25 XP",
      ),
    ).toBe(false);
    expect(isCoreSuccessCueText("Could not claim tutorial")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
    expect(isCoreSuccessCueText("Claimed on the notice board.")).toBe(false);
  });
});
