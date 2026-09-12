import { describe, expect, it } from "vitest";
import {
  cityNoticeBoardTips,
  landGatherPracticeTip,
} from "@game/shared";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

describe("CityLands CL32.3 land gather practice tip", () => {
  it("exposes stable notice tip id land_gather_practice (happy)", () => {
    const tip = cityNoticeBoardTips().find(
      (t) => t.id === "land_gather_practice",
    );
    expect(tip).toBeDefined();
    expect(tip!.title).toMatch(/trees|ore/i);
    expect(tip!.body).toBe(landGatherPracticeTip());
    expect(tip!.body.toLowerCase()).toMatch(/your land/);
    expect(tip!.body.toLowerCase()).toMatch(/land editor|\bp\b/);
    expect(tip!.body.toLowerCase()).toMatch(/forester xp/);
    expect(tip!.body.toLowerCase()).toMatch(/miner xp/);
    expect(tip!.body.toLowerCase()).toMatch(/scarce|shared/);
    expect(tip!.body.toLowerCase()).toMatch(/hammer/);
  });

  it("keeps tip on walk-up notice only — notice default-closed (edge)", () => {
    expect(defaultClosedPanelIds()).toContain("notice");
    const ids = cityNoticeBoardTips().map((t) => t.id);
    expect(ids.filter((id) => id === "land_gather_practice")).toHaveLength(1);
  });

  it("does not invent an always-on gather HUD column (failure)", () => {
    const tip = cityNoticeBoardTips().find(
      (t) => t.id === "land_gather_practice",
    )!;
    expect(tip.body.toLowerCase()).not.toContain("always-on");
    expect(
      cityNoticeBoardTips().every((t) => t.id !== "land_gather_hud"),
    ).toBe(true);
  });
});
