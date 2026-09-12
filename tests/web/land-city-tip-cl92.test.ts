import { describe, expect, it } from "vitest";
import { cityNoticeBoardTips } from "@game/shared";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

describe("CityLands CL9.2 land→city produce loop tip", () => {
  it("exposes a board tip nudging City sell/list after land craft (happy)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "land_to_city");
    expect(tip).toBeDefined();
    expect(tip!.title).toMatch(/Land.*City/i);
    expect(tip!.body).toMatch(/Craft on Your Land/i);
    expect(tip!.body).toMatch(/Vendor|Market/i);
    expect(tip!.body).toMatch(/No forced quest/i);
  });

  it("keeps the tip on walk-up notice only — notice stays default-closed (edge)", () => {
    const closed = defaultClosedPanelIds();
    expect(closed).toContain("notice");
  });

  it("does not invent an always-on produce HUD column (failure)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "land_to_city")!;
    expect(tip.body.toLowerCase()).not.toContain("always-on");
    expect(cityNoticeBoardTips().every((t) => t.id !== "produce_hud")).toBe(
      true,
    );
  });
});
