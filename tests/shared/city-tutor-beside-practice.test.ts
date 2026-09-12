import { describe, expect, it } from "vitest";
import {
  CITY_BUILDINGS,
  CITY_PRACTICE_STATIONS,
  type EconomyProfessionId,
} from "@game/shared";

/**
 * City tutors with a practice station must stand in the same bay (adjacent grid).
 */
describe("City tutor beside practice station", () => {
  it("places each practice tutor within 3 grid of a matching station (happy)", () => {
    for (const [id, stations] of Object.entries(CITY_PRACTICE_STATIONS) as Array<
      [EconomyProfessionId, readonly string[] | null]
    >) {
      if (!stations || stations.length === 0) continue;
      const tutor = CITY_BUILDINGS.find(
        (b) => b.type === "tutorial_npc" && b.tutorialNpcId === id,
      );
      expect(tutor, `missing tutor ${id}`).toBeTruthy();
      const matches = CITY_BUILDINGS.filter((b) =>
        (stations as readonly string[]).includes(b.type),
      );
      expect(matches.length, `no stations for ${id}`).toBeGreaterThan(0);
      const minDist = Math.min(
        ...matches.map((s) =>
          Math.hypot((tutor!.x - s.x), (tutor!.z - s.z)),
        ),
      );
      expect(minDist, `${id} too far from practice`).toBeLessThanOrEqual(3);
    }
  });

  it("keeps explore/builder tutors on the plaza fountain lip (edge)", () => {
    const plazaCenter = { x: 0, z: 0 };
    const cells = new Set<string>();
    for (const id of ["animal_hunter", "monster_hunter", "builder"] as const) {
      const tutor = CITY_BUILDINGS.find(
        (b) => b.type === "tutorial_npc" && b.tutorialNpcId === id,
      )!;
      const dist = Math.hypot(
        tutor.x - plazaCenter.x,
        tutor.z - plazaCenter.z,
      );
      expect(dist, `${id} should stand by the fountain`).toBeLessThanOrEqual(4);
      expect(tutor.z, `${id} must not sit behind City Hall`).toBeGreaterThan(-4);
      expect(tutor.z).not.toBe(-8);
      const key = `${tutor.x},${tutor.z}`;
      expect(cells.has(key), `${id} shares a plaza cell`).toBe(false);
      cells.add(key);
      expect(
        CITY_BUILDINGS.filter((b) => b.x === tutor.x && b.z === tutor.z),
      ).toHaveLength(1);
    }
  });

  it("spaces scarce station centers so bays are not packed (failure)", () => {
    const scarce = CITY_BUILDINGS.filter(
      (b) =>
        b.type !== "tutorial_npc" &&
        b.type !== "portal" &&
        b.type !== "vendor_stall" &&
        b.type !== "market_board" &&
        b.type !== "realm_market" &&
        b.type !== "notice_board",
    );
    let closePairs = 0;
    for (let i = 0; i < scarce.length; i++) {
      for (let j = i + 1; j < scarce.length; j++) {
        const a = scarce[i]!;
        const b = scarce[j]!;
        // Same-type pairs (two crops / two stumps / two ores) may share a bay.
        if (a.type === b.type) continue;
        const d = Math.hypot(a.x - b.x, a.z - b.z);
        if (d < 2.5) closePairs += 1;
      }
    }
    expect(closePairs).toBe(0);
  });
});
