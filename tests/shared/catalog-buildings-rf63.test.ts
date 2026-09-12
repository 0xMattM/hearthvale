import { describe, expect, it } from "vitest";
import {
  CITY_BUILDINGS,
  EXPLORE_BUILDINGS,
  MAP_IDENTITY,
  PLAYER_LAND_STATIONS,
  WARRIOR_BUILDINGS,
  isPlayerLandStationType,
  normalizeLandKind,
} from "@game/shared";

/**
 * RF6.3 — buildings/layouts live in catalog-* modules via catalog barrel.
 */
describe("catalog-buildings RF6.3", () => {
  it("exports player mill station and city layout (happy)", () => {
    expect(PLAYER_LAND_STATIONS.mill.name).toBe("Mill");
    expect(CITY_BUILDINGS.some((b) => b.type === "market_board")).toBe(true);
    expect(MAP_IDENTITY.city.word).toBe("City");
  });

  it("normalizes legacy land kinds (edge)", () => {
    expect(normalizeLandKind("starter")).toBe("player_land");
    expect(normalizeLandKind("forest")).toBe("explore");
    expect(EXPLORE_BUILDINGS.some((b) => b.type === "game_trail")).toBe(true);
    expect(WARRIOR_BUILDINGS.some((b) => b.type === "arena_board")).toBe(true);
  });

  it("rejects unknown station type (fail)", () => {
    expect(isPlayerLandStationType("not_a_station")).toBe(false);
    expect(normalizeLandKind("dungeon")).toBeNull();
  });
});
