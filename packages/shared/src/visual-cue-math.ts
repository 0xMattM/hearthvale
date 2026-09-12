/**
 * Shared pulse / flash / contrast math for world cues (RF5.1).
 * Prefer this over copy-pasted sin/decay helpers per object type.
 */

/**
 * Clamps a number to [0, 1].
 *
 * @param n - Raw value.
 */
export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n <= 0) return 0;
  if (n >= 1) return 1;
  return n;
}

/**
 * Continuous sine pulse envelope in [0, 1].
 *
 * @param nowMs - Clock ms.
 * @param periodMs - Full-cycle period (must be > 0).
 */
export function sinePulseEnvelope(nowMs: number, periodMs: number): number {
  const period = Math.max(1, periodMs);
  const t = ((nowMs % period) + period) % period;
  return 0.5 + 0.5 * Math.sin((t / period) * Math.PI * 2);
}

/**
 * Maps an envelope in [0, 1] onto [min, max].
 *
 * @param min - Floor intensity/opacity.
 * @param max - Peak intensity/opacity.
 * @param envelope - 0..1 pulse/flash envelope.
 */
export function lerpByEnvelope(
  min: number,
  max: number,
  envelope: number,
): number {
  const e = clamp01(envelope);
  return min + e * (max - min);
}

/**
 * One-shot ease-out flash envelope (peaks at 0 elapsed, 0 at duration).
 *
 * @param elapsedMs - Ms since flash start.
 * @param durationMs - Flash length.
 */
export function flashDecayEnvelope(
  elapsedMs: number,
  durationMs: number,
): number {
  if (!(durationMs > 0) || !Number.isFinite(elapsedMs) || elapsedMs < 0) {
    return 0;
  }
  if (elapsedMs >= durationMs) return 0;
  const t = 1 - elapsedMs / durationMs;
  // Reason: ease-out so settle reads at the edge then softens quickly.
  return t * t;
}

/**
 * Absolute contrast between two intensities (for kinship asserts).
 *
 * @param a - First intensity.
 * @param b - Second intensity.
 */
export function intensityContrast(a: number, b: number): number {
  return Math.abs(a - b);
}
