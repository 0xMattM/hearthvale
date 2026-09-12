import type { Group, Object3D, SkinnedMesh } from "three";

const SHOULDER_L = ["shoulderl", "shoulder_l", "shoulder.l"];
const SHOULDER_R = ["shoulderr", "shoulder_r", "shoulder.r"];
const ARM_L = ["upper_arml", "upperarm_l", "upper_arm.l", "leftarm", "arm_l"];
const ARM_R = ["upper_armr", "upperarm_r", "upper_arm.r", "rightarm", "arm_r"];
const FOREARM_R = ["forearmr", "forearm.r", "forearm_r", "lowerarm_r", "rightforearm"];
const HAND_R = ["handr", "hand.r", "hand_r", "righthand"];
const LEG_L = ["thighl", "thigh_l", "thigh.l", "leg_l"];
const LEG_R = ["thighr", "thigh_r", "thigh.r", "leg_r"];

/** Shoulder pitch + partial upper-arm roll — arms hang angled, visible outside torso. */
const SHOULDER_DROP_X = 0.28;
const ARM_Z_FACTOR = 0.36;

function findBone(candidates: Object3D[], names: string[]): Object3D | null {
  for (const obj of candidates) {
    const n = obj.name.toLowerCase();
    if (names.some((frag) => n.includes(frag.toLowerCase()))) return obj;
  }
  return null;
}

function collectSkeletonBones(root: Group): Object3D[] {
  const bones: Object3D[] = [];
  const seen = new Set<Object3D>();
  root.traverse((obj) => {
    const skinned = obj as SkinnedMesh;
    if (!skinned.isSkinnedMesh || !skinned.skeleton) return;
    for (const bone of skinned.skeleton.bones) {
      if (seen.has(bone)) continue;
      seen.add(bone);
      bones.push(bone);
    }
  });
  return bones;
}

/**
 * Refreshes skinned meshes after manual bone rotations.
 */
export function updateVillagerSkeletons(root: Group): void {
  root.traverse((obj) => {
    const skinned = obj as SkinnedMesh;
    if (skinned.isSkinnedMesh && skinned.skeleton) {
      skinned.skeleton.update();
    }
  });
}

/**
 * Drops T-pose arms to a natural hang (angled, not straight into the torso).
 */
export function applyVillagerRestPose(root: Group): void {
  const bones = collectSkeletonBones(root);
  const shoulderL = findBone(bones, SHOULDER_L);
  const shoulderR = findBone(bones, SHOULDER_R);
  const armL = findBone(bones, ARM_L);
  const armR = findBone(bones, ARM_R);

  if (shoulderL) shoulderL.rotation.x -= SHOULDER_DROP_X;
  if (shoulderR) shoulderR.rotation.x -= SHOULDER_DROP_X;
  if (armL) armL.rotation.z -= ARM_Z_FACTOR * Math.PI;
  if (armR) armR.rotation.z += ARM_Z_FACTOR * Math.PI;
  updateVillagerSkeletons(root);
}

export interface VillagerBoneRest {
  x: number;
  y: number;
  z: number;
}

export interface VillagerBoneRefs {
  shoulderL: Object3D | null;
  shoulderR: Object3D | null;
  armL: Object3D | null;
  armR: Object3D | null;
  forearmR: Object3D | null;
  handR: Object3D | null;
  legL: Object3D | null;
  legR: Object3D | null;
  rest: {
    shoulderL?: VillagerBoneRest;
    shoulderR?: VillagerBoneRest;
    armL?: VillagerBoneRest;
    armR?: VillagerBoneRest;
    legL?: VillagerBoneRest;
    legR?: VillagerBoneRest;
  };
}

function snapshotRest(bone: Object3D | null): VillagerBoneRest | undefined {
  if (!bone) return undefined;
  return { x: bone.rotation.x, y: bone.rotation.y, z: bone.rotation.z };
}

/**
 * Collects limb bones after rest pose for procedural walk.
 */
export function collectVillagerBones(root: Group): VillagerBoneRefs {
  const bones = collectSkeletonBones(root);
  const shoulderL = findBone(bones, SHOULDER_L);
  const shoulderR = findBone(bones, SHOULDER_R);
  const armL = findBone(bones, ARM_L);
  const armR = findBone(bones, ARM_R);
  const forearmR = findBone(bones, FOREARM_R);
  const handR = findBone(bones, HAND_R);
  const legL = findBone(bones, LEG_L);
  const legR = findBone(bones, LEG_R);
  return {
    shoulderL,
    shoulderR,
    armL,
    armR,
    forearmR,
    handR,
    legL,
    legR,
    rest: {
      shoulderL: snapshotRest(shoulderL),
      shoulderR: snapshotRest(shoulderR),
      armL: snapshotRest(armL),
      armR: snapshotRest(armR),
      legL: snapshotRest(legL),
      legR: snapshotRest(legR),
    },
  };
}

/**
 * Shoulder pitch swings forward/back; legs swing opposite arms.
 */
export function applyVillagerWalkPose(
  bones: VillagerBoneRefs,
  phase: number,
  amp: number,
): void {
  const shoulderSwing = Math.sin(phase) * 0.3 * amp;
  const legSwing = Math.sin(phase) * 0.22 * amp;

  if (bones.shoulderL && bones.rest.shoulderL) {
    bones.shoulderL.rotation.x = bones.rest.shoulderL.x + shoulderSwing;
  }
  if (bones.shoulderR && bones.rest.shoulderR) {
    bones.shoulderR.rotation.x = bones.rest.shoulderR.x - shoulderSwing;
  }
  if (bones.legL && bones.rest.legL) {
    bones.legL.rotation.x = bones.rest.legL.x - legSwing;
  }
  if (bones.legR && bones.rest.legR) {
    bones.legR.rotation.x = bones.rest.legR.x + legSwing;
  }
}

/**
 * Hold rest pose while idle.
 */
export function applyVillagerIdlePose(bones: VillagerBoneRefs): void {
  if (bones.shoulderL && bones.rest.shoulderL) {
    bones.shoulderL.rotation.x = bones.rest.shoulderL.x;
    bones.shoulderL.rotation.y = bones.rest.shoulderL.y;
    bones.shoulderL.rotation.z = bones.rest.shoulderL.z;
  }
  if (bones.shoulderR && bones.rest.shoulderR) {
    bones.shoulderR.rotation.x = bones.rest.shoulderR.x;
    bones.shoulderR.rotation.y = bones.rest.shoulderR.y;
    bones.shoulderR.rotation.z = bones.rest.shoulderR.z;
  }
  if (bones.armL && bones.rest.armL) {
    bones.armL.rotation.x = bones.rest.armL.x;
    bones.armL.rotation.y = bones.rest.armL.y;
    bones.armL.rotation.z = bones.rest.armL.z;
  }
  if (bones.armR && bones.rest.armR) {
    bones.armR.rotation.x = bones.rest.armR.x;
    bones.armR.rotation.y = bones.rest.armR.y;
    bones.armR.rotation.z = bones.rest.armR.z;
  }
  if (bones.legL && bones.rest.legL) {
    bones.legL.rotation.x = bones.rest.legL.x;
    bones.legL.rotation.y = bones.rest.legL.y;
    bones.legL.rotation.z = bones.rest.legL.z;
  }
  if (bones.legR && bones.rest.legR) {
    bones.legR.rotation.x = bones.rest.legR.x;
    bones.legR.rotation.y = bones.rest.legR.y;
    bones.legR.rotation.z = bones.rest.legR.z;
  }
}

/**
 * Readable melee overlay on the Hunter FBX (walk/idle still drive legs).
 * A held weapon keeps a chest-high ready pose so the blade is not on the ground.
 *
 * @param bones - Collected limb refs.
 * @param swingT - 1 just clicked … 0 finished.
 * @param guarding - True while RMB guard is held.
 * @param holdingWeapon - True when a combat weapon mesh is shown.
 */
export function applyVillagerCombatOverlay(
  bones: VillagerBoneRefs,
  swingT: number,
  guarding: boolean,
  holdingWeapon = false,
): void {
  const swing = Math.min(1, Math.max(0, swingT));
  if (guarding) {
    if (bones.shoulderL && bones.rest.shoulderL) {
      bones.shoulderL.rotation.x = bones.rest.shoulderL.x - 0.55;
    }
    if (bones.shoulderR && bones.rest.shoulderR) {
      bones.shoulderR.rotation.x = bones.rest.shoulderR.x - 0.7;
    }
    if (bones.armL && bones.rest.armL) {
      bones.armL.rotation.x = bones.rest.armL.x - 0.45;
    }
    if (bones.armR && bones.rest.armR) {
      bones.armR.rotation.x = bones.rest.armR.x - 0.35;
    }
    return;
  }

  if (swing <= 0) {
    if (!holdingWeapon) return;
    applyWeaponHold(bones);
    return;
  }

  const chop = Math.sin(swing * Math.PI);
  const hold = holdingWeapon ? 1 : 0;
  if (bones.shoulderR && bones.rest.shoulderR) {
    bones.shoulderR.rotation.x =
      bones.rest.shoulderR.x - 0.55 * hold - (holdingWeapon ? 0.7 : 1.45) * chop;
    bones.shoulderR.rotation.z =
      bones.rest.shoulderR.z - 0.12 * hold - 0.35 * chop;
  }
  if (bones.armR && bones.rest.armR) {
    bones.armR.rotation.x =
      bones.rest.armR.x - 0.22 * hold - (holdingWeapon ? 0.55 : 0.95) * chop;
    bones.armR.rotation.z =
      bones.rest.armR.z + 0.15 * hold + 0.55 * chop;
  }
  if (bones.shoulderL && bones.rest.shoulderL) {
    bones.shoulderL.rotation.x = bones.rest.shoulderL.x + 0.22 * chop;
  }
}

/**
 * Chest-high right-arm ready pose so a held blade sits in front of the torso.
 *
 * @param bones - Collected limb refs with rest snapshots.
 */
function applyWeaponHold(bones: VillagerBoneRefs): void {
  if (bones.shoulderR && bones.rest.shoulderR) {
    bones.shoulderR.rotation.x = bones.rest.shoulderR.x - 0.55;
    bones.shoulderR.rotation.z = bones.rest.shoulderR.z - 0.12;
  }
  if (bones.armR && bones.rest.armR) {
    bones.armR.rotation.x = bones.rest.armR.x - 0.22;
    bones.armR.rotation.z = bones.rest.armR.z + 0.15;
  }
}

/**
 * Right-hand bone for a held combat mesh (hand, else forearm, else upper arm).
 *
 * @param bones - Collected Hunter limb refs.
 * @returns Parent bone, or null when the rig has no right arm.
 */
export function villagerHeldWeaponBone(
  bones: VillagerBoneRefs,
): Object3D | null {
  return bones.handR ?? bones.forearmR ?? bones.armR;
}
