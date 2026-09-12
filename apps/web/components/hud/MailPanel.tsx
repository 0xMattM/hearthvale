"use client";

import { useEffect, useState } from "react";
import {
  ITEMS,
  countPendingInboxMail,
  hasUnreadMailParcels,
  type ItemId,
} from "@game/shared";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  SOCIAL_DESK,
  mailInboxHeading,
  mailSentHeading,
  socialDeskClassName,
} from "@/lib/hud/social-desk-chrome";

interface MailItem {
  itemId: string;
  qty: number;
}

interface MailRow {
  id: string;
  fromUsername: string;
  toUsername: string;
  subject: string;
  items: MailItem[];
  coins: number;
  status: string;
  createdAt: number;
  direction: "inbox" | "sent";
}

interface DepositOption {
  itemId: string;
  qty: number;
}

interface MailPanelProps {
  mail: MailRow[];
  depositOptions: DepositOption[];
  players: Array<{ username: string }>;
  busy: boolean;
  /** PL34.1 — brief header/border accent when Mail opens (L). */
  openAccent?: boolean;
  onSend: (input: {
    toUsername: string;
    itemId: string;
    qty: number;
    coins: number;
    subject: string;
  }) => void;
  onClaim: (mailId: string) => void;
  onCancel: (mailId: string) => void;
  onRefresh: () => void;
  onClose: () => void;
}

function parcelSummary(items: MailItem[], coins: number): string {
  const goods =
    items
      .map((i) => `${ITEMS[i.itemId as ItemId]?.name ?? i.itemId}×${i.qty}`)
      .join(", ") || "no items";
  return coins > 0 ? `${goods} · ${coins} coins` : goods;
}

/**
 * Offline mail parcels (L) — send stackables/coins; claim when online (F13.4).
 * PL17.1: soft unread accent while pending inbox parcels remain (same panel).
 * PL34.1: brief open accent when opened from L.
 */
export function MailPanel({
  mail,
  depositOptions,
  players,
  busy,
  openAccent = false,
  onSend,
  onClaim,
  onCancel,
  onRefresh,
  onClose,
}: MailPanelProps) {
  const [toUsername, setToUsername] = useState("");
  const [itemId, setItemId] = useState("");
  const [qty, setQty] = useState(1);
  const [coins, setCoins] = useState(0);
  const [subject, setSubject] = useState("Parcel");

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  useEffect(() => {
    if (
      depositOptions.length > 0 &&
      !depositOptions.some((o) => o.itemId === itemId)
    ) {
      setItemId(depositOptions[0]!.itemId);
    }
  }, [depositOptions, itemId]);

  const inbox = mail.filter((m) => m.direction === "inbox" && m.status === "pending");
  const sent = mail.filter((m) => m.direction === "sent" && m.status === "pending");
  const unread = hasUnreadMailParcels(mail);
  const unreadCount = countPendingInboxMail(mail);
  const copy = SOCIAL_DESK.mail;

  return (
    <aside
      className={socialDeskClassName("mail", [
        unread ? "mail-panel--unread" : "",
        openAccent ? "mail-panel--open-accent" : "",
      ])}
      data-testid="mail-panel"
      data-unread={unread ? "true" : "false"}
      data-open-accent={openAccent ? "true" : "false"}
    >
      <SocialDeskHeader
        hotkey={copy.hotkey}
        kicker={copy.kicker}
        title={copy.title}
        headerClassName="mail-panel__header"
        extra={
          unread ? (
            <span className="mail-panel__unread-tag" aria-label="Unread parcels">
              New · {unreadCount}
            </span>
          ) : null
        }
        busy={busy}
        onRefresh={onRefresh}
        onClose={onClose}
      />
      <p className="muted social-desk__lede">{copy.lede}</p>

      <p className="social-desk__section">New parcel</p>
      <div className="social-desk__compose">
        <label className="social-desk__field">
          <span>To</span>
          <input
            list="mail-players"
            value={toUsername}
            onChange={(e) => setToUsername(e.target.value)}
            placeholder="Settler name"
          />
        </label>
        <datalist id="mail-players">
          {players.map((p) => (
            <option key={p.username} value={p.username} />
          ))}
        </datalist>
        <label className="social-desk__field">
          <span>Subject</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            maxLength={48}
          />
        </label>
        {depositOptions.length > 0 ? (
          <div className="social-desk__row">
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
            >
              {depositOptions.map((o) => (
                <option key={o.itemId} value={o.itemId}>
                  {ITEMS[o.itemId as ItemId]?.name ?? o.itemId} ({o.qty})
                </option>
              ))}
            </select>
            <input
              className="social-desk__qty"
              type="number"
              min={0}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || 0)}
            />
          </div>
        ) : (
          <p className="muted social-desk__empty">No stackables to mail.</p>
        )}
        <label className="social-desk__field">
          <span>Coins</span>
          <input
            type="number"
            min={0}
            value={coins}
            onChange={(e) => setCoins(Number(e.target.value) || 0)}
          />
        </label>
        <button
          className="social-desk__primary"
          type="button"
          disabled={busy || !toUsername.trim() || (qty < 1 && coins < 1)}
          onClick={() =>
            onSend({
              toUsername,
              itemId,
              qty: qty > 0 && itemId ? qty : 0,
              coins,
              subject,
            })
          }
        >
          Send parcel
        </button>
      </div>

      <p className="social-desk__section">{mailInboxHeading(inbox.length)}</p>
      {inbox.length === 0 ? (
        <p className="muted social-desk__empty">No pending parcels.</p>
      ) : (
        inbox.map((m) => (
          <div key={m.id} className="social-desk__card">
            <div className="social-desk__card-title">{m.subject}</div>
            <div className="muted social-desk__card-meta">
              From {m.fromUsername}
              <br />
              {parcelSummary(m.items, m.coins)}
            </div>
            <button
              className="social-desk__primary"
              type="button"
              disabled={busy}
              onClick={() => onClaim(m.id)}
            >
              Claim
            </button>
          </div>
        ))
      )}

      <p className="social-desk__section">{mailSentHeading(sent.length)}</p>
      {sent.length === 0 ? (
        <p className="muted social-desk__empty">Nothing waiting on the road.</p>
      ) : (
        sent.map((m) => (
          <div key={m.id} className="social-desk__card">
            <div className="social-desk__card-title">{m.subject}</div>
            <div className="muted social-desk__card-meta">
              To {m.toUsername}
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => onCancel(m.id)}
            >
              Cancel / return
            </button>
          </div>
        ))
      )}
    </aside>
  );
}
