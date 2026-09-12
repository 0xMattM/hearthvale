/**
 * Round-over used by kit boxes so station meshes are not ruler-cut cubes.
 *
 * @param width - X size.
 * @param height - Y size.
 * @param depth - Z size.
 * @returns Corner radius in world units, clamped to half the shortest side.
 */
export function kitBoxRadius(width: number, height: number, depth: number): number {
  const w = Math.max(0.001, width);
  const h = Math.max(0.001, height);
  const d = Math.max(0.001, depth);
  const minDim = Math.min(w, h, d);
  // Reason: bigger round-overs so station bodies stop reading as Minecraft cubes.
  const requested = Math.min(0.16, minDim * 0.34);
  return Math.min(w / 2, h / 2, d / 2, requested);
}

/**
 * Bevel segment count — thin boards stay cheap; chunky kits get smoother fillets.
 *
 * @param width - X size.
 * @param height - Y size.
 * @param depth - Z size.
 * @returns 1–3.
 */
export function kitBoxSegments(
  width: number,
  height: number,
  depth: number,
): number {
  const w = Math.max(0.001, width);
  const h = Math.max(0.001, height);
  const d = Math.max(0.001, depth);
  const minDim = Math.min(w, h, d);
  if (minDim < 0.09) return 1;
  if (minDim < 0.35) return 2;
  return 3;
}
