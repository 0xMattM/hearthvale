import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  CLAIM_WAR_ALREADY_OPEN_REFUSE_CUE,
  CLAIM_WAR_NOT_OPEN_REFUSE_CUE,
  claimWarNotOpenRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashClaimWarAlreadyOpenRefuseCue,
  shouldFlashClaimWarNotOpenRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL82.3 — Claim-war-not-open refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Peace` instead of sticky long soft-war prose.
 * Soft-war rules unchanged; mute ok.
 */
describe("CityLands PL82.3 claim-war-not-open refuse ephemeral", () => {
  it("flashes Peace for claimWarNotOpen (happy)", () => {
    expect(claimWarNotOpenRefuseCueText()).toBe(CLAIM_WAR_NOT_OPEN_REFUSE_CUE);
    expect(claimWarNotOpenRefuseCueText()).toBe("Peace");
    expect(
      shouldFlashClaimWarNotOpenRefuseCue(ACTION_ERROR.claimWarNotOpen),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.claimWarNotOpen)).toBe(true);
    expect(isCoreSuccessCueText("Peace")).toBe(true);
    expect(ACTION_ERROR.claimWarNotOpen.toLowerCase()).toMatch(
      /no soft war|not active|no .*war/,
    );
  });

  it("stays quiet for unrelated claim war already-open refuse (edge)", () => {
    expect(
      shouldFlashClaimWarNotOpenRefuseCue(ACTION_ERROR.claimWarAlreadyOpen),
    ).toBe(false);
    expect(claimWarNotOpenRefuseCueText()).not.toBe(
      CLAIM_WAR_ALREADY_OPEN_REFUSE_CUE,
    );
    expect(
      shouldFlashClaimWarAlreadyOpenRefuseCue(ACTION_ERROR.claimWarNotOpen),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent soft-war rules (failure)", () => {
    expect(shouldFlashClaimWarNotOpenRefuseCue(null)).toBe(false);
    expect(shouldFlashClaimWarNotOpenRefuseCue(undefined)).toBe(false);
    expect(shouldFlashClaimWarNotOpenRefuseCue("")).toBe(false);
    expect(
      shouldFlashClaimWarNotOpenRefuseCue(ACTION_ERROR.claimWarNeedMats),
    ).toBe(false);
    expect(claimWarNotOpenRefuseCueText()).not.toMatch(/\d/);
    expect(claimWarNotOpenRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.claimWarNotOpen.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.claimWarNotOpen)).toBe(false);
    expect(claimWarNotOpenRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
