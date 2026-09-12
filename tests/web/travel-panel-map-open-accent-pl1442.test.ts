import { describe, expect, it } from "vitest";
import {
  CANONICAL_LAND_KINDS,
  LAND_DESTINATIONS,
  mapIdentityForLandKind,
} from "@game/shared";
import { WORKSPACE_PANEL_OPEN_ACCENT_MS } from "../../apps/web/lib/hud/workspace-panel-open-accent";
import { formatCurrentMapChip } from "../../apps/web/lib/hud/topbar-chrome";
import {
  TRAVEL_PANEL_MAP_OPEN_ACCENT,
  shouldPlayTravelMapOpenAccent,
  travelDestinationMapTintAccent,
  travelPanelMapOpenAccentClassName,
  travelPanelMapOpenAccentStyle,
} from "../../apps/web/lib/hud/travel-destination-map-tint";

/**
 * PL144.2 — Travel panel open soft map accent.
 * Quiet open chrome keyed to current-map chip accents (kinship with
 * destination map-tints PL133.2; complements Travel open PL24.3).
 * Destinations / fares unchanged; mute ok; min HUD.
 * Choice: map-chip border/header flash (not workspace green) so open
 * reads as circuit identity beside continuous destination row tints.
 */
describe("CityLands PL144.2 travel panel open soft map accent", () => {
  it("plays map open accent on Travel open with current-map chip (happy)", () => {
    expect(shouldPlayTravelMapOpenAccent(null, "travel")).toBe(true);
    expect(shouldPlayTravelMapOpenAccent("inventory", "travel")).toBe(true);
    expect(travelPanelMapOpenAccentClassName(true)).toBe(
      TRAVEL_PANEL_MAP_OPEN_ACCENT.className,
    );
    expect(WORKSPACE_PANEL_OPEN_ACCENT_MS).toBeGreaterThanOrEqual(300);
    expect(WORKSPACE_PANEL_OPEN_ACCENT_MS).toBeLessThanOrEqual(800);

    for (const kind of CANONICAL_LAND_KINDS) {
      const style = travelPanelMapOpenAccentStyle(kind);
      const accent = travelDestinationMapTintAccent(kind);
      expect(style[TRAVEL_PANEL_MAP_OPEN_ACCENT.cssVar]).toBe(accent);
      expect(accent).toBe(mapIdentityForLandKind(kind).accent);
      expect(accent).toBe(formatCurrentMapChip(kind).accent);
    }
  });

  it("skips when already open / closing; idle class empty (edge)", () => {
    expect(shouldPlayTravelMapOpenAccent("travel", "travel")).toBe(false);
    expect(shouldPlayTravelMapOpenAccent("travel", null)).toBe(false);
    expect(travelPanelMapOpenAccentClassName(false)).toBe("");
    expect(LAND_DESTINATIONS.length).toBe(4);
    const accents = CANONICAL_LAND_KINDS.map((k) =>
      travelDestinationMapTintAccent(k),
    );
    expect(new Set(accents).size).toBe(CANONICAL_LAND_KINDS.length);
  });

  it("refuses unrelated panels / fare invent (failure)", () => {
    expect(shouldPlayTravelMapOpenAccent(null, "build")).toBe(false);
    expect(shouldPlayTravelMapOpenAccent(null, "guild")).toBe(false);
    expect(shouldPlayTravelMapOpenAccent("travel", "inventory")).toBe(false);
    expect(String(TRAVEL_PANEL_MAP_OPEN_ACCENT.className)).not.toMatch(
      /nft|combat|fare/i,
    );
    expect(travelDestinationMapTintAccent("city")).not.toMatch(/fare|coin/i);
    // Warrior / Arena still maps to the same chip accent family.
    expect(travelPanelMapOpenAccentStyle("warrior")[
      TRAVEL_PANEL_MAP_OPEN_ACCENT.cssVar
    ]).toBe(formatCurrentMapChip("warrior").accent);
  });
});
