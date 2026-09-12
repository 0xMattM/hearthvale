import { CITY_BUILDINGS } from "./catalog-layouts.js";

/**
 * Idle yaw so a tutor faces a grid cell (player convention: 0 faces +Z).
 *
 * @param fromX - Tutor grid X.
 * @param fromZ - Tutor grid Z.
 * @param toX - Look-at grid X.
 * @param toZ - Look-at grid Z.
 * @returns Radians, or 0 when from === to.
 */
export function cityTutorFaceYaw(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
): number {
  const dx = toX - fromX;
  const dz = toZ - fromZ;
  if (Math.abs(dx) < 1e-6 && Math.abs(dz) < 1e-6) return 0;
  return Math.atan2(dx, dz);
}

/**
 * Idle yaw per city walk-up NPC (radians, 0 faces +Z).
 * Values are spaced so nobody shares a facing with a neighbor.
 */
const CITY_TUTOR_YAW: Readonly<Record<string, number>> = {
  // Plaza / fountain cluster — conversation + basin.
  mayor: cityTutorFaceYaw(1, -4, 0, 0),
  animal_hunter: cityTutorFaceYaw(-2, 1, 1, 3),
  builder: cityTutorFaceYaw(1, 3, -2, 1),
  monster_hunter: cityTutorFaceYaw(3, 0, 0, 2),
  // Station bays — unique idle headings (not a cloned +Z firing squad).
  farmer: 2.52,
  cook: 1.42,
  forester: 3.02,
  carpenter: -1.38,
  miner: 2.08,
  blacksmith: 0.22,
  fisher: 1.88,
  weaver: -2.72,
  alchemist: -0.62,
  animal_breeder: -2.95,
  broker: 0.55,
  clerk: -1.85,
};

/**
 * Idle facing for a city walk-up tutor.
 *
 * @param npcId - Tutorial or civic NPC id.
 * @returns Radians (0 faces +Z); 0 when the tutor is unknown.
 */
export function cityTutorialNpcYaw(
  npcId: string | null | undefined,
): number {
  if (!npcId) return 0;
  const yaw = CITY_TUTOR_YAW[npcId];
  if (yaw === undefined) return 0;
  const placed = CITY_BUILDINGS.some(
    (b) => b.type === "tutorial_npc" && b.tutorialNpcId === npcId,
  );
  return placed ? yaw : 0;
}

/**
 * Shortest absolute yaw gap in radians.
 *
 * @param a - First yaw.
 * @param b - Second yaw.
 * @returns Distance in [0, π].
 */
export function cityTutorYawGap(a: number, b: number): number {
  let d = Math.abs(a - b) % (Math.PI * 2);
  if (d > Math.PI) d = Math.PI * 2 - d;
  return d;
}
