import { describe, expect, it } from "vitest";
import {
  CITY_BUILDINGS,
  SEEDED_CITY_TUTORIAL_NPCS,
  TUTOR_CLOAK_COLORS,
  TUTOR_CLOAK_FALLBACK,
  tutorialNpcCloakColor,
} from "@game/shared";

/** Pre-PL1.2 only these three cloaks differed; everyone else shared gray. */
const LEGACY_COLORED = new Set(["farmer", "forester", "carpenter"]);

/**
 * PL1.2 — Tutor silhouette cloak colors for all seeded professions.
 * Choice: shared SoT so BuildingMesh + tests stay aligned.
 */
describe("CityLands PL1.2 tutor cloak colors", () => {
  it("maps every city-template tutor to a unique-ish cloak (happy)", () => {
    const cityTutorIds = CITY_BUILDINGS.filter(
      (b) => b.type === "tutorial_npc" && b.tutorialNpcId,
    ).map((b) => b.tutorialNpcId!);

    expect(cityTutorIds.length).toBeGreaterThanOrEqual(
      SEEDED_CITY_TUTORIAL_NPCS.length,
    );

    const cloaks = cityTutorIds.map((id) => tutorialNpcCloakColor(id));
    expect(new Set(cloaks).size).toBe(cloaks.length);
    for (const id of cityTutorIds) {
      expect(TUTOR_CLOAK_COLORS[id as keyof typeof TUTOR_CLOAK_COLORS]).toBe(
        tutorialNpcCloakColor(id),
      );
      expect(tutorialNpcCloakColor(id)).not.toBe(TUTOR_CLOAK_FALLBACK);
    }
  });

  it("gives distinct cloaks to ≥3 previously-gray tutors (edge)", () => {
    const previouslyGray = SEEDED_CITY_TUTORIAL_NPCS.filter(
      (id) => !LEGACY_COLORED.has(id),
    );
    expect(previouslyGray.length).toBeGreaterThanOrEqual(3);

    const sample = ["miner", "cook", "weaver"] as const;
    for (const id of sample) {
      expect(previouslyGray).toContain(id);
    }

    const cloaks = sample.map((id) => tutorialNpcCloakColor(id));
    expect(cloaks.every((c) => c !== TUTOR_CLOAK_FALLBACK)).toBe(true);
    expect(new Set(cloaks).size).toBe(3);
    expect(cloaks).not.toContain(TUTOR_CLOAK_COLORS.farmer);
    expect(cloaks).not.toContain(TUTOR_CLOAK_COLORS.forester);
    expect(cloaks).not.toContain(TUTOR_CLOAK_COLORS.carpenter);
  });

  it("falls back to gray for unknown tutor ids (failure)", () => {
    expect(tutorialNpcCloakColor(null)).toBe(TUTOR_CLOAK_FALLBACK);
    expect(tutorialNpcCloakColor(undefined)).toBe(TUTOR_CLOAK_FALLBACK);
    expect(tutorialNpcCloakColor("")).toBe(TUTOR_CLOAK_FALLBACK);
    expect(tutorialNpcCloakColor("warrior")).toBe(TUTOR_CLOAK_FALLBACK);
    expect(tutorialNpcCloakColor("swamp_hermit")).toBe(TUTOR_CLOAK_FALLBACK);
  });
});
