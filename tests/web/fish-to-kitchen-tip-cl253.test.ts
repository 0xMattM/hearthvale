import { describe, expect, it } from "vitest";
import { cityNoticeBoardTips, fishToKitchenTip } from "@game/shared";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

describe("CityLands CL25.3 Fish → Kitchen tip", () => {
  it("exposes stable notice tip id fish_to_kitchen (happy)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "fish_to_kitchen");
    expect(tip).toBeDefined();
    expect(tip!.title).toMatch(/Fish/i);
    expect(tip!.body).toBe(fishToKitchenTip());
    expect(tip!.body.toLowerCase()).toMatch(/catch|fish/);
    expect(tip!.body.toLowerCase()).toMatch(/kitchen/);
    expect(tip!.body.toLowerCase()).toMatch(/cooked fish|cook xp/);
    expect(tip!.body.toLowerCase()).toMatch(/city|land|dock/);
  });

  it("keeps tip on walk-up notice only — notice default-closed (edge)", () => {
    expect(defaultClosedPanelIds()).toContain("notice");
    const ids = cityNoticeBoardTips().map((t) => t.id);
    expect(ids.filter((id) => id === "fish_to_kitchen")).toHaveLength(1);
  });

  it("does not invent an always-on fish cook HUD column (failure)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "fish_to_kitchen")!;
    expect(tip.body.toLowerCase()).not.toContain("always-on");
    expect(
      cityNoticeBoardTips().every((t) => t.id !== "fish_cook_hud"),
    ).toBe(true);
  });
});
