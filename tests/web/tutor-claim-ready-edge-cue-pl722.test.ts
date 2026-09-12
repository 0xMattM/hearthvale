import { describe, expect, it } from "vitest";
import {
  TUTOR_CLAIMABLE_WORLD_CUE,
  isTutorQuestClaimable,
  tutorClaimableProfessionIds,
} from "@game/shared";
import {
  TUTOR_CLAIM_READY_EDGE_CUE,
  TUTOR_CLAIM_SUCCESS_CUE,
  isCoreSuccessCueText,
  shouldFlashTutorClaimReadyEdgeCue,
  SUCCESS_CUE_MS,
  tutorClaimReadyEdgeCueText,
} from "../../apps/web/lib/hud/success-cue";

/**
 * PL72.2 — Tutor claim-ready soft TopBar cue.
 * Brief TopBar `Claim` when a tutor objective first becomes claimable;
 * complements world Claim accent PL30.3; XP / claim rules unchanged; mute ok.
 */
describe("CityLands PL72.2 tutor claim-ready edge soft cue", () => {
  it("flashes Claim when a tutor edges into claimable (happy)", () => {
    expect(tutorClaimReadyEdgeCueText()).toBe(TUTOR_CLAIM_READY_EDGE_CUE);
    expect(tutorClaimReadyEdgeCueText()).toBe("Claim");
    expect(tutorClaimReadyEdgeCueText()).toBe(TUTOR_CLAIMABLE_WORLD_CUE.soft);
    expect(isCoreSuccessCueText("Claim")).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);

    const prev = new Set<string>();
    const next = new Set(["farmer"]);
    expect(shouldFlashTutorClaimReadyEdgeCue(prev, next)).toBe(true);

    expect(isTutorQuestClaimable("ready")).toBe(true);
    expect(
      tutorClaimableProfessionIds([
        { id: "farmer", quest: { status: "ready" } },
        { id: "forester", quest: { status: "active" } },
      ]),
    ).toEqual(["farmer"]);
  });

  it("stays quiet on hydrate, same set, or claim clear (edge)", () => {
    expect(shouldFlashTutorClaimReadyEdgeCue(null, new Set(["farmer"]))).toBe(
      false,
    );
    expect(
      shouldFlashTutorClaimReadyEdgeCue(undefined, new Set(["farmer"])),
    ).toBe(false);
    expect(
      shouldFlashTutorClaimReadyEdgeCue(
        new Set(["farmer"]),
        new Set(["farmer"]),
      ),
    ).toBe(false);
    expect(
      shouldFlashTutorClaimReadyEdgeCue(new Set(["farmer"]), new Set()),
    ).toBe(false);
    // Second tutor becoming ready while first already claimable still flashes once.
    expect(
      shouldFlashTutorClaimReadyEdgeCue(
        new Set(["farmer"]),
        new Set(["farmer", "forester"]),
      ),
    ).toBe(true);
  });

  it("keeps XP / claim rules and refuses sticky prose (failure)", () => {
    expect(isTutorQuestClaimable("active")).toBe(false);
    expect(isTutorQuestClaimable("claimed")).toBe(false);
    expect(isTutorQuestClaimable("locked")).toBe(false);
    expect(tutorClaimReadyEdgeCueText()).not.toMatch(/\d/);
    expect(tutorClaimReadyEdgeCueText()).not.toBe(TUTOR_CLAIM_SUCCESS_CUE);
    expect(tutorClaimReadyEdgeCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|always-on/,
    );
    expect(isCoreSuccessCueText("Claim forever sticky")).toBe(false);
    expect(shouldFlashTutorClaimReadyEdgeCue(new Set(), new Set(["x"]))).toBe(
      true,
    );
    expect(shouldFlashTutorClaimReadyEdgeCue(null, new Set(["x"]))).toBe(false);
  });
});
