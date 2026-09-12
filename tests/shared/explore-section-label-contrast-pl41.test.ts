import { describe, expect, it } from "vitest";
import {
  EXPLORE_SECTIONS,
  cssHexRgbDistance,
  exploreSectionForBuildingType,
  parseCssHexRgb,
  withExploreSectionPrompt,
} from "@game/shared";

/**
 * PL4.1 — Explore section label contrast.
 * Stronger accents + hints stay on EXPLORE_SECTIONS SoT; prompts still prefix label.
 */
describe("CityLands PL4.1 explore section label contrast", () => {
  it("gives each section a high-contrast accent distinct from its floor (happy)", () => {
    expect(EXPLORE_SECTIONS).toHaveLength(3);
    for (const section of EXPLORE_SECTIONS) {
      expect(section.labelAccent).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(parseCssHexRgb(section.labelAccent)).not.toBeNull();
      // Accent must read clearly against the floor tint.
      expect(
        cssHexRgbDistance(section.labelAccent, section.floorColor),
      ).toBeGreaterThan(80);
      expect(section.hint.length).toBeGreaterThan(8);
    }
    const accents = EXPLORE_SECTIONS.map((s) => s.labelAccent);
    expect(new Set(accents).size).toBe(3);
  });

  it("keeps prompt prefixes on section labels; hunt hint still Exploration-only (edge)", () => {
    expect(withExploreSectionPrompt("tree_stump", "Chop wood")).toBe(
      "Woodland · Chop wood",
    );
    expect(
      withExploreSectionPrompt("ore_node", "Chip iron ore (Iron Hammer)"),
    ).toBe("Mines · Chip iron ore (Iron Hammer)");
    expect(withExploreSectionPrompt("game_trail", "Hunt · fight hare")).toBe(
      "Hunt grounds · fight hare",
    );
    expect(exploreSectionForBuildingType("edge_thicket")?.label).toBe(
      "Hunt grounds",
    );
    const hunt = EXPLORE_SECTIONS.find((s) => s.id === "hunt")!;
    expect(hunt.hint.toLowerCase()).toMatch(/exploration only/);
    expect(hunt.hint.toLowerCase()).toMatch(/trail/);
    expect(hunt.labelAccent.toLowerCase()).toMatch(/^#f0c878$/);
  });

  it("rejects invalid hex and does not invent accents for non-sections (failure)", () => {
    expect(parseCssHexRgb("not-a-color")).toBeNull();
    expect(cssHexRgbDistance("#fff", "nope")).toBe(0);
    expect(exploreSectionForBuildingType("portal")).toBeNull();
    expect(withExploreSectionPrompt("portal", "Free travel")).toBe(
      "Free travel",
    );
    expect(
      EXPLORE_SECTIONS.every((s) => s.labelAccent !== s.floorColor),
    ).toBe(true);
  });
});
