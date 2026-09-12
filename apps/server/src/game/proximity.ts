import { ACTION_ERROR, inInteractRange } from "@game/shared";
import type { ActionResult } from "./actions/farming.js";

export interface Pos {
  x: number;
  y?: number;
  z: number;
}

/**
 * Validates client-reported position against a building grid cell.
 */
export function requireNearGrid(
  pos: Pos | undefined,
  gridX: number,
  gridZ: number,
): ActionResult {
  if (
    !pos ||
    typeof pos.x !== "number" ||
    typeof pos.z !== "number" ||
    Number.isNaN(pos.x) ||
    Number.isNaN(pos.z)
  ) {
    return { ok: false, error: ACTION_ERROR.tooFar };
  }
  if (!inInteractRange(pos.x, pos.z, gridX, gridZ)) {
    return { ok: false, error: ACTION_ERROR.tooFar };
  }
  return { ok: true };
}

/**
 * Like requireNearGrid but with an explicit world-unit reach (bows).
 *
 * @param pos - Client world position.
 * @param gridX - Building catalog X.
 * @param gridZ - Building catalog Z.
 * @param range - Max distance in world units.
 */
export function requireNearGridRange(
  pos: Pos | undefined,
  gridX: number,
  gridZ: number,
  range: number,
): ActionResult {
  if (
    !pos ||
    typeof pos.x !== "number" ||
    typeof pos.z !== "number" ||
    Number.isNaN(pos.x) ||
    Number.isNaN(pos.z)
  ) {
    return { ok: false, error: ACTION_ERROR.tooFar };
  }
  if (!inInteractRange(pos.x, pos.z, gridX, gridZ, range)) {
    return { ok: false, error: ACTION_ERROR.tooFar };
  }
  return { ok: true };
}
