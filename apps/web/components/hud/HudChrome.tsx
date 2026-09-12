"use client";

import type { CSSProperties } from "react";
import {
  MINIMAL_WALKING_HOTKEYS,
  compactHudGlanceParts,
  hudMeterPercent,
} from "@/lib/hud/hud-chrome";

interface HudMeterProps {
  kind: "energy" | "health" | "tool";
  current: number;
  max: number;
  fill: string;
  title: string;
  low?: boolean;
  idleGlance?: boolean;
  className?: string;
  testId?: string;
  labelTestId?: string;
  style?: CSSProperties;
}

/**
 * Compact vitals bar — numbers live in the tooltip, not a prose line.
 */
export function HudMeter({
  kind,
  current,
  max,
  fill,
  title,
  low = false,
  idleGlance = false,
  className,
  testId,
  labelTestId,
  style,
}: HudMeterProps) {
  const pct = hudMeterPercent(current, max);
  return (
    <div
      className={["hud-meter", `hud-meter--${kind}`, className]
        .filter(Boolean)
        .join(" ")}
      title={title}
      data-low={low ? "true" : "false"}
      data-idle-glance={idleGlance ? "true" : "false"}
      data-health-low={kind === "health" && low ? "true" : "false"}
      data-durability-low={kind === "tool" && low ? "true" : "false"}
      data-testid={labelTestId}
      style={style}
    >
      <span className="hud-meter__pip" aria-hidden />
      <span className="hud-meter__track" data-testid={testId}>
        <span className="hud-meter__fill" style={{ width: `${pct}%`, background: fill }} />
      </span>
      <span className="hud-meter__value">
        {Number.isFinite(current) ? Math.max(0, Math.round(current)) : 0}
      </span>
    </div>
  );
}

interface HudGlanceChipProps {
  label: string;
  className: string;
  testId: string;
  title: string;
  dataAttr: string;
  color: string;
  extraStyle?: CSSProperties;
  idleGlance?: boolean;
}

/**
 * Closed-glance chip — hotkey mark only; word stays in the tooltip.
 */
export function HudGlanceChip({
  label,
  className,
  testId,
  title,
  dataAttr,
  color,
  extraStyle,
  idleGlance = false,
}: HudGlanceChipProps) {
  const parts = compactHudGlanceParts(label);
  if (!parts.mark) return null;
  return (
    <span
      className={`hud-glance ${className}`}
      data-testid={testId}
      data-idle-glance={idleGlance ? "true" : "false"}
      title={title}
      style={{
        borderColor: `color-mix(in srgb, ${color} 70%, #3a4b36)`,
        color,
        ...extraStyle,
      }}
      {...{ [dataAttr]: "true" }}
    >
      <kbd>{parts.mark}</kbd>
      {parts.count ? <span className="hud-glance__n">{parts.count}</span> : null}
    </span>
  );
}

/**
 * Tiny walking key strip — Settings (H) still holds the full bind list.
 */
export function HudHotkeyStrip() {
  return (
    <div className="hud-hotkeys" title="Settings (H) for all keys">
      {MINIMAL_WALKING_HOTKEYS.map((bind) => (
        <kbd key={bind.key} title={bind.title}>
          {bind.key}
        </kbd>
      ))}
    </div>
  );
}
