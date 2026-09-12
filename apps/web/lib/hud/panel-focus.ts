import type { HudPanelId } from "./panel-orchestration";

/**
 * PL2.3 — Single contextual panel focus helpers.
 * Soft dim + clear stacking so only one panel job is readable.
 */

/**
 * True when any contextual HUD panel is open (not min walking chrome).
 *
 * @param panel - Active panel id or null.
 */
export function isHudPanelOpen(panel: HudPanelId): boolean {
  return panel != null;
}

/**
 * Whether the walk-up interact prompt should render alongside a panel.
 * Closed panels keep prompts; an open panel clears stacking.
 *
 * @param panel - Active panel id or null.
 * @param promptLabel - Resolved prompt label (null when far from targets).
 */
export function shouldShowInteractPromptWithPanel(
  panel: HudPanelId,
  promptLabel: string | null,
): boolean {
  if (!promptLabel) return false;
  if (isHudPanelOpen(panel)) return false;
  return true;
}

/**
 * Whether onboarding tips should stay visible with a panel open.
 * Tips demote so the panel is the single readable job.
 *
 * @param panel - Active panel id or null.
 */
export function shouldShowOnboardingWithPanel(panel: HudPanelId): boolean {
  return !isHudPanelOpen(panel);
}
