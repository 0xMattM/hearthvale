"use client";

import type { ItemDefinition, ItemId, MarketItemAnalytics } from "@game/shared";
import { MARKET, formatGrowRemaining } from "@game/shared";
import { useEffect, useMemo, useState } from "react";
import {
  commerceBuyAffordMode,
  marketBuyShortFundsHint,
} from "@/lib/hud/commerce-afford";
import { ItemIcon } from "@/components/hud/ItemIcon";
import { MarketListInventoryPicker } from "@/components/hud/MarketListInventoryPicker";
import {
  clampMarketListQty,
  listableInventoryItems,
  selectedListableInventoryItem,
} from "@/lib/hud/market-list-inventory";
import {
  filterMarketListings,
  marketListingsEmptyMessage,
} from "@/lib/hud/market-listing-filter";
import { MarketAnalyticsView } from "@/components/hud/MarketAnalyticsView";
import { apiGetMarketAnalytics } from "@/lib/api";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";

export interface MarketListingView {
  id: string;
  sellerUsername: string;
  itemId: string;
  qty: number;
  priceCoins: number;
  mine: boolean;
  createdAt?: number;
  expiresAt?: number;
}

interface MarketPanelProps {
  items: Record<string, ItemDefinition>;
  /** Bag stacks — list picker shows owned stackables only. */
  inventory: Array<{ itemId: string; qty: number }>;
  listings: MarketListingView[];
  nowMs: number;
  /** Soft coins for buy-row short-funds clarity (PL32.2). */
  softCurrency: number;
  busy: boolean;
  /** Session token for analytics GET. */
  authToken: string;
  /** PL19.2 — brief open accent after board/hotkey open (same panel). */
  openAccent?: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onCreate: (input: { itemId: ItemId; qty: number; priceCoins: number }) => void;
  onBuy: (listingId: string) => void;
  onCancel: (listingId: string) => void;
}

/**
 * Player marketplace board (M) — fee + TTL (F11.4).
 * PL19.2: brief header/border accent when opened from board or hotkey.
 * PL32.2: soft short-funds hint + muted buy when coins are insufficient.
 * Analytics: search a stackable for board / sales / vendor NPC price hints.
 */
export function MarketPanel({
  items,
  inventory,
  listings,
  nowMs,
  softCurrency,
  busy,
  authToken,
  openAccent = false,
  onClose,
  onRefresh,
  onCreate,
  onBuy,
  onCancel,
}: MarketPanelProps) {
  const ownedGoods = useMemo(
    () => listableInventoryItems(inventory, items),
    [inventory, items],
  );
  const [itemId, setItemId] = useState<ItemId>("wheat");
  const [qty, setQty] = useState(1);
  const [priceCoins, setPriceCoins] = useState(5);
  const selectedGood = selectedListableInventoryItem(ownedGoods, itemId);
  const availableQty = selectedGood?.qty ?? 0;
  const listQty = clampMarketListQty(qty, availableQty);
  const [query, setQuery] = useState("");
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsQuery, setAnalyticsQuery] = useState("");
  const [analyticsItemId, setAnalyticsItemId] = useState<ItemId>("wheat");
  const [analytics, setAnalytics] = useState<MarketItemAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const filtered = useMemo(
    () => filterMarketListings(listings, items, query),
    [listings, items, query],
  );

  useEffect(() => {
    if (!analyticsOpen || !authToken) return;
    let cancelled = false;
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    void apiGetMarketAnalytics(authToken, analyticsItemId).then((res) => {
      if (cancelled) return;
      setAnalyticsLoading(false);
      if (!res.ok || !res.analytics) {
        setAnalytics(null);
        setAnalyticsError(res.error ?? "Could not load analytics");
        return;
      }
      setAnalytics(res.analytics);
    });
    return () => {
      cancelled = true;
    };
  }, [analyticsOpen, analyticsItemId, authToken]);

  return (
    <aside
      className={gameDeskClassName("market-panel", [
        openAccent ? "market-panel--open-accent" : "",
        analyticsOpen ? "market-panel--analytics" : "",
      ])}
      data-testid="market-panel"
      data-open-accent={openAccent ? "true" : "false"}
    >
      <SocialDeskHeader
        hotkey={GAME_DESK.market.hotkey}
        kicker={GAME_DESK.market.kicker}
        title={analyticsOpen ? "Analytics" : GAME_DESK.market.title}
        headerClassName="market-panel__header"
        actions={
          <button
            type="button"
            data-testid="market-analytics-toggle"
            aria-pressed={analyticsOpen}
            onClick={() => {
              const next = !analyticsOpen;
              setAnalyticsOpen(next);
              if (next) {
                const id = selectedGood?.itemId ?? itemId;
                setAnalyticsItemId(id);
                setAnalyticsQuery(items[id]?.name ?? "");
              }
            }}
          >
            {analyticsOpen ? "Board" : "Analytics"}
          </button>
        }
        onClose={onClose}
      />
      <p className="muted social-desk__lede">
        Listing fee {MARKET.listFeeCoins}c. Listings expire after{" "}
        {Math.round(MARKET.listingTtlMs / 60_000)} min and return goods.
      </p>
      {analyticsOpen ? (
        <MarketAnalyticsView
          items={items}
          query={analyticsQuery}
          onQueryChange={setAnalyticsQuery}
          selectedItemId={analyticsItemId}
          onSelectItem={setAnalyticsItemId}
          analytics={analytics}
          loading={analyticsLoading}
          error={analyticsError}
          qty={qty}
          onUseSuggested={(input) => {
            setItemId(input.itemId);
            setPriceCoins(input.priceCoins);
            setAnalyticsOpen(false);
          }}
        />
      ) : (
        <>
      <div className="market-panel__list-form">
        <MarketListInventoryPicker
          rows={ownedGoods}
          selectedItemId={selectedGood?.itemId}
          disabled={busy}
          onSelect={(id) => {
            setItemId(id);
            setQty(1);
          }}
        />
        <input
          type="number"
          min={1}
          max={availableQty || undefined}
          value={listQty || ""}
          disabled={busy || !selectedGood}
          onChange={(e) => setQty(Number(e.target.value))}
          placeholder="Qty"
          title="Qty to list"
        />
        <input
          type="number"
          min={1}
          value={priceCoins}
          disabled={busy || !selectedGood}
          onChange={(e) => setPriceCoins(Number(e.target.value))}
          placeholder="Price in coins"
        />
        <button
          type="button"
          disabled={busy || !selectedGood || listQty < 1}
          onClick={() => {
            if (!selectedGood || listQty < 1) return;
            onCreate({
              itemId: selectedGood.itemId,
              qty: listQty,
              priceCoins,
            });
          }}
        >
          List for sale (−{MARKET.listFeeCoins}c fee)
        </button>
        <button type="button" disabled={busy} onClick={onRefresh}>
          Refresh board
        </button>
      </div>
      <h4 style={{ margin: "1rem 0 0.4rem" }}>Open listings</h4>
      {listings.length > 0 ? (
        <label className="market-panel__search">
          <span className="visually-hidden">Search listings</span>
          <input
            type="search"
            data-testid="market-listing-search"
            placeholder="Search items or sellers…"
            value={query}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      ) : null}
      {filtered.length === 0 ? (
        <p
          className="muted"
          style={{ fontSize: "0.8rem" }}
          data-testid="market-listings-empty"
        >
          {marketListingsEmptyMessage(listings.length, query)}
        </p>
      ) : (
        filtered.map((listing) => {
          const remain =
            listing.expiresAt != null
              ? Math.max(0, listing.expiresAt - nowMs)
              : null;
          // Reason: PL32.2 — short-funds clarity on others' buy rows only; own cancel unchanged.
          const buyShort =
            !listing.mine &&
            commerceBuyAffordMode(softCurrency, listing.priceCoins) === "short";
          const shortHint = listing.mine
            ? null
            : marketBuyShortFundsHint(softCurrency, listing.priceCoins);
          return (
            <div
              key={listing.id}
              className={
                buyShort
                  ? "market-panel__listing market-panel__listing--short"
                  : "market-panel__listing"
              }
              data-afford={listing.mine ? "own" : buyShort ? "short" : "affordable"}
              data-testid={`market-listing-${listing.id}`}
            >
              <ItemIcon itemId={listing.itemId} />
              <div className="market-panel__listing-body">
                <div style={{ fontSize: "0.85rem" }}>
                  <strong>
                    {listing.qty}× {items[listing.itemId]?.name ?? listing.itemId}
                  </strong>{" "}
                  · {listing.priceCoins} coins
                  {shortHint ? (
                    <span className="market-panel__short-hint"> · {shortHint}</span>
                  ) : null}
                </div>
                <div className="muted" style={{ fontSize: "0.75rem" }}>
                  Seller {listing.sellerUsername}
                  {listing.mine ? " (you)" : ""}
                  {remain != null ? ` · expires ${formatGrowRemaining(remain)}` : ""}
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  {listing.mine ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onCancel(listing.id)}
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={
                        buyShort ? "market-panel__buy market-panel__buy--short" : undefined
                      }
                      disabled={busy || buyShort}
                      onClick={() => onBuy(listing.id)}
                    >
                      {buyShort ? "Short coins" : "Buy"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
        </>
      )}
    </aside>
  );
}
