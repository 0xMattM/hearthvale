import { describe, expect, it } from "vitest";
import {
  CAMERA_FOLLOW_OFFSET_X,
  CAMERA_FOLLOW_OFFSET_Z,
  cameraRelativeWalk,
} from "../../apps/web/lib/camera-relative-walk";

describe("cameraRelativeWalk", () => {
  it("walks up the screen (away from the isometric camera) on W", () => {
    const up = cameraRelativeWalk(0, -1);
    expect(up.dx).toBeCloseTo(-Math.SQRT1_2);
    expect(up.dz).toBeCloseTo(-Math.SQRT1_2);
    expect(Math.hypot(up.dx, up.dz)).toBeCloseTo(1);
    const down = cameraRelativeWalk(0, 1);
    expect(down.dx).toBeCloseTo(-up.dx);
    expect(down.dz).toBeCloseTo(-up.dz);
    expect(CAMERA_FOLLOW_OFFSET_X).toBe(CAMERA_FOLLOW_OFFSET_Z);
  });

  it("keeps W+D as a unit diagonal on screen (edge)", () => {
    const { dx, dz } = cameraRelativeWalk(1, -1);
    expect(Math.hypot(dx, dz)).toBeCloseTo(1);
    // Screen-up + screen-right → world -Z only for this 45° camera.
    expect(dx).toBeCloseTo(0, 5);
    expect(dz).toBeCloseTo(-1, 5);
    const left = cameraRelativeWalk(-1, 0);
    const right = cameraRelativeWalk(1, 0);
    expect(left.dx).toBeCloseTo(-right.dx);
    expect(left.dz).toBeCloseTo(-right.dz);
  });

  it("falls back to world -Z when the camera offset is invalid (failure)", () => {
    const overhead = cameraRelativeWalk(0, -1, 0, 0);
    expect(overhead).toEqual({ dx: 0, dz: -1 });
    const nanCam = cameraRelativeWalk(0, -1, Number.NaN, 7);
    expect(nanCam).toEqual({ dx: 0, dz: -1 });
    const noInput = cameraRelativeWalk(Number.NaN, Number.NaN);
    expect(noInput).toEqual({ dx: 0, dz: 0 });
  });
});
