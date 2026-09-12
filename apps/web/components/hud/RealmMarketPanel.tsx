"use client";

import { useMemo, useState } from "react";
import {
  ITEMS,
  TOKEN_MARKET,
  formatRealmAmount,
  type ItemId,
  type PlayerStateDto,
} from "@game/shared";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  CreditcoinSection,
  creditcoinStatusClass,
} from "@/components/hud/creditcoin-panel-ui";
import { MarketListInventoryPicker } from "@/components/hud/MarketListInventoryPicker";
import {
  clampMarketListQty,
  listableInventoryItems,
  selectedListableInventoryItem,
} from "@/lib/hud/market-list-inventory";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";

interface RealmMarketPanelProps {
  state: PlayerStateDto;
  busy: boolean;
  onClose: () => void;
  onListItem: (itemId: ItemId, qty: number, priceRealm: number) => void;
  onBuyItem: (listingId: string) => void;
  onCancelItem: (listingId: string) => void;
  openAccent?: boolean;
}

/**
 * Indigo stall (E) — REALM item listings, separate from the B Creditcoin desk.
 *
 * @param props - Player snapshot plus list / buy / cancel handlers.
 * @returns REALM market desk.
 */
export function RealmMarketPanel({
  state,
  busy,
  onClose,
  onListItem,
  onBuyItem,
  onCancelItem,
  openAccent = false,
}: RealmMarketPanelProps) {
  const chain = state.chain ?? null;
  const [listItemId, setListItemId] = useState<ItemId>("wheat");
  const [listQty, setListQty] = useState(1);
  const [listPrice, setListPrice] = useState(1);
  const linked = Boolean(state.walletAddress);
  const ownedGoods = useMemo(
    () => listableInventoryItems(state.inventory, ITEMS),
    [state.inventory],
  );
  const selectedGood = selectedListableInventoryItem(ownedGoods, listItemId);
  const availableQty = selectedGood?.qty ?? 0;
  const qtyToList = clampMarketListQty(listQty, availableQty);

  return (
    <aside
      className={gameDeskClassName("creditcoin-panel realm-market-panel", [
        openAccent ? "creditcoin-panel--open-accent" : "",
      ])}
      data-testid="realm-market-panel"
      data-open-accent={openAccent ? "true" : "false"}
    >
      <SocialDeskHeader
        hotkey={GAME_DESK.realmMarket.hotkey}
        kicker={GAME_DESK.realmMarket.kicker}
        title={GAME_DESK.realmMarket.title}
        headerClassName="creditcoin-panel__header"
        onClose={onClose}
      />
      <p className="creditcoin-panel__lede">{GAME_DESK.realmMarket.lede}</p>

      <CreditcoinSection
        label="Listings"
        hint={TOKEN_MARKET.disclaimer}
        sectionId="creditcoin-realm-market"
      >
        <div className="market-panel__list-form">
          <MarketListInventoryPicker
            rows={ownedGoods}
            selectedItemId={selectedGood?.itemId}
            disabled={busy}
            onSelect={(id) => {
              setListItemId(id);
              setListQty(1);
            }}
          />
          <div className="creditcoin-panel__row">
            <input
              type="number"
              min={1}
              max={availableQty || undefined}
              value={qtyToList || ""}
              disabled={busy || !selectedGood}
              onChange={(e) => setListQty(Number(e.target.value))}
              style={{ width: 56 }}
              title="Qty"
            />
            <input
              type="number"
              min={TOKEN_MARKET.minPriceRealm}
              max={TOKEN_MARKET.maxPriceRealm}
              value={listPrice}
              disabled={busy || !selectedGood}
              onChange={(e) => setListPrice(Number(e.target.value))}
              style={{ width: 64 }}
              title="Price REALM"
            />
            <button
              type="button"
              disabled={busy || !linked || !selectedGood || qtyToList < 1}
              onClick={() => {
                if (!selectedGood || qtyToList < 1) return;
                onListItem(selectedGood.itemId, qtyToList, listPrice);
              }}
            >
              List
            </button>
          </div>
        </div>
        {!linked ? (
          <p className="creditcoin-panel__hint">
            Connect MetaMask in Creditcoin (B) before listing or buying.
          </p>
        ) : null}
        {(chain?.tokenListings ?? []).length === 0 ? (
          <p className="creditcoin-panel__empty">No REALM listings.</p>
        ) : (
          <div className="creditcoin-panel__list">
            {(chain?.tokenListings ?? []).map((row) => (
              <div key={row.id} className="creditcoin-panel__item">
                <div>
                  {row.qty}× {ITEMS[row.itemId as ItemId]?.name ?? row.itemId} ·{" "}
                  {formatRealmAmount(row.priceRealm)} REALM
                  <span className={creditcoinStatusClass(row.status)}>
                    {row.status}
                  </span>
                  <div className="creditcoin-panel__item-meta">
                    {row.sellerUsername}
                    {row.status === "escrowed"
                      ? " · waiting for Creditcoin"
                      : ""}
                  </div>
                </div>
                {row.mine ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onCancelItem(row.id)}
                  >
                    Cancel
                  </button>
                ) : row.status === "listed" && row.onchainListingId ? (
                  <button
                    type="button"
                    className="creditcoin-panel__btn-primary"
                    disabled={busy || !linked}
                    onClick={() => onBuyItem(row.id)}
                  >
                    Buy
                  </button>
                ) : (
                  <span className="creditcoin-panel__hint">Pending chain</span>
                )}
              </div>
            ))}
          </div>
        )}
      </CreditcoinSection>
    </aside>
  );
}
