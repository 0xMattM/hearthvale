"use client";

import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";

interface VisitPanelProps {
  players: Array<{ username: string }>;
  busy: boolean;
  onVisit: (username: string) => void;
  onRefreshPlayers: () => void;
  onClose: () => void;
}

/**
 * Pick a land to visit (V). View-only production; trade with T.
 */
export function VisitPanel({
  players,
  busy,
  onVisit,
  onRefreshPlayers,
  onClose,
}: VisitPanelProps) {
  const copy = GAME_DESK.visit;

  return (
    <aside className={gameDeskClassName("visit-panel")} data-testid="visit-panel">
      <SocialDeskHeader
        hotkey={copy.hotkey}
        kicker={copy.kicker}
        title={copy.title}
        headerClassName="visit-panel__header"
        busy={busy}
        onRefresh={onRefreshPlayers}
        onClose={onClose}
      />
      <p className="muted social-desk__lede">{copy.lede}</p>
      {players.length === 0 ? (
        <p className="muted social-desk__empty">
          No other players online yet. Register a second account.
        </p>
      ) : (
        <div className="visit-panel__list">
          {players.map((p) => (
            <button
              key={p.username}
              type="button"
              disabled={busy}
              onClick={() => onVisit(p.username)}
              style={{ textAlign: "left" }}
            >
              Visit {p.username}
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
