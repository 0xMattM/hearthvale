import { describe, expect, it } from "vitest";
import {
  LAND_DESTINATIONS,
  TRAVEL,
  TRAVEL_YOU_ARE_HERE,
  formatFreeTravelCircuit,
  freeTravelCaravanDisclaimer,
  freeTravelPanelIntro,
  isTravelDestinationHere,
  travelDestinationActionLabel,
} from "@game/shared";

/**
 * PL5.2 — TravelPanel “you are here” polish.
 * Stronger here-state + one-line blurbs; free/instant; four destinations.
 */
describe("CityLands PL5.2 TravelPanel you-are-here polish", () => {
  it("marks current map Here and keeps four free destinations (happy)", () => {
    expect(LAND_DESTINATIONS).toHaveLength(4);
    expect(LAND_DESTINATIONS.map((d) => d.kind)).toEqual([
      "city",
      "player_land",
      "explore",
      "warrior",
    ]);

    for (const dest of LAND_DESTINATIONS) {
      expect(isTravelDestinationHere(dest.kind, dest.kind)).toBe(true);
      expect(travelDestinationActionLabel(dest.name, true)).toBe(
        `${dest.name} · ${TRAVEL_YOU_ARE_HERE}`,
      );
      expect(travelDestinationActionLabel(dest.name, false)).toBe(dest.name);
      expect(travelDestinationActionLabel(dest.name, false)).not.toMatch(
        /free|instant|caravan|fare/i,
      );
      // One-line blurb: no newlines; keep readable but not multi-paragraph.
      expect(dest.blurb.includes("\n")).toBe(false);
      expect(dest.blurb.length).toBeGreaterThan(12);
      expect(dest.blurb.length).toBeLessThan(120);
      expect(dest.blurb.toLowerCase()).not.toMatch(/caravan|fare|45s|road time/);
    }

    expect(isTravelDestinationHere("city", "player_land")).toBe(false);
    expect(isTravelDestinationHere("explore", "forest")).toBe(true);
    expect(isTravelDestinationHere("player_land", "starter")).toBe(true);
  });

  it("keeps panel intro fare-free/instant; circuit names all maps (edge)", () => {
    const intro = freeTravelPanelIntro();
    const circuit = formatFreeTravelCircuit();
    expect(intro.toLowerCase()).toContain("instant");
    expect(intro).toContain(circuit);
    expect(intro.toLowerCase()).not.toMatch(/caravan|fare|15\s*coins/);
    expect(TRAVEL_YOU_ARE_HERE).toBe("Here");
    expect(freeTravelCaravanDisclaimer().toLowerCase()).toContain("free");
    expect(freeTravelCaravanDisclaimer().toLowerCase()).toContain("instant");
    // Legacy constants stay inert for map UX.
    expect(intro).not.toContain(String(TRAVEL.coinCost));
    expect(intro).not.toContain(String(TRAVEL.durationMs / 1000));
  });

  it("rejects here-state without a current map (failure)", () => {
    expect(isTravelDestinationHere("city", null)).toBe(false);
    expect(isTravelDestinationHere("city", undefined)).toBe(false);
    expect(isTravelDestinationHere("city", "")).toBe(false);
    expect(isTravelDestinationHere("city", "unknown_land")).toBe(false);
    expect(travelDestinationActionLabel("City", false)).not.toContain(
      TRAVEL_YOU_ARE_HERE,
    );
  });
});
