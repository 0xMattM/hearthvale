import { describe, expect, it } from "vitest";
import type { BuildingDto } from "@game/shared";
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

/**
 * PL1.3 — Walk-up prompt meaning unchanged after service silhouette kits.
 */
describe("CityLands PL1.3 service walk-up prompts", () => {
  it("keeps vendor / market / notice prompt copy (happy)", () => {
    expect(
      resolveInteractPrompt({
        target: buildingTarget("vendor_stall"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toEqual({ label: "Vendor Stall", showKey: true });

    expect(
      resolveInteractPrompt({
        target: buildingTarget("market_board"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toEqual({ label: "City Market Board", showKey: true });

    expect(
      resolveInteractPrompt({
        target: buildingTarget("notice_board"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toEqual({ label: "City notice board", showKey: true });
  });

  it("hides interact key at their vendor while visiting (edge)", () => {
    expect(
      resolveInteractPrompt({
        target: buildingTarget("vendor_stall"),
        visiting: true,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toEqual({ label: "Their Vendor Stall", showKey: false });
  });

  it("returns null with no target (failure)", () => {
    expect(
      resolveInteractPrompt({
        target: null,
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toBeNull();
  });
});
