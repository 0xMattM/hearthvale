import { describe, expect, it } from "vitest";
import { cityNoticeBoardTips, meatToKitchenTip } from "@game/shared";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

describe("CityLands CL33.3 Hunt meat → Kitchen tip", () => {
  it("exposes stable notice tip id meat_to_kitchen (happy)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "meat_to_kitchen");
    expect(tip).toBeDefined();
    expect(tip!.title).toMatch(/meat|Hunt/i);
    expect(tip!.body).toBe(meatToKitchenTip());
    expect(tip!.body.toLowerCase()).toMatch(/raw meat|hunt/);
    expect(tip!.body.toLowerCase()).toMatch(/kitchen/);
    expect(tip!.body.toLowerCase()).toMatch(/cooked meat|cook xp/);
    expect(tip!.body.toLowerCase()).toMatch(/explore/);
  });

  it("keeps tip on walk-up notice only — notice default-closed (edge)", () => {
    expect(defaultClosedPanelIds()).toContain("notice");
    const ids = cityNoticeBoardTips().map((t) => t.id);
    expect(ids.filter((id) => id === "meat_to_kitchen")).toHaveLength(1);
    expect(ids).toContain("fish_to_kitchen");
  });

  it("does not invent an always-on meat cook HUD column (failure)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "meat_to_kitchen")!;
    expect(tip.body.toLowerCase()).not.toContain("always-on");
    expect(
      cityNoticeBoardTips().every((t) => t.id !== "meat_cook_hud"),
    ).toBe(true);
  });
});
