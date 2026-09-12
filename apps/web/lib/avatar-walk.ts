/**
 * Farmer-kit walk / idle pose — hip-pivoted limbs, opposite arm swing, body bob.
 */

import type { Group } from "three";

export interface AvatarWalkPose {
  leftLegX: number;
  rightLegX: number;
  leftArmX: number;
  rightArmX: number;
  leftArmZ: number;
  rightArmZ: number;
  bodyY: number;
  torsoYaw: number;
}

const REST_ARM_Z = 0.3;
const LEG_SWING = 0.62;
const ARM_SWING = 0.52;
const BOB = 0.032;
const BREATHE = 0.016;
const TORSO_YAW = 0.09;

/**
 * Computes a readable walk cycle (or idle settle) for kit limb groups.
 *
 * @param phase - Walk oscillator in radians.
 * @param moveAmp - 0 idle … 1 full walk (lerp this in the frame loop).
 * @param idleTime - Seconds for breathing when standing.
 * @returns Euler offsets for hip/shoulder groups plus body bob.
 */
export function avatarWalkPose(
  phase: number,
  moveAmp: number,
  idleTime: number,
): AvatarWalkPose {
  const amp = clamp01(moveAmp);
  const swing = Math.sin(phase) * LEG_SWING * amp;
  const armSwing = Math.sin(phase) * ARM_SWING * amp;
  const bob = (1 - Math.cos(phase * 2)) * 0.5 * BOB * amp;
  const idle = 1 - amp;
  const breathe = Math.sin(idleTime * 2.35) * BREATHE * (0.2 + idle * 0.8);
  const armIdle = Math.sin(idleTime * 1.55) * 0.025 * idle;
  return {
    leftLegX: swing,
    rightLegX: -swing,
    leftArmX: -armSwing,
    rightArmX: armSwing,
    leftArmZ: REST_ARM_Z + armIdle,
    rightArmZ: -REST_ARM_Z - armIdle,
    bodyY: bob + breathe,
    torsoYaw: Math.sin(phase) * TORSO_YAW * amp,
  };
}

/**
 * Overlay swing / guard on top of the walk cycle during a live fight.
 *
 * @param guarding - True while RMB guard is open.
 * @param swingT - 0..1 remaining of a strike (1 = just clicked).
 * @param holdingWeapon - True when a combat weapon mesh is shown.
 * @returns Arm / torso offsets to add to a walk pose.
 */
export function avatarCombatOverlay(
  guarding: boolean,
  swingT: number,
  holdingWeapon = false,
): Pick<AvatarWalkPose, "leftArmX" | "rightArmX" | "leftArmZ" | "torsoYaw"> {
  const swing = Math.min(1, Math.max(0, swingT));
  if (guarding) {
    return {
      leftArmX: -0.85,
      rightArmX: -0.35,
      leftArmZ: 0.95,
      torsoYaw: -0.18,
    };
  }
  const hold = holdingWeapon ? 1 : 0;
  return {
    leftArmX: 0,
    rightArmX: -0.5 * hold - 1.15 * swing,
    leftArmZ: 0,
    torsoYaw: 0.08 * hold + 0.22 * swing,
  };
}

/**
 * Writes a pose onto kit pivot groups (no-ops missing refs).
 *
 * @param pose - Output of `avatarWalkPose`.
 * @param parts - Limb / body groups from the farmer kit.
 */
export function applyAvatarWalkPose(
  pose: AvatarWalkPose,
  parts: {
    leftLeg?: Group | null;
    rightLeg?: Group | null;
    leftArm?: Group | null;
    rightArm?: Group | null;
    body?: Group | null;
    torso?: Group | null;
  },
): void {
  if (parts.leftLeg) parts.leftLeg.rotation.x = pose.leftLegX;
  if (parts.rightLeg) parts.rightLeg.rotation.x = pose.rightLegX;
  if (parts.leftArm) {
    parts.leftArm.rotation.x = pose.leftArmX;
    parts.leftArm.rotation.z = pose.leftArmZ;
  }
  if (parts.rightArm) {
    parts.rightArm.rotation.x = pose.rightArmX;
    parts.rightArm.rotation.z = pose.rightArmZ;
  }
  if (parts.body) parts.body.position.y = pose.bodyY;
  if (parts.torso) parts.torso.rotation.y = pose.torsoYaw;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n <= 0) return 0;
  if (n >= 1) return 1;
  return n;
}
