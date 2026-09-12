import { describe, expect, it } from "vitest";
import {
  SEEDED_CITY_NPCS,
  TUTOR_CLOAK_FALLBACK,
  TUTOR_LOOK_FALLBACK,
  TUTOR_MESH_TINT_MIX,
  TUTOR_VILLAGER_VARIANT,
  tutorialNpcCloakColor,
  tutorialNpcLook,
} from "@game/shared";

/**
 * City tutors share the Blacksmith villager and differ by profession color wash.
 */
describe("city tutor looks", () => {
  it("gives every seeded city NPC a unique cloak tint (happy)", () => {
    const cloaks = SEEDED_CITY_NPCS.map((id) => tutorialNpcLook(id).cloak);
    expect(cloaks).toHaveLength(SEEDED_CITY_NPCS.length);
    expect(new Set(cloaks).size).toBe(SEEDED_CITY_NPCS.length);
    expect(tutorialNpcLook("farmer").cloak).toBe(tutorialNpcCloakColor("farmer"));
    expect(tutorialNpcLook("mayor").cloak).not.toBe(tutorialNpcLook("farmer").cloak);
    expect(TUTOR_VILLAGER_VARIANT).toBe("tutor");
  });

  it("washes clothing texels hard enough to read (edge)", () => {
    expect(TUTOR_MESH_TINT_MIX).toBeGreaterThan(0.7);
    expect(TUTOR_MESH_TINT_MIX).toBeLessThanOrEqual(1);
    expect(tutorialNpcLook("animal_hunter").cloak).not.toBe(
      tutorialNpcLook("blacksmith").cloak,
    );
    expect(tutorialNpcLook("weaver").cloak).not.toBe(
      tutorialNpcLook("fisher").cloak,
    );
  });

  it("falls back to gray for unknown ids (failure)", () => {
    expect(tutorialNpcLook(null)).toEqual(TUTOR_LOOK_FALLBACK);
    expect(tutorialNpcLook(undefined)).toEqual(TUTOR_LOOK_FALLBACK);
    expect(tutorialNpcLook("")).toEqual(TUTOR_LOOK_FALLBACK);
    expect(tutorialNpcLook("warrior")).toEqual(TUTOR_LOOK_FALLBACK);
    expect(tutorialNpcLook("swamp_hermit").cloak).toBe(TUTOR_CLOAK_FALLBACK);
  });
});
