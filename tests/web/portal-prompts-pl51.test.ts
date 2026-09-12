import { describe, expect, it } from "vitest";
import type { BuildingDto, CanonicalLandKind } from "@game/shared";
import {
  formatFreeTravelCircuit,
  freeTravelPortalPrompt,
  LAND_DESTINATIONS,
  warriorArenaExitLabel,
} from "@game/shared";
import { resolveInteractPrompt } from "../../apps/web/lib/hud/interact-prompt";
import { buildInteractPromptHierarchy } from "../../apps/web/lib/hud/interact-prompt-hierarchy";
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
 * PL5.1 — Portal free-travel prompt clarity.
 * “Travel · free” + named circuit; fare-free; no caravan product rule.
 */
describe("CityLands PL5.1 portal free-travel prompt clarity", () => {
  it("names Travel · free + full four-map circuit on city/land/explore (happy)", () => {
    const circuit = formatFreeTravelCircuit();
    expect(LAND_DESTINATIONS.map((d) => d.kind)).toEqual(FOUR);
    expect(circuit).toContain("City");
    expect(circuit).toContain("Your Land");
    expect(circuit).toContain("Exploration");
    expect(circuit).toContain("Warrior Arena");

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
      expect(prompt!.label.toLowerCase()).not.toMatch(/fare|caravan|coins|45\s*s/);

      const hierarchy = buildInteractPromptHierarchy(
        prompt!.label,
        prompt!.showKey,
      );
      expect(hierarchy.verb).toBe("Travel");
      expect(hierarchy.detail.toLowerCase()).toMatch(/^free/);
      expect(hierarchy.detail).toContain(circuit);
    }
  });

  it("warrior portal keeps Exit + N while Travel · free leads the action (edge)", () => {
    const warrior = resolveInteractPrompt({
      target: buildingTarget("portal"),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
      landKind: "warrior",
    });
    expect(warrior?.label).toBe(freeTravelPortalPrompt("warrior"));
    expect(warrior?.label).toMatch(/^Exit · Travel · free \(N\) ·/);
    expect(warrior?.label).toMatch(/\bN\b/);
    expect(warriorArenaExitLabel()).toMatch(/Travel · free/);

    const hierarchy = buildInteractPromptHierarchy(
      warrior!.label,
      warrior!.showKey,
    );
    expect(hierarchy.prefix).toBe("Exit");
    expect(hierarchy.verb).toBe("Travel");
    expect(hierarchy.detail.toLowerCase()).toMatch(/^free/);

    for (const kind of ["city", "player_land", "explore"] as const) {
      const label = freeTravelPortalPrompt(kind);
      expect(label).toMatch(/^Travel · free ·/);
      expect(label).not.toMatch(/^Exit/);
    }
  });

  it("rejects caravan/fare language and null without a portal (failure)", () => {
    for (const kind of FOUR) {
      const label = freeTravelPortalPrompt(kind);
      expect(label.toLowerCase()).not.toMatch(/caravan|fare|road time|15\s*coins/);
    }
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
