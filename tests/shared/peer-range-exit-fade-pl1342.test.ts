import { describe, expect, it } from "vitest";
import {
  NEARBY_PEER_EXIT_FADE,
  NEARBY_PEER_PING,
  PRESENCE_PEER_SILHOUETTE,
  WORLD,
  inWorldInteractRange,
  peerRangeExitFadeEmissiveIntensity,
  peerRangeExitFadeEnvelope,
  peerRangeExitFadeOpacity,
  peersInInteractRange,
  shouldStartPeerRangeExitFade,
} from "@game/shared";

/**
 * PL134.2 — Peer range-exit soft fade.
 * Choice: brief ease-out on the existing ping ring when leaving interact range
 * (not a second HUD list) so exit reads softly beside enter ping PL15.2 +
 * silhouette PL40.3; presence rules unchanged; zero peers stay quiet.
 */
describe("CityLands PL134.2 peer range-exit soft fade", () => {
  it("starts fade on in-range → out-of-range and decays soft (happy)", () => {
    expect(shouldStartPeerRangeExitFade(true, false)).toBe(true);
    expect(NEARBY_PEER_EXIT_FADE.durationMs).toBeGreaterThan(0);

    expect(peerRangeExitFadeEnvelope(0)).toBeCloseTo(1, 5);
    expect(peerRangeExitFadeOpacity(1)).toBeCloseTo(NEARBY_PEER_PING.opacity, 5);
    expect(peerRangeExitFadeEmissiveIntensity(1)).toBeCloseTo(
      NEARBY_PEER_PING.emissiveIntensity,
      5,
    );

    const mid = peerRangeExitFadeEnvelope(
      NEARBY_PEER_EXIT_FADE.durationMs * 0.5,
    );
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
  });

  it("stays quiet on enter / stay / idle; reuses ping palette (edge)", () => {
    expect(shouldStartPeerRangeExitFade(false, true)).toBe(false);
    expect(shouldStartPeerRangeExitFade(true, true)).toBe(false);
    expect(shouldStartPeerRangeExitFade(false, false)).toBe(false);

    expect(
      peerRangeExitFadeEnvelope(NEARBY_PEER_EXIT_FADE.durationMs),
    ).toBe(0);
    expect(NEARBY_PEER_EXIT_FADE.durationMs).toBeLessThan(2000);

    // Exit fade borrows enter-ping colors — not silhouette teal invent.
    expect(NEARBY_PEER_PING.color).toMatch(/^#/);
    expect(NEARBY_PEER_PING.color.toLowerCase()).not.toBe(
      PRESENCE_PEER_SILHOUETTE.color.toLowerCase(),
    );

    const edge = WORLD.INTERACT_RANGE;
    expect(inWorldInteractRange(0, 0, edge, 0)).toBe(true);
    expect(inWorldInteractRange(0, 0, edge + 0.01, 0)).toBe(false);
  });

  it("keeps presence rules; clamps envelope; zero peers quiet (failure)", () => {
    expect(peersInInteractRange(0, 0, [])).toEqual([]);
    expect(peerRangeExitFadeEnvelope(-1)).toBe(0);
    expect(peerRangeExitFadeEnvelope(Number.NaN)).toBe(0);
    expect(peerRangeExitFadeOpacity(2)).toBeCloseTo(NEARBY_PEER_PING.opacity, 5);
    expect(peerRangeExitFadeEmissiveIntensity(-1)).toBe(0);
    expect(shouldStartPeerRangeExitFade(true, false)).not.toBe(
      shouldStartPeerRangeExitFade(false, true),
    );
  });
});
