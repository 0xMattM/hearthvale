import { describe, expect, it } from "vitest";
import {
  LAND_DESTINATIONS,
  TRAVEL,
  formatFreeTravelCircuit,
  freeTravelCaravanDisclaimer,
  freeTravelPanelIntro,
  freeTravelPortalPrompt,
} from "../../packages/shared/src/catalog";

describe("CityLands CL7.1 free travel UX copy", () => {
  it("lists the full free circuit without fare language (happy)", () => {
    const circuit = formatFreeTravelCircuit();
    expect(circuit).toContain("City");
    expect(circuit).toContain("Your Land");
    expect(circuit).toContain("Exploration");
    expect(circuit).toContain("Warrior Arena");
    expect(circuit.split("↔").length).toBe(LAND_DESTINATIONS.length);

    const intro = freeTravelPanelIntro();
    expect(intro.toLowerCase()).toContain("instant");
    expect(intro.toLowerCase()).toContain("no road time");
    expect(intro).not.toMatch(/\d+\s*s/);
    expect(intro).not.toMatch(/15\s*coins/i);

    const portal = freeTravelPortalPrompt();
    expect(portal).toMatch(/^Travel · free/);
    expect(portal).toContain(circuit);
  });

  it("documents legacy caravan as non-rule; TRAVEL stays inert for maps (edge)", () => {
    const note = freeTravelCaravanDisclaimer();
    expect(note.toLowerCase()).toContain("caravan");
    expect(note.toLowerCase()).toContain("free");
    expect(note.toLowerCase()).toContain("instant");
    // Reason: constants remain for ration recipes / history but must not drive UX.
    expect(TRAVEL.durationMs).toBe(45_000);
    expect(TRAVEL.coinCost).toBe(15);
    expect(freeTravelPanelIntro()).not.toContain(String(TRAVEL.coinCost));
    expect(freeTravelPanelIntro()).not.toContain(String(TRAVEL.durationMs / 1000));
  });

  it("rejects implying a paid timer in destination blurbs (failure)", () => {
    for (const dest of LAND_DESTINATIONS) {
      expect(dest.blurb.toLowerCase()).not.toMatch(/caravan|fare|45s|road time/);
    }
    expect(freeTravelCaravanDisclaimer().toLowerCase()).not.toContain(
      "required",
    );
  });
});
