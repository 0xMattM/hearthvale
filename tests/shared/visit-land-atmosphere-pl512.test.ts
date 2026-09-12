import { describe, expect, it } from "vitest";
import {
  HOMESTEAD_YARD_VISUAL,
  homesteadYardFloorColors,
  homesteadYardPresenceFor,
  homesteadVisitVsHomeMeadowContrast,
} from "@game/shared";

/**
 * PL51.2 — Visit land soft atmosphere tint.
 * Choice: cool guest meadow/plot + quiet haze on visit vs warm home yard;
 * visit rules / trade hotkey unchanged; no HUD column.
 */
describe("CityLands PL51.2 visit land soft atmosphere tint", () => {
  it("applies cool visit floors + haze vs warm home (happy)", () => {
    const home = homesteadYardFloorColors("lived", "home");
    const visit = homesteadYardFloorColors("lived", "visit");

    expect(home.meadowColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.meadowColor.toLowerCase(),
    );
    expect(home.hazeColor).toBeNull();
    expect(home.hazeOpacity).toBe(0);

    expect(visit.meadowColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.visit.meadowColor.toLowerCase(),
    );
    expect(visit.plotColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.visit.lived.plotColor.toLowerCase(),
    );
    expect(visit.pathColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.visit.lived.pathColor.toLowerCase(),
    );
    expect(visit.padColor?.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.visit.lived.padColor.toLowerCase(),
    );
    expect(visit.hazeColor?.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.visit.hazeColor.toLowerCase(),
    );
    expect(visit.hazeOpacity).toBe(HOMESTEAD_YARD_VISUAL.visit.hazeOpacity);
    expect(visit.hazeOpacity).toBeGreaterThan(0);
    expect(visit.hazeOpacity).toBeLessThan(0.35);
    expect(homesteadVisitVsHomeMeadowContrast()).toBeGreaterThan(20);
    expect(visit.meadowColor).not.toBe(home.meadowColor);
    expect(visit.plotColor).not.toBe(home.plotColor);
  });

  it("keeps empty/lived gate on visit; presence defaults home (edge)", () => {
    const emptyVisit = homesteadYardFloorColors("empty", "visit");
    expect(emptyVisit.padColor).toBeNull();
    expect(emptyVisit.plotColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.visit.empty.plotColor.toLowerCase(),
    );
    expect(emptyVisit.hazeColor).not.toBeNull();

    expect(homesteadYardPresenceFor(true, "player_land")).toBe("visit");
    expect(homesteadYardPresenceFor(true, "starter")).toBe("visit");
    expect(homesteadYardPresenceFor(false, "player_land")).toBe("home");
    // Default presence stays warm home (PL22.1 / PL114.1 callers).
    const defaultHome = homesteadYardFloorColors("empty");
    expect(defaultHome.meadowColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.empty.meadowColor.toLowerCase(),
    );
    expect(defaultHome.hazeColor).toBeNull();
  });

  it("does not cool-tint non-homestead visits; home stays warm (failure)", () => {
    expect(homesteadYardPresenceFor(true, "city")).toBe("home");
    expect(homesteadYardPresenceFor(true, "explore")).toBe("home");
    expect(homesteadYardPresenceFor(true, "warrior")).toBe("home");
    expect(homesteadYardPresenceFor(false, "city")).toBe("home");

    const homeLived = homesteadYardFloorColors("lived", "home");
    expect(homeLived.plotColor.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.lived.plotColor.toLowerCase(),
    );
    expect(homeLived.padColor?.toLowerCase()).toBe(
      HOMESTEAD_YARD_VISUAL.lived.padColor.toLowerCase(),
    );
  });
});
