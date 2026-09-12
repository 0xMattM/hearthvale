import { describe, expect, it } from "vitest";
import {
  cityNoticeBoardTips,
  exploreMatsCraftChainTip,
} from "@game/shared";

describe("CityLands CL37.2 Explore mats → land craft tip fidelity", () => {
  it("documents woodland / mines / hunt → craft chain (happy)", () => {
    const tip = cityNoticeBoardTips().find((t) => t.id === "explore_mats_craft");
    expect(tip).toBeDefined();
    expect(tip!.body).toBe(exploreMatsCraftChainTip());
    const body = tip!.body.toLowerCase();
    expect(body).toMatch(/woodland/);
    expect(body).toMatch(/mines/);
    expect(body).toMatch(/game trail|edge thicket|hunt/);
    expect(body).toMatch(/wood/);
    expect(body).toMatch(/ore/);
    expect(body).toMatch(/leather|boar tusk/);
    expect(body).toMatch(/loom|kitchen|workshop|forge/);
    expect(body).toMatch(/craft/);
  });

  it("keeps explore_mats_craft tip id stable (edge)", () => {
    const ids = cityNoticeBoardTips().map((t) => t.id);
    expect(ids.filter((id) => id === "explore_mats_craft")).toHaveLength(1);
    expect(ids).not.toContain("explore_mats_craft_v2");
  });

  it("does not drop hunt XP fidelity from the craft tip (failure)", () => {
    const body = exploreMatsCraftChainTip().toLowerCase();
    expect(body).toMatch(/animal hunter xp/);
    expect(body).toMatch(/monster hunter xp/);
    expect(body).not.toMatch(/grant hunter xp \(not cook\)/);
  });
});
