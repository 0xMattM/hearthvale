"use client";

import { useEffect } from "react";
import { cityNoticeBoardTips } from "@game/shared";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";

interface NoticeBoardPanelProps {
  onClose: () => void;
  onOpenTravel: () => void;
  /** PL17.1 — mark current tip ids seen when the board opens (clears world/prompt accent). */
  onMarkTipsSeen?: (tipIds: string[]) => void;
  /** PL34.3 — brief header/border accent when Notice opens from walk-up. */
  openAccent?: boolean;
}

/**
 * City walk-up notice board (CL8.3) — static tips only; no live-ops backend.
 * PL17.1: opening marks tips seen so the soft unread accent clears.
 * PL34.3: brief open accent on walk-up open.
 */
export function NoticeBoardPanel({
  onClose,
  onOpenTravel,
  onMarkTipsSeen,
  openAccent = false,
}: NoticeBoardPanelProps) {
  const tips = cityNoticeBoardTips();
  const copy = GAME_DESK.notice;

  useEffect(() => {
    // Reason: mark on open so world/prompt · New clears after the player reads.
    onMarkTipsSeen?.(cityNoticeBoardTips().map((t) => t.id));
  }, [onMarkTipsSeen]);

  return (
    <aside
      className={gameDeskClassName("notice-panel", [
        openAccent ? "notice-panel--open-accent" : "",
      ])}
      data-testid="notice-board-panel"
      data-open-accent={openAccent ? "true" : "false"}
    >
      <SocialDeskHeader
        hotkey={copy.hotkey}
        kicker={copy.kicker}
        title={copy.title}
        headerClassName="notice-panel__header"
        onClose={onClose}
      />
      <p className="muted social-desk__lede">{copy.lede}</p>
      <ul className="notice-panel__list">
        {tips.map((tip) => (
          <li key={tip.id} className="social-desk__card">
            <strong className="social-desk__card-title">{tip.title}</strong>
            <p className="muted social-desk__card-meta">{tip.body}</p>
          </li>
        ))}
      </ul>
      <div className="social-desk__row" style={{ marginTop: "0.55rem" }}>
        <button type="button" onClick={onOpenTravel}>
          Travel map
        </button>
        <button type="button" onClick={onClose}>
          Done
        </button>
      </div>
    </aside>
  );
}
