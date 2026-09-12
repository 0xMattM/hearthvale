import { describe, expect, it } from "vitest";

import {
  MUTE_WORLD_REINFORCE,
  muteWorldReinforceBackground,
  shouldFlashMuteWorldReinforce,
} from "../../apps/web/lib/hud/mute-world-reinforce-feedback";
import {
  shouldFlashMuteEnableConfirm,
} from "../../apps/web/lib/hud/mute-enable-confirm";
import {
  DAY_NIGHT_ENABLE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/day-night-enable-feedback";
import {
  WALLET_DISCONNECT_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/wallet-disconnect-feedback";
import {
  MUTE_OFF_SUCCESS_CUE,
  MUTE_ON_SUCCESS_CUE,
  muteToggleSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL180.1 — Mute soft world reinforce leftover.
 * Brief soft rim when mute toggles on/off from settings (complements
 * Muted/Unmuted ephemeral + mute enable confirm). Audio rules unchanged; mute ok.
 * Choice: one-shot hush graphite rim on both edges (not another Muted toast /
 * enable-only row flash) so every mute toggle stays world-readable.
 */
describe("CityLands PL180.1 mute soft world reinforce", () => {
  it("flashes quiet hush graphite rim on mute and unmute (happy)", () => {
    expect(shouldFlashMuteWorldReinforce(false, true)).toBe(true);
    expect(shouldFlashMuteWorldReinforce(true, false)).toBe(true);
    expect(MUTE_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(MUTE_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = muteWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(MUTE_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Muted / Unmuted ephemeral.
    expect(muteToggleSuccessCueText(true)).toBe(MUTE_ON_SUCCESS_CUE);
    expect(muteToggleSuccessCueText(false)).toBe(MUTE_OFF_SUCCESS_CUE);
  });

  it("stays quiet on no-op; both edges ≠ enable-only confirm; rim ≠ dawn / disconnect (edge)", () => {
    expect(shouldFlashMuteWorldReinforce(false, false)).toBe(false);
    expect(shouldFlashMuteWorldReinforce(true, true)).toBe(false);

    // Enable confirm is mute-on only; world rim covers both edges.
    expect(shouldFlashMuteEnableConfirm(false, true)).toBe(true);
    expect(shouldFlashMuteEnableConfirm(true, false)).toBe(false);
    expect(shouldFlashMuteWorldReinforce(true, false)).toBe(true);

    expect(MUTE_WORLD_REINFORCE.outerRgba).not.toBe(
      DAY_NIGHT_ENABLE_WORLD_REINFORCE.outerRgba,
    );
    expect(MUTE_WORLD_REINFORCE.midRgba).not.toBe(
      DAY_NIGHT_ENABLE_WORLD_REINFORCE.midRgba,
    );
    expect(MUTE_WORLD_REINFORCE.outerRgba).not.toBe(
      WALLET_DISCONNECT_WORLD_REINFORCE.outerRgba,
    );
    expect(MUTE_WORLD_REINFORCE.clearPct).toBeLessThan(MUTE_WORLD_REINFORCE.midPct);
    expect(MUTE_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent audio rules / NFT combat; keeps toggle gate (failure)", () => {
    expect(muteWorldReinforceBackground()).not.toMatch(
      /always.?on|nft|bypass.?mute/i,
    );
    expect(String(MUTE_WORLD_REINFORCE.durationMs)).not.toMatch(/combat|fare/i);
    expect(MUTE_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashMuteWorldReinforce(false, true)).not.toBe(
      shouldFlashMuteWorldReinforce(false, false),
    );
  });
});
