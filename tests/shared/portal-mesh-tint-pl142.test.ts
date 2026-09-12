import { describe, expect, it } from "vitest";
import {
  CANONICAL_LAND_KINDS,
  MAP_IDENTITY,
  cssHexRgbDistance,
  freeTravelPortalPrompt,
  portalMeshTintContrastMin,
  portalMeshTintForLandKind,
  warriorArenaExitLabel,
} from "@game/shared";

/**
 * PL14.2 — Portal mesh tint by destination / circuit role.
 * Distinct veil per map; fare-free prompts unchanged; warrior Exit-first.
 */
describe("CityLands PL14.2 portal mesh tint by destination", () => {
  it("gives each map a distinct portal veil / frame tint (happy)", () => {
    expect(portalMeshTintContrastMin()).toBeGreaterThan(40);

    const veils = CANONICAL_LAND_KINDS.map(
      (k) => portalMeshTintForLandKind(k).portalVeil.toLowerCase(),
    );
    expect(new Set(veils).size).toBe(4);

    expect(portalMeshTintForLandKind("city").portalVeil.toLowerCase()).toBe(
      MAP_IDENTITY.city.portalVeil.toLowerCase(),
    );
    expect(
      portalMeshTintForLandKind("player_land").portalVeil.toLowerCase(),
    ).toBe(MAP_IDENTITY.player_land.portalVeil.toLowerCase());
    expect(portalMeshTintForLandKind("explore").portalVeil.toLowerCase()).toBe(
      MAP_IDENTITY.explore.portalVeil.toLowerCase(),
    );
    expect(portalMeshTintForLandKind("warrior").portalVeil.toLowerCase()).toBe(
      MAP_IDENTITY.warrior.portalVeil.toLowerCase(),
    );

    // City stays cool cyan; land/explore greens; arena warm exit silhouette.
    expect(
      cssHexRgbDistance(
        MAP_IDENTITY.city.portalVeil,
        MAP_IDENTITY.warrior.portalVeil,
      ),
    ).toBeGreaterThan(60);
    expect(
      cssHexRgbDistance(
        MAP_IDENTITY.player_land.portalVeil,
        MAP_IDENTITY.explore.portalVeil,
      ),
    ).toBeGreaterThan(25);
  });

  it("keeps fare-free prompts and warrior Exit-first copy (edge)", () => {
    for (const kind of ["city", "player_land", "explore"] as const) {
      const prompt = freeTravelPortalPrompt(kind);
      expect(prompt).toMatch(/^Travel · free ·/);
      expect(prompt.toLowerCase()).not.toMatch(/fare|caravan|coins/);
    }
    const warriorPrompt = freeTravelPortalPrompt("warrior");
    expect(warriorPrompt).toMatch(/^Exit · Travel · free \(N\)/);
    expect(warriorArenaExitLabel().toLowerCase()).toMatch(/exit/);
    expect(warriorPrompt.toLowerCase()).not.toMatch(/fare|caravan/);
  });

  it("refuses collapsed tints and unknown-kind crash (failure)", () => {
    expect(portalMeshTintContrastMin()).not.toBe(0);
    expect(MAP_IDENTITY.city.portalVeil).not.toBe(
      MAP_IDENTITY.player_land.portalVeil,
    );
    expect(MAP_IDENTITY.city.portalVeil).not.toBe(
      MAP_IDENTITY.warrior.portalVeil,
    );
    const fallback = portalMeshTintForLandKind("nope");
    expect(fallback.portalVeil).toBe(MAP_IDENTITY.player_land.portalVeil);
    expect(portalMeshTintForLandKind(null).portalFrame).toBe(
      MAP_IDENTITY.player_land.portalFrame,
    );
  });
});
