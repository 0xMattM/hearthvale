"use client";

import { useEffect, useState } from "react";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  SOCIAL_DESK,
  chatDeskEmptyNote,
  formatChatLineTime,
  socialDeskClassName,
} from "@/lib/hud/social-desk-chrome";

interface ChatMessage {
  id: string;
  username: string;
  text: string;
  t: number;
}

export type ChatChannel = "world" | "guild";

interface ChatPanelProps {
  channel: ChatChannel;
  onChannelChange: (channel: ChatChannel) => void;
  messages: ChatMessage[];
  inGuild: boolean;
  busy: boolean;
  /** PL38.1 — brief header/border accent when Chat opens (C). */
  openAccent?: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
  onRefresh: () => void;
}

/**
 * World + guild chat (C) — WS push with HTTP send/fallback (F12.5 guild).
 * PL38.1: brief social open accent when opened from C; receive ping (PL27.2) still works while closed.
 */
export function ChatPanel({
  channel,
  onChannelChange,
  messages,
  inGuild,
  busy,
  openAccent = false,
  onSend,
  onClose,
  onRefresh,
}: ChatPanelProps) {
  const [text, setText] = useState("");
  const copy = SOCIAL_DESK.chat;
  const emptyNote = chatDeskEmptyNote(channel, inGuild);

  useEffect(() => {
    onRefresh();
  }, [onRefresh, channel]);

  return (
    <aside
      className={socialDeskClassName("chat", [
        openAccent ? "chat-panel--open-accent" : "",
      ])}
      data-testid="chat-panel"
      data-open-accent={openAccent ? "true" : "false"}
    >
      <SocialDeskHeader
        hotkey={copy.hotkey}
        kicker={copy.kicker}
        title={copy.title}
        headerClassName="chat-panel__header"
        onClose={onClose}
      />
      <p className="muted social-desk__lede">{copy.lede}</p>
      <div className="chat-panel__channels">
        <button
          className={channel === "world" ? "chat-panel__channel--on" : ""}
          type="button"
          disabled={channel === "world"}
          onClick={() => onChannelChange("world")}
        >
          World
        </button>
        <button
          className={channel === "guild" ? "chat-panel__channel--on" : ""}
          type="button"
          disabled={channel === "guild" || !inGuild}
          onClick={() => onChannelChange("guild")}
          title={inGuild ? "Guild channel" : "Join a guild first"}
        >
          Guild
        </button>
      </div>
      <div className="chat-panel__log">
        {messages.length === 0 ? (
          <p className="muted social-desk__empty">{emptyNote}</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="chat-panel__line">
              <strong className="chat-panel__who">{m.username}</strong>
              <span className="chat-panel__time">{formatChatLineTime(m.t)}</span>
              <span className="chat-panel__text">{m.text}</span>
            </div>
          ))
        )}
      </div>
      <form
        className="chat-panel__composer"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          if (channel === "guild" && !inGuild) return;
          onSend(text);
          setText("");
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            channel === "guild" ? "Message your guild…" : "Say something…"
          }
          maxLength={160}
          disabled={channel === "guild" && !inGuild}
        />
        <button
          className="social-desk__primary"
          type="submit"
          disabled={busy || (channel === "guild" && !inGuild)}
        >
          Send
        </button>
      </form>
    </aside>
  );
}
