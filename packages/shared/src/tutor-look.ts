import {
  TUTOR_CLOAK_FALLBACK,
  tutorialNpcCloakColor,
} from "./tutorial-npcs.js";

/** Players use Hunter; city tutors always use this villager mesh. */
export const TUTOR_VILLAGER_VARIANT = "tutor" as const;

export interface TutorLook {
  /** Profession wash applied to the Blacksmith atlas (no extra meshes). */
  cloak: string;
}

/** Lerp mix when washing the villager atlas with the profession color. */
export const TUTOR_MESH_TINT_MIX = 0.88;

export const TUTOR_LOOK_FALLBACK: TutorLook = {
  cloak: TUTOR_CLOAK_FALLBACK,
};

/**
 * Visual identity for a city walk-up NPC (color wash only).
 *
 * @param npcId - Tutorial or civic NPC id.
 * @returns Profession cloak tint, or gray fallback when unknown.
 */
export function tutorialNpcLook(
  npcId: string | null | undefined,
): TutorLook {
  return { cloak: tutorialNpcCloakColor(npcId) };
}
