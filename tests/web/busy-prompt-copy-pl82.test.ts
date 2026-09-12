import { describe, expect, it } from "vitest";
import type { BuildingDto } from "@game/shared";
import { WORLD } from "@game/shared";
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
    x: 1,
    z: 1,
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

/**
 * PL8.2 — Interact prompt names Busy vs Free on scarce city stations.
 * Choice: soft presence detail on city only; action-first hierarchy unchanged.
 */
describe("CityLands PL8.2 busy interact prompt copy", () => {
  it("names Free on open city kitchen and Busy when peer contends (happy)", () => {
    const free = resolveInteractPrompt({
      target: buildingTarget("kitchen", { x: 1, z: 1 }),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
      landKind: "city",
      presenceOthers: [],
    });
    expect(free).toEqual({ label: "Use Kitchen · Free", showKey: true });
    expect(
      buildInteractPromptHierarchy(free!.label, free!.showKey),
    ).toMatchObject({
      keyLabel: "E",
      verb: "Use",
      detail: "Kitchen · Free",
    });

    const busy = resolveInteractPrompt({
      target: buildingTarget("kitchen", { x: 1, z: 1 }),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
      landKind: "city",
      presenceOthers: [{ x: 1 * WORLD.GRID, z: 1 * WORLD.GRID }],
    });
    expect(busy).toEqual({ label: "Use Kitchen · Busy", showKey: true });
    expect(
      buildInteractPromptHierarchy(busy!.label, busy!.showKey).detail,
    ).toMatch(/Busy/);
  });

  it("leaves player-land and explore prompts without Busy/Free tags (edge)", () => {
    const land = resolveInteractPrompt({
      target: buildingTarget("kitchen"),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
      landKind: "player_land",
      presenceOthers: [{ x: 0, z: 0 }],
    });
    expect(land?.label).toBe("Use Kitchen");
    expect(land?.label).not.toMatch(/Busy|Free/);

    const explore = resolveInteractPrompt({
      target: buildingTarget("tree_stump"),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
      landKind: "explore",
      presenceOthers: [{ x: 0, z: 0 }],
    });
    expect(explore?.label).toBe("Woodland · Chop wood");
    expect(explore?.label).not.toMatch(/Busy|Free/);
  });

  it("skips availability tags for city tutors / services (failure)", () => {
    const tutor = resolveInteractPrompt({
      target: buildingTarget("tutorial_npc", {
        tutorialNpcId: "farmer",
      }),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
      landKind: "city",
      presenceOthers: [{ x: 0, z: 0 }],
    });
    expect(tutor?.label).toMatch(/Talk to/);
    expect(tutor?.label).not.toMatch(/Busy|Free/);

    const vendor = resolveInteractPrompt({
      target: buildingTarget("vendor_stall"),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
      landKind: "city",
      presenceOthers: [{ x: 0, z: 0 }],
    });
    expect(vendor?.label).toBe("Vendor Stall");
    expect(vendor?.label).not.toMatch(/Busy|Free/);

    expect(
      resolveInteractPrompt({
        target: null,
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "city",
        presenceOthers: [{ x: 0, z: 0 }],
      }),
    ).toBeNull();
  });
});
