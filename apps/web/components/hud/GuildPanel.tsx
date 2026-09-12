"use client";

import { useEffect, useState } from "react";
import { ITEMS, type GuildRank, type ItemId } from "@game/shared";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";
import type { PendingGuildInvite } from "@/lib/hud/guild-invite-closed-glance";

interface GuildMemberRow {
  username: string;
  rank: GuildRank;
}

interface BankStack {
  itemId: string;
  qty: number;
}

interface DepositOption {
  itemId: string;
  qty: number;
}

interface GuildPanelProps {
  guildName: string | null;
  guildRank: GuildRank | null;
  guildInviteCode: string | null;
  guilds: Array<{ name: string; members: number }>;
  members: GuildMemberRow[];
  bank: BankStack[];
  depositOptions: DepositOption[];
  busy: boolean;
  /** PL46.1 — brief system open accent (non-member / generic). */
  openAccent?: boolean;
  /** PL140.2 — brief membership open accent when already in a guild. */
  membershipOpenAccent?: boolean;
  /** PL189.2 — unanswered soft invite offers while not in a guild. */
  pendingInvites?: PendingGuildInvite[];
  onCreate: (name: string) => void;
  onJoinByCode: (code: string) => void;
  onLeave: () => void;
  onRefresh: () => void;
  onRegenerateInvite: () => void;
  /** PL189.2 — soft-offer existing code to a nearby player. */
  onOfferInvite?: (toUsername: string) => void;
  /** PL189.2 — dismiss an unanswered soft offer. */
  onDismissPendingInvite?: (code: string) => void;
  onSetRank: (username: string, rank: "officer" | "member") => void;
  onDeposit: (itemId: string, qty: number) => void;
  onWithdraw: (itemId: string, qty: number) => void;
  onClose: () => void;
}

/**
 * Guild social layer (G) — ranks, invites, shared bank (F12.1–F12.2).
 */
export function GuildPanel({
  guildName,
  guildRank,
  guildInviteCode,
  guilds,
  members,
  bank,
  depositOptions,
  busy,
  openAccent = false,
  membershipOpenAccent = false,
  pendingInvites = [],
  onCreate,
  onJoinByCode,
  onLeave,
  onRefresh,
  onRegenerateInvite,
  onOfferInvite,
  onDismissPendingInvite,
  onSetRank,
  onDeposit,
  onWithdraw,
  onClose,
}: GuildPanelProps) {
  const [name, setName] = useState("");
  const [invite, setInvite] = useState("");
  const [offerTo, setOfferTo] = useState("");
  const [depositItem, setDepositItem] = useState("");
  const [depositQty, setDepositQty] = useState(1);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  useEffect(() => {
    if (
      depositOptions.length > 0 &&
      !depositOptions.some((o) => o.itemId === depositItem)
    ) {
      setDepositItem(depositOptions[0]!.itemId);
    }
  }, [depositOptions, depositItem]);

  // Reason: PL189.2 — prefill join field from first unanswered soft offer.
  useEffect(() => {
    if (guildName) return;
    if (invite.trim().length > 0) return;
    const first = pendingInvites[0];
    if (first?.code) setInvite(first.code);
  }, [guildName, invite, pendingInvites]);

  const canManageInvite = guildRank === "owner" || guildRank === "officer";
  const copy = GAME_DESK.guild;

  return (
    <aside
      className={gameDeskClassName("guild-panel", [
        membershipOpenAccent
          ? "guild-panel--member-open-accent"
          : openAccent
            ? "guild-panel--open-accent"
            : "",
      ])}
      data-open-accent={openAccent || membershipOpenAccent ? "true" : "false"}
      data-member-open-accent={membershipOpenAccent ? "true" : "false"}
      data-testid="guild-panel"
    >
      <SocialDeskHeader
        hotkey={copy.hotkey}
        kicker={copy.kicker}
        title={copy.title}
        headerClassName="guild-panel__header"
        onClose={onClose}
      />
      <p className="muted social-desk__lede">{copy.lede}</p>
      {guildName ? (
        <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
          <div>
            You are in <strong>{guildName}</strong>{" "}
            <span className="muted">({guildRank ?? "member"})</span>
          </div>
          {canManageInvite && guildInviteCode ? (
            <div style={{ fontSize: "0.85rem" }}>
              Invite code: <strong>{guildInviteCode}</strong>
              <button
                type="button"
                disabled={busy}
                onClick={onRegenerateInvite}
                style={{ marginLeft: 8 }}
              >
                New code
              </button>
              {onOfferInvite ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 4,
                    marginTop: 6,
                    alignItems: "center",
                  }}
                >
                  <input
                    value={offerTo}
                    onChange={(e) => setOfferTo(e.target.value)}
                    placeholder="Nearby player"
                    style={{ flex: 1, minWidth: 120 }}
                    data-testid="guild-invite-offer-input"
                  />
                  <button
                    type="button"
                    disabled={busy || offerTo.trim().length < 2}
                    onClick={() => onOfferInvite(offerTo)}
                    data-testid="guild-invite-offer-btn"
                  >
                    Offer nearby
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="muted" style={{ fontSize: "0.8rem", margin: 0 }}>
              Ask an officer for the invite code to recruit.
            </p>
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
              Guild bank
            </div>
            {bank.length === 0 ? (
              <p className="muted" style={{ fontSize: "0.8rem", margin: "4px 0" }}>
                Empty — deposit stackables from your bag.
              </p>
            ) : (
              bank.map((row) => (
                <div
                  key={row.itemId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 6,
                    fontSize: "0.85rem",
                    marginTop: 4,
                  }}
                >
                  <span>
                    {ITEMS[row.itemId as ItemId]?.name ?? row.itemId} ×{row.qty}
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onWithdraw(row.itemId, 1)}
                  >
                    Take 1
                  </button>
                </div>
              ))
            )}
            {depositOptions.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                  marginTop: 6,
                  alignItems: "center",
                }}
              >
                <select
                  value={depositItem}
                  onChange={(e) => setDepositItem(e.target.value)}
                  style={{ flex: 1, minWidth: 120 }}
                >
                  {depositOptions.map((o) => (
                    <option key={o.itemId} value={o.itemId}>
                      {ITEMS[o.itemId as ItemId]?.name ?? o.itemId} ({o.qty})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={depositQty}
                  onChange={(e) => setDepositQty(Number(e.target.value) || 1)}
                  style={{ width: 56 }}
                />
                <button
                  type="button"
                  disabled={busy || !depositItem}
                  onClick={() => onDeposit(depositItem, depositQty)}
                >
                  Deposit
                </button>
              </div>
            ) : null}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>Members</div>
            {members.map((m) => (
              <div
                key={m.username}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.85rem",
                  marginTop: 4,
                }}
              >
                <span>
                  {m.username} ({m.rank})
                </span>
                {guildRank === "owner" && m.rank !== "owner" ? (
                  <span style={{ display: "flex", gap: 4 }}>
                    {m.rank !== "officer" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onSetRank(m.username, "officer")}
                      >
                        Officer
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onSetRank(m.username, "member")}
                      >
                        Member
                      </button>
                    )}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <button type="button" disabled={busy} onClick={onLeave}>
            Leave guild
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
          {pendingInvites.length > 0 ? (
            <div
              data-testid="guild-pending-invites"
              style={{ display: "grid", gap: 4, marginBottom: 4 }}
            >
              <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                Pending invites
              </div>
              {pendingInvites.map((inv) => (
                <div
                  key={inv.code}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 4,
                    alignItems: "center",
                    fontSize: "0.85rem",
                  }}
                >
                  <span>
                    {inv.guildName ? (
                      <>
                        <strong>{inv.guildName}</strong> ·{" "}
                      </>
                    ) : null}
                    from {inv.fromUsername}
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onJoinByCode(inv.code)}
                  >
                    Join
                  </button>
                  {onDismissPendingInvite ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onDismissPendingInvite(inv.code)}
                    >
                      Dismiss
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Guild name"
          />
          <button
            type="button"
            disabled={busy || name.trim().length < 3}
            onClick={() => onCreate(name)}
          >
            Create guild
          </button>
          <input
            value={invite}
            onChange={(e) => setInvite(e.target.value.toUpperCase())}
            placeholder="Invite code"
          />
          <button
            type="button"
            disabled={busy || invite.trim().length < 4}
            onClick={() => onJoinByCode(invite)}
          >
            Join with code
          </button>
          <button type="button" disabled={busy} onClick={onRefresh}>
            Refresh list
          </button>
          {guilds.map((g) => (
            <div key={g.name} style={{ fontSize: "0.85rem" }}>
              {g.name} ({g.members}) — need invite
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
