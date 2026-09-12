"use client";

import { WARRIOR_ARENA_VISUAL, arenaPlaqueCopy } from "@game/shared";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";

interface ArenaStubPanelProps {
  onClose: () => void;
  onOpenTravel: () => void;
  /** PL52.2 — brief warm open accent when plaque opens the stub. */
  openAccent?: boolean;
}

/**
 * Walk-up warrior arena plaque (CL5.1 / CL11.1 / PL11.1 / PL41.2) — optional path stub, free exit.
 * Accent chrome matches arena floor palette; soft warm plaque polish (PL41.2).
 * PL52.2: brief open accent on plaque / travel open; copy stays optional / no-ladder.
 */
export function ArenaStubPanel({
  onClose,
  onOpenTravel,
  openAccent = false,
}: ArenaStubPanelProps) {
  const copy = arenaPlaqueCopy();
  const desk = GAME_DESK.arena;
  const accent = WARRIOR_ARENA_VISUAL.plaqueAccent;
  const emissive = WARRIOR_ARENA_VISUAL.plaqueEmissive;

  return (
    <aside
      className={gameDeskClassName("arena-stub-panel", [
        openAccent ? "arena-stub-panel--open-accent" : "",
      ])}
      data-open-accent={openAccent ? "true" : "false"}
      data-testid="arena-stub-panel"
      style={{
        borderColor: accent,
        boxShadow: openAccent
          ? `inset 3px 0 0 ${accent}, 0 0 18px ${emissive}55`
          : `inset 3px 0 0 ${accent}, 0 0 14px ${emissive}33`,
      }}
    >
      <SocialDeskHeader
        hotkey={desk.hotkey}
        kicker={desk.kicker}
        title={copy.title}
        extra={
          <span className="social-desk__extra" style={{ color: accent }}>
            optional
          </span>
        }
        headerClassName="arena-stub-panel__header"
        onClose={onClose}
      />
      <p className="muted social-desk__lede">{copy.lead}</p>
      <p style={{ fontSize: "0.85rem", margin: "0 0 0.55rem" }}>{copy.body}</p>
      <p className="muted" style={{ fontSize: "0.78rem", margin: "0 0 0.55rem" }}>
        {copy.noLadderNote}
      </p>
      <p style={{ fontSize: "0.82rem", margin: "0 0 0.7rem" }}>{copy.exitHint}</p>
      <div className="social-desk__row">
        <button type="button" onClick={onOpenTravel}>
          Exit · Travel map (N)
        </button>
        <button type="button" onClick={onClose}>
          Stay
        </button>
      </div>
    </aside>
  );
}
