import { describe, expect, it } from "vitest";
import {
  FOLIAGE_CANOPY,
  FOLIAGE_OCCLUSION,
  foliageCanopyWorld,
  foliageIsOccluding,
  foliageOcclusionIsGhost,
  foliageOcclusionOpacity,
} from "@game/shared";

/** Matches CameraFollow offset (tx+7, 8.2, tz+7). */
function followCam(playerX: number, playerZ: number) {
  return { camX: playerX + 7, camY: 8.2, camZ: playerZ + 7, playerY: 0.5 };
}

describe("foliage occlusion (ghost canopy when player is behind the tree)", () => {
  it("ghosts a canopy on the camera→player sight line (happy)", () => {
    const playerX = 0;
    const playerZ = 0;
    const cam = followCam(playerX, playerZ);
    const sphere = foliageCanopyWorld(3.5, 3.5, 1, FOLIAGE_CANOPY.cityDecor);
    const args = {
      canopyX: sphere.x,
      canopyY: sphere.y,
      canopyZ: sphere.z,
      canopyRadius: sphere.radius,
      playerX,
      playerZ,
      ...cam,
    };
    expect(foliageIsOccluding(args)).toBe(true);
    expect(foliageOcclusionOpacity(args)).toBe(FOLIAGE_OCCLUSION.hiddenOpacity);
    expect(foliageOcclusionIsGhost()).toBe(true);
    expect(FOLIAGE_OCCLUSION.hiddenOpacity).toBeGreaterThan(0);
    expect(FOLIAGE_OCCLUSION.hiddenOpacity).toBeLessThan(
      FOLIAGE_OCCLUSION.opaqueOpacity,
    );
  });

  it("keeps scenery trees and trees beside the player (edge)", () => {
    const plaza = followCam(0.5, 3.2);
    const far = foliageCanopyWorld(15.5, -11.5, 2.1, FOLIAGE_CANOPY.cityDecor);
    expect(
      foliageOcclusionOpacity({
        canopyX: far.x,
        canopyY: far.y,
        canopyZ: far.z,
        canopyRadius: far.radius,
        playerX: 0.5,
        playerZ: 3.2,
        ...plaza,
      }),
    ).toBe(FOLIAGE_OCCLUSION.opaqueOpacity);

    const playerX = 10;
    const playerZ = 10;
    const atFeet = foliageCanopyWorld(10, 10, 2, FOLIAGE_CANOPY.cityDecor);
    expect(
      foliageIsOccluding({
        canopyX: atFeet.x,
        canopyY: atFeet.y,
        canopyZ: atFeet.z,
        canopyRadius: atFeet.radius,
        playerX,
        playerZ,
        ...followCam(playerX, playerZ),
      }),
    ).toBe(false);
  });

  it("stays visible behind the player and on invalid input (failure)", () => {
    const playerX = 0;
    const playerZ = 0;
    const cam = followCam(playerX, playerZ);
    const behind = foliageCanopyWorld(-5, -5, 2, FOLIAGE_CANOPY.cityDecor);
    expect(
      foliageOcclusionOpacity({
        canopyX: behind.x,
        canopyY: behind.y,
        canopyZ: behind.z,
        canopyRadius: behind.radius,
        playerX,
        playerZ,
        ...cam,
      }),
    ).toBe(FOLIAGE_OCCLUSION.opaqueOpacity);

    expect(
      foliageIsOccluding({
        canopyX: Number.NaN,
        canopyY: 2,
        canopyZ: 0,
        canopyRadius: 1,
        playerX: 0,
        playerY: 0.5,
        playerZ: 0,
        camX: 7,
        camY: 8.2,
        camZ: 7,
      }),
    ).toBe(false);

    expect(foliageCanopyWorld(1, 2, Number.NaN, FOLIAGE_CANOPY.forest).radius).toBe(
      FOLIAGE_CANOPY.forest.localRadius,
    );
    expect(FOLIAGE_OCCLUSION.hiddenOpacity).not.toBe(0);
  });
});
