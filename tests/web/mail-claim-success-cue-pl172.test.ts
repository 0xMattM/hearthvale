import { describe, expect, it } from "vitest";
import {
  MAIL_CLAIM_SUCCESS_CUE,
  SUCCESS_CUE_MS,
  isCoreSuccessCueText,
  mailClaimSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL17.2 — Mail parcel claim ephemeral TopBar cue (PL6.2 / PL10.2 pattern).
 * Escrow rules unchanged; sticky “Parcel claimed.” prose replaced.
 */
describe("CityLands PL17.2 mail claim success cue", () => {
  it("uses short Parcel claimed copy (happy)", () => {
    expect(mailClaimSuccessCueText()).toBe(MAIL_CLAIM_SUCCESS_CUE);
    expect(mailClaimSuccessCueText()).toBe("Parcel claimed");
    expect(isCoreSuccessCueText(MAIL_CLAIM_SUCCESS_CUE)).toBe(true);
  });

  it("clears quickly — reuses SUCCESS_CUE_MS (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not treat sticky / fail mail prose as the ephemeral cue (failure)", () => {
    expect(isCoreSuccessCueText("Parcel claimed.")).toBe(false);
    expect(
      isCoreSuccessCueText("Parcel sent — they can claim it when online."),
    ).toBe(false);
    expect(isCoreSuccessCueText("Parcel cancelled — goods returned.")).toBe(
      false,
    );
    expect(isCoreSuccessCueText("Could not claim mail")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
  });
});
