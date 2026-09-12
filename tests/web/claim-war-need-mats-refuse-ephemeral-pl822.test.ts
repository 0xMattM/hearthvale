import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  CLAIM_WAR_ALREADY_OPEN_REFUSE_CUE,
  CLAIM_WAR_NEED_MATS_REFUSE_CUE,
  claimWarNeedMatsRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashClaimWarAlreadyOpenRefuseCue,
  shouldFlashClaimWarNeedMatsRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL82.2 — Claim-war-need-mats refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Wood` instead of sticky long soft-war prose.
 * Deliver scoring unchanged; mute ok.
 */
describe("CityLands PL82.2 claim-war-need-mats refuse ephemeral", () => {
  it("flashes Wood for claimWarNeedMats (happy)", () => {
    expect(claimWarNeedMatsRefuseCueText()).toBe(CLAIM_WAR_NEED_MATS_REFUSE_CUE);
    expect(claimWarNeedMatsRefuseCueText()).toBe("Wood");
    expect(
      shouldFlashClaimWarNeedMatsRefuseCue(ACTION_ERROR.claimWarNeedMats),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.claimWarNeedMats)).toBe(true);
    expect(isCoreSuccessCueText("Wood")).toBe(true);
    expect(ACTION_ERROR.claimWarNeedMats.toLowerCase()).toMatch(/wood|deliver/);
  });

  it("stays quiet for unrelated claim war already-open refuse (edge)", () => {
    expect(
      shouldFlashClaimWarNeedMatsRefuseCue(ACTION_ERROR.claimWarAlreadyOpen),
    ).toBe(false);
    expect(claimWarNeedMatsRefuseCueText()).not.toBe(
      CLAIM_WAR_ALREADY_OPEN_REFUSE_CUE,
    );
    expect(
      shouldFlashClaimWarAlreadyOpenRefuseCue(ACTION_ERROR.claimWarNeedMats),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent soft-war rules (failure)", () => {
    expect(shouldFlashClaimWarNeedMatsRefuseCue(null)).toBe(false);
    expect(shouldFlashClaimWarNeedMatsRefuseCue(undefined)).toBe(false);
    expect(shouldFlashClaimWarNeedMatsRefuseCue("")).toBe(false);
    expect(
      shouldFlashClaimWarNeedMatsRefuseCue(ACTION_ERROR.claimWarNotOpen),
    ).toBe(false);
    expect(claimWarNeedMatsRefuseCueText()).not.toMatch(/\d/);
    expect(claimWarNeedMatsRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.claimWarNeedMats.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.claimWarNeedMats)).toBe(false);
    expect(claimWarNeedMatsRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
