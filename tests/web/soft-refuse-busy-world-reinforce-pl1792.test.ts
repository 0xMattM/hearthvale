import { describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";

import {
  SOFT_REFUSE_BUSY_WORLD_REINFORCE,
  softRefuseBusyWorldReinforceBackground,
  shouldFlashSoftRefuseBusyWorldReinforce,
} from "../../apps/web/lib/hud/soft-refuse-busy-world-reinforce-feedback";
import {
  SCARCE_BUSY_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/scarce-busy-world-reinforce-feedback";
import {
  SCARCE_FREE_SETTLE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/scarce-free-settle-feedback";
import {
  BUSY_STATION_REFUSE_CUE,
  busyStationRefuseCueText,
  shouldFlashBusyStationCue,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL179.2 — Soft-refuse busy soft world reinforce leftover.
 * Brief soft rim when scarce/busy interact soft-refuses (complements Busy
 * ephemeral + busy peer pulse; ≠ free→busy observational rim PL166.1).
 * Contention unchanged; mute ok.
 * Choice: one-shot dusty rose refuse rim (not another Busy toast / coral edge)
 * so every busy interact refuse stays world-readable beside ephemeral + pulse.
 */
describe("CityLands PL179.2 soft-refuse busy soft world reinforce", () => {
  it("flashes quiet dusty rose rim on stationBusy soft-refuse (happy)", () => {
    expect(
      shouldFlashSoftRefuseBusyWorldReinforce(ACTION_ERROR.stationBusy),
    ).toBe(true);
    expect(SOFT_REFUSE_BUSY_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(SOFT_REFUSE_BUSY_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = softRefuseBusyWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(SOFT_REFUSE_BUSY_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — Busy ephemeral; same gate.
    expect(busyStationRefuseCueText()).toBe(BUSY_STATION_REFUSE_CUE);
    expect(shouldFlashBusyStationCue(ACTION_ERROR.stationBusy)).toBe(true);
    expect(shouldFlashSoftRefuseBusyWorldReinforce(ACTION_ERROR.stationBusy)).toBe(
      shouldFlashBusyStationCue(ACTION_ERROR.stationBusy),
    );
  });

  it("stays quiet on other errors; rim ≠ Busy coral / Free cyan (edge)", () => {
    expect(
      shouldFlashSoftRefuseBusyWorldReinforce(ACTION_ERROR.notEnoughEnergy),
    ).toBe(false);
    expect(shouldFlashSoftRefuseBusyWorldReinforce(null)).toBe(false);
    expect(shouldFlashSoftRefuseBusyWorldReinforce(undefined)).toBe(false);
    expect(shouldFlashSoftRefuseBusyWorldReinforce("")).toBe(false);

    expect(SOFT_REFUSE_BUSY_WORLD_REINFORCE.outerRgba).not.toBe(
      SCARCE_BUSY_WORLD_REINFORCE.outerRgba,
    );
    expect(SOFT_REFUSE_BUSY_WORLD_REINFORCE.midRgba).not.toBe(
      SCARCE_BUSY_WORLD_REINFORCE.midRgba,
    );
    expect(SOFT_REFUSE_BUSY_WORLD_REINFORCE.outerRgba).not.toBe(
      SCARCE_FREE_SETTLE_WORLD_REINFORCE.outerRgba,
    );
    expect(SOFT_REFUSE_BUSY_WORLD_REINFORCE.clearPct).toBeLessThan(
      SOFT_REFUSE_BUSY_WORLD_REINFORCE.midPct,
    );
    expect(SOFT_REFUSE_BUSY_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent contention / NFT combat; keeps busy gate (failure)", () => {
    expect(softRefuseBusyWorldReinforceBackground()).not.toMatch(
      /always.?on|nft|fare/i,
    );
    expect(String(SOFT_REFUSE_BUSY_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|cap/i,
    );
    expect(SOFT_REFUSE_BUSY_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(
      shouldFlashSoftRefuseBusyWorldReinforce(ACTION_ERROR.stationBusy),
    ).not.toBe(
      shouldFlashSoftRefuseBusyWorldReinforce(ACTION_ERROR.notEnoughEnergy),
    );
  });
});
