"use client";

import { useEffect, useState } from "react";
import {
  LAND_DEED,
  formatChainPriceLabel,
  type ChainMarketListingDto,
  type LandDeedDto,
} from "@game/shared";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";

interface DeedPanelProps {
  deeds: LandDeedDto[];
  market: LandDeedDto[];
  chainListings: ChainMarketListingDto[];
  chainNetwork?: string;
  softCurrency: number;
  busy: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onClaim: () => void;
  onMint: (deedId: string) => void;
  onList: (deedId: string, priceCoins: number) => void;
  onUnlist: (deedId: string) => void;
  /** PL55.2 — brief header/border accent when Deed desk opens (B / settings path). */
  openAccent?: boolean;
}

/**
 * Deed desk (B) — mint/list stubs + read-only on-chain price mirror (F15.3–F15.4).
 * PL55.2: brief open accent on B open; no combat power; core loops stay wallet-free.
 */
export function DeedPanel({
  deeds,
  market,
  chainListings,
  chainNetwork = "stub-testnet",
  softCurrency,
  busy,
  onClose,
  onRefresh,
  onClaim,
  onMint,
  onList,
  onUnlist,
  openAccent = false,
}: DeedPanelProps) {
  const [priceById, setPriceById] = useState<Record<string, number>>({});

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  return (
    <aside
      className={gameDeskClassName("deed-panel", [
        openAccent ? "deed-panel--open-accent" : "",
      ])}
      data-testid="deed-panel"
      data-open-accent={openAccent ? "true" : "false"}
    >
      <SocialDeskHeader
        hotkey={GAME_DESK.deeds.hotkey}
        kicker={GAME_DESK.deeds.kicker}
        title={GAME_DESK.deeds.title}
        headerClassName="deed-panel__header"
        busy={busy}
        onRefresh={onRefresh}
        onClose={onClose}
      />
      <p className="muted social-desk__lede">{GAME_DESK.deeds.lede}</p>
      <p
        style={{
          fontSize: "0.8rem",
          margin: "8px 0",
          padding: "8px 10px",
          background: "rgba(90,60,20,0.35)",
          border: "1px solid #8a6a3a",
          borderRadius: 6,
        }}
      >
        {LAND_DEED.disclaimer}
      </p>

      <h4 style={{ margin: "0 0 6px", fontSize: "0.9rem" }}>Your deeds</h4>
      {deeds.length === 0 ? (
        <div style={{ marginBottom: 12 }}>
          <p className="muted" style={{ fontSize: "0.8rem" }}>
            No deed yet. Claim an off-chain record for soft currency.
          </p>
          <button type="button" disabled={busy} onClick={onClaim}>
            Claim {LAND_DEED.title} ({LAND_DEED.claimCostCoins}c · {softCurrency}c)
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
          {deeds.map((d) => {
            const price =
              priceById[d.id] ?? d.listPriceCoins ?? LAND_DEED.defaultListPrice;
            return (
              <div
                key={d.id}
                style={{
                  borderTop: "1px solid #3a4b36",
                  paddingTop: 8,
                  fontSize: "0.85rem",
                }}
              >
                <strong>{d.title}</strong>
                <div className="muted" style={{ fontSize: "0.75rem" }}>
                  {d.landKind} · {d.status}
                  {d.mintTxStub
                    ? ` · mint ${d.mintTxStub.slice(0, 10)}…`
                    : " · not minted"}
                  {d.status === "listed" && d.listPriceCoins != null
                    ? ` · ${d.listPriceCoins}c`
                    : ""}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  {!d.mintTxStub ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onMint(d.id)}
                    >
                      Mint stub
                    </button>
                  ) : null}
                  {d.mintTxStub && d.status !== "listed" ? (
                    <>
                      <input
                        type="number"
                        min={LAND_DEED.minListPrice}
                        max={LAND_DEED.maxListPrice}
                        value={price}
                        disabled={busy}
                        onChange={(e) =>
                          setPriceById((prev) => ({
                            ...prev,
                            [d.id]: Number(e.target.value),
                          }))
                        }
                        style={{ width: 72 }}
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onList(d.id, price)}
                      >
                        List
                      </button>
                    </>
                  ) : null}
                  {d.status === "listed" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onUnlist(d.id)}
                    >
                      Unlist
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h4 style={{ margin: "0 0 6px", fontSize: "0.9rem" }}>Soft listings</h4>
      <p className="muted" style={{ fontSize: "0.75rem" }}>
        In-game board (soft coins).
      </p>
      {market.length === 0 ? (
        <p className="muted" style={{ fontSize: "0.8rem", marginBottom: 12 }}>
          No soft listings yet.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
          {market.map((m) => (
            <div
              key={m.id}
              style={{
                fontSize: "0.8rem",
                borderTop: "1px solid #3a4b36",
                paddingTop: 6,
              }}
            >
              <strong>{m.title}</strong> · {m.listPriceCoins}c
              <div className="muted" style={{ fontSize: "0.72rem" }}>
                {m.sellerUsername ?? "?"} · {m.landKind}
              </div>
            </div>
          ))}
        </div>
      )}

      <h4 style={{ margin: "0 0 6px", fontSize: "0.9rem" }}>
        On-chain mirror ({chainNetwork})
      </h4>
      <p className="muted" style={{ fontSize: "0.75rem" }}>
        Read-only · prices mirrored from soft board · not required to play · never
        combat power.
      </p>
      <div style={{ display: "grid", gap: 6 }}>
        {chainListings.map((row) => (
          <div
            key={row.id}
            style={{
              fontSize: "0.8rem",
              borderTop: "1px solid #3a4b36",
              paddingTop: 6,
            }}
          >
            <strong>{row.title}</strong>
            <div>
              {row.softPriceCoins}c → {formatChainPriceLabel(row.chainPriceWei)}
            </div>
            <div className="muted" style={{ fontSize: "0.72rem" }}>
              {row.seller} · {row.landKind} · {row.source.replace("_", " ")}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
