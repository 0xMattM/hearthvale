import { describe, expect, it } from "vitest";
import {
  Bone,
  BoxGeometry,
  Group,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
} from "three";
import {
  applyWildAnimalPose,
  collectWildAnimalBones,
  huntKitPose,
  updateWildAnimalSkeletons,
  wildAnimalGaitAmp,
  wildAnimalHopY,
  wildAnimalStretch,
} from "../../apps/web/lib/wild-animal-rig";

function makeRabbitRoot() {
  const root = new Group();
  const spine = new Bone();
  spine.name = "Spine_rabbot";
  const hindUpperL = new Bone();
  hindUpperL.name = "Hind_Shoulder_L";
  hindUpperL.rotation.z = -1.4;
  const hindUpperR = new Bone();
  hindUpperR.name = "Hind_Shoulder_R";
  hindUpperR.rotation.z = -1.4;
  const neck = new Bone();
  neck.name = "Neck";
  spine.add(hindUpperL, hindUpperR, neck);
  const skeleton = new Skeleton([spine, hindUpperL, hindUpperR, neck]);
  const mesh = new SkinnedMesh(
    new BoxGeometry(1, 1, 1),
    new MeshStandardMaterial(),
  );
  mesh.add(spine);
  mesh.bind(skeleton);
  root.add(mesh);
  return { root, hindUpperL, neck };
}

describe("wild animal locomotion", () => {
  it("plants then bounds the hare; boar only bobs (happy)", () => {
    expect(wildAnimalHopY("hop", Math.PI, 1)).toBeGreaterThan(0.05);
    expect(wildAnimalHopY("hop", Math.PI, 1)).toBeLessThan(0.14);
    expect(wildAnimalHopY("trot", Math.PI / 2, 1)).toBeGreaterThan(0.008);
    expect(wildAnimalHopY("trot", Math.PI / 2, 1)).toBeLessThan(0.02);
    expect(wildAnimalGaitAmp(1.35, 1.35)).toBe(1);
    expect(wildAnimalStretch(0.2)).toEqual({ y: 1, xz: 1 });
    const { root, hindUpperL } = makeRabbitRoot();
    const bones = collectWildAnimalBones(root);
    applyWildAnimalPose(bones, "hop", Math.PI, 1, 0);
    expect(hindUpperL.rotation.z).not.toBeCloseTo(bones.rest.hindUpperL!.z, 3);
    const kit = huntKitPose("hop", Math.PI, 1, 0);
    expect(kit.hopY).toBeGreaterThan(0.07);
    expect(kit.bodyScaleY).not.toBe(1);
    updateWildAnimalSkeletons(root);
  });

  it("idles with no hop and restores bind legs (edge)", () => {
    expect(wildAnimalHopY("hop", Math.PI / 2, 0)).toBe(0);
    expect(wildAnimalHopY("hop", 0, 1)).toBe(0);
    expect(huntKitPose("hop", 0, 0, 0).hopY).toBe(0);
    expect(wildAnimalGaitAmp(0.05, 1.35)).toBe(0);
    const { root, hindUpperL } = makeRabbitRoot();
    const bones = collectWildAnimalBones(root);
    const restZ = hindUpperL.rotation.z;
    applyWildAnimalPose(bones, "hop", Math.PI / 2, 1, 0);
    applyWildAnimalPose(bones, "hop", 0, 0, 0);
    expect(hindUpperL.rotation.z).toBeCloseTo(restZ, 3);
  });

  it("ignores missing bones, clamps speed, and lunges the neck (failure)", () => {
    expect(wildAnimalGaitAmp(40, 1.1)).toBe(1);
    expect(wildAnimalGaitAmp(-2, 1.35)).toBe(0);
    expect(wildAnimalHopY("hop", 0, 1)).toBe(0);
    const empty = new Group();
    const bones = collectWildAnimalBones(empty);
    expect(() => applyWildAnimalPose(bones, "trot", 1, 1, 1)).not.toThrow();
    const { root, neck } = makeRabbitRoot();
    const rig = collectWildAnimalBones(root);
    applyWildAnimalPose(rig, "hop", 0, 0, 1);
    expect(neck.rotation.z).toBeGreaterThan(rig.rest.neck!.z);
    expect(huntKitPose("trot", 1, 1, 1).pitch).toBeLessThan(
      huntKitPose("trot", 1, 1, 0).pitch,
    );
  });
});
