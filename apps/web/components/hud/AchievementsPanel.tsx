"use client";

import { useEffect } from "react";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";

interface AchievementRow {
  id: string;
  title: string;
  blurb: string;
  counter: number;
  target: number;
  unlocked: boolean;
  unlockedAt: number | null;
}

interface AchievementsPanelProps {
  achievements: AchievementRow[];
  busy: boolean;
  /** PL46.2 — brief system open accent. */
  openAccent?: boolean;
  onRefresh: () => void;
  onClose: () => void;
}

/**
 * Achievement stub list (A) — counters + unlock state (F13.3).
 */
export function AchievementsPanel({
  achievements,
  busy,
  openAccent = false,
  onRefresh,
  onClose,
}: AchievementsPanelProps) {
  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const copy = GAME_DESK.achievements;

  return (
    <aside
      className={gameDeskClassName("achievements-panel", [
        openAccent ? "achievements-panel--open-accent" : "",
      ])}
      data-open-accent={openAccent ? "true" : "false"}
      data-testid="achievements-panel"
    >
      <SocialDeskHeader
        hotkey={copy.hotkey}
        kicker={copy.kicker}
        title={copy.title}
        headerClassName="achievements-panel__header"
        extra={
          <span className="social-desk__extra">
            {unlockedCount}/{achievements.length}
          </span>
        }
        busy={busy}
        onRefresh={onRefresh}
        onClose={onClose}
      />
      <p className="muted social-desk__lede">{copy.lede}</p>
      <div className="visit-panel__list">
        {achievements.map((a) => (
          <div
            key={a.id}
            className="social-desk__card"
            style={{ opacity: a.unlocked ? 1 : 0.72 }}
          >
            <div className="achievements-panel__row">
              <strong className="social-desk__card-title">{a.title}</strong>
              <span className="muted social-desk__card-meta">
                {a.unlocked ? "unlocked" : `${a.counter}/${a.target}`}
              </span>
            </div>
            <p className="muted social-desk__card-meta">{a.blurb}</p>
            <div className="achievements-panel__bar">
              <span
                style={{
                  width: `${Math.min(100, Math.round((a.counter / a.target) * 100))}%`,
                  background: a.unlocked ? "var(--ok)" : "var(--accent)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
