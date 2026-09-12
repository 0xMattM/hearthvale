/**
 * Arena enter soft world reinforce (PL145.2).
 * Brief soft rim when arriving on Arena map —
 * complements Arrived · dest (PL115.2) + first Warrior tip (PL53.2) +
 * warm arena haze (PL41.2). Warrior optional / stub; no balance invent; mute ok.
 */

/**
 * Brief soft world rim flash when entering the Warrior Arena map (PL145.2).
 * Warm arena / plaque kinship (#d4886a / #e09060) — distinct from visit meadow,
 * quest verdant, and market teal.
 */
export const ARENA_ENTER_WORLD_REINFORCE = {
  durationMs: 520,
  opacityPeak: 0.86,
  clearPct: 48,
  midPct: 74,
  midRgba: "rgba(200, 110, 72, 0.26)",
  outerRgba: "rgba(96, 48, 28, 0.42)",
} as const;

/**
 * Whether arriving on Arena should flash the soft world reinforce (PL145.2).
 * True only when land-kind transition enters warrior; other maps stay quiet.
 *
 * @param enteredWarrior - True when `isEnteringWarriorMap(prev, next)`.
 * @returns True when the soft arena rim should briefly flash.
 */
export function shouldFlashArenaEnterWorldReinforce(
  enteredWarrior: boolean,
): boolean {
  return enteredWarrior === true;
}

/**
 * CSS `background` radial gradient for the arena-enter reinforce (PL145.2).
 *
 * @returns Radial-gradient string for the one-shot overlay.
 */
export function arenaEnterWorldReinforceBackground(): string {
  const { clearPct, midPct, midRgba, outerRgba } = ARENA_ENTER_WORLD_REINFORCE;
  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;
}
