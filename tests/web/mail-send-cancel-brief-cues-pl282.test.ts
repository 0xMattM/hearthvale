import { describe, expect, it } from "vitest";
import {
  MAIL_CANCEL_SUCCESS_CUE,
  MAIL_CLAIM_SUCCESS_CUE,
  MAIL_SEND_SUCCESS_CUE,
  SUCCESS_CUE_MS,
  isCoreSuccessCueText,
  mailCancelSuccessCueText,
  mailSendSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL28.2 — Mail send / cancel ephemeral TopBar cues (PL17.2 claim pattern).
 * Escrow unchanged; sticky send/cancel prose replaced; mute ok (no dedicated SFX).
 */
describe("CityLands PL28.2 mail send / cancel brief cues", () => {
  it("uses short Parcel sent / Parcel cancelled copy (happy)", () => {
    expect(mailSendSuccessCueText()).toBe(MAIL_SEND_SUCCESS_CUE);
    expect(mailSendSuccessCueText()).toBe("Parcel sent");
    expect(isCoreSuccessCueText(MAIL_SEND_SUCCESS_CUE)).toBe(true);

    expect(mailCancelSuccessCueText()).toBe(MAIL_CANCEL_SUCCESS_CUE);
    expect(mailCancelSuccessCueText()).toBe("Parcel cancelled");
    expect(isCoreSuccessCueText(MAIL_CANCEL_SUCCESS_CUE)).toBe(true);

    expect(MAIL_SEND_SUCCESS_CUE).not.toBe(MAIL_CLAIM_SUCCESS_CUE);
    expect(MAIL_CANCEL_SUCCESS_CUE).not.toBe(MAIL_CLAIM_SUCCESS_CUE);
  });

  it("clears quickly — reuses SUCCESS_CUE_MS (edge)", () => {
    expect(SUCCESS_CUE_MS).toBeGreaterThanOrEqual(800);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("does not treat sticky / fail mail prose as the ephemeral cues (failure)", () => {
    expect(
      isCoreSuccessCueText("Parcel sent — they can claim it when online."),
    ).toBe(false);
    expect(isCoreSuccessCueText("Parcel cancelled — goods returned.")).toBe(
      false,
    );
    expect(isCoreSuccessCueText("Parcel claimed.")).toBe(false);
    expect(isCoreSuccessCueText("Could not send mail")).toBe(false);
    expect(isCoreSuccessCueText("Could not cancel mail")).toBe(false);
    expect(isCoreSuccessCueText(null)).toBe(false);
  });
});
