"use client";

import { buildInteractPromptHierarchy } from "@/lib/hud/interact-prompt-hierarchy";
import {
  INTERACT_PROMPT_IDLE_GLANCE,
  shouldShowInteractPromptIdleGlance,
} from "@/lib/hud/interact-prompt-idle-glance";

interface InteractPromptProps {
  label: string | null;
  showKey?: boolean;
  /** One-shot accent pulse after plant/harvest success (PL6.2). */
  successPulse?: boolean;
  /**
   * PL188.1 — quiet idle chrome breath while in range (no panel open).
   * Caller already hides this component when a panel is open; kept for gate parity.
   */
  panelOpen?: boolean;
}

/**
 * Bottom action-first prompt when near an interactable (PL2.1 / PL188.1).
 * Key badge + verb lead; no generic panel chrome; hidden when no target.
 * Quiet periodic chrome breath while in range (success pulse wins).
 */
export function InteractPrompt({
  label,
  showKey = true,
  successPulse = false,
  panelOpen = false,
}: InteractPromptProps) {
  if (!label) return null;

  const parts = buildInteractPromptHierarchy(label, showKey);
  if (!parts.verb) return null;

  // Reason: PL188.1 — success one-shot wins over idle breath; panel open clears breath.
  const idleGlance = shouldShowInteractPromptIdleGlance(
    true,
    panelOpen,
    successPulse,
  );

  const rootClass = successPulse
    ? "interact-prompt interact-prompt--success"
    : idleGlance
      ? `interact-prompt ${INTERACT_PROMPT_IDLE_GLANCE.className}`
      : "interact-prompt";

  return (
    <div
      className={rootClass}
      style={{
        position: "absolute",
        bottom: 28,
        left: "50%",
        zIndex: 5,
        transform: "translateX(-50%)",
        pointerEvents: "none",
        ...(idleGlance
          ? {
              ["--interact-prompt-idle-period" as string]: `${INTERACT_PROMPT_IDLE_GLANCE.periodMs}ms`,
            }
          : null),
      }}
      data-testid="interact-prompt"
      data-show-key={parts.keyLabel ? "true" : "false"}
      data-success-pulse={successPulse ? "true" : "false"}
      data-idle-glance={idleGlance ? "true" : "false"}
    >
      <div className="interact-prompt__chip">
        {parts.keyLabel ? (
          <span className="interact-prompt__key" aria-hidden>
            {parts.keyLabel}
          </span>
        ) : null}
        <span className="interact-prompt__copy">
          {parts.prefix ? (
            <span className="interact-prompt__prefix">{parts.prefix}</span>
          ) : null}
          <span className="interact-prompt__verb">{parts.verb}</span>
          {parts.detail ? (
            <span className="interact-prompt__detail"> {parts.detail}</span>
          ) : null}
        </span>
      </div>
    </div>
  );
}
