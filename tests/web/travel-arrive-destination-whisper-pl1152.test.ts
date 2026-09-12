import { describe, expect, it } from "vitest";
import {
  LAND_DESTINATIONS,
  MAP_IDENTITY,
  shouldFlashTravelArriveCue,
  travelArriveDestinationLabel,
} from "@game/shared";
import {
  SUCCESS_CUE_MS,
  coreSuccessCueText,
  isCoreSuccessCueText,
  shouldFlashTravelArriveSuccessCue,
  travelArriveSuccessCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL115.2 — Travel-arrive destination whisper.
 * Arrived · map cue stays one-shot; dest label matches TravelPanel free-travel names.
 * Choice: LAND_DESTINATIONS.name SoT over map-chip short words (Land/Explore/Arena).
 */
describe("CityLands PL115.2 travel-arrive destination whisper", () => {
  it("whispers Arrived · TravelPanel names for every free-travel dest (happy)", () => {
    for (const dest of LAND_DESTINATIONS) {
      expect(travelArriveDestinationLabel(dest.kind)).toBe(dest.name);
      expect(travelArriveSuccessCueText(dest.kind)).toBe(
        `Arrived · ${dest.name}`,
      );
      expect(travelArriveSuccessCueText(dest.kind)).toBe(
        coreSuccessCueText("travel", dest.name),
      );
      expect(isCoreSuccessCueText(travelArriveSuccessCueText(dest.kind))).toBe(
        true,
      );
    }
    expect(shouldFlashTravelArriveSuccessCue(true)).toBe(true);
    expect(shouldFlashTravelArriveCue(true)).toBe(true);
    expect(SUCCESS_CUE_MS).toBeLessThanOrEqual(2500);
  });

  it("keeps one-shot gate quiet on refuse and prefers panel names over chip words (edge)", () => {
    expect(shouldFlashTravelArriveSuccessCue(false)).toBe(false);
    expect(shouldFlashTravelArriveCue(false)).toBe(false);
    expect(travelArriveDestinationLabel("player_land")).toBe("Your Land");
    expect(travelArriveDestinationLabel("player_land")).not.toBe(
      MAP_IDENTITY.player_land.word,
    );
    expect(travelArriveDestinationLabel("explore")).toBe("Exploration");
    expect(travelArriveDestinationLabel("explore")).not.toBe(
      MAP_IDENTITY.explore.word,
    );
    expect(travelArriveDestinationLabel("warrior")).toBe("Warrior Arena");
    expect(travelArriveDestinationLabel("warrior")).not.toBe(
      MAP_IDENTITY.warrior.word,
    );
    expect(travelArriveSuccessCueText(null)).toBe("Arrived");
    expect(travelArriveSuccessCueText(undefined)).toBe("Arrived");
  });

  it("rejects unknown kinds and does not invent caravan fare copy (failure)", () => {
    expect(travelArriveDestinationLabel("")).toBeNull();
    expect(travelArriveDestinationLabel("not_a_map")).toBeNull();
    expect(travelArriveSuccessCueText("not_a_map")).toBe("Arrived");
    const cityCue = travelArriveSuccessCueText("city");
    expect(cityCue.includes("fare")).toBe(false);
    expect(cityCue.includes("coin")).toBe(false);
    expect(cityCue.includes("caravan")).toBe(false);
    expect(cityCue).toBe("Arrived · City");
    expect(shouldFlashTravelArriveSuccessCue(Boolean(null))).toBe(false);
  });
});
