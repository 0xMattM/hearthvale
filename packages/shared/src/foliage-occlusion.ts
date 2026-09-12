/**
 * Follow-camera foliage — ghost a canopy only while the player is behind it.
 * Trees stay in the world (and collidable); they are not deleted.
 */
export const FOLIAGE_OCCLUSION = {
  /** Fully visible canopy. */
  opaqueOpacity: 1,
  /** See-through ghost while the canopy blocks the player — still readable. */
  hiddenOpacity: 0.32,
  /** Extra XZ pad around the camera→player line. */
  linePad: 1.0,
} as const;

/**
 * Local canopy spheres (pre-scale) matching the env-kit meshes.
 * `localRadius` covers the main blob plus offset lobes / cones.
 */
export const FOLIAGE_CANOPY = {
  cityDecor: { localY: 2.15, localRadius: 1.35 },
  homestead: { localY: 1.95, localRadius: 1.45 },
  forest: { localY: 2.85, localRadius: 1.75 },
  /** Chop-ready gather tree — covers main canopy plus offset lobes. */
  gatherTree: { localY: 2.15, localRadius: 1.35 },
} as const;

export interface FoliageCanopySphere {
  localY: number;
  localRadius: number;
}

export interface FoliageOcclusionArgs {
  canopyX: number;
  canopyY: number;
  canopyZ: number;
  canopyRadius: number;
  playerX: number;
  playerY: number;
  playerZ: number;
  camX: number;
  camY: number;
  camZ: number;
}

/**
 * World-space canopy sphere for a placed tree.
 *
 * @param treeX - Trunk world X.
 * @param treeZ - Trunk world Z.
 * @param scale - Uniform kit scale.
 * @param canopy - Local Y / radius before scale.
 * @returns Scaled sphere center + radius.
 */
export function foliageCanopyWorld(
  treeX: number,
  treeZ: number,
  scale: number,
  canopy: FoliageCanopySphere,
): { x: number; y: number; z: number; radius: number } {
  const s = Number.isFinite(scale) && scale > 0 ? scale : 1;
  return {
    x: treeX,
    y: canopy.localY * s,
    z: treeZ,
    radius: canopy.localRadius * s,
  };
}

/**
 * True when the player is behind this canopy (it sits between camera and player).
 *
 * @param args - World positions and already-scaled canopy sphere.
 * @returns True when the follow camera should ghost the canopy.
 */
export function foliageIsOccluding(args: FoliageOcclusionArgs): boolean {
  const {
    canopyX,
    canopyZ,
    canopyRadius,
    playerX,
    playerZ,
    camX,
    camZ,
  } = args;

  if (
    ![canopyX, canopyZ, canopyRadius, playerX, playerZ, camX, camZ].every(
      Number.isFinite,
    )
  ) {
    return false;
  }

  const radius = Math.max(0, canopyRadius);
  const lookX = playerX - camX;
  const lookZ = playerZ - camZ;
  const lookLen = Math.hypot(lookX, lookZ);
  if (lookLen < 1e-4) return false;

  const toTreeX = canopyX - camX;
  const toTreeZ = canopyZ - camZ;
  const along = (toTreeX * lookX + toTreeZ * lookZ) / lookLen;
  // Reason: only ghost while the player is behind the tree, not when it is scenery.
  if (along <= 0 || along >= lookLen - 0.12) return false;

  const t = along / lookLen;
  const closestX = camX + lookX * t;
  const closestZ = camZ + lookZ * t;
  const perp = Math.hypot(canopyX - closestX, canopyZ - closestZ);
  const onLine = perp <= radius + FOLIAGE_OCCLUSION.linePad;
  return onLine;
}

/**
 * Opacity for a canopy that may sit between camera and player.
 *
 * @param args - World positions and already-scaled canopy sphere.
 * @returns Opaque when the tree should stay; ghost opacity when it blocks the view.
 */
export function foliageOcclusionOpacity(args: FoliageOcclusionArgs): number {
  return foliageIsOccluding(args)
    ? FOLIAGE_OCCLUSION.hiddenOpacity
    : FOLIAGE_OCCLUSION.opaqueOpacity;
}

/**
 * Whether occlusion uses a readable ghost instead of a fully invisible canopy.
 *
 * @returns True when hidden opacity is strictly between 0 and fully opaque.
 */
export function foliageOcclusionIsGhost(): boolean {
  return (
    FOLIAGE_OCCLUSION.hiddenOpacity > 0 &&
    FOLIAGE_OCCLUSION.hiddenOpacity < FOLIAGE_OCCLUSION.opaqueOpacity
  );
}
