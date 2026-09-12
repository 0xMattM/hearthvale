"use client";

import type { ReactNode } from "react";

interface SocialDeskHeaderProps {
  hotkey: string;
  kicker: string;
  title: string;
  extra?: ReactNode;
  headerClassName?: string;
  actions?: ReactNode;
  busy?: boolean;
  onRefresh?: () => void;
  onClose: () => void;
}

/**
 * Shared kicker + key chip + close row for in-game desk panels.
 *
 * @param props - Hotkey, titles, optional extra actions, close handler.
 * @returns Header block for a game desk panel.
 */
export function SocialDeskHeader({
  hotkey,
  kicker,
  title,
  extra = null,
  headerClassName = "",
  actions = null,
  busy = false,
  onRefresh,
  onClose,
}: SocialDeskHeaderProps) {
  return (
    <div
      className={["social-desk__header", headerClassName]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="social-desk__heading">
        <p className="social-desk__kicker">{kicker}</p>
        <h3>
          <span className="social-desk__key" aria-hidden>
            {hotkey}
          </span>
          {title}
          {extra}
        </h3>
      </div>
      <div className="social-desk__header-actions">
        {actions}
        {onRefresh ? (
          <button type="button" disabled={busy} onClick={onRefresh}>
            Refresh
          </button>
        ) : null}
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
