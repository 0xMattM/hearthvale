/**
 * Camera-relative walk on the XZ plane — WASD follows the screen, not world axes.
 */

/** Horizontal follow offset used by CameraFollow (isometric 3/4 view). */
export const CAMERA_FOLLOW_OFFSET_X = 7;
/** Height of the follow camera above the avatar. */
export const CAMERA_FOLLOW_OFFSET_Y = 8.2;
/** Depth follow offset used by CameraFollow (isometric 3/4 view). */
export const CAMERA_FOLLOW_OFFSET_Z = 7;

export interface WalkAxes {
  dx: number;
  dz: number;
}

/**
 * Maps screen-space WASD intent onto world XZ for an isometric follow camera.
 *
 * W/Up walks away from the camera (up the screen). A/D strafe along screen X.
 * Zero or invalid camera offset falls back to world -Z forward so movement
 * still works if the camera sits directly above the avatar.
 *
 * @param inputX - Strafe: -1 left (A), +1 right (D).
 * @param inputZ - Forward: -1 up (W), +1 down (S) — same signs as world -Z WASD.
 * @param camOffsetX - Camera X minus avatar X (default isometric +7).
 * @param camOffsetZ - Camera Z minus avatar Z (default isometric +7).
 * @returns Unit { dx, dz } in world space, or zeros when there is no intent.
 */
export function cameraRelativeWalk(
  inputX: number,
  inputZ: number,
  camOffsetX: number = CAMERA_FOLLOW_OFFSET_X,
  camOffsetZ: number = CAMERA_FOLLOW_OFFSET_Z,
): WalkAxes {
  const ix = Number.isFinite(inputX) ? inputX : 0;
  const iz = Number.isFinite(inputZ) ? inputZ : 0;
  if (ix === 0 && iz === 0) return { dx: 0, dz: 0 };

  let fwdX = -camOffsetX;
  let fwdZ = -camOffsetZ;
  const fwdLen = Math.hypot(fwdX, fwdZ);
  // Reason: overhead / NaN camera must not produce a zero basis (÷0).
  if (!Number.isFinite(fwdLen) || fwdLen < 1e-6) {
    return normalizeAxes(ix, iz);
  }
  fwdX /= fwdLen;
  fwdZ /= fwdLen;
  const rightX = -fwdZ;
  const rightZ = fwdX;
  // Reason: legacy W is inputZ < 0; screen-up is camera-forward (away from cam).
  const dx = fwdX * -iz + rightX * ix;
  const dz = fwdZ * -iz + rightZ * ix;
  return normalizeAxes(dx, dz);
}

/**
 * Returns a unit XZ vector, or zeros when the input has no length.
 *
 * @param dx - Raw world X.
 * @param dz - Raw world Z.
 * @returns Normalized axes.
 */
function normalizeAxes(dx: number, dz: number): WalkAxes {
  const len = Math.hypot(dx, dz);
  if (!Number.isFinite(len) || len < 1e-6) return { dx: 0, dz: 0 };
  return { dx: dx / len, dz: dz / len };
}
