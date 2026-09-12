import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  CLAIM_HELD_BY_OTHER_REFUSE_CUE,
  CLAIM_NEED_GUILD_REFUSE_CUE,
  claimHeldByOtherRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashClaimHeldByOtherRefuseCue,
  shouldFlashClaimNeedGuildRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL81.1 — Claim-held-by-other refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Held` instead of sticky long claim prose.
 * Claim / war rules unchanged; mute ok.
 */
describe("CityLands PL81.1 claim-held-by-other refuse ephemeral", () => {
  it("flashes Held for claimHeldByOther (happy)", () => {
    expect(claimHeldByOtherRefuseCueText()).toBe(CLAIM_HELD_BY_OTHER_REFUSE_CUE);
    expect(claimHeldByOtherRefuseCueText()).toBe("Held");
    expect(
      shouldFlashClaimHeldByOtherRefuseCue(ACTION_ERROR.claimHeldByOther),
    ).toBe(true);
    expect(isSoftRefuseError(ACTION_ERROR.claimHeldByOther)).toBe(true);
    expect(isCoreSuccessCueText("Held")).toBe(true);
    expect(ACTION_ERROR.claimHeldByOther.toLowerCase()).toMatch(/hold|held/);
  });

  it("stays quiet for unrelated claim guild refuse (edge)", () => {
    expect(
      shouldFlashClaimHeldByOtherRefuseCue(ACTION_ERROR.claimNeedGuild),
    ).toBe(false);
    expect(claimHeldByOtherRefuseCueText()).not.toBe(CLAIM_NEED_GUILD_REFUSE_CUE);
    expect(
      shouldFlashClaimNeedGuildRefuseCue(ACTION_ERROR.claimHeldByOther),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent claim rules (failure)", () => {
    expect(shouldFlashClaimHeldByOtherRefuseCue(null)).toBe(false);
    expect(shouldFlashClaimHeldByOtherRefuseCue(undefined)).toBe(false);
    expect(shouldFlashClaimHeldByOtherRefuseCue("")).toBe(false);
    expect(
      shouldFlashClaimHeldByOtherRefuseCue(ACTION_ERROR.claimNothingStored),
    ).toBe(false);
    expect(claimHeldByOtherRefuseCueText()).not.toMatch(/\d/);
    expect(claimHeldByOtherRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.claimHeldByOther.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.claimHeldByOther)).toBe(false);
    expect(claimHeldByOtherRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
