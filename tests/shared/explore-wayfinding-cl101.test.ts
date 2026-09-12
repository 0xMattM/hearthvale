import { describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  EXPLORE_BUILDINGS,
  EXPLORE_SECTIONS,
  exploreSectionForBuildingType,
  withExploreSectionPrompt,
} from "@game/shared";

describe("CityLands CL10.1 explore section wayfinding", () => {
  it("defines woodland / mines / hunt sections covering explore resources (happy)", () => {
    expect(EXPLORE_SECTIONS.map((s) => s.id).sort()).toEqual([
      "hunt",
      "mines",
      "woodland",
    ]);
    expect(exploreSectionForBuildingType("tree_stump")?.label).toBe("Woodland");
    expect(exploreSectionForBuildingType("ore_node")?.label).toBe("Mines");
    expect(exploreSectionForBuildingType("game_trail")?.label).toBe(
      "Hunt grounds",
    );
    expect(exploreSectionForBuildingType("edge_thicket")?.id).toBe("hunt");

    for (const b of EXPLORE_BUILDINGS) {
      if (
        b.type === "tree_stump" ||
        b.type === "ore_node" ||
        b.type === "game_trail" ||
        b.type === "edge_thicket"
      ) {
        expect(exploreSectionForBuildingType(b.type)).not.toBeNull();
      }
    }
  });

  it("prefixes prompts and keeps hunt explore-only copy in section hint (edge)", () => {
    expect(withExploreSectionPrompt("tree_stump", "Chop wood")).toBe(
      "Woodland · Chop wood",
    );
    expect(
      withExploreSectionPrompt("ore_node", "Chip iron ore (Iron Hammer)"),
    ).toBe("Mines · Chip iron ore (Iron Hammer)");
    expect(withExploreSectionPrompt("game_trail", "Hunt · fight hare")).toBe(
      "Hunt grounds · fight hare",
    );
    expect(withExploreSectionPrompt("edge_thicket", "Hunt · fight boar")).toBe(
      "Hunt grounds · fight boar",
    );
    const hunt = EXPLORE_SECTIONS.find((s) => s.id === "hunt")!;
    expect(hunt.hint.toLowerCase()).toMatch(/exploration only/);
  });

  it("does not invent sections for city-only buildings (failure)", () => {
    expect(exploreSectionForBuildingType("portal")).toBeNull();
    expect(exploreSectionForBuildingType("vendor_stall")).toBeNull();
    expect(exploreSectionForBuildingType("notice_board")).toBeNull();
    expect(exploreSectionForBuildingType("tutorial_npc")).toBeNull();
    expect(withExploreSectionPrompt("portal", "Free travel")).toBe("Free travel");
    expect(ACTION_ERROR.huntExploreOnly).toMatch(/Exploration/i);
  });
});
