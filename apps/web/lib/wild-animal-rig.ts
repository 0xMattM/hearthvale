import type { Group, Object3D, SkinnedMesh } from "three";

export type WildAnimalGait = "hop" | "trot";

export interface BoneRest {
  x: number;
  y: number;
  z: number;
}

export interface WildAnimalBones {
  spine: Object3D | null;
  spine1: Object3D | null;
  spine2: Object3D | null;
  neck: Object3D | null;
  head: Object3D | null;
  tail: Object3D | null;
  hindHipL: Object3D | null;
  hindHipR: Object3D | null;
  hindUpperL: Object3D | null;
  hindUpperR: Object3D | null;
  hindKneeL: Object3D | null;
  hindKneeR: Object3D | null;
  frontHipL: Object3D | null;
  frontHipR: Object3D | null;
  frontUpperL: Object3D | null;
  frontUpperR: Object3D | null;
  frontKneeL: Object3D | null;
  frontKneeR: Object3D | null;
  earL: Object3D | null;
  earR: Object3D | null;
  rest: Partial<Record<keyof Omit<WildAnimalBones, "rest">, BoneRest>>;
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

function byName(bones: Object3D[], name: string): Object3D | null {
  const want = name.toLowerCase();
  return bones.find((b) => b.name.toLowerCase() === want) ?? null;
}

function snapshot(bone: Object3D | null): BoneRest | undefined {
  if (!bone) return undefined;
  return { x: bone.rotation.x, y: bone.rotation.y, z: bone.rotation.z };
}

function restore(bone: Object3D | null, rest: BoneRest | undefined): void {
  if (!bone || !rest) return;
  bone.rotation.x = rest.x;
  bone.rotation.y = rest.y;
  bone.rotation.z = rest.z;
}

function addZ(bone: Object3D | null, delta: number): void {
  if (!bone || !delta) return;
  bone.rotation.z += delta;
}

/**
 * Locates CraftPix quadruped bones after the FBX clone is fitted.
 *
 * @param root - Cloned animal group.
 */
export function collectWildAnimalBones(root: Group): WildAnimalBones {
  const all = collectSkeletonBones(root);
  const frontLegL = byName(all, "Front_Leg_L");
  const frontRegR = byName(all, "Front_Reg_R");
  const frontShoulderL = byName(all, "Front_Shoulder_L");
  const frontShoulderR = byName(all, "Front_Shoulder_R");
  const frontKneeL = byName(all, "Front_Knee_L");
  const frontKneeR = byName(all, "Front_Knee_R");
  const bones: WildAnimalBones = {
    spine: byName(all, "Spine_rabbot") ?? byName(all, "Spine_boar"),
    spine1: byName(all, "Spine_1"),
    spine2: byName(all, "Spine_2"),
    neck: byName(all, "Neck"),
    head: byName(all, "Head"),
    tail: byName(all, "Tail_1"),
    hindHipL: byName(all, "Hind_Leg_L"),
    hindHipR: byName(all, "Hind_Reg_R"),
    hindUpperL: byName(all, "Hind_Shoulder_L"),
    hindUpperR: byName(all, "Hind_Shoulder_R"),
    hindKneeL: byName(all, "Hind_Knee_L"),
    hindKneeR: byName(all, "Hind_Knee_R"),
    frontHipL: frontLegL ?? frontShoulderL,
    frontHipR: frontRegR ?? frontShoulderR,
    frontUpperL: frontLegL ? frontShoulderL : frontKneeL,
    frontUpperR: frontRegR ? frontShoulderR : frontKneeR,
    frontKneeL: byName(all, "Front_Knee_1_L") ?? frontKneeL,
    frontKneeR: byName(all, "Front_Knee_1_R") ?? frontKneeR,
    earL: byName(all, "Ear_1_L"),
    earR: byName(all, "Ear_1_R"),
    rest: {},
  };
  const keys = Object.keys(bones).filter((k) => k !== "rest") as Array<
    keyof Omit<WildAnimalBones, "rest">
  >;
  for (const key of keys) {
    bones.rest[key] = snapshot(bones[key]);
  }
  return bones;
}

/**
 * Writes bone matrices after procedural rotation.
 *
 * @param root - Cloned animal group.
 */
export function updateWildAnimalSkeletons(root: Group): void {
  root.traverse((obj) => {
    const skinned = obj as SkinnedMesh;
    if (skinned.isSkinnedMesh && skinned.skeleton) skinned.skeleton.update();
  });
}

/**
 * 0 when standing still, 1 at catalog run speed.
 *
 * @param speed - World XZ units per second.
 * @param refSpeed - Kind run speed.
 */
export function wildAnimalGaitAmp(speed: number, refSpeed: number): number {
  if (!(speed > 0.1) || !(refSpeed > 0)) return 0;
  return Math.min(1, speed / refSpeed);
}

const TWO_PI = Math.PI * 2;

/**
 * One hare bound: plant / gather, then a short airborne arc.
 *
 * @param phase - Radians.
 */
export function wildAnimalHopCycle(phase: number): { air: number; gather: number } {
  const t = (((phase % TWO_PI) + TWO_PI) % TWO_PI) / TWO_PI;
  if (t < 0.32) {
    return { air: 0, gather: Math.sin((t / 0.32) * Math.PI) };
  }
  if (t < 0.84) {
    const u = (t - 0.32) / 0.52;
    return { air: 4 * u * (1 - u), gather: 0 };
  }
  const u = (t - 0.84) / 0.16;
  return { air: 0, gather: Math.sin(u * Math.PI) * 0.4 };
}

/**
 * Vertical bound so feet leave the grass (hare) or a tiny walk bob (boar).
 *
 * @param gait - Hop bound vs trot bob.
 * @param phase - Radians.
 * @param amp - 0 idle … 1 full run.
 */
export function wildAnimalHopY(
  gait: WildAnimalGait,
  phase: number,
  amp: number,
): number {
  const a = Math.min(1, Math.max(0, amp));
  if (a <= 0) return 0;
  if (gait === "hop") return wildAnimalHopCycle(phase).air * 0.1 * a;
  return Math.abs(Math.sin(phase)) * 0.014 * a;
}

/**
 * Nose pitch — slight in flight / weight shift, not a full-body flop.
 *
 * @param gait - Hop bound vs trot bob.
 * @param phase - Radians.
 * @param amp - 0 idle … 1 full run.
 */
export function wildAnimalBodyPitch(
  gait: WildAnimalGait,
  phase: number,
  amp: number,
): number {
  const a = Math.min(1, Math.max(0, amp));
  if (gait === "hop") return -0.12 * wildAnimalHopCycle(phase).air * a;
  return Math.sin(phase) * 0.035 * a;
}

/**
 * Disabled: scaling a skinned CraftPix mesh reads as rubber.
 *
 * @param _hopY - Unused; kept so callers can stop stretching.
 */
export function wildAnimalStretch(_hopY: number): { y: number; xz: number } {
  return { y: 1, xz: 1 };
}

function applyHop(bones: WildAnimalBones, phase: number, amp: number): void {
  const { air, gather } = wildAnimalHopCycle(phase);
  const hind = (gather * 0.18 - air * 0.1) * amp;
  const front = (gather * 0.14 + air * 0.08) * amp;
  addZ(bones.hindHipL, hind * 0.45);
  addZ(bones.hindHipR, hind * 0.45);
  addZ(bones.hindUpperL, hind);
  addZ(bones.hindUpperR, hind);
  addZ(bones.hindKneeL, hind * 0.7);
  addZ(bones.hindKneeR, hind * 0.7);
  addZ(bones.frontHipL, front * 0.45);
  addZ(bones.frontHipR, front * 0.45);
  addZ(bones.frontUpperL, front);
  addZ(bones.frontUpperR, front);
  addZ(bones.frontKneeL, front * 0.55);
  addZ(bones.frontKneeR, front * 0.55);
}

function applyTrot(bones: WildAnimalBones, phase: number, amp: number): void {
  const s = Math.sin(phase) * amp;
  const retractL = Math.max(0, -Math.sin(phase)) * amp;
  const retractR = Math.max(0, Math.sin(phase)) * amp;
  addZ(bones.frontHipL, s * 0.16);
  addZ(bones.frontHipR, -s * 0.16);
  addZ(bones.frontUpperL, s * 0.08);
  addZ(bones.frontUpperR, -s * 0.08);
  addZ(bones.frontKneeL, retractL * 0.12);
  addZ(bones.frontKneeR, retractR * 0.12);
  addZ(bones.hindHipL, -s * 0.14);
  addZ(bones.hindHipR, s * 0.14);
  addZ(bones.hindUpperL, -s * 0.08);
  addZ(bones.hindUpperR, s * 0.08);
  addZ(bones.hindKneeL, retractR * 0.12);
  addZ(bones.hindKneeR, retractL * 0.12);
  addZ(bones.spine1, s * 0.03);
}

function applyIdleLife(bones: WildAnimalBones, phase: number, amp: number): void {
  const life = 1 - amp * 0.7;
  addZ(bones.spine1, Math.sin(phase * 0.5) * 0.02 * life);
  addZ(bones.tail, Math.sin(phase * 1.4) * 0.1 * (0.25 + amp * 0.5));
  addZ(bones.earL, Math.sin(phase * 0.7 + 0.5) * 0.045 * life);
  addZ(bones.earR, Math.sin(phase * 0.7) * 0.045 * life);
}

function applyLunge(bones: WildAnimalBones, lunge: number): void {
  addZ(bones.neck, 0.12 * lunge);
  addZ(bones.head, 0.08 * lunge);
  addZ(bones.spine1, -0.06 * lunge);
}

/**
 * Restores bind pose, then applies idle / hop / trot / lunge.
 *
 * @param bones - Collected CraftPix limb refs.
 * @param gait - Hare bound or boar trot.
 * @param phase - Radians.
 * @param amp - 0 idle … 1 full run.
 * @param lunge - 0..1 bite telegraph.
 */
export function applyWildAnimalPose(
  bones: WildAnimalBones,
  gait: WildAnimalGait,
  phase: number,
  amp: number,
  lunge: number,
): void {
  const keys = Object.keys(bones.rest) as Array<keyof Omit<WildAnimalBones, "rest">>;
  for (const key of keys) restore(bones[key], bones.rest[key]);
  const a = Math.min(1, Math.max(0, amp));
  const L = Math.min(1, Math.max(0, lunge));
  if (gait === "hop") applyHop(bones, phase, a);
  else applyTrot(bones, phase, a);
  applyIdleLife(bones, phase, a);
  if (L > 0) applyLunge(bones, L);
}

export interface HuntKitPose {
  hopY: number;
  pitch: number;
  bodyScaleY: number;
  bodyScaleXZ: number;
  frontL: number;
  frontR: number;
  hindL: number;
  hindR: number;
  earFlop: number;
  tail: number;
}

/**
 * Stylized kit locomotion — squash and swinging legs (not skinned FBX).
 *
 * @param gait - Hare bound or boar trot.
 * @param phase - Radians.
 * @param amp - 0 idle … 1 full run.
 * @param lunge - 0..1 bite telegraph.
 */
export function huntKitPose(
  gait: WildAnimalGait,
  phase: number,
  amp: number,
  lunge: number,
): HuntKitPose {
  const a = Math.min(1, Math.max(0, amp));
  const L = Math.min(1, Math.max(0, lunge));
  const life = 1 - a * 0.5;
  const breathe = 1 + Math.sin(phase * 0.55) * 0.035 * life;
  const hopY = wildAnimalHopY(gait, phase, a) * (gait === "hop" ? 1.55 : 1.25);
  const pitch = wildAnimalBodyPitch(gait, phase, a) + L * -0.2;
  if (gait === "hop") {
    const { air, gather } = wildAnimalHopCycle(phase);
    const fold = (gather * 0.9 + air * 0.32) * a;
    const squash = 1 - gather * 0.14 * a + air * 0.1 * a;
    return {
      hopY: hopY + L * 0.05,
      pitch,
      bodyScaleY: squash * breathe,
      bodyScaleXZ: 1 / Math.sqrt(Math.max(0.8, squash)),
      frontL: 0.2 + fold,
      frontR: 0.2 + fold,
      hindL: 0.12 + fold * 1.15,
      hindR: 0.12 + fold * 1.15,
      earFlop: air * 0.55 * a + Math.sin(phase * 0.85) * 0.12 * life,
      tail: Math.sin(phase * 2.4) * 0.4 * (0.35 + a),
    };
  }
  const s = Math.sin(phase) * a;
  return {
    hopY,
    pitch,
    bodyScaleY: breathe,
    bodyScaleXZ: 1,
    frontL: 0.12 + s * 0.62,
    frontR: 0.12 - s * 0.62,
    hindL: 0.08 - s * 0.55,
    hindR: 0.08 + s * 0.55,
    earFlop: 0,
    tail: Math.sin(phase * 2.1) * 0.45 * (0.4 + a),
  };
}
