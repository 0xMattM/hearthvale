"use client";

import type { OnboardingTip } from "@/lib/onboarding";

interface OnboardingTipsProps {
  tip: OnboardingTip | null;
  onDismiss: (id: OnboardingTip["id"]) => void;
}

/**
 * Non-blocking first-session guide (bottom-left).
 */
export function OnboardingTips({ tip, onDismiss }: OnboardingTipsProps) {
  if (!tip) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 28,
        left: 12,
        maxWidth: 320,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          background: "rgba(20,28,18,0.82)",
          border: "1px solid #3a4b36",
          borderRadius: 8,
          padding: "10px 12px",
          fontSize: "0.85rem",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>{tip.text}</div>
        <button
          type="button"
          onClick={() => onDismiss(tip.id)}
          style={{ padding: "2px 8px", fontSize: "0.75rem" }}
          aria-label="Dismiss tip"
        >
          OK
        </button>
      </div>
    </div>
  );
}
