import { describe, expect, it } from "vitest";
import {
  cityNoticeBoardTips,
  exploreMatsCraftChainTip,
} from "@game/shared";
import { defaultClosedPanelIds } from "../../apps/web/lib/hud/panel-orchestration";

describe("CityLands CL21.2 / CL24.3 Explore mats → craft chain tip", () => {
  it("exposes stable notice tip id explore_mats_craft (happy)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "explore_mats_craft");
    expect(tip).toBeDefined();
    expect(tip!.title).toMatch(/Explore mats/i);
    expect(tip!.body).toBe(exploreMatsCraftChainTip());
    expect(tip!.body.toLowerCase()).toMatch(/leather/);
    expect(tip!.body.toLowerCase()).toMatch(/tusk/);
    expect(tip!.body.toLowerCase()).toMatch(/wood/);
    expect(tip!.body.toLowerCase()).toMatch(/ore/);
    expect(tip!.body.toLowerCase()).toMatch(/weave|loom/);
    expect(tip!.body.toLowerCase()).toMatch(/cook|stew|kitchen/);
    expect(tip!.body.toLowerCase()).toMatch(/carpenter|plank|workshop/);
    expect(tip!.body.toLowerCase()).toMatch(/forge|bar/);
    expect(tip!.body.toLowerCase()).toMatch(/woodland|mines/);
    // CL31.2 — dual Animal / Monster Hunter XP (not Cook)
    expect(tip!.body.toLowerCase()).toMatch(/animal hunter xp/);
    expect(tip!.body.toLowerCase()).toMatch(/monster hunter xp/);
    expect(tip!.body.toLowerCase()).toMatch(/trail/);
    expect(tip!.body.toLowerCase()).toMatch(/thicket/);
  });

  it("keeps tip on walk-up notice only — notice default-closed (edge)", () => {
    expect(defaultClosedPanelIds()).toContain("notice");
    const ids = cityNoticeBoardTips().map((t) => t.id);
    expect(ids.filter((id) => id === "explore_mats_craft")).toHaveLength(1);
  });

  it("does not invent an always-on explore craft HUD column (failure)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "explore_mats_craft")!;
    expect(tip.body.toLowerCase()).not.toContain("always-on");
    expect(
      cityNoticeBoardTips().every((t) => t.id !== "explore_craft_hud"),
    ).toBe(true);
  });
});
