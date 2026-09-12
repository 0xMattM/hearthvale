/**
 * Dedupes remote presence by username (last write wins) for render keys.
 */
export function mergeRemotePresence(
  others: Array<{ username: string; x: number; z: number }>,
): Array<{ username: string; x: number; z: number }> {
  const map = new Map<string, { username: string; x: number; z: number }>();
  for (const o of others) {
    if (!o.username) continue;
    map.set(o.username, { username: o.username, x: o.x, z: o.z });
  }
  return [...map.values()];
}
