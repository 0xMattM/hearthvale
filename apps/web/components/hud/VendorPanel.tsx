"use client";

import type { ItemDefinition, ItemId, LandKind } from "@game/shared";
import { commerceBuyAffordMode } from "@/lib/hud/commerce-afford";
import { ItemIcon } from "@/components/hud/ItemIcon";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";

interface VendorPanelProps {
  items: Record<string, ItemDefinition>;
  landKind: LandKind;
  vendor: {
    sell: Partial<Record<ItemId, number>>;
    buy: Partial<Record<ItemId, number>>;
  };
  /** Soft coins for buy-row afford tint (PL32.1). */
  softCurrency: number;
  busy: boolean;
  /** PL19.1 — brief open accent after walk-up open (same panel). */
  openAccent?: boolean;
  onBuy: (itemId: ItemId, qty: number) => void;
  onSell: (itemId: ItemId, qty: number) => void;
  onClose: () => void;
}

/**
 * Regional vendor — prices follow the active land (F11.3).
 * PL19.1: brief header/border accent when opened from walk-up.
 * PL32.1: quiet buy-row tint when affordable vs short coins.
 */
export function VendorPanel({
  items,
  landKind,
  vendor,
  softCurrency,
  busy,
  openAccent = false,
  onBuy,
  onSell,
  onClose,
}: VendorPanelProps) {
  const regionLabel =
    landKind === "city"
      ? "City Hub"
      : landKind === "forest" || landKind === "explore"
        ? "Forest Glade"
        : "Homestead";
  const copy = GAME_DESK.vendor;
  const buyEntries = Object.entries(vendor.buy) as Array<[ItemId, number]>;
  const sellEntries = Object.entries(vendor.sell) as Array<[ItemId, number]>;

  return (
    <aside
      className={gameDeskClassName("vendor-panel", [
        openAccent ? "vendor-panel--open-accent" : "",
      ])}
      data-testid="vendor-panel"
      data-open-accent={openAccent ? "true" : "false"}
    >
      <SocialDeskHeader
        hotkey={copy.hotkey}
        kicker={copy.kicker}
        title={copy.title}
        extra={<span className="social-desk__extra">{regionLabel}</span>}
        headerClassName="vendor-panel__header"
        onClose={onClose}
      />
      <p className="vendor-panel__lede muted social-desk__lede">
        {landKind === "city"
          ? "City NPC — basic tools and seeds. Player goods list at the market board."
          : "Regional prices — forest pays more for wood/hunt mats; seeds cost more there."}
      </p>
      {buyEntries.length > 0 ? (
        <p className="vendor-panel__section">Buy</p>
      ) : null}
      <div className="vendor-panel__list">
        {buyEntries.map(([itemId, price]) => {
          // Reason: PL32.1 — quiet afford tint only on buy rows; sell stays neutral.
          const afford = commerceBuyAffordMode(softCurrency, price);
          return (
            <button
              key={`b-${itemId}`}
              type="button"
              className={
                afford === "affordable"
                  ? "vendor-panel__row vendor-panel__buy vendor-panel__buy--affordable"
                  : "vendor-panel__row vendor-panel__buy vendor-panel__buy--short"
              }
              data-afford={afford}
              data-testid={`vendor-buy-${itemId}`}
              disabled={busy}
              onClick={() => onBuy(itemId, 1)}
            >
              <ItemIcon itemId={itemId} />
              <span className="vendor-panel__row-copy">
                <span className="vendor-panel__row-name">
                  {items[itemId]?.name ?? itemId}
                </span>
              </span>
              <span className="vendor-panel__row-price">{price}c</span>
            </button>
          );
        })}
      </div>
      {sellEntries.length > 0 ? (
        <p className="vendor-panel__section">Sell</p>
      ) : null}
      <div className="vendor-panel__list">
        {sellEntries.map(([itemId, price]) => (
          <button
            key={`s-${itemId}`}
            type="button"
            className="vendor-panel__row"
            disabled={busy}
            onClick={() => onSell(itemId, 1)}
          >
            <ItemIcon itemId={itemId} />
            <span className="vendor-panel__row-copy">
              <span className="vendor-panel__row-name">
                {items[itemId]?.name ?? itemId}
              </span>
            </span>
            <span className="vendor-panel__row-price">{price}c</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
