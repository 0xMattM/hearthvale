"use client";

import type { ItemDefinition, ItemId, MarketItemAnalytics } from "@game/shared";
import {
  MARKET_SUGGEST_REASON_LABEL,
  filterTradableMarketItems,
  formatCoinsEach,
  suggestedListingTotal,
  vendorCompareHint,
} from "@game/shared";
import { ItemIcon } from "@/components/hud/ItemIcon";

interface MarketAnalyticsViewProps {
  items: Record<string, ItemDefinition>;
  query: string;
  onQueryChange: (query: string) => void;
  selectedItemId: ItemId;
  onSelectItem: (itemId: ItemId) => void;
  analytics: MarketItemAnalytics | null;
  loading: boolean;
  error: string | null;
  qty: number;
  onUseSuggested: (input: { itemId: ItemId; priceCoins: number }) => void;
}

/**
 * Market analytics lookup — search a stackable and read board / sales / NPC.
 */
export function MarketAnalyticsView({
  items,
  query,
  onQueryChange,
  selectedItemId,
  onSelectItem,
  analytics,
  loading,
  error,
  qty,
  onUseSuggested,
}: MarketAnalyticsViewProps) {
  const matches = filterTradableMarketItems(items, query);
  const suggestedTotal = suggestedListingTotal(
    analytics?.suggestedUnitCoins ?? null,
    qty,
  );
  const vendorHint = vendorCompareHint(
    analytics?.suggestedUnitCoins ?? null,
    analytics?.vendorNpcCoins ?? null,
  );
  const selectedName =
    items[selectedItemId]?.name ?? analytics?.itemId ?? selectedItemId;

  return (
    <div className="market-analytics" data-testid="market-analytics">
      <p className="muted" style={{ fontSize: "0.8rem", margin: "0 0 8px" }}>
        Search an item to see live asks, recent sales, and the city vendor
        buyback — then price your listing.
      </p>
      <label className="market-panel__search">
        <span className="visually-hidden">Search items for analytics</span>
        <input
          type="search"
          data-testid="market-analytics-search"
          placeholder="Search item to price…"
          value={query}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      {matches.length === 0 ? (
        <p className="muted" style={{ fontSize: "0.8rem" }}>
          No tradable items match.
        </p>
      ) : (
        <div className="market-analytics__items">
          {matches.map((id) => {
            const active = id === selectedItemId;
            return (
              <button
                key={id}
                type="button"
                className={
                  active
                    ? "market-analytics__item market-analytics__item--active"
                    : "market-analytics__item"
                }
                data-testid={`market-analytics-item-${id}`}
                aria-pressed={active}
                onClick={() => onSelectItem(id)}
              >
                <ItemIcon itemId={id} />
                <span>{items[id]?.name ?? id}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="market-analytics__card">
        <div className="market-analytics__card-head">
          <ItemIcon itemId={selectedItemId} />
          <div>
            <strong>{selectedName}</strong>
            <div className="muted" style={{ fontSize: "0.75rem" }}>
              Unit prices (coins each)
            </div>
          </div>
        </div>
        {loading ? (
          <p className="muted" style={{ fontSize: "0.8rem" }}>
            Loading prices…
          </p>
        ) : null}
        {error ? (
          <p
            className="market-analytics__error"
            data-testid="market-analytics-error"
          >
            {error}
          </p>
        ) : null}
        {analytics && !loading ? (
          <>
            <dl className="market-analytics__stats">
              <div>
                <dt>Lowest ask</dt>
                <dd data-testid="market-analytics-lowest">
                  {formatCoinsEach(analytics.board.lowestUnit)}
                </dd>
              </div>
              <div>
                <dt>Median</dt>
                <dd>{formatCoinsEach(analytics.board.medianUnit)}</dd>
              </div>
              <div>
                <dt>Highest ask</dt>
                <dd>{formatCoinsEach(analytics.board.highestUnit)}</dd>
              </div>
              <div>
                <dt>On board</dt>
                <dd>
                  {analytics.board.listingCount} listing
                  {analytics.board.listingCount === 1 ? "" : "s"} ·{" "}
                  {analytics.board.qtyOnBoard} qty
                </dd>
              </div>
              <div>
                <dt>Last sold</dt>
                <dd>{formatCoinsEach(analytics.sold.lastUnit)}</dd>
              </div>
              <div>
                <dt>Avg sold</dt>
                <dd>{formatCoinsEach(analytics.sold.avgUnit)}</dd>
              </div>
              <div>
                <dt>Sold range</dt>
                <dd>
                  {analytics.sold.minUnit == null
                    ? "—"
                    : `${formatCoinsEach(analytics.sold.minUnit)}–${formatCoinsEach(analytics.sold.maxUnit)}`}
                </dd>
              </div>
              <div>
                <dt>Volume</dt>
                <dd>
                  {analytics.sold.saleCount} sale
                  {analytics.sold.saleCount === 1 ? "" : "s"} ·{" "}
                  {analytics.sold.qtySold} qty
                </dd>
              </div>
              <div>
                <dt>Vendor NPC</dt>
                <dd data-testid="market-analytics-vendor">
                  {analytics.vendorNpcCoins == null
                    ? "Won't buy"
                    : `${analytics.vendorNpcCoins}c`}
                </dd>
              </div>
            </dl>
            <div className="market-analytics__suggest">
              <div>
                <strong data-testid="market-analytics-suggested">
                  Suggested {formatCoinsEach(analytics.suggestedUnitCoins)}
                </strong>
                <div className="muted" style={{ fontSize: "0.75rem" }}>
                  {MARKET_SUGGEST_REASON_LABEL[analytics.suggestedReason]}
                  {vendorHint ? ` · ${vendorHint}` : ""}
                </div>
              </div>
              {suggestedTotal != null ? (
                <button
                  type="button"
                  data-testid="market-analytics-use-price"
                  onClick={() =>
                    onUseSuggested({
                      itemId: analytics.itemId,
                      priceCoins: suggestedTotal,
                    })
                  }
                >
                  Use {suggestedTotal}c for {qty}×
                </button>
              ) : (
                <p className="muted" style={{ fontSize: "0.75rem", margin: 0 }}>
                  No suggested list price yet.
                </p>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
