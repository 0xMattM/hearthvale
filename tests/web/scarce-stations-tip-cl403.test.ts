import { describe, expect, it } from "vitest";
import { cityNoticeBoardTips } from "@game/shared";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

describe("CityLands CL40.3 City scarce stations tip fidelity", () => {
  it("documents shared scarce city stations vs unlimited land (happy)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "scarce_stations");
    expect(tip).toBeDefined();
    expect(tip!.title).toMatch(/scarce|city/i);
    const body = tip!.body.toLowerCase();
    expect(body).toMatch(/shared|limited|scarce/);
    expect(body).toMatch(/your land|unlimited/);
    expect(body).toMatch(/kitchen|workshop|forge|mill/);
    expect(body).toMatch(/loom|fishing dock|alchemy|animal pen/);
  });

  it("keeps scarce_stations id unique and notice default-closed (edge)", () => {
    expect(defaultClosedPanelIds()).toContain("notice");
    const ids = cityNoticeBoardTips().map((t) => t.id);
    expect(ids.filter((id) => id === "scarce_stations")).toHaveLength(1);
    expect(ids).toContain("travel_circuit");
  });

  it("does not invent an always-on scarce-stations HUD column (failure)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "scarce_stations")!;
    expect(tip.body.toLowerCase()).not.toContain("always-on");
    expect(
      cityNoticeBoardTips().every((t) => t.id !== "scarce_stations_hud"),
    ).toBe(true);
  });
});
