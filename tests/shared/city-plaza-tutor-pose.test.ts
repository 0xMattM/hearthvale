import { describe, expect, it } from "vitest";
import {
  CITY_BUILDINGS,
  SEEDED_CITY_NPCS,
  cityTutorFaceYaw,
  cityTutorYawGap,
  cityTutorialNpcYaw,
} from "@game/shared";

const PLAZA_IDS = ["animal_hunter", "monster_hunter", "builder"] as const;

function plazaTutors() {
  return PLAZA_IDS.map((id) => {
    const row = CITY_BUILDINGS.find(
      (b) => b.type === "tutorial_npc" && b.tutorialNpcId === id,
    )!;
    return { id, ...row };
  });
}

function gridCross(
  a: { x: number; z: number },
  b: { x: number; z: number },
  c: { x: number; z: number },
): number {
  return (b.x - a.x) * (c.z - a.z) - (c.x - a.x) * (b.z - a.z);
}

/**
 * Fountain cluster is a loose gathering, not a lined-up firing squad.
 */
describe("city plaza fountain tutor poses", () => {
  it("scatters Builder and hunters with distinct facing (happy)", () => {
    const tutors = plazaTutors();
    const xs = new Set(tutors.map((t) => t.x));
    const zs = new Set(tutors.map((t) => t.z));
    const yaws = new Set(tutors.map((t) => cityTutorialNpcYaw(t.id)));
    expect(xs.size).toBe(3);
    expect(zs.size).toBe(3);
    expect(yaws.size).toBe(3);
    expect(cityTutorialNpcYaw("animal_hunter")).toBeCloseTo(
      cityTutorFaceYaw(-2, 1, 1, 3),
    );
    expect(cityTutorialNpcYaw("builder")).toBeCloseTo(
      cityTutorFaceYaw(1, 3, -2, 1),
    );
    expect(cityTutorialNpcYaw("monster_hunter")).toBeCloseTo(
      cityTutorFaceYaw(3, 0, 0, 2),
    );
  });

  it("keeps the gathering on the plaza, not behind City Hall (edge)", () => {
    for (const tutor of plazaTutors()) {
      expect(Math.hypot(tutor.x, tutor.z)).toBeLessThanOrEqual(4);
      expect(tutor.z).toBeGreaterThan(-4);
      expect(
        CITY_BUILDINGS.filter((b) => b.x === tutor.x && b.z === tutor.z),
      ).toHaveLength(1);
    }
  });

  it("refuses a symmetric row or a shared idle yaw (failure)", () => {
    const [a, b, c] = plazaTutors();
    expect(Math.abs(gridCross(a, b, c))).toBeGreaterThan(0.5);
    expect(a.z).not.toBe(b.z);
    expect(b.z).not.toBe(c.z);
    const hunter = plazaTutors().find((t) => t.id === "animal_hunter")!;
    const monster = plazaTutors().find((t) => t.id === "monster_hunter")!;
    expect(hunter.x === -monster.x && hunter.z === monster.z).toBe(false);
    expect(cityTutorFaceYaw(0, 0, 0, 0)).toBe(0);
    expect(cityTutorialNpcYaw(null)).toBe(0);
    expect(cityTutorialNpcYaw("nope")).toBe(0);
    for (const id of PLAZA_IDS) {
      expect(cityTutorialNpcYaw(id)).not.toBe(0);
    }
  });
});

/**
 * Every city walk-up tutor has a unique idle facing.
 */
describe("city tutor idle facing", () => {
  it("gives every seeded city NPC a distinct yaw (happy)", () => {
    const yaws = SEEDED_CITY_NPCS.map((id) => cityTutorialNpcYaw(id));
    expect(yaws).toHaveLength(SEEDED_CITY_NPCS.length);
    for (let i = 0; i < yaws.length; i++) {
      expect(Number.isFinite(yaws[i]), SEEDED_CITY_NPCS[i]).toBe(true);
      for (let j = i + 1; j < yaws.length; j++) {
        expect(
          cityTutorYawGap(yaws[i]!, yaws[j]!),
          `${SEEDED_CITY_NPCS[i]} vs ${SEEDED_CITY_NPCS[j]}`,
        ).toBeGreaterThan(0.2);
      }
    }
  });

  it("faces station tutors toward their bay, not default +Z (edge)", () => {
    expect(cityTutorialNpcYaw("farmer")).not.toBe(0);
    expect(cityTutorialNpcYaw("mayor")).not.toBe(0);
    expect(cityTutorialNpcYaw("mayor")).toBeCloseTo(cityTutorFaceYaw(1, -4, 0, 0));
    expect(cityTutorialNpcYaw("blacksmith")).toBeGreaterThan(0);
  });

  it("does not leave unknown tutors facing a catalog look-at (failure)", () => {
    expect(cityTutorialNpcYaw("")).toBe(0);
    expect(cityTutorialNpcYaw("warrior")).toBe(0);
    expect(cityTutorYawGap(0, 0)).toBe(0);
    expect(cityTutorYawGap(Math.PI, -Math.PI)).toBeLessThan(0.001);
  });
});
