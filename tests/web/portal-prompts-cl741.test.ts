import { describe, expect, it } from "vitest";
import type { BuildingDto, CanonicalLandKind } from "@game/shared";
import {
  formatFreeTravelCircuit,
  freeTravelPortalPrompt,
  LAND_DESTINATIONS,
} from "@game/shared";
import { resolveInteractPrompt } from "../../apps/web/lib/hud/interact-prompt";
import type { InteractTarget } from "../../apps/web/components/land-scene/landProximity";

function building(
  type: BuildingDto["type"],
  extra: Partial<BuildingDto> = {},
): BuildingDto {
  return {
    id: "b1",
    type,
    slotIndex: 0,
    x: 0,
    z: 0,
    tier: 1,
    cropState: null,
    cropId: null,
    plantedAt: null,
    readyAt: null,
    claim: null,
    tutorialNpcId: null,
    ...extra,
  };
}

function buildingTarget(
  type: BuildingDto["type"],
  extra: Partial<BuildingDto> = {},
): InteractTarget {
  return { kind: "building", dist: 1, building: building(type, extra) };
}

const FOUR: CanonicalLandKind[] = [
  "city",
  "player_land",
  "explore",
  "warrior",
];

/**
 * CL74.1 — Portal free-travel prompts still green.
 * Choice: assert-only Free travel · circuit + warrior Exit · N (parity with CL54.1; no invent).
 */
describe("CityLands CL74.1 portal free-travel prompts still green", () => {
  it("labels portal Free travel + full circuit on city/land/explore (happy)", () => {
    const circuit = formatFreeTravelCircuit();
    expect(circuit).toContain("City");
    expect(circuit).toContain("Your Land");
    expect(circuit).toContain("Exploration");
    expect(circuit).toContain("Warrior Arena");
    expect(LAND_DESTINATIONS.map((d) => d.kind)).toEqual(FOUR);

    for (const kind of ["city", "player_land", "explore"] as const) {
      const prompt = resolveInteractPrompt({
        target: buildingTarget("portal"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: kind,
      });
      expect(prompt?.showKey).toBe(true);
      expect(prompt?.label).toBe(freeTravelPortalPrompt(kind));
      expect(prompt!.label).toMatch(/^Travel · free ·/);
      expect(prompt!.label).toContain(circuit);
      expect(prompt!.label.toLowerCase()).not.toMatch(/fare|caravan|coins/);
    }
  });

  it("warrior portal stresses Exit + N while others stay Free travel (edge)", () => {
    const warrior = resolveInteractPrompt({
      target: buildingTarget("portal"),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
      landKind: "warrior",
    });
    expect(warrior?.label).toMatch(/^Exit · Travel · free/);
    expect(warrior?.label).toMatch(/\bN\b/);
    expect(warrior?.label).toBe(freeTravelPortalPrompt("warrior"));

    for (const kind of ["city", "player_land", "explore"] as const) {
      const label = resolveInteractPrompt({
        target: buildingTarget("portal"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: kind,
      })?.label;
      expect(label).toMatch(/^Travel · free ·/);
      expect(label).not.toMatch(/^Exit · Travel · free/);
    }
  });

  it("returns null without a portal target (failure)", () => {
    expect(
      resolveInteractPrompt({
        target: null,
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "city",
      }),
    ).toBeNull();
  });
});
