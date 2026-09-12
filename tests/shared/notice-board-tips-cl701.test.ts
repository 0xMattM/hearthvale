import { describe, expect, it } from "vitest";
import {
  CITY_BUILDINGS,
  cityNoticeBoardTips,
  formatFreeTravelCircuit,
  isProductionBuildingType,
} from "@game/shared";

/**
 * CL70.1 — Notice board tips still green (travel / scarce / warrior-optional).
 * Choice: assert-only stable ids + copy; no invent live-ops.
 */
describe("CityLands CL70.1 Notice board tips still green", () => {
  it("keeps travel / scarce / warrior tip ids and core copy (happy)", () => {
    expect(CITY_BUILDINGS.some((b) => b.type === "notice_board")).toBe(true);
    expect(isProductionBuildingType("notice_board")).toBe(false);

    const tips = cityNoticeBoardTips();
    const ids = tips.map((t) => t.id);
    expect(ids).toContain("travel_circuit");
    expect(ids).toContain("scarce_stations");
    expect(ids).toContain("warrior_optional");

    const travel = tips.find((t) => t.id === "travel_circuit")!;
    expect(travel.body).toContain(formatFreeTravelCircuit());
    expect(travel.body.toLowerCase()).toMatch(/no fare|fare-free|instant/);
    expect(travel.body.toLowerCase()).toMatch(/travel ration/);
    expect(travel.body.toLowerCase()).toMatch(/energy/);

    const scarce = tips.find((t) => t.id === "scarce_stations")!;
    expect(scarce.body.toLowerCase()).toMatch(/scarce|shared|limited/);
    expect(scarce.body.toLowerCase()).toMatch(/alchemy/);
    expect(scarce.body.toLowerCase()).toMatch(/your land|unlimited/);

    const warrior = tips.find((t) => t.id === "warrior_optional")!;
    expect(warrior.body.toLowerCase()).toMatch(/optional|not required/);
    expect(warrior.body.toLowerCase()).toMatch(
      /profession ladder|no combat|not on the economy/,
    );
  });

  it("keeps tip ids stable and avoids live-ops invent (edge)", () => {
    const tips = cityNoticeBoardTips();
    expect(tips.every((t) => typeof t.id === "string" && t.id.length > 0)).toBe(
      true,
    );
    expect(tips.every((t) => t.title.length > 0 && t.body.length > 0)).toBe(
      true,
    );
    // Reason: notice board is static walk-up copy — not a live-ops feed.
    const joined = tips.map((t) => `${t.title} ${t.body}`).join(" ");
    expect(joined).not.toMatch(/season pass|battle pass|daily login/i);
    expect(joined).not.toMatch(/\blive[- ]?ops\b/i);
  });

  it("rejects inventing combat balance on warrior tip (failure)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "warrior_optional")!;
    expect(tip.body).not.toMatch(/\d+\s*(dmg|hp|defense|dps)/i);
    // Reason: copy says "not required" — reject mandatory-warrior phrasing only.
    expect(tip.body.toLowerCase()).not.toMatch(
      /\b(is|are|must be)\s+required\b/,
    );
    expect(tip.body.toLowerCase()).not.toMatch(/\bmandatory\b/);
  });
});
