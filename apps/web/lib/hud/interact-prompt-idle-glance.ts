/**
 * Interact-prompt idle soft glance (PL188.1).
 * Quiet periodic prompt chrome breath while in interact range with no panel
 * open — complements action-first hierarchy PL2.1 + success pulse PL6.2;
 * no HUD column; mute ok. Success one-shot wins over idle breath.
 */

/**
 * Quiet periodic interact-prompt chrome breath while in range (PL188.1).
 * Complements hierarchy + success pulse; min HUD; mute ok.
 */
export const INTERACT_PROMPT_IDLE_GLANCE = {
  /** CSS class for the soft periodic chrome breath (not success one-shot). */
  className: "interact-prompt--idle-glance",
  /** Soft breath period — slower than success 400ms flash. */
  periodMs: 5200,
} as const;

/** How long the success pulse stays visually distinct (PL6.2). */
export const INTERACT_PROMPT_SUCCESS_PULSE_MS = 400;

/**
 * Whether the interact-prompt idle breath should play (PL188.1).
 * True while in interact range with no contextual panel open and no success
 * pulse. Hierarchy / prompts / min HUD unchanged.
 *
 * @param inRange - True when a walk-up prompt label is present.
 * @param panelOpen - True when any contextual panel is open.
 * @param successPulse - True during the brief plant/harvest success pulse.
 * @returns True when the quiet idle glance breath should apply.
 */
export function shouldShowInteractPromptIdleGlance(
  inRange: boolean,
  panelOpen: boolean,
  successPulse = false,
): boolean {
  if (!inRange) return false;
  if (panelOpen === true) return false;
  if (successPulse === true) return false;
  return true;
}
