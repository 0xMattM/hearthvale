/**
 * Screen compass for the isometric follow camera (+X/+Z offset).
 * Screen-up is north (away from the camera, toward City Hall / the portal).
 * Screen-right is east. World +Z is camera-near (bottom of the screen) = south-westish.
 */

export const SCREEN_COMPASS_DIRS = [
  "north",
  "northeast",
  "east",
  "southeast",
  "south",
  "southwest",
  "west",
  "northwest",
] as const;

export type ScreenCompass = (typeof SCREEN_COMPASS_DIRS)[number];

/**
 * Maps a world XZ offset onto the walking camera's compass.
 *
 * @param dx - World X from plaza origin (grid or world units; ratio only).
 * @param dz - World Z from plaza origin.
 * @returns Eight-way screen direction, or null at the origin / invalid.
 */
export function screenCompassFromOffset(
  dx: number,
  dz: number,
): ScreenCompass | null {
  if (!Number.isFinite(dx) || !Number.isFinite(dz)) return null;
  if (Math.abs(dx) < 1e-6 && Math.abs(dz) < 1e-6) return null;
  // Reason: camera sits on +X/+Z; screen-up is (-X,-Z), screen-right is (+X,-Z).
  const north = -dx - dz;
  const east = dx - dz;
  const twoPi = Math.PI * 2;
  const angle = Math.atan2(east, north);
  const turns = ((angle % twoPi) + twoPi) % twoPi;
  const step = Math.round(turns / (Math.PI / 4)) % 8;
  return SCREEN_COMPASS_DIRS[step] ?? null;
}

/**
 * Plaza phrase for a screen compass dir (“northwest of the plaza”).
 *
 * @param dir - Eight-way screen direction.
 * @returns Spoken wayfinding fragment.
 */
export function screenCompassPlazaPhrase(dir: ScreenCompass): string {
  if (dir === "east" || dir === "west") return `on the ${dir} side`;
  if (dir === "north" || dir === "south") return `${dir} of the plaza`;
  return `${dir} of the plaza`;
}
