import { describe, expect, it } from "vitest";
import {
  NEARBY_PEER_EXIT_FADE,
  NEARBY_PEER_PING,
  PRESENCE_PEER_SILHOUETTE,
  peerRangeExitFadeEnvelope,
  peerRangeExitFadeOpacity,
  shouldStartPeerRangeExitFade,
} from "../../packages/shared/src/catalog";
import {
  remotePresenceKitMaterials,
  worldObjectSurfacesDiffer,
} from "../../packages/shared/src/world-object-materials";

describe("world object materials VA5.1", () => {
  it("ping ring reads smoother than always-on halo (happy)", () => {
    const kit = remotePresenceKitMaterials();
    expect(kit.ping.roughness).toBeLessThan(kit.halo.roughness);
    expect(kit.lip.metalness).toBeGreaterThan(kit.halo.metalness);
    expect(kit.lipColor).toMatch(/^#/);
    expect(worldObjectSurfacesDiffer(kit.halo, kit.ping)).toBe(true);
  });

  it("lip articulates without flattening halo or ping (edge)", () => {
    const kit = remotePresenceKitMaterials();
    expect(worldObjectSurfacesDiffer(kit.halo, kit.lip)).toBe(true);
    expect(worldObjectSurfacesDiffer(kit.ping, kit.lip)).toBe(true);
    expect(kit.lipColor).not.toBe(PRESENCE_PEER_SILHOUETTE.color);
    expect(kit.lipColor).not.toBe(NEARBY_PEER_PING.color);
    expect(shouldStartPeerRangeExitFade(true, false)).toBe(true);
    expect(peerRangeExitFadeEnvelope(0)).toBe(1);
    expect(peerRangeExitFadeOpacity(1)).toBe(NEARBY_PEER_PING.opacity);
  });

  it("presence cue RGB / geometry / exit fade stay intact (failure)", () => {
    const kit = remotePresenceKitMaterials();
    expect(PRESENCE_PEER_SILHOUETTE.color).toBe("#5a8a9a");
    expect(PRESENCE_PEER_SILHOUETTE.opacity).toBe(0.48);
    expect(PRESENCE_PEER_SILHOUETTE.haloOuter).toBeGreaterThan(
      PRESENCE_PEER_SILHOUETTE.haloInner,
    );
    expect(NEARBY_PEER_PING.color).toBe("#6a8e78");
    expect(NEARBY_PEER_PING.opacity).toBe(0.72);
    expect(NEARBY_PEER_PING.ringOuter).toBeGreaterThan(NEARBY_PEER_PING.ringInner);
    expect(NEARBY_PEER_EXIT_FADE.durationMs).toBe(420);
    expect(shouldStartPeerRangeExitFade(false, true)).toBe(false);
    // Kit never overrides catalog cue RGB — lip accent only.
    expect(kit.lipColor).not.toBe(PRESENCE_PEER_SILHOUETTE.nameBorder);
    expect(kit.halo.roughness).toBeGreaterThan(0.5);
  });
});
