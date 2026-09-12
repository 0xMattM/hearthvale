import { describe, expect, it } from "vitest";
import type { BuildingDto } from "@game/shared";
import { nextSlotExpansion } from "@game/shared";
import {
  clientCropState,
  findInteractTarget,
  GRID,
  INTERACT_RANGE,
} from "../../apps/web/components/land-scene/landProximity";

function plot(
  partial: Partial<BuildingDto> & Pick<BuildingDto, "id" | "x" | "z" | "slotIndex">,
): BuildingDto {
  return {
    type: "crop_plot",
    cropState: "empty",
    readyAt: null,
    cropId: null,
    plantedAt: null,
    tier: 1,
    claim: null,
    tutorialNpcId: null,
    ...partial,
  };
}

describe("land proximity", () => {
  it("keeps interact range under half a grid cell", () => {
    expect(INTERACT_RANGE).toBeLessThan(GRID / 2);
  });

  it("finds the nearest building in range", () => {
    const buildings = [
      plot({ id: "a", x: 0, z: 0, slotIndex: 0 }),
      plot({ id: "b", x: 2, z: 0, slotIndex: 1 }),
    ];
    const t = findInteractTarget(buildings, 0.1, 0.1);
    expect(t?.kind).toBe("building");
    if (t?.kind === "building") expect(t.building.id).toBe("a");
  });

  it("returns null when nothing is in interact range", () => {
    const buildings = [plot({ id: "a", x: 0, z: 0, slotIndex: 0 })];
    expect(findInteractTarget(buildings, 10, 10)).toBeNull();
  });

  it("prefers expand pad when it is closer than neighboring buildings", () => {
    const buildings = [
      plot({ id: "a", x: 0, z: -1, slotIndex: 1 }),
      { ...plot({ id: "mill", x: 3, z: -1, slotIndex: 4 }), type: "mill" as const, cropState: null },
    ];
    const next = nextSlotExpansion([1, 4]);
    expect(next).toBeDefined();
    const px = next!.x * GRID;
    const pz = next!.z * GRID;
    const t = findInteractTarget(buildings, px, pz);
    expect(t?.kind).not.toBe("expand");
  });

  it("marks crops ready from readyAt without waiting for poll state", () => {
    const building = plot({
      id: "a",
      x: 0,
      z: 0,
      slotIndex: 0,
      cropState: "planted",
      readyAt: Date.now() - 1000,
    });
    expect(clientCropState(building, Date.now())).toBe("ready");
  });
});
