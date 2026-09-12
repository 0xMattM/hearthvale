"use client";

import { useEffect } from "react";
import type { QuestStatus } from "@game/shared";
import {
  questReadyRowAccentClassName,
  shouldShowQuestReadyRowAccent,
} from "@/lib/hud/quest-ready-row-accent";
import {
  partitionQuestBoard,
  questBoardEmptyNote,
  questBoardPipKind,
  questBoardProgress,
  questStatusLabel,
  type QuestBoardRow,
} from "@/lib/hud/quest-board-view";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";

interface QuestPanelProps {
  quests: QuestBoardRow[];
  busy: boolean;
  /** PL29.2 — brief border/header tint when Quest log opens (Q). */
  openAccent?: boolean;
  onRefresh: () => void;
  onClose: () => void;
}

/**
 * City quest board (Q) — parchment log of tutor errands.
 * Rewards are claimed by talking to the NPC, never from this board.
 */
export function QuestPanel({
  quests,
  busy,
  openAccent = false,
  onRefresh,
  onClose,
}: QuestPanelProps) {
  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const { done, current } = partitionQuestBoard(quests);
  const progress = questBoardProgress(quests);
  const emptyNote = questBoardEmptyNote({
    current,
    done: progress.done,
    total: progress.total,
  });
  const copy = GAME_DESK.quests;

  return (
    <aside
      className={gameDeskClassName("quest-panel", [
        "quest-panel--board",
        openAccent ? "quest-panel--open-accent" : "",
      ])}
      data-testid="quest-panel"
      data-open-accent={openAccent ? "true" : "false"}
    >
      <SocialDeskHeader
        hotkey={copy.hotkey}
        kicker={copy.kicker}
        title={copy.title}
        headerClassName="quest-panel__header"
        busy={busy}
        onRefresh={onRefresh}
        onClose={onClose}
      />
      <p className="muted social-desk__lede">{copy.lede}</p>
      <div className="quest-panel__progress">
        <span>
          {progress.done} of {progress.total}
        </span>
        <div className="quest-panel__pips" aria-hidden>
          {Array.from({ length: progress.total }, (_, index) => (
            <span
              key={index}
              className={`quest-panel__pip quest-panel__pip--${questBoardPipKind(
                index,
                progress.done,
                Boolean(current),
              )}`}
            />
          ))}
        </div>
      </div>

      {current ? <QuestCurrentSlip quest={current} /> : null}
      {emptyNote ? <p className="quest-panel__empty">{emptyNote}</p> : null}

      {done.length > 0 ? (
        <section className="quest-panel__done-list">
          <h4 className="quest-panel__section">Finished</h4>
          {done.map((quest) => (
            <QuestDoneRow key={quest.id} quest={quest} />
          ))}
        </section>
      ) : null}

      <p className="muted quest-panel__footnote">
        Claim rewards by talking to them — not from this log.
      </p>
    </aside>
  );
}

/**
 * Featured errand slip — active, ready, or locked.
 *
 * @param quest - Open quest to glance at.
 */
function QuestCurrentSlip({ quest }: { quest: QuestBoardRow }) {
  const readyAccent = shouldShowQuestReadyRowAccent(quest.status);
  const readyClass = questReadyRowAccentClassName(quest.status);
  return (
    <article
      className={[
        "quest-panel__row",
        "quest-panel__current",
        readyClass,
        quest.status === "locked" ? "quest-panel__current--locked" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-quest-ready={readyAccent ? "true" : "false"}
      data-quest-status={quest.status}
      data-testid={
        readyAccent ? `quest-row-ready-${quest.id}` : `quest-row-${quest.id}`
      }
    >
      <QuestStatusBadge status={quest.status} />
      <h4 className="quest-panel__title">{quest.title}</h4>
      <p className="quest-panel__blurb">{quest.blurb}</p>
      <div className="quest-panel__reward">
        +{quest.rewardCoins} coins · +{quest.rewardCharacterXp} XP
      </div>
      {quest.status === "ready" ? (
        <p
          className="quest-panel__turn-in"
          data-testid={`quest-claim-at-${quest.id}`}
        >
          Talk to {quest.claimAtNpc ?? "the NPC"} to claim.
        </p>
      ) : null}
    </article>
  );
}

/**
 * Compact finished row — title only, no reward dump.
 *
 * @param quest - Claimed quest.
 */
function QuestDoneRow({ quest }: { quest: QuestBoardRow }) {
  return (
    <div
      className="quest-panel__row quest-panel__done"
      data-quest-ready="false"
      data-quest-status={quest.status}
      data-testid={`quest-row-${quest.id}`}
    >
      <span className="quest-panel__check" aria-hidden>
        ✓
      </span>
      <span className="quest-panel__done-title">{quest.title}</span>
      <span className="quest-panel__done-status">
        {questStatusLabel(quest.status)}
      </span>
    </div>
  );
}

/**
 * Small status chip on a quest slip.
 *
 * @param status - Quest status.
 */
function QuestStatusBadge({ status }: { status: QuestStatus }) {
  return (
    <span className={`quest-panel__badge quest-panel__badge--${status}`}>
      {questStatusLabel(status)}
    </span>
  );
}
