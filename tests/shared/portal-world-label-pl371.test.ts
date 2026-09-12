import { describe, expect, it } from "vitest";
import {
  CANONICAL_LAND_KINDS,
  MAP_IDENTITY,
  PORTAL_WORLD_SOFT,
  PORTAL_WORLD_SOFT_WARRIOR,
  freeTravelPortalPrompt,
  portalWorldLabelParts,
  TRAVEL,
} from "@game/shared";

/**
 * PL37.1 — Portal world Html names fare-free circuit role.
 * Choice: MAP_IDENTITY word + soft Travel/Exit · free; complements PL5.1 prompt + PL14.2 tint;
 * fare-free; no caravan timers.
 */
describe("CityLands PL37.1 portal world label destination", () => {
  it("names each map circuit role with fare-free soft line (happy)", () => {
    expect(portalWorldLabelParts("city")).toEqual({
      name: MAP_IDENTITY.city.word,
      soft: PORTAL_WORLD_SOFT,
    });
    expect(portalWorldLabelParts("player_land")).toEqual({
      name: MAP_IDENTITY.player_land.word,
      soft: PORTAL_WORLD_SOFT,
    });
    expect(portalWorldLabelParts("explore")).toEqual({
      name: MAP_IDENTITY.explore.word,
      soft: PORTAL_WORLD_SOFT,
    });
    expect(portalWorldLabelParts("warrior")).toEqual({
      name: MAP_IDENTITY.warrior.word,
      soft: PORTAL_WORLD_SOFT_WARRIOR,
    });
    for (const kind of CANONICAL_LAND_KINDS) {
      expect(portalWorldLabelParts(kind).soft.toLowerCase()).toMatch(/free/);
    }
  });

  it("keeps warrior Exit soft and unknown falls back to Land (edge)", () => {
    expect(portalWorldLabelParts("warrior").soft).toBe(PORTAL_WORLD_SOFT_WARRIOR);
    expect(portalWorldLabelParts("warrior").name).toBe("Arena");
    expect(portalWorldLabelParts(null).name).toBe(MAP_IDENTITY.player_land.word);
    expect(portalWorldLabelParts("nope").soft).toBe(PORTAL_WORLD_SOFT);
    expect(freeTravelPortalPrompt("city")).toMatch(/Travel · free/);
  });

  it("refuses inventing caravan fare on portal labels (failure)", () => {
    for (const kind of CANONICAL_LAND_KINDS) {
      const parts = portalWorldLabelParts(kind);
      expect(parts.soft.toLowerCase()).not.toMatch(/fare|caravan|coins/);
      expect(parts.name.length).toBeGreaterThan(0);
    }
    // Legacy TRAVEL fare stays unused by portal world label.
    expect(TRAVEL.coinCost).toBeGreaterThan(0);
    expect(PORTAL_WORLD_SOFT.toLowerCase()).not.toContain(String(TRAVEL.coinCost));
  });
});
