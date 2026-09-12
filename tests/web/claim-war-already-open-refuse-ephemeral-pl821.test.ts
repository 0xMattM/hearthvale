import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  CLAIM_WAR_ALREADY_OPEN_REFUSE_CUE,
  CLAIM_WAR_NOT_OPEN_REFUSE_CUE,
  claimWarAlreadyOpenRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashClaimWarAlreadyOpenRefuseCue,
  shouldFlashClaimWarNotOpenRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL82.1 — Claim-war-already-open refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Contest` instead of sticky long soft-war prose.
 * Soft-war rules unchanged; mute ok.
 */
describe("CityLands PL82.1 claim-war-already-open refuse ephemeral", () => {
  it("flashes Contest for claimWarAlreadyOpen (happy)", () => {
    expect(claimWarAlreadyOpenRefuseCueText()).toBe(
      CLAIM_WAR_ALREADY_OPEN_REFUSE_CUE,
    );
    expect(claimWarAlreadyOpenRefuseCueText()).toBe("Contest");
    expect(
      shouldFlashClaimWarAlreadyOpenRefuseCue(ACTION_ERROR.claimWarAlreadyOpen),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.claimWarAlreadyOpen)).toBe(true);
    expect(isCoreSuccessCueText("Contest")).toBe(true);
    expect(ACTION_ERROR.claimWarAlreadyOpen.toLowerCase()).toMatch(
      /war|underway|deliver/,
    );
  });

  it("stays quiet for unrelated claim war not-open refuse (edge)", () => {
    expect(
      shouldFlashClaimWarAlreadyOpenRefuseCue(ACTION_ERROR.claimWarNotOpen),
    ).toBe(false);
    expect(claimWarAlreadyOpenRefuseCueText()).not.toBe(
      CLAIM_WAR_NOT_OPEN_REFUSE_CUE,
    );
    expect(
      shouldFlashClaimWarNotOpenRefuseCue(ACTION_ERROR.claimWarAlreadyOpen),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent soft-war rules (failure)", () => {
    expect(shouldFlashClaimWarAlreadyOpenRefuseCue(null)).toBe(false);
    expect(shouldFlashClaimWarAlreadyOpenRefuseCue(undefined)).toBe(false);
    expect(shouldFlashClaimWarAlreadyOpenRefuseCue("")).toBe(false);
    expect(
      shouldFlashClaimWarAlreadyOpenRefuseCue(ACTION_ERROR.claimWarNeedMats),
    ).toBe(false);
    expect(claimWarAlreadyOpenRefuseCueText()).not.toMatch(/\d/);
    expect(claimWarAlreadyOpenRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.claimWarAlreadyOpen.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.claimWarAlreadyOpen)).toBe(false);
    expect(claimWarAlreadyOpenRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
