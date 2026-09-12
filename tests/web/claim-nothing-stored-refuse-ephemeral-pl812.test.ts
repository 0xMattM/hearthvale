import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  CLAIM_HELD_BY_OTHER_REFUSE_CUE,
  CLAIM_NOTHING_STORED_REFUSE_CUE,
  claimNothingStoredRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashClaimHeldByOtherRefuseCue,
  shouldFlashClaimNothingStoredRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL81.2 — Claim-nothing-stored refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Empty` instead of sticky long claim prose.
 * Claim produce rules unchanged; mute ok.
 */
describe("CityLands PL81.2 claim-nothing-stored refuse ephemeral", () => {
  it("flashes Empty for claimNothingStored (happy)", () => {
    expect(claimNothingStoredRefuseCueText()).toBe(
      CLAIM_NOTHING_STORED_REFUSE_CUE,
    );
    expect(claimNothingStoredRefuseCueText()).toBe("Empty");
    expect(
      shouldFlashClaimNothingStoredRefuseCue(ACTION_ERROR.claimNothingStored),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.claimNothingStored)).toBe(true);
    expect(isCoreSuccessCueText("Empty")).toBe(true);
    expect(ACTION_ERROR.claimNothingStored.toLowerCase()).toMatch(
      /produc|yet|nothing/,
    );
  });

  it("stays quiet for unrelated claim held refuse (edge)", () => {
    expect(
      shouldFlashClaimNothingStoredRefuseCue(ACTION_ERROR.claimHeldByOther),
    ).toBe(false);
    expect(claimNothingStoredRefuseCueText()).not.toBe(
      CLAIM_HELD_BY_OTHER_REFUSE_CUE,
    );
    expect(
      shouldFlashClaimHeldByOtherRefuseCue(ACTION_ERROR.claimNothingStored),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent claim rules (failure)", () => {
    expect(shouldFlashClaimNothingStoredRefuseCue(null)).toBe(false);
    expect(shouldFlashClaimNothingStoredRefuseCue(undefined)).toBe(false);
    expect(shouldFlashClaimNothingStoredRefuseCue("")).toBe(false);
    expect(
      shouldFlashClaimNothingStoredRefuseCue(ACTION_ERROR.claimNodeMissing),
    ).toBe(false);
    expect(claimNothingStoredRefuseCueText()).not.toMatch(/\d/);
    expect(claimNothingStoredRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.claimNothingStored.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.claimNothingStored)).toBe(false);
    expect(claimNothingStoredRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
