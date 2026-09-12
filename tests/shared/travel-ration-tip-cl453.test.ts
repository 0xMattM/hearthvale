import { describe, expect, it } from "vitest";
import {
  ENERGY,
  FOOD_RESTORE,
  TRAVEL,
  cityNoticeBoardTips,
  formatFreeTravelCircuit,
  freeTravelCaravanDisclaimer,
  getRecipe,
} from "@game/shared";

describe("CityLands CL45.3 Travel ration tip fidelity", () => {
  it("keeps travel_circuit id and names ration as energy food (happy)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "travel_circuit");
    expect(tip).toBeTruthy();
    expect(tip!.id).toBe("travel_circuit");
    expect(tip!.title).toMatch(/free travel/i);
    expect(tip!.body).toContain(formatFreeTravelCircuit());

    const body = tip!.body.toLowerCase();
    expect(body).toMatch(/no fare|fare-free|free/);
    expect(body).toMatch(/instant|no.*road/);
    expect(body).toMatch(/travel ration/);
    expect(body).toMatch(/energy/);
    // Reason: ration is kitchen food — tip must not sell it as a map ticket.
    expect(body).toMatch(/not a travel|energy food|not.*fare|not.*ticket/);
  });

  it("keeps free travel fare-free while ration stays edible energy (edge)", () => {
    expect(FOOD_RESTORE.travel_ration).toBe(ENERGY.rationRestore);
    expect(TRAVEL.rationItemId).toBe("travel_ration");
    expect(getRecipe("pack_travel_ration")!.station).toBe("kitchen");
    expect(getRecipe("pack_travel_ration")!.output.itemId).toBe(
      "travel_ration",
    );

    const tip = cityNoticeBoardTips().find((t) => t.id === "travel_circuit")!;
    expect(tip.body).not.toMatch(/\b15\s*coins\b/i);
    expect(tip.body).not.toMatch(/\b45\s*s\b/i);
    expect(freeTravelCaravanDisclaimer().toLowerCase()).toMatch(
      /free|instant/,
    );
  });

  it("rejects implying Travel Ration is required for map hops (failure)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "travel_circuit")!;
    const body = tip.body.toLowerCase();
    expect(body).not.toMatch(/requires? (a )?travel ration/);
    expect(body).not.toMatch(/(spend|pay|cost).{0,24}(travel )?ration/);
    expect(body).not.toMatch(/ration.{0,24}(fare|ticket|toll)/);
  });
});
