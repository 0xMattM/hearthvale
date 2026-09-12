"use client";

import type { ItemDefinition, ItemId } from "@game/shared";
import {
  shouldShowTradePreferredPartnerNameplate,
  TRADE_PREFERRED_PARTNER_NAMEPLATE,
  tradePreferredPartnerNameplateBorder,
  tradePreferredPartnerNameplateText,
} from "@game/shared";
import { useEffect, useState } from "react";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  SOCIAL_DESK,
  socialDeskClassName,
  tradeOfferKindLabel,
  tradePendingHeading,
} from "@/lib/hud/social-desk-chrome";

interface TradeView {
  id: string;
  fromUsername: string;
  toUsername: string;
  direction: "incoming" | "outgoing";
  give: Array<{ itemId: string; qty: number; durability?: number | null }>;
  want: Array<{ itemId: string; qty: number; durability?: number | null }>;
  giveCoins: number;
  wantCoins: number;
}

interface TradePanelProps {
  items: Record<string, ItemDefinition>;
  trades: TradeView[];
  players: Array<{ username: string }>;
  preferredPartner?: string | null;
  busy: boolean;
  /** PL29.1 — brief border/header tint when Trade opens (T / invite review). */
  openAccent?: boolean;
  onCreateTrade: (input: {
    toUsername: string;
    giveItemId: ItemId;
    giveQty: number;
    wantItemId: ItemId;
    wantQty: number;
    giveCoins: number;
    wantCoins: number;
  }) => void;
  onAcceptTrade: (tradeId: string) => void;
  onRejectTrade: (tradeId: string) => void;
  onClose: () => void;
  onRefreshPlayers: () => void;
}

function formatLegs(
  catalog: Record<string, ItemDefinition>,
  legs: TradeView["give"],
  coins: number,
): string {
  const parts: string[] = [];
  for (const leg of legs) {
    const name = catalog[leg.itemId]?.name ?? leg.itemId;
    const dur = leg.durability != null ? ` (${leg.durability} dur)` : "";
    parts.push(`${leg.qty}× ${name}${dur}`);
  }
  if (coins > 0) parts.push(`${coins} coins`);
  return parts.length ? parts.join(", ") : "nothing";
}

/**
 * Player trade surface (T) — goods, tools, and coins; offers are escrowed.
 * PL29.1: brief header/border accent when opened from T / invite review.
 * PL123.2: soft Host · preferred-partner nameplate while visiting.
 */
export function TradePanel({
  items,
  trades,
  players,
  preferredPartner = null,
  busy,
  openAccent = false,
  onCreateTrade,
  onAcceptTrade,
  onRejectTrade,
  onClose,
  onRefreshPlayers,
}: TradePanelProps) {
  const tradeItemIds = Object.keys(items) as ItemId[];
  const [toUsername, setToUsername] = useState(preferredPartner ?? "");
  const [giveItemId, setGiveItemId] = useState<ItemId>("wheat");
  const [wantItemId, setWantItemId] = useState<ItemId>("iron_ore");
  const [giveQty, setGiveQty] = useState(1);
  const [wantQty, setWantQty] = useState(1);
  const [giveCoins, setGiveCoins] = useState(0);
  const [wantCoins, setWantCoins] = useState(0);

  const giveIsTool = !items[giveItemId]?.stackable;
  const wantIsTool = !items[wantItemId]?.stackable;
  const partnerNameplate = shouldShowTradePreferredPartnerNameplate(
    preferredPartner,
  )
    ? tradePreferredPartnerNameplateText(preferredPartner)
    : null;
  const partnerBorder = tradePreferredPartnerNameplateBorder(openAccent);
  const copy = SOCIAL_DESK.trade;

  useEffect(() => {
    if (preferredPartner) {
      setToUsername(preferredPartner);
      return;
    }
    if (players.length === 0) return;
    if (!toUsername || !players.some((p) => p.username === toUsername)) {
      setToUsername(players[0].username);
    }
  }, [players, toUsername, preferredPartner]);

  useEffect(() => {
    if (giveIsTool) setGiveQty(1);
  }, [giveIsTool, giveItemId]);

  useEffect(() => {
    if (wantIsTool) setWantQty(1);
  }, [wantIsTool, wantItemId]);

  return (
    <aside
      className={socialDeskClassName("trade", [
        openAccent ? "trade-panel--open-accent" : "",
      ])}
      data-testid="trade-panel"
      data-open-accent={openAccent ? "true" : "false"}
      data-preferred-partner={partnerNameplate ? "1" : "0"}
    >
      <SocialDeskHeader
        hotkey={copy.hotkey}
        kicker={copy.kicker}
        title={copy.title}
        headerClassName="trade-panel__header"
        busy={busy}
        onRefresh={onRefreshPlayers}
        onClose={onClose}
      />
      <p className="muted social-desk__lede">{copy.lede}</p>
      {partnerNameplate ? (
        <div
          className={
            openAccent
              ? "trade-panel__preferred-partner trade-panel__preferred-partner--reinforce"
              : "trade-panel__preferred-partner"
          }
          data-testid="trade-preferred-partner-nameplate"
          data-reinforce={openAccent ? "1" : "0"}
          style={{
            marginTop: 2,
            marginBottom: 8,
            padding: "4px 10px",
            borderRadius: 5,
            border: `1px solid ${partnerBorder}`,
            background: TRADE_PREFERRED_PARTNER_NAMEPLATE.bg,
            color: TRADE_PREFERRED_PARTNER_NAMEPLATE.textColor,
            fontSize: "0.82rem",
            fontWeight: 600,
            letterSpacing: "0.01em",
            boxShadow: openAccent
              ? `0 0 10px color-mix(in srgb, ${TRADE_PREFERRED_PARTNER_NAMEPLATE.borderReinforce} 35%, transparent)`
              : "none",
          }}
        >
          {partnerNameplate}
        </div>
      ) : null}

      <p className="social-desk__section">With</p>
      <label className="social-desk__field">
        <span>Settler</span>
        <select
          value={toUsername}
          onChange={(e) => setToUsername(e.target.value)}
          disabled={players.length === 0}
        >
          {players.length === 0 ? (
            <option value="">No other players yet</option>
          ) : (
            players.map((p) => (
              <option key={p.username} value={p.username}>
                {p.username}
              </option>
            ))
          )}
        </select>
      </label>

      <div className="trade-panel__legs">
        <div className="trade-panel__leg">
          <p className="social-desk__section">You give</p>
          <select
            value={giveItemId}
            onChange={(e) => setGiveItemId(e.target.value as ItemId)}
          >
            {tradeItemIds.map((id) => (
              <option key={id} value={id}>
                {items[id]?.name}
                {!items[id]?.stackable ? " (tool)" : ""}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            max={giveIsTool ? 1 : undefined}
            value={giveQty}
            disabled={giveIsTool}
            onChange={(e) => setGiveQty(Number(e.target.value))}
          />
          <label className="social-desk__field">
            <span>Coins</span>
            <input
              type="number"
              min={0}
              value={giveCoins}
              onChange={(e) => setGiveCoins(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="trade-panel__leg">
          <p className="social-desk__section">You want</p>
          <select
            value={wantItemId}
            onChange={(e) => setWantItemId(e.target.value as ItemId)}
          >
            {tradeItemIds.map((id) => (
              <option key={id} value={id}>
                {items[id]?.name}
                {!items[id]?.stackable ? " (tool)" : ""}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            max={wantIsTool ? 1 : undefined}
            value={wantQty}
            disabled={wantIsTool}
            onChange={(e) => setWantQty(Number(e.target.value))}
          />
          <label className="social-desk__field">
            <span>Coins</span>
            <input
              type="number"
              min={0}
              value={wantCoins}
              onChange={(e) => setWantCoins(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      <button
        className="social-desk__primary"
        type="button"
        disabled={busy || !toUsername.trim()}
        onClick={() =>
          onCreateTrade({
            toUsername,
            giveItemId,
            giveQty: giveIsTool ? 1 : giveQty,
            wantItemId,
            wantQty: wantIsTool ? 1 : wantQty,
            giveCoins,
            wantCoins,
          })
        }
        style={{ width: "100%", marginTop: "0.65rem" }}
      >
        Send offer
      </button>

      <p className="social-desk__section">{tradePendingHeading(trades.length)}</p>
      {trades.length === 0 ? (
        <p className="muted social-desk__empty">No open offers.</p>
      ) : (
        trades.map((trade) => (
          <div key={trade.id} className="social-desk__card">
            <span
              className={
                trade.direction === "incoming"
                  ? "trade-panel__kind trade-panel__kind--in"
                  : "trade-panel__kind"
              }
            >
              {tradeOfferKindLabel(trade.direction)}
            </span>
            <div className="social-desk__card-title">
              {trade.direction === "incoming"
                ? trade.fromUsername
                : trade.toUsername}
            </div>
            <div className="muted social-desk__card-meta">
              They offer: {formatLegs(items, trade.give, trade.giveCoins)}
              <br />
              They ask: {formatLegs(items, trade.want, trade.wantCoins)}
            </div>
            <div className="trade-panel__actions">
              {trade.direction === "incoming" ? (
                <button
                  className="social-desk__primary"
                  type="button"
                  disabled={busy}
                  onClick={() => onAcceptTrade(trade.id)}
                >
                  Accept
                </button>
              ) : null}
              <button
                type="button"
                disabled={busy}
                onClick={() => onRejectTrade(trade.id)}
              >
                {trade.direction === "incoming" ? "Reject" : "Cancel"}
              </button>
            </div>
          </div>
        ))
      )}
    </aside>
  );
}
