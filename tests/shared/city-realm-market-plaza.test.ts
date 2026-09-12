import { describe, expect, it } from "vitest";
import {
  BUILDING_COLLISION_RADIUS,
  CITY_BUILDINGS,
  CITY_LAND,
  PLAYER_COLLISION_RADIUS,
  WORLD,
} from "@game/shared";

/**
 * REALM stall sits in front of the coin Market on the east plaza lip.
 */
describe("city REALM market plaza placement", () => {
  it("puts the indigo stall in front of the coin Market (happy)", () => {
    const coins = CITY_BUILDINGS.find((b) => b.type === "market_board")!;
    const realm = CITY_BUILDINGS.find((b) => b.type === "realm_market")!;
    expect(realm.x).toBe(coins.x);
    expect(realm.z).toBeGreaterThan(coins.z);
    expect(realm.x).toBe(6);
    expect(realm.z).toBe(4);
    expect(CITY_BUILDINGS.length).toBe(CITY_LAND.buildSlots);
  });

  it("keeps a unique cell and reachable E (edge)", () => {
    const realm = CITY_BUILDINGS.find((b) => b.type === "realm_market")!;
    expect(
      CITY_BUILDINGS.filter((b) => b.x === realm.x && b.z === realm.z),
    ).toHaveLength(1);
    expect(
      new Set(CITY_BUILDINGS.map((b) => b.slotIndex)).size,
    ).toBe(CITY_BUILDINGS.length);
    expect(
      PLAYER_COLLISION_RADIUS + BUILDING_COLLISION_RADIUS.realm_market,
    ).toBeLessThan(WORLD.INTERACT_RANGE);
  });

  it("does not sit on the coin Market or carpenter cell (failure)", () => {
    const realm = CITY_BUILDINGS.find((b) => b.type === "realm_market")!;
    const coins = CITY_BUILDINGS.find((b) => b.type === "market_board")!;
    const carpenter = CITY_BUILDINGS.find(
      (b) => b.type === "tutorial_npc" && b.tutorialNpcId === "carpenter",
    )!;
    expect(`${realm.x},${realm.z}`).not.toBe(`${coins.x},${coins.z}`);
    expect(`${realm.x},${realm.z}`).not.toBe(`${carpenter.x},${carpenter.z}`);
    expect(realm.z).not.toBe(0);
  });
});
