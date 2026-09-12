/**
 * City / explore vendor stall visual scale — a bit larger than the old counter.
 * Collision stays under interact range in `BUILDING_COLLISION_RADIUS`.
 */
export const VENDOR_STALL_KIT_SCALE = 1.3;

/** World-label height above the scaled awning. */
export const VENDOR_STALL_LABEL_Y = 2.25 * VENDOR_STALL_KIT_SCALE;

/**
 * True when the stall is enlarged vs the original 1.0 kit.
 */
export function vendorStallIsEnlarged(): boolean {
  return VENDOR_STALL_KIT_SCALE > 1;
}
