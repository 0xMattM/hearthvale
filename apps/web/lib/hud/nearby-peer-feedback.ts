/**
 * Nearby-peer soft world reinforce leftover (PL184.2).
 * Brief soft rim when a peer first enters interact range —
 * complements nearby peer ping (PL15.2) + silhouette (PL40.3) +
 * range-exit fade (PL134.2). Presence rules unchanged; mute ok.
 * Not kinship — floor ping ≠ HUD shell rim.
 */

/**
 * Brief soft world rim flash when a peer first enters interact range (PL184.2).
 * Quiet sage kinship with NEARBY_PEER_PING (#6a8e78) — distinct from guest-teal
 * visit-arrive, Free cyan travel-arrive, and cool peer silhouette alone.
 */
export const NEARBY_PEER_WORLD_REINFORCE = {
  durationMs: 480,
  opacityPeak: 0.82,
  clearPct: 50,
  midPct: 76,
  midRgba: "rgba(106, 142, 120, 0.22)",
  outerRgba: "rgba(40, 60, 48, 0.38)",
} as const;

/**
 * CSS `background` radial gradient for the nearby-peer reinforce (PL184.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function nearbyPeerWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = NEARBY_PEER_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
