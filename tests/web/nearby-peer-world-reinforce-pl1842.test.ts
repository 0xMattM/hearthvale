import { describe, expect, it } from "vitest";
import {
  NEARBY_PEER_WORLD_REINFORCE,
  nearbyPeerWorldReinforceBackground,
} from "../../apps/web/lib/hud/nearby-peer-feedback";
import {
  VISIT_ARRIVE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/visit-arrive-feedback";
import {
  TRAVEL_ARRIVE_WORLD_REINFORCE,
} from "../../apps/web/lib/hud/travel-arrive-feedback";
import {
  NEARBY_PEER_PING,
  PRESENCE_PEER_SILHOUETTE,
  shouldFlashNearbyPeerWorldReinforce,
  shouldStartPeerRangeExitFade,
} from "@game/shared";

/**
 * PL184.2 — Nearby-peer soft world reinforce leftover.
 * Brief soft rim when a peer first enters interact range (complements nearby
 * peer ping + silhouette; presence rules unchanged). Mute ok.
 * Choice: one-shot sage rim (not another floor ping / silhouette) so every
 * enter edge stays world-readable beside ping + always-on halo.
 * Not kinship — floor ping ≠ HUD shell rim.
 */
describe("CityLands PL184.2 nearby-peer soft world reinforce leftover", () => {
  it("flashes sage rim on first enter interact range (happy)", () => {
    expect(shouldFlashNearbyPeerWorldReinforce(false, true)).toBe(true);
    expect(NEARBY_PEER_WORLD_REINFORCE.durationMs).toBeGreaterThan(0);
    expect(NEARBY_PEER_WORLD_REINFORCE.opacityPeak).toBeGreaterThan(0);

    const bg = nearbyPeerWorldReinforceBackground();
    expect(bg).toMatch(/^radial-gradient/);
    expect(bg).toContain(NEARBY_PEER_WORLD_REINFORCE.outerRgba);
    expect(bg).toContain("transparent");

    // Complements — does not replace — floor ping + silhouette.
    expect(NEARBY_PEER_PING.color.toLowerCase()).toBe("#6a8e78");
    expect(PRESENCE_PEER_SILHOUETTE.color.toLowerCase()).toBe("#5a8a9a");
  });

  it("stays quiet on stay / exit / idle; rim ≠ visit teal / travel cyan (edge)", () => {
    expect(shouldFlashNearbyPeerWorldReinforce(true, true)).toBe(false);
    expect(shouldFlashNearbyPeerWorldReinforce(false, false)).toBe(false);
    expect(shouldFlashNearbyPeerWorldReinforce(true, false)).toBe(false);
    // Exit fade stays the opposite edge — not this rim.
    expect(shouldStartPeerRangeExitFade(true, false)).toBe(true);
    expect(shouldFlashNearbyPeerWorldReinforce(true, false)).toBe(false);

    expect(NEARBY_PEER_WORLD_REINFORCE.outerRgba).not.toBe(
      VISIT_ARRIVE_WORLD_REINFORCE.outerRgba,
    );
    expect(NEARBY_PEER_WORLD_REINFORCE.midRgba).not.toBe(
      TRAVEL_ARRIVE_WORLD_REINFORCE.midRgba,
    );
    expect(NEARBY_PEER_WORLD_REINFORCE.clearPct).toBeLessThan(
      NEARBY_PEER_WORLD_REINFORCE.midPct,
    );
    expect(NEARBY_PEER_WORLD_REINFORCE.durationMs).toBeLessThan(2000);
  });

  it("does not invent nearby lists / NFT combat; keeps enter-edge gate (failure)", () => {
    expect(nearbyPeerWorldReinforceBackground()).not.toMatch(
      /roster|leaderboard|nft|combat/i,
    );
    expect(String(NEARBY_PEER_WORLD_REINFORCE.durationMs)).not.toMatch(
      /coin|cost|timer/i,
    );
    expect(NEARBY_PEER_WORLD_REINFORCE.opacityPeak).toBeLessThanOrEqual(1);
    expect(shouldFlashNearbyPeerWorldReinforce(false, true)).not.toBe(
      shouldFlashNearbyPeerWorldReinforce(true, true),
    );
  });
});
