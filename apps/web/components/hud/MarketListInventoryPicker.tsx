"use client";

import { ItemIcon } from "@/components/hud/ItemIcon";
import type { ItemId } from "@game/shared";
import {
  MARKET_LIST_EMPTY_INVENTORY,
  type ListableInventoryItem,
} from "@/lib/hud/market-list-inventory";

interface MarketListInventoryPickerProps {
  rows: readonly ListableInventoryItem[];
  selectedItemId: string | null | undefined;
  disabled?: boolean;
  emptyLabel?: string;
  onSelect: (itemId: ItemId) => void;
}

/**
 * Scrollable bag list for market sell — owned stackables with available qty.
 *
 * @param props - Owned rows, selection, and click handler.
 * @returns Inventory picker, or empty copy when the bag has nothing to list.
 */
export function MarketListInventoryPicker({
  rows,
  selectedItemId,
  disabled = false,
  emptyLabel = MARKET_LIST_EMPTY_INVENTORY,
  onSelect,
}: MarketListInventoryPickerProps) {
  if (rows.length === 0) {
    return (
      <p className="market-list-inv__empty" data-testid="market-list-inventory-empty">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="market-list-inv" data-testid="market-list-inventory">
      {rows.map((row) => {
        const selected = row.itemId === selectedItemId;
        return (
          <li key={row.itemId}>
            <button
              type="button"
              className={
                selected
                  ? "market-list-inv__row market-list-inv__row--selected"
                  : "market-list-inv__row"
              }
              data-testid={`market-list-inv-${row.itemId}`}
              data-selected={selected ? "true" : "false"}
              disabled={disabled}
              onClick={() => onSelect(row.itemId)}
            >
              <ItemIcon itemId={row.itemId} />
              <span className="market-list-inv__name">{row.name}</span>
              <span className="market-list-inv__qty">×{row.qty}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
