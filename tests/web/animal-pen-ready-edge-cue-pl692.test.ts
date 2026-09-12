import { describe, expect, it } from "vitest";
import { ANIMAL_PEN } from "@game/shared";
import {
  oreNodeReady,
  readyAnimalPenIds,
} from "../../apps/web/components/land-scene/landProximity";
import {
  ANIMAL_PEN_COOLDOWN_REFUSE_CUE,
  ANIMAL_PEN_READY_EDGE_CUE,
  CROP_READY_EDGE_CUE,
  animalPenReadyEdgeCueText,
  isCoreSuccessCueText,
  shouldFlashAnimalPenReadyEdgeCue,
  SUCCESS_CUE_MS,
} from "../../apps/web/lib/hud/success-cue";
import type { BuildingDto } from "@game/shared";

function pen(id: string, readyAt: number | null): BuildingDto {
  return {
    id,
    type: "animal_pen",
    slotIndex: 0,
    x: 0,
    z: 0,
    tier: 1,
    cropState: null,
    cropId: null,
    plantedAt: null,
    readyAt,
    claim: null,
    tutorialNpcId: null,
  };
}

/**
 * PL69.2 — Animal pen ready soft cue (edge into care-ready after cooldown).
 * Brief TopBar `Ready`; cooldown / yields unchanged; mute ok.
 */
describe("CityLands PL69.2 animal pen ready edge soft cue", () => {
  it("flashes Ready when a pen edges into care-ready after cooldown (happy)", () => {
    expect(animalPenReadyEdgeCueText()).toBe(ANIMAL_PEN_READY_EDGE_CUE);
    expect(animalPenReadyEdgeCueText()).toBe("Ready");
    expect(animalPenReadyEdgeCueText()).toBe(CROP_READY_EDGE_CUE);
    expect(isCoreSuccessCueText("Ready")).toBe(true);
    expect(SUCCESS_CUE_MS).toBeGreaterThan(0);
    expect(SUCCESS_CUE_MS).toBeLessThan(5000);

    const prev = new Set<string>();
    const next = new Set(["pen-a"]);
    expect(shouldFlashAnimalPenReadyEdgeCue(prev, next)).toBe(true);

    const now = 10_000;
    const buildings = [
      pen("pen-a", now - 1),
      pen("pen-b", now + ANIMAL_PEN.cooldownMs),
      pen("pen-fresh", null),
    ];
    expect(readyAnimalPenIds(buildings, now)).toEqual(["pen-a"]);
    expect(oreNodeReady(buildings[0]!, now)).toBe(true);
    expect(oreNodeReady(buildings[1]!, now)).toBe(false);
    expect(oreNodeReady(buildings[2]!, now)).toBe(true);
  });

  it("stays quiet on hydrate, never-cared place, same ready set, or clear (edge)", () => {
    expect(shouldFlashAnimalPenReadyEdgeCue(null, new Set(["pen-a"]))).toBe(
      false,
    );
    expect(
      shouldFlashAnimalPenReadyEdgeCue(undefined, new Set(["pen-a"])),
    ).toBe(false);
    expect(
      shouldFlashAnimalPenReadyEdgeCue(
        new Set(["pen-a"]),
        new Set(["pen-a"]),
      ),
    ).toBe(false);
    expect(
      shouldFlashAnimalPenReadyEdgeCue(new Set(["pen-a"]), new Set()),
    ).toBe(false);
    // Never-cared (null readyAt) is not in the ready-edge set.
    expect(readyAnimalPenIds([pen("fresh", null)], 10_000)).toEqual([]);
    // Second pen finishing cooldown while first already ready still flashes once.
    expect(
      shouldFlashAnimalPenReadyEdgeCue(
        new Set(["pen-a"]),
        new Set(["pen-a", "pen-b"]),
      ),
    ).toBe(true);
  });

  it("keeps cooldown / care costs and refuses sticky prose (failure)", () => {
    expect(ANIMAL_PEN.cooldownMs).toBe(45_000);
    expect(ANIMAL_PEN.feedQty).toBe(1);
    expect(ANIMAL_PEN.cleanQty).toBe(1);
    expect(animalPenReadyEdgeCueText()).not.toMatch(/\d/);
    expect(animalPenReadyEdgeCueText()).not.toBe(
      ANIMAL_PEN_COOLDOWN_REFUSE_CUE,
    );
    expect(animalPenReadyEdgeCueText().toLowerCase()).not.toMatch(
      /daily cap|nft|combat|always-on/,
    );
    expect(isCoreSuccessCueText("Ready forever sticky")).toBe(false);
    expect(shouldFlashAnimalPenReadyEdgeCue(new Set(), new Set(["x"]))).toBe(
      true,
    );
    expect(shouldFlashAnimalPenReadyEdgeCue(null, new Set(["x"]))).toBe(false);
  });
});
