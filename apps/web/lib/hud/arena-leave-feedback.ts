/**

 * Arena leave soft world reinforce (PL147.1).

 * Brief soft rim when leaving the Warrior Arena map —

 * complements Arena enter rim (PL145.2) + Arrived · dest (PL115.2).

 * Warrior optional / stub; no balance invent; mute ok.

 */



/**

 * Brief soft world rim flash when leaving the Warrior Arena map (PL147.1).

 * Quieter dusty amber exit kinship — distinct from enter peach (PL145.2),

 * visit meadow, and free-travel cyan.

 */

export const ARENA_LEAVE_WORLD_REINFORCE = {

  durationMs: 500,

  opacityPeak: 0.8,

  clearPct: 50,

  midPct: 76,

  midRgba: "rgba(148, 112, 72, 0.22)",

  outerRgba: "rgba(56, 40, 28, 0.36)",

} as const;



/**

 * Whether leaving Arena should flash the soft world reinforce (PL147.1).

 * True only when land-kind transition exits warrior; other maps stay quiet.

 *

 * @param leftWarrior - True when `isLeavingWarriorMap(prev, next)`.

 * @returns True when the soft arena-leave rim should briefly flash.

 */

export function shouldFlashArenaLeaveWorldReinforce(

  leftWarrior: boolean,

): boolean {

  return leftWarrior === true;

}



/**

 * CSS `background` radial gradient for the arena-leave reinforce (PL147.1).

 *

 * @returns Radial-gradient string for the one-shot overlay.

 */

export function arenaLeaveWorldReinforceBackground(): string {

  const { clearPct, midPct, midRgba, outerRgba } = ARENA_LEAVE_WORLD_REINFORCE;

  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;

}


