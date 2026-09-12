import { describe, expect, it } from "vitest";
import {
  SOFT_WAR_DELIVER_WORLD_REINFORCE,
  softWarDeliverWorldReinforceBackground,
  shouldFlashSoftWarDeliverWorldReinforce,
} from "../../apps/web/lib/hud/soft-war-deliver-feedback";
import {
  ARENA_ENTER_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/arena-enter-feedback";
import {
  GUILD_BANK_DEPOSIT_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/guild-bank-deposit-feedback";
import {
  GUILD_DELIVER_SUCCESS_CUE_PREFIX,
  guildDeliverSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";
import {
  CLAIM_NODE_CONTEST_SOFT_CUE,
  CLAIM_WAR,
} from "@game/shared";

/**
 * PL146.2 — Soft-war deliver soft world reinforce.
 * Brief soft rim when wood deliver scores during an open contest
 * (complements Delivered · N PL31.2 + contest pulse PL146.1).
 * Deliver rules unchanged; mute ok; fail silent.
 * Choice: one-shot warm-ember rim (not another Delivered toast) so scoring
 * stays world-readable beside the existing ephemeral.
 */
describe("CityLands PL146.2 soft-war deliver soft world reinforce", () => {
  it("flashes warm ember rim when deliver scores (happy)", () => {
    expect(shouldFlashSoftWarDeliverWorldReinforce(true, 3)).toBe(true);
    expect(SOFT_WAR_DELIVER_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(SOFT_WAR_DELIVER_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = softWarDeliverWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(SOFT_WAR_DELIVER_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Delivered · N ephemeral.
    expect(guildDeliverSuccessCueText(3)).toBe(
      `${GUILD_DELIVER_SUCCESS_CUE_PREFIX}3`,
    );
    expect(guildDeliverSuccessCueText(3)).toBe("Delivered · 3");
  });

  it("stays quiet on fail / zero; rim ≠ arena / bank (edge)", () => {
    expect(shouldFlashSoftWarDeliverWorldReinforce(false, 3)).toBe(false);
    expect(shouldFlashSoftWarDeliverWorldReinforce(true, 0)).toBe(false);
    expect(shouldFlashSoftWarDeliverWorldReinforce(true, null)).toBe(false);
    expect(shouldFlashSoftWarDeliverWorldReinforce(true, undefined)).toBe(
      false,
    );

    expect(SOFT_WAR_DELIVER_WORLD_REINFORCE.outerRgba).not.toBe(
      ARENA_ENTER_WORLD_REINFORCE.outerRgba,
    );
    expect(SOFT_WAR_DELIVER_WORLD_REINFORCE.outerRgba).not.toBe(
      GUILD_BANK_DEPOSIT_WORLD_REINFORCE.outerRgba,
    );
    expect(SOFT_WAR_DELIVER_WORLD_REINFORCE.clearPct).toBeLessThan(
      SOFT_WAR_DELIVER_WORLD_REINFORCE.midPct,
    );
    expect(SOFT_WAR_DELIVER_WORLD_REINFORCE.durationMs).toBeLessThan(2000);

    // Kinship with contest beacon pulse (same warm family).
    expect(CLAIM_NODE_CONTEST_SOFT_CUE.emissive).toMatch(/^#c4/i);
  });

  it("does not invent scoring / wars; keeps ok+qty gate (failure)", () => {
    expect(softWarDeliverWorldReinforceBackground()).not.toMatch(
      /scoring|always.?on|nft/i,
    );
    expect(String(SOFT_WAR_DELIVER_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|fare/i,
    );
    expect(SOFT_WAR_DELIVER_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashSoftWarDeliverWorldReinforce(true, 1)).not.toBe(
      shouldFlashSoftWarDeliverWorldReinforce(false, 1),
    );
    expect(CLAIM_WAR.windowMs).toBe(3 * 60_000);
    expect(CLAIM_WAR.deliverItemId).toBe("wood");
  });
});
