"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TutorialNpcView } from "@/lib/api";
import { isTextEntryTarget } from "@/lib/hud/panel-orchestration";
import {
  dialogueAdvanceAction,
  tutorialNpcDialogueLines,
} from "@/lib/hud/tutorial-npc-dialogue";

interface TutorialNpcPanelProps {
  npc: TutorialNpcView | null;
  busy: boolean;
  onClaim: () => void;
  onRefresh: () => void;
  onClose: () => void;
  /** PL55.1 — brief header/border accent when Tutor opens from walk-up. */
  openAccent?: boolean;
}

/**
 * Walk-up tutor talk box — one spoken line at a time (not a dump window).
 * E / Space / Enter / click advances; the last ready beat claims at the NPC.
 */
export function TutorialNpcPanel({
  npc,
  busy,
  onClaim,
  onRefresh,
  onClose,
  openAccent = false,
}: TutorialNpcPanelProps) {
  const talkKey = `${npc?.id ?? ""}:${npc?.quest.status ?? ""}`;
  const [cursor, setCursor] = useState({ key: talkKey, index: 0 });
  const index = cursor.key === talkKey ? cursor.index : 0;
  const beats = tutorialNpcDialogueLines(npc);
  const safeIndex = Math.min(index, Math.max(0, beats.length - 1));
  const beat = beats[safeIndex];

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const advance = useCallback(() => {
    if (!npc || busy) return;
    const action = dialogueAdvanceAction(beats, safeIndex);
    if (action === "next") {
      setCursor({ key: talkKey, index: index + 1 });
      return;
    }
    if (action === "claim") {
      onClaim();
      return;
    }
    onClose();
  }, [npc, busy, beats, safeIndex, talkKey, index, onClaim, onClose]);

  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.repeat) return;
      if (
        event.code !== "KeyE" &&
        event.code !== "Space" &&
        event.code !== "Enter"
      ) {
        return;
      }
      if (isTextEntryTarget(event.target)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      advanceRef.current();
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  const panelClass = openAccent
    ? "panel tutorial-npc-panel tutorial-npc-panel--open-accent tutorial-npc-dialogue"
    : "panel tutorial-npc-panel tutorial-npc-dialogue";
  const speakerName =
    beat?.speaker === "player" ? "You" : npc?.name ?? "Tutor";
  const action = dialogueAdvanceAction(beats, safeIndex);
  const hint =
    action === "claim"
      ? "E · reply"
      : action === "close"
        ? "E · leave"
        : "E · continue";

  return (
    <aside
      className={panelClass}
      data-testid="tutorial-npc-panel"
      data-open-accent={openAccent ? "true" : "false"}
      data-dialogue-index={String(safeIndex)}
      onClick={() => {
        if (action !== "claim") advance();
      }}
    >
      <div className="tutorial-npc-panel__header tutorial-npc-dialogue__header">
        <h3 className="tutorial-npc-dialogue__name">{speakerName}</h3>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
        >
          Close
        </button>
      </div>
      {action === "claim" ? (
        <>
          <button
            type="button"
            className="tutorial-npc-dialogue__reply"
            disabled={busy}
            onClick={(event) => {
              event.stopPropagation();
              onClaim();
            }}
          >
            {beat?.text ?? "I'll take that."}
          </button>
          <div className="tutorial-npc-dialogue__hint">E · reply</div>
        </>
      ) : (
        <>
          <p
            className={
              beat?.speaker === "player"
                ? "tutorial-npc-dialogue__line tutorial-npc-dialogue__line--player"
                : "tutorial-npc-dialogue__line"
            }
          >
            {beat?.text ?? "…"}
          </p>
          <div className="tutorial-npc-dialogue__hint">{hint}</div>
        </>
      )}
    </aside>
  );
}
