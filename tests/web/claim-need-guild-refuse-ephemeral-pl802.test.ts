import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { isSoftRefuseError } from "../../apps/web/lib/game-audio";
import {
  CLAIM_NEED_GUILD_REFUSE_CUE,
  VENDOR_WONT_BUY_REFUSE_CUE,
  claimNeedGuildRefuseCueText,
  isCoreSuccessCueText,
  shouldFlashClaimNeedGuildRefuseCue,
  shouldFlashVendorWontBuyRefuseCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL80.2 — Claim-need-guild refuse ephemeral.
 * Soft refuse SFX + brief TopBar `Guild` instead of sticky long claim prose.
 * Claim rules unchanged; mute ok.
 */
describe("CityLands PL80.2 claim-need-guild refuse ephemeral", () => {
  it("flashes Guild for claimNeedGuild (happy)", () => {
    expect(claimNeedGuildRefuseCueText()).toBe(CLAIM_NEED_GUILD_REFUSE_CUE);
    expect(claimNeedGuildRefuseCueText()).toBe("Guild");
    expect(shouldFlashClaimNeedGuildRefuseCue(ACTION_ERROR.claimNeedGuild)).toBe(
      true,
    );
    expect(isSoftRefuseError(ACTION_ERROR.claimNeedGuild)).toBe(true);
    expect(isCoreSuccessCueText("Guild")).toBe(true);
    expect(ACTION_ERROR.claimNeedGuild.toLowerCase()).toMatch(/guild/);
  });

  it("stays quiet for unrelated vendor refuses (edge)", () => {
    expect(
      shouldFlashClaimNeedGuildRefuseCue(ACTION_ERROR.vendorWontBuy),
    ).toBe(false);
    expect(claimNeedGuildRefuseCueText()).not.toBe(VENDOR_WONT_BUY_REFUSE_CUE);
    expect(
      shouldFlashVendorWontBuyRefuseCue(ACTION_ERROR.claimNeedGuild),
    ).toBe(false);
  });

  it("refuses unrelated errors and does not invent claim rules (failure)", () => {
    expect(shouldFlashClaimNeedGuildRefuseCue(null)).toBe(false);
    expect(shouldFlashClaimNeedGuildRefuseCue(undefined)).toBe(false);
    expect(shouldFlashClaimNeedGuildRefuseCue("")).toBe(false);
    expect(
      shouldFlashClaimNeedGuildRefuseCue(ACTION_ERROR.claimNodeMissing),
    ).toBe(false);
    expect(claimNeedGuildRefuseCueText()).not.toMatch(/\d/);
    expect(claimNeedGuildRefuseCueText().length).toBeLessThan(
      ACTION_ERROR.claimNeedGuild.length,
    );
    expect(isCoreSuccessCueText(ACTION_ERROR.claimNeedGuild)).toBe(false);
    expect(claimNeedGuildRefuseCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|energy/,
    );
  });
});
