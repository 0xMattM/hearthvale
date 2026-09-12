import { describe, expect, it } from "vitest";
import {
  NEARBY_PEER_PING,
  PRESENCE_PEER_SILHOUETTE,
} from "../../packages/shared/src";
import {
  TUTOR_CLAIMABLE_WORLD_CUE,
  tutorialNpcCloakColor,
} from "../../packages/shared/src/tutorial-npcs";
import { AVATAR_PALETTES } from "../../apps/web/lib/avatar-art";

/**
 * PL40.3 — Presence peer soft silhouette (quiet halo; presence rules unchanged).
 */
describe("CityLands PL40.3 presence peer soft silhouette", () => {
  it("defines a cooler always-on peer halo distinct from interact ping (happy)", () => {
    expect(PRESENCE_PEER_SILHOUETTE.haloOuter).toBeGreaterThan(
      PRESENCE_PEER_SILHOUETTE.haloInner,
    );
    expect(PRESENCE_PEER_SILHOUETTE.haloOuter).toBeLessThan(
      NEARBY_PEER_PING.ringInner,
    );
    expect(PRESENCE_PEER_SILHOUETTE.opacity).toBeGreaterThan(0);
    expect(PRESENCE_PEER_SILHOUETTE.opacity).toBeLessThan(
      NEARBY_PEER_PING.opacity,
    );
    expect(PRESENCE_PEER_SILHOUETTE.color).toMatch(/^#/);
    expect(PRESENCE_PEER_SILHOUETTE.color).not.toBe(NEARBY_PEER_PING.color);
    expect(AVATAR_PALETTES.remote.shirt).toMatch(/^#/);
  });

  it("reads apart from warm tutor cloak / claimable pad hues (edge)", () => {
    const farmerCloak = tutorialNpcCloakColor("farmer");
    expect(PRESENCE_PEER_SILHOUETTE.color.toLowerCase()).not.toBe(
      farmerCloak.toLowerCase(),
    );
    expect(PRESENCE_PEER_SILHOUETTE.color.toLowerCase()).not.toBe(
      TUTOR_CLAIMABLE_WORLD_CUE.padColor.toLowerCase(),
    );
    expect(PRESENCE_PEER_SILHOUETTE.color.toLowerCase()).not.toBe(
      TUTOR_CLAIMABLE_WORLD_CUE.haloColor.toLowerCase(),
    );
    // Cool teal peer vs warm gold claimable tutor pad.
    expect(PRESENCE_PEER_SILHOUETTE.color).toBe("#5a8a9a");
    expect(TUTOR_CLAIMABLE_WORLD_CUE.padColor).toMatch(/^#c/i);
  });

  it("does not invent HUD columns or widen presence ping rules (failure)", () => {
    expect(PRESENCE_PEER_SILHOUETTE.emissiveIntensity).toBeLessThan(
      NEARBY_PEER_PING.emissiveIntensity,
    );
    expect(NEARBY_PEER_PING.ringOuter).toBeGreaterThan(
      PRESENCE_PEER_SILHOUETTE.haloOuter,
    );
    // Silhouette is always-on under peers — must stay quieter than near ping.
    expect(
      PRESENCE_PEER_SILHOUETTE.opacity * PRESENCE_PEER_SILHOUETTE.emissiveIntensity,
    ).toBeLessThan(NEARBY_PEER_PING.opacity * NEARBY_PEER_PING.emissiveIntensity);
  });
});
