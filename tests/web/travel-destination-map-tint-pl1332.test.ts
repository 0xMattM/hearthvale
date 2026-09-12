import { describe, expect, it } from "vitest";
import {
  CANONICAL_LAND_KINDS,
  LAND_DESTINATIONS,
  mapIdentityForLandKind,
} from "@game/shared";
import { formatCurrentMapChip } from "../../apps/web/lib/hud/topbar-chrome";
import {
  TRAVEL_DESTINATION_MAP_TINT,
  shouldShowTravelDestinationMapTint,
  travelDestinationMapTintAccent,
  travelDestinationMapTintClassName,
  travelDestinationMapTintStyle,
} from "../../apps/web/lib/hud/travel-destination-map-tint";

/**
 * PL133.2 — TravelPanel destination map-tint.
 * Quiet destination-row accents matching TopBar map-chip colors for
 * City/Land/Explore/Arena (complements chip PL14.1, arrive pulse PL40.2).
 * Fare-free destinations unchanged; Here state still readable.
 * Choice: continuous per-row map accent (not one-shot) so Travel stays
 * glanceably tied to the four-map chip palette while Here stays louder.
 */
describe("CityLands PL133.2 travel destination map-tint", () => {
  it("tints each destination with TopBar map-chip accent (happy)", () => {
    for (const dest of LAND_DESTINATIONS) {
      const accent = travelDestinationMapTintAccent(dest.kind);
      expect(accent).toBe(mapIdentityForLandKind(dest.kind).accent);
      expect(accent).toBe(formatCurrentMapChip(dest.kind).accent);
      expect(shouldShowTravelDestinationMapTint(dest.kind)).toBe(true);

      const idle = travelDestinationMapTintStyle(dest.kind, false);
      expect(idle.boxShadow).toContain(accent);
      expect(idle.border).toContain(accent);

      const here = travelDestinationMapTintStyle(dest.kind, true);
      expect(here.border).toMatch(/^2px solid/);
      expect(here.border).toContain(accent);
      expect(here.color).toBe(accent);
      expect(here.background).toContain(
        String(TRAVEL_DESTINATION_MAP_TINT.hereFillMixPct),
      );
    }

    expect(travelDestinationMapTintClassName(false)).toBe(
      TRAVEL_DESTINATION_MAP_TINT.rowClassName,
    );
    expect(travelDestinationMapTintClassName(true)).toContain(
      TRAVEL_DESTINATION_MAP_TINT.hereClassName,
    );
  });

  it("keeps Here louder than idle; four distinct accents (edge)", () => {
    const accents = CANONICAL_LAND_KINDS.map((k) =>
      travelDestinationMapTintAccent(k),
    );
    expect(new Set(accents).size).toBe(CANONICAL_LAND_KINDS.length);

    const cityIdle = travelDestinationMapTintStyle("city", false);
    const cityHere = travelDestinationMapTintStyle("city", true);
    expect(cityHere.border).not.toBe(cityIdle.border);
    expect(cityHere.background).not.toBe(cityIdle.background);
    expect(TRAVEL_DESTINATION_MAP_TINT.hereFillMixPct).toBeGreaterThan(
      TRAVEL_DESTINATION_MAP_TINT.idleFillMixPct,
    );
  });

  it("refuses fare invent / empty kind; destinations stay free (failure)", () => {
    expect(LAND_DESTINATIONS.length).toBe(4);
    expect(shouldShowTravelDestinationMapTint(null)).toBe(false);
    expect(shouldShowTravelDestinationMapTint("")).toBe(false);
    expect(travelDestinationMapTintAccent("city")).not.toMatch(/fare|coin/i);
    expect(String(TRAVEL_DESTINATION_MAP_TINT.rowClassName)).not.toMatch(
      /nft|combat/i,
    );
    // Warrior / Arena still maps to the same chip accent family.
    expect(travelDestinationMapTintAccent("warrior")).toBe(
      formatCurrentMapChip("warrior").accent,
    );
  });
});
