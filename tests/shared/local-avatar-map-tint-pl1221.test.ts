import { describe, expect, it } from "vitest";
import {
  CANONICAL_LAND_KINDS,
  LOCAL_AVATAR_MAP_TINT,
  MAP_IDENTITY,
  cssHexRgbDistance,
  localAvatarMapTintContrastMin,
  localAvatarMapTintForLandKind,
  mapIdentityForLandKind,
  mixCssHex,
  portalMeshTintForLandKind,
} from "@game/shared";
import {
  AVATAR_PALETTES,
  resolveAvatarKitColors,
} from "../../apps/web/lib/avatar-art";

/**
 * PL122.1 — Local avatar map-tint micro.
 * Choice: vest leans toward map portal veil + hat-band toward chip accent
 * (complements portal tint PL14.2 + chip PL14.1); remotes stay untinted;
 * movement unchanged.
 */
describe("CityLands PL122.1 local avatar map-tint micro", () => {
  it("tints local cloak/kit by map identity (happy)", () => {
    expect(localAvatarMapTintContrastMin()).toBeGreaterThan(25);
    expect(LOCAL_AVATAR_MAP_TINT.vestMix).toBeGreaterThan(0);
    expect(LOCAL_AVATAR_MAP_TINT.hatBandMix).toBeGreaterThan(0);
    expect(LOCAL_AVATAR_MAP_TINT.vestEmissiveIntensity).toBeGreaterThan(0);

    for (const kind of CANONICAL_LAND_KINDS) {
      const tint = localAvatarMapTintForLandKind(kind);
      const id = MAP_IDENTITY[kind];
      expect(tint.vest).toBe(
        mixCssHex(
          LOCAL_AVATAR_MAP_TINT.baseVest,
          id.portalVeil,
          LOCAL_AVATAR_MAP_TINT.vestMix,
        ),
      );
      expect(tint.hatBand).toBe(
        mixCssHex(
          LOCAL_AVATAR_MAP_TINT.baseHatBand,
          id.accent,
          LOCAL_AVATAR_MAP_TINT.hatBandMix,
        ),
      );
      expect(tint.vestEmissive.toLowerCase()).toBe(
        id.portalEmissive.toLowerCase(),
      );
      expect(tint.vest).not.toBe(LOCAL_AVATAR_MAP_TINT.baseVest);
      expect(tint.hatBand).not.toBe(LOCAL_AVATAR_MAP_TINT.baseHatBand);

      const kit = resolveAvatarKitColors("local", kind);
      expect(kit.vest).toBe(tint.vest);
      expect(kit.hatBand).toBe(tint.hatBand);
      expect(kit.vestEmissiveIntensity).toBe(tint.vestEmissiveIntensity);
      // Shirt / boots stay farmer kit — cloak/kit only.
      expect(kit.shirt).toBe(AVATAR_PALETTES.local.shirt);
      expect(kit.boots).toBe(AVATAR_PALETTES.local.boots);
    }

    expect(localAvatarMapTintForLandKind("city").vest).not.toBe(
      localAvatarMapTintForLandKind("warrior").vest,
    );
    expect(localAvatarMapTintForLandKind("player_land").vest).not.toBe(
      localAvatarMapTintForLandKind("explore").vest,
    );
  });

  it("keeps remotes untinted; aliases match chip/portal (edge)", () => {
    const remote = resolveAvatarKitColors("remote", "city");
    expect(remote.vest).toBe(AVATAR_PALETTES.remote.vest);
    expect(remote.hatBand).toBe(AVATAR_PALETTES.remote.hatBand);
    expect(remote.vestEmissiveIntensity).toBe(0);

    expect(localAvatarMapTintForLandKind("starter").vest).toBe(
      localAvatarMapTintForLandKind("player_land").vest,
    );
    expect(localAvatarMapTintForLandKind("forest").vest).toBe(
      localAvatarMapTintForLandKind("explore").vest,
    );
    expect(mapIdentityForLandKind("city").word).toBe("City");
    expect(portalMeshTintForLandKind("city").portalVeil).toBe(
      MAP_IDENTITY.city.portalVeil,
    );
  });

  it("clamps mix; unknown falls back to Land (failure)", () => {
    expect(mixCssHex("#000000", "#ffffff", 2)).toBe("#ffffff");
    expect(mixCssHex("#000000", "#ffffff", -1)).toBe("#000000");
    expect(mixCssHex("#000000", "#ffffff", Number.NaN)).toBe("#000000");
    expect(mixCssHex("nope", "#ffffff", 0.5)).toBe("nope");

    const fallback = localAvatarMapTintForLandKind("nope");
    expect(fallback.vest).toBe(localAvatarMapTintForLandKind(null).vest);
    expect(fallback.vest).toBe(
      localAvatarMapTintForLandKind("player_land").vest,
    );
    expect(localAvatarMapTintContrastMin()).not.toBe(0);
    expect(
      cssHexRgbDistance(
        localAvatarMapTintForLandKind("city").vest,
        localAvatarMapTintForLandKind("warrior").vest,
      ),
    ).toBeGreaterThan(25);
  });
});
