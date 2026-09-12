import { describe, expect, it } from "vitest";
import type { BuildingDto } from "@game/shared";
import { resolveInteractPrompt } from "../../apps/web/lib/hud/interact-prompt";
import type { InteractTarget } from "../../apps/web/components/land-scene/landProximity";

function building(
  extra: Partial<BuildingDto> = {},
): BuildingDto {
  return {
    id: "d1",
    type: "fishing_dock",
    slotIndex: 27,
    x: 8,
    z: 11,
    tier: 1,
    cropState: null,
    cropId: null,
    plantedAt: null,
    readyAt: null,
    claim: null,
    tutorialNpcId: null,
    craft: null,
    ...extra,
  };
}

function target(extra: Partial<BuildingDto> = {}): InteractTarget {
  return { kind: "building", dist: 1, building: building(extra) };
}

/**
 * City river fishing spot interact copy — catch from the bank, not a pier.
 */
describe("city river fishing interact prompt", () => {
  it("keeps Catch fish on the city river spot (happy)", () => {
    expect(
      resolveInteractPrompt({
        target: target(),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "city",
      }),
    ).toEqual({ label: "Catch fish · Free", showKey: true });
  });

  it("says River settling on city cooldown; Dock settling on land (edge)", () => {
    const cooling = { readyAt: 5_000 };
    expect(
      resolveInteractPrompt({
        target: target(cooling),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "city",
      }),
    ).toEqual({ label: "River settling · 5s · Free", showKey: false });
    expect(
      resolveInteractPrompt({
        target: target(cooling),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "player_land",
      }),
    ).toEqual({ label: "Dock settling · 5s", showKey: false });
  });

  it("does not expose a pier prompt while visiting city (failure)", () => {
    expect(
      resolveInteractPrompt({
        target: target(),
        visiting: true,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "city",
      }),
    ).toEqual({ label: "Their Fishing Dock", showKey: false });
    expect(
      resolveInteractPrompt({
        target: target(),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: "city",
      })?.label.toLowerCase(),
    ).not.toContain("pier");
  });
});
