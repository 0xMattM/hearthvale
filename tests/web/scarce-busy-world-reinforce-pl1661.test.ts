import { describe, expect, it } from "vitest";
import {
  CITY_SCARCE_BUSY_PEER_PULSE,
  shouldPulseScarceBusyPeerEdge,
} from "@game/shared";
import {
  SCARCE_BUSY_WORLD_REINFORCE,
  scarceBusyWorldReinforceBackground,
  shouldFlashScarceBusyWorldReinforce,
} from "../../apps/web/lib/hud/scarce-busy-world-reinforce-feedback";
import {
  SCARCE_FREE_SETTLE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/scarce-free-settle-feedback";
import {
  TRAVEL_ARRIVE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/travel-arrive-feedback";

/**
 * PL166.1 — Scarce-busy soft world reinforce leftover.
 * Brief soft rim when city scarce station edges free→busy (complements
 * busy peer pulse PL115.1 + Free settle rim PL165.2; contention unchanged).
 * Mute ok. Choice: one-shot warm Busy coral rim (not another Free cyan /
 * travel Arrived) so every free→busy edge stays world-readable beside pad pulse.
 */
describe("CityLands PL166.1 scarce-busy soft world reinforce leftover", () => {
  it("flashes quiet Busy coral rim on free→busy (happy)", () => {
    expect(shouldFlashScarceBusyWorldReinforce(false, true)).toBe(true);
    expect(SCARCE_BUSY_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(SCARCE_BUSY_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = scarceBusyWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(SCARCE_BUSY_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Same gate as pad busy peer pulse — rim complements, does not replace.
    expect(shouldFlashScarceBusyWorldReinforce(false, true)).toBe(
      shouldPulseScarceBusyPeerEdge(false, true),
    );
    expect(CITY_SCARCE_BUSY_PEER_PULSE.durationMs).toBeGreaterThan(0);
  });

  it("stays quiet on busy→free / idle; rim ≠ Free settle / travel (edge)", () => {
    expect(shouldFlashScarceBusyWorldReinforce(true, false)).toBe(false);
    expect(shouldFlashScarceBusyWorldReinforce(false, false)).toBe(false);
    expect(shouldFlashScarceBusyWorldReinforce(true, true)).toBe(false);

    expect(SCARCE_BUSY_WORLD_REINFORCE.outerRgba).not.toBe(
      SCARCE_FREE_SETTLE_WORLD_REINFORCE.outerRgba,
    );
    expect(SCARCE_BUSY_WORLD_REINFORCE.midRgba).not.toBe(
      SCARCE_FREE_SETTLE_WORLD_REINFORCE.midRgba,
    );
    expect(SCARCE_BUSY_WORLD_REINFORCE.outerRgba).not.toBe(
      TRAVEL_ARRIVE_WORLD_REINFORCE.outerRgba,
    );
    expect(SCARCE_BUSY_WORLD_REINFORCE.clearPct).toBeLessThan(
      SCARCE_BUSY_WORLD_REINFORCE.midPct,
    );
    expect(SCARCE_BUSY_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent contention / NFT combat; keeps busy gate (failure)", () => {
    expect(shouldFlashScarceBusyWorldReinforce(false, true)).toBe(
      shouldPulseScarceBusyPeerEdge(false, true),
    );
    expect(scarceBusyWorldReinforceBackground()).not.toMatch(
      /nft|combat|fare/i,
    );
    expect(String(SCARCE_BUSY_WORLD_REINFORCE.durationMs)).not.toMatch(
      /combat|nft/i,
    );
    expect(SCARCE_BUSY_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashScarceBusyWorldReinforce(false, true)).not.toBe(
      shouldFlashScarceBusyWorldReinforce(true, false),
    );
  });
});
