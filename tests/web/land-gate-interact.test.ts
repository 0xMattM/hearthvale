import { describe, expect, it } from "vitest";
import { homesteadGateWorldZ, PLAYER_LAND_GATE, WORLD } from "@game/shared";
import { findInteractTarget } from "../../apps/web/components/land-scene/landProximity";
import { resolveInteractPrompt } from "../../apps/web/lib/hud/interact-prompt";
import type { BuildingDto } from "@game/shared";

function millAt(x: number, z: number): BuildingDto {
  return {
    id: "mill-1",
    type: "mill",
    slotIndex: 0,
    x,
    z,
    tier: 1,
    cropState: null,
    cropId: null,
    plantedAt: null,
    readyAt: null,
    craft: null,
    claim: null,
    tutorialNpcId: null,
  };
}

/**
 * Yard-exit gate interact — E opens Travel on own player land.
 */
describe("player-land yard gate interact", () => {
  it("targets the gate in range and labels Travel (happy)", () => {
    const t = findInteractTarget([], PLAYER_LAND_GATE.worldX, 6.2, {
      includeLandGate: true,
    });
    expect(t?.kind).toBe("gate");
    expect(
      resolveInteractPrompt({
        target: t,
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toEqual({ label: "Travel", showKey: true });
  });

  it("ignores the gate off own land or while visiting (edge)", () => {
    expect(
      findInteractTarget([], PLAYER_LAND_GATE.worldX, 6.2),
    ).toBeNull();
    expect(
      findInteractTarget([], PLAYER_LAND_GATE.worldX, 6.2, {
        includeLandGate: false,
      }),
    ).toBeNull();
    expect(
      resolveInteractPrompt({
        target: { kind: "gate", dist: 0.4 },
        visiting: true,
        gameNow: 0,
        occupiedSlotIndexes: [],
      }),
    ).toBeNull();
  });

  it("prefers a closer building and ignores a far gate (failure)", () => {
    const buildings = [millAt(0, 0)];
    const nearMill = findInteractTarget(buildings, 0.1, 0.1, {
      includeLandGate: true,
    });
    expect(nearMill?.kind).toBe("building");
    if (nearMill?.kind === "building") expect(nearMill.building.id).toBe("mill-1");

    const far = findInteractTarget(
      [],
      PLAYER_LAND_GATE.worldX,
      PLAYER_LAND_GATE.worldZ - WORLD.INTERACT_RANGE - 0.2,
      { includeLandGate: true },
    );
    expect(far).toBeNull();
  });

  it("uses a farther gate Z on NFT small land (edge)", () => {
    const nftGateZ = homesteadGateWorldZ("small");
    expect(nftGateZ).toBeGreaterThan(PLAYER_LAND_GATE.worldZ);
    const atNftGate = findInteractTarget([], PLAYER_LAND_GATE.worldX, nftGateZ, {
      includeLandGate: true,
      gateWorldZ: nftGateZ,
    });
    expect(atNftGate?.kind).toBe("gate");
    const stillAtStarter = findInteractTarget(
      [],
      PLAYER_LAND_GATE.worldX,
      PLAYER_LAND_GATE.worldZ,
      { includeLandGate: true, gateWorldZ: nftGateZ },
    );
    expect(stillAtStarter).toBeNull();
  });
});
