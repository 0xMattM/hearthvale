import { describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  EXPLORE_BUILDINGS,
  EXPLORE_SECTIONS,
  PLAYER_LAND_BUILDINGS,
  STARTER_BUILDINGS,
  cssHexRgbDistance,
  exploreSectionFloorContrastMin,
} from "@game/shared";

/**
 * PL4.2 — Hunt vs gather floor separation.
 * Warm hunt floor + trail belt vs woodland green / mines slate; no homestead hunt.
 */
describe("CityLands PL4.2 hunt vs gather floor separation", () => {
  it("keeps three distinct floors with hunt warmer than gather greens (happy)", () => {
    const ids = EXPLORE_SECTIONS.map((s) => s.id).sort();
    expect(ids).toEqual(["hunt", "mines", "woodland"]);
    const floors = EXPLORE_SECTIONS.map((s) => s.floorColor);
    expect(new Set(floors).size).toBe(3);
    expect(exploreSectionFloorContrastMin()).toBeGreaterThan(40);

    const woodland = EXPLORE_SECTIONS.find((s) => s.id === "woodland")!;
    const mines = EXPLORE_SECTIONS.find((s) => s.id === "mines")!;
    const hunt = EXPLORE_SECTIONS.find((s) => s.id === "hunt")!;
    expect(cssHexRgbDistance(woodland.floorColor, hunt.floorColor)).toBeGreaterThan(
      50,
    );
    expect(cssHexRgbDistance(mines.floorColor, hunt.floorColor)).toBeGreaterThan(
      40,
    );
    // Hunt warm earth vs woodland green / mines cool slate.
    expect(hunt.floorColor.toLowerCase()).toBe("#6b5434");
    expect(woodland.floorColor.toLowerCase()).toBe("#2e6b3c");
    expect(mines.floorColor.toLowerCase()).toBe("#4a5058");
  });

  it("exposes hunt trail belt pathColor; hunt nodes only on explore (edge)", () => {
    const hunt = EXPLORE_SECTIONS.find((s) => s.id === "hunt")!;
    expect(hunt.pathColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(cssHexRgbDistance(hunt.pathColor!, hunt.floorColor)).toBeGreaterThan(
      20,
    );
    expect(EXPLORE_SECTIONS.find((s) => s.id === "woodland")?.pathColor).toBeUndefined();
    expect(EXPLORE_SECTIONS.find((s) => s.id === "mines")?.pathColor).toBeUndefined();

    const huntTypes = new Set(["game_trail", "edge_thicket"]);
    expect(
      EXPLORE_BUILDINGS.some((b) => huntTypes.has(b.type)),
    ).toBe(true);
    expect(STARTER_BUILDINGS.some((b) => huntTypes.has(b.type))).toBe(false);
    expect(PLAYER_LAND_BUILDINGS.some((b) => huntTypes.has(b.type))).toBe(
      false,
    );
  });

  it("refuses homestead hunt and rejects collapsed floor palette (failure)", () => {
    expect(ACTION_ERROR.huntExploreOnly).toMatch(/Exploration/i);
    expect(exploreSectionFloorContrastMin()).not.toBe(0);
    const sameFloor = EXPLORE_SECTIONS.every(
      (s) => s.floorColor === EXPLORE_SECTIONS[0]!.floorColor,
    );
    expect(sameFloor).toBe(false);
    expect(
      EXPLORE_SECTIONS.find((s) => s.id === "hunt")!.buildingTypes,
    ).toEqual(["game_trail", "edge_thicket"]);
  });
});
