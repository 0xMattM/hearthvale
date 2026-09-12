import { describe, expect, it } from "vitest";
import { applyAvatarWalkPose, avatarCombatOverlay, avatarWalkPose } from "../../apps/web/lib/avatar-walk";
import type { Group } from "three";

describe("avatar walk pose", () => {
  it("swings opposite legs and arms while walking (happy)", () => {
    const pose = avatarWalkPose(Math.PI / 2, 1, 0);
    expect(pose.leftLegX).toBeGreaterThan(0.4);
    expect(pose.rightLegX).toBe(-pose.leftLegX);
    expect(pose.leftArmX).toBeLessThan(-0.3);
    expect(pose.rightArmX).toBe(-pose.leftArmX);
    expect(pose.bodyY).toBeGreaterThan(0);
  });

  it("settles limbs and still breathes when idle (edge)", () => {
    const rest = avatarWalkPose(1.2, 0, 0);
    expect(Math.abs(rest.leftLegX)).toBeLessThan(0.001);
    expect(Math.abs(rest.leftArmX)).toBeLessThan(0.001);
    const inhale = avatarWalkPose(0, 0, Math.PI / (2 * 2.35));
    const exhale = avatarWalkPose(0, 0, 0);
    expect(inhale.bodyY).not.toBe(exhale.bodyY);
  });

  it("clamps invalid move amp and skips missing groups (failure)", () => {
    const pose = avatarWalkPose(1, Number.NaN, 0);
    expect(pose.leftLegX).toBeCloseTo(0);
    expect(pose.rightLegX).toBeCloseTo(0);
    const dummy = { rotation: { x: 9, z: 9 }, position: { y: 9 } } as unknown as Group;
    applyAvatarWalkPose(pose, { leftLeg: dummy });
    expect(dummy.rotation.x).toBe(0);
    applyAvatarWalkPose(pose, {});
  });
});

describe("avatar combat overlay", () => {
  it("raises a guard pose (happy)", () => {
    const overlay = avatarCombatOverlay(true, 0);
    expect(overlay.leftArmX).toBeLessThan(-0.5);
    expect(overlay.leftArmZ).toBeGreaterThan(0.5);
  });

  it("swings the weapon arm mid-strike (edge)", () => {
    const overlay = avatarCombatOverlay(false, 1);
    expect(overlay.rightArmX).toBeLessThan(-0.8);
  });

  it("adds nothing when idle in a fight (failure)", () => {
    const overlay = avatarCombatOverlay(false, 0);
    expect(overlay.rightArmX).toBeCloseTo(0);
    expect(overlay.leftArmX).toBeCloseTo(0);
  });

  it("lifts the weapon arm while holding a blade (edge)", () => {
    const overlay = avatarCombatOverlay(false, 0, true);
    expect(overlay.rightArmX).toBeLessThan(-0.3);
  });
});
