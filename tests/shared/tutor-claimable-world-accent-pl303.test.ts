import { describe, expect, it } from "vitest";
import {
  TUTOR_CLAIMABLE_WORLD_CUE,
  isTutorQuestClaimable,
  tutorClaimableProfessionIds,
  tutorClaimableWorldLabelParts,
  tutorialNpcCloakColor,
} from "@game/shared";

/**
 * PL30.3 — Tutor claimable world accent.
 * Choice: quiet pad/halo + soft Claim secondary (notice unread pattern);
 * claim XP/coins unchanged; no HUD column.
 */
describe("CityLands PL30.3 tutor claimable world accent", () => {
  it("flags ready tutors and name-first Claim soft (happy)", () => {
    expect(isTutorQuestClaimable("ready")).toBe(true);
    expect(TUTOR_CLAIMABLE_WORLD_CUE.soft).toBe("Claim");
    const ids = tutorClaimableProfessionIds([
      { id: "fisher", quest: { status: "ready" } },
      { id: "farmer", quest: { status: "active" } },
      { id: "cook", quest: { status: "claimed" } },
    ]);
    expect(ids).toEqual(["fisher"]);
    const parts = tutorClaimableWorldLabelParts("Fisher");
    expect(parts.name).toBe("Fisher");
    expect(parts.soft).toBe("Claim");
    expect(TUTOR_CLAIMABLE_WORLD_CUE.haloColor.length).toBeGreaterThan(0);
    expect(TUTOR_CLAIMABLE_WORLD_CUE.padColor.length).toBeGreaterThan(0);
  });

  it("stays quiet for active / claimed / locked; cloak unchanged (edge)", () => {
    expect(isTutorQuestClaimable("active")).toBe(false);
    expect(isTutorQuestClaimable("claimed")).toBe(false);
    expect(isTutorQuestClaimable("locked")).toBe(false);
    expect(tutorClaimableProfessionIds([])).toEqual([]);
    expect(
      tutorClaimableProfessionIds([
        { id: "builder", quest: { status: "active" } },
      ]),
    ).toEqual([]);
    expect(tutorialNpcCloakColor("fisher").length).toBeGreaterThan(0);
    expect(TUTOR_CLAIMABLE_WORLD_CUE.soft).not.toBe("Ready");
  });

  it("rejects empty/unknown status; keeps name ahead of soft (failure)", () => {
    expect(isTutorQuestClaimable("")).toBe(false);
    expect(isTutorQuestClaimable("Ready")).toBe(false);
    const parts = tutorClaimableWorldLabelParts("Animal Breeder");
    expect(parts.name.toLowerCase()).not.toBe(parts.soft.toLowerCase());
    expect(parts.name.length).toBeGreaterThan(parts.soft.length);
    expect(tutorClaimableProfessionIds([{ id: "x", quest: { status: "" } }])).toEqual(
      [],
    );
  });
});
