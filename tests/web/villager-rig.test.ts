import { describe, expect, it } from "vitest";
import {
  applyVillagerCombatOverlay,
  applyVillagerIdlePose,
  applyVillagerRestPose,
  applyVillagerWalkPose,
  collectVillagerBones,
  updateVillagerSkeletons,
  villagerHeldWeaponBone,
} from "../../apps/web/lib/villager-rig";
import {
  Bone,
  Group,
  Skeleton,
  SkinnedMesh,
  BoxGeometry,
  MeshStandardMaterial,
} from "three";

function makeSkinnedRoot() {
  const root = new Group();
  const shoulderL = new Bone();
  shoulderL.name = "shoulderL";
  const shoulderR = new Bone();
  shoulderR.name = "shoulderR";
  const armL = new Bone();
  armL.name = "upper_armL";
  const armR = new Bone();
  armR.name = "upper_armR";
  const forearmR = new Bone();
  forearmR.name = "forearm.R";
  const handR = new Bone();
  handR.name = "hand.R";
  const thighL = new Bone();
  thighL.name = "thighL";
  thighL.rotation.x = 2.885;
  shoulderL.add(armL);
  shoulderR.add(armR);
  armR.add(forearmR);
  forearmR.add(handR);
  root.add(shoulderL, shoulderR, thighL);
  const skeleton = new Skeleton([
    shoulderL,
    shoulderR,
    armL,
    armR,
    forearmR,
    handR,
    thighL,
  ]);
  const mesh = new SkinnedMesh(
    new BoxGeometry(1, 1, 1),
    new MeshStandardMaterial(),
  );
  mesh.add(shoulderL, shoulderR, thighL);
  mesh.bind(skeleton);
  root.add(mesh);
  return root;
}

describe("villager rig", () => {
  it("angles arms from T-pose without side yaw (happy)", () => {
    const root = makeSkinnedRoot();
    applyVillagerRestPose(root);
    const shoulderL = root.getObjectByName("shoulderL");
    const armL = root.getObjectByName("upper_armL");
    expect(shoulderL?.rotation.x).toBeCloseTo(-0.28, 2);
    expect(armL?.rotation.y).toBeCloseTo(0, 2);
    expect(armL?.rotation.z).toBeCloseTo(-0.36 * Math.PI, 2);
  });

  it("swings shoulders forward/back opposite legs (edge)", () => {
    const root = makeSkinnedRoot();
    applyVillagerRestPose(root);
    const bones = collectVillagerBones(root);
    applyVillagerWalkPose(bones, Math.PI / 2, 1);
    expect(bones.shoulderL?.rotation.x).toBeGreaterThan(bones.rest.shoulderL!.x);
    expect(bones.legL?.rotation.x).toBeLessThan(bones.rest.legL!.x);
    expect(bones.armL?.rotation.x).toBeCloseTo(bones.rest.armL!.x, 3);
    applyVillagerIdlePose(bones);
    expect(bones.shoulderL?.rotation.x).toBeCloseTo(bones.rest.shoulderL!.x, 3);
  });

  it("chops the right arm on a melee swing (edge)", () => {
    const root = makeSkinnedRoot();
    applyVillagerRestPose(root);
    const bones = collectVillagerBones(root);
    applyVillagerIdlePose(bones);
    applyVillagerCombatOverlay(bones, 0.5, false);
    expect(bones.shoulderR?.rotation.x).toBeLessThan(bones.rest.shoulderR!.x);
    applyVillagerCombatOverlay(bones, 0, true);
    expect(bones.shoulderL?.rotation.x).toBeLessThan(bones.rest.shoulderL!.x);
    expect(villagerHeldWeaponBone(bones)?.name).toBe("hand.R");
    applyVillagerIdlePose(bones);
    applyVillagerCombatOverlay(bones, 0, false, true);
    expect(bones.shoulderR?.rotation.x).toBeLessThan(bones.rest.shoulderR!.x);
  });

  it("ignores missing bones safely (failure)", () => {
    const root = new Group();
    expect(() => {
      applyVillagerRestPose(root);
      updateVillagerSkeletons(root);
    }).not.toThrow();
    expect(villagerHeldWeaponBone(collectVillagerBones(root))).toBeNull();
  });
});
