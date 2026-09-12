import type { CanonicalLandKind, LandKind } from "@game/shared";
import { normalizeLandKind } from "@game/shared";

/** Visual scene template ids — one per CityLands map space (CL1.3). */
export type SceneTemplateId = CanonicalLandKind;

/**
 * Resolves which LandScene environment template to mount for a land kind.
 * Legacy aliases (`starter` / `forest`) map to player_land / explore.
 */
export function sceneTemplateForLandKind(
  kind: LandKind | string | null | undefined,
): SceneTemplateId {
  return normalizeLandKind(kind ?? "") ?? "player_land";
}

/**
 * True when the scene should show the homestead expand pad affordance.
 * Only private player lands expand; city/explore/warrior never do.
 */
export function sceneAllowsExpandPad(
  kind: LandKind | string | null | undefined,
): boolean {
  return sceneTemplateForLandKind(kind) === "player_land";
}
