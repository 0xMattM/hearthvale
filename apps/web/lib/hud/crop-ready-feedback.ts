/**

 * Crop-ready soft world leftover (PL142.2).

 * Brief quiet harvest-ready rim when a plot flips to ready — complements

 * ready pad pulse (PL12.1) + Ready soft TopBar (PL60.1).

 * Grow timers unchanged; mute ok; not a HUD column.

 */



/**

 * Brief soft world rim flash when a crop plot edges into harvest-ready (PL142.2).

 * Quiet harvest lime/gold kinship with ready pad — distinct from plant sprout rim.

 */

export const CROP_READY_WORLD_REINFORCE = {

  durationMs: 480,

  opacityPeak: 0.86,

  clearPct: 49,

  midPct: 75,

  midRgba: "rgba(160, 184, 48, 0.2)",

  outerRgba: "rgba(88, 104, 28, 0.38)",

} as const;



/**

 * Whether a crop-ready edge should flash the world reinforce (PL142.2).

 * True only when a plot newly enters harvest-ready; steady ready / empty stay quiet.

 *

 * @param edgedIntoReady - True when `shouldFlashCropReadyEdgeCue` fired.

 * @returns True when the soft harvest rim should briefly flash.

 */

export function shouldFlashCropReadyWorldReinforce(

  edgedIntoReady: boolean,

): boolean {

  return edgedIntoReady === true;

}



/**

 * CSS `background` radial gradient for the crop-ready reinforce (PL142.2).

 *

 * @returns Radial-gradient string for the one-shot overlay.

 */

export function cropReadyWorldReinforceBackground(): string {

  const { clearPct, midPct, midRgba, outerRgba } = CROP_READY_WORLD_REINFORCE;

  return `radial-gradient(ellipse at center, transparent ${clearPct}%, ${midRgba} ${midPct}%, ${outerRgba} 100%)`;

}


