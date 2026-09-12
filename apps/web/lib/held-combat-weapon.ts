/**
 * In-hand combat silhouettes — club / sword / bow parented to the Hunter hand.
 * Numbers stay visual-only; combat damage still comes from COMBAT_GEAR.
 */

import type { HeldCombatWeaponKind } from "@game/shared";
import {
  Box3,
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  type Object3D,
} from "three";

/** Scene-graph name for the held-weapon group. */
export const HELD_COMBAT_WEAPON_OBJECT = "held_combat_weapon";

export type HeldCombatGrip = "bone" | "kit";

/**
 * Local pose in the parent (Hunter `handR` or kit arm).
 * Bone: Hunter handR +Y is fingers (forward in the combat hold); +Z is world-up.
 * A +90° X rotation stands the blade up in the fist instead of along the ground.
 */
export const HELD_COMBAT_GRIP_POSE: Record<
  HeldCombatGrip,
  { position: [number, number, number]; rotation: [number, number, number]; scale: number }
> = {
  // Reason: isometric camera sits far above; a 1:1 20cm club reads as a speck.
  bone: {
    position: [0.01, 0.06, 0.03],
    rotation: [1.05, 0.35, 0.55],
    scale: 1.15,
  },
  kit: {
    position: [0.04, -0.26, 0.08],
    rotation: [0.2, 0.25, -0.18],
    scale: 1.35,
  },
};

const WOOD = new MeshStandardMaterial({
  color: 0x8a5a28,
  roughness: 0.86,
  metalness: 0.04,
});
const WOOD_DARK = new MeshStandardMaterial({
  color: 0x5c3a1c,
  roughness: 0.9,
  metalness: 0.03,
});
const STEEL = new MeshStandardMaterial({
  color: 0xd0d8e4,
  roughness: 0.28,
  metalness: 0.62,
});
const GOLD = new MeshStandardMaterial({
  color: 0xc4a35a,
  roughness: 0.42,
  metalness: 0.45,
});
const STRING = new MeshStandardMaterial({
  color: 0xf0ebe0,
  roughness: 0.65,
  metalness: 0.02,
});

function mesh(
  geometry: BoxGeometry | CylinderGeometry | SphereGeometry | TorusGeometry,
  material: MeshStandardMaterial,
): Mesh {
  const m = new Mesh(geometry, material);
  m.castShadow = true;
  return m;
}

function addSword(group: Group): void {
  const grip = mesh(new CylinderGeometry(0.02, 0.022, 0.1, 8), WOOD_DARK);
  grip.position.y = 0.05;
  const pommel = mesh(new SphereGeometry(0.024, 7, 5), GOLD);
  pommel.position.y = 0;
  const guard = mesh(new BoxGeometry(0.16, 0.022, 0.036), GOLD);
  guard.position.y = 0.11;
  const blade = mesh(new CylinderGeometry(0.004, 0.018, 0.42, 6), STEEL);
  blade.position.y = 0.33;
  const tip = mesh(new CylinderGeometry(0.001, 0.004, 0.07, 6), STEEL);
  tip.position.y = 0.57;
  group.add(grip, pommel, guard, blade, tip);
}

function addClub(group: Group): void {
  const shaft = mesh(new CylinderGeometry(0.028, 0.04, 0.38, 8), WOOD);
  shaft.position.y = 0.19;
  const head = mesh(new SphereGeometry(0.09, 10, 8), WOOD_DARK);
  head.position.y = 0.42;
  head.scale.set(1.25, 0.88, 1.2);
  group.add(shaft, head);
}

function addBow(group: Group): void {
  const stave = mesh(new TorusGeometry(0.2, 0.016, 6, 16, Math.PI), WOOD);
  stave.rotation.z = Math.PI / 2;
  stave.position.y = 0.2;
  const string = mesh(new CylinderGeometry(0.004, 0.004, 0.4, 5), STRING);
  string.position.set(0.2, 0.2, 0);
  group.add(stave, string);
}

/**
 * Builds a readable held-weapon group (club, sword, or bow).
 *
 * @param kind - Silhouette to draw.
 * @param grip - Bone attach vs kit-arm local pose.
 * @returns Named group ready to parent under a hand / arm.
 */
export function createHeldCombatWeaponGroup(
  kind: HeldCombatWeaponKind,
  grip: HeldCombatGrip = "bone",
): Group {
  const group = new Group();
  group.name = HELD_COMBAT_WEAPON_OBJECT;
  group.userData.kind = kind;
  const pose = HELD_COMBAT_GRIP_POSE[grip];
  group.position.set(...pose.position);
  group.rotation.set(...pose.rotation);
  group.scale.setScalar(pose.scale);

  if (kind === "club") addClub(group);
  else if (kind === "sword") addSword(group);
  else addBow(group);

  return group;
}

/**
 * Axis-aligned size of a held-weapon group (after grip scale/rotation).
 *
 * @param group - Group from {@link createHeldCombatWeaponGroup}.
 * @returns Width/height/depth plus the longest edge.
 */
export function heldCombatWeaponSize(group: Group): {
  x: number;
  y: number;
  z: number;
  longest: number;
} {
  group.updateWorldMatrix(true, true);
  const size = new Box3().setFromObject(group).getSize(new Vector3());
  return {
    x: size.x,
    y: size.y,
    z: size.z,
    longest: Math.max(size.x, size.y, size.z),
  };
}

/**
 * Parents a held-weapon group under `parent`, replacing any previous one.
 *
 * @param parent - Hand / forearm / arm bone (or kit arm group).
 * @param kind - Silhouette to draw.
 * @param grip - Bone attach vs kit-arm local pose.
 * @returns The new group.
 */
export function attachHeldCombatWeapon(
  parent: Object3D,
  kind: HeldCombatWeaponKind,
  grip: HeldCombatGrip = "bone",
): Group {
  detachHeldCombatWeapon(parent);
  const group = createHeldCombatWeaponGroup(kind, grip);
  parent.add(group);
  return group;
}

/**
 * Removes a previously attached held-weapon group.
 *
 * @param parent - Bone or arm group that may hold a weapon.
 */
export function detachHeldCombatWeapon(parent: Object3D): void {
  const existing = parent.getObjectByName(HELD_COMBAT_WEAPON_OBJECT);
  if (!existing) return;
  parent.remove(existing);
  disposeHeldCombatWeaponGroup(existing as Group);
}

/**
 * Frees geometries on a held-weapon group (shared materials stay).
 *
 * @param group - Group from {@link createHeldCombatWeaponGroup}.
 */
export function disposeHeldCombatWeaponGroup(group: Group): void {
  group.traverse((obj) => {
    const m = obj as Mesh;
    if (m.isMesh) m.geometry.dispose();
  });
}
