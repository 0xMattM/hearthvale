"use client";

import type { ItemDefinition, PlayerStateDto } from "@game/shared";
import { ItemIcon } from "@/components/hud/ItemIcon";
import {
  INVENTORY_LOADOUT_GROUPS,
  inventoryLoadoutRows,
  type InventoryLoadoutRow,
  type InventoryLoadoutSlotId,
} from "@/lib/hud/inventory-loadout";
import { inventorySlotLabel } from "@/lib/hud/inventory-slot-label";

interface InventoryLoadoutProps {
  state: PlayerStateDto;
  items: Record<string, ItemDefinition>;
  selectedId: string | null;
  onSelect: (stackId: string | null) => void;
}

/**
 * Equipped work tool vs combat weapon / armor / shield.
 *
 * @param props - Player state, catalog, and bag selection.
 */
export function InventoryLoadout({
  state,
  items,
  selectedId,
  onSelect,
}: InventoryLoadoutProps) {
  const rows = inventoryLoadoutRows(state);
  const workRows = rows.filter((row) =>
    (INVENTORY_LOADOUT_GROUPS.work as readonly InventoryLoadoutSlotId[]).includes(
      row.slot,
    ),
  );
  const combatRows = rows.filter((row) =>
    (
      INVENTORY_LOADOUT_GROUPS.combat as readonly InventoryLoadoutSlotId[]
    ).includes(row.slot),
  );

  return (
    <div className="inventory-panel__loadout" data-testid="inventory-loadout">
      <LoadoutGroup
        title="Work"
        testId="inventory-loadout-work"
        rows={workRows}
        items={items}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <LoadoutGroup
        title="Combat"
        testId="inventory-loadout-combat"
        rows={combatRows}
        items={items}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </div>
  );
}

interface LoadoutGroupProps {
  title: string;
  testId: string;
  rows: InventoryLoadoutRow[];
  items: Record<string, ItemDefinition>;
  selectedId: string | null;
  onSelect: (stackId: string | null) => void;
}

/**
 * One loadout section (work or combat).
 *
 * @param props - Section title and slot rows.
 */
function LoadoutGroup({
  title,
  testId,
  rows,
  items,
  selectedId,
  onSelect,
}: LoadoutGroupProps) {
  return (
    <section className="inventory-panel__loadout-group" data-testid={testId}>
      <h4>{title}</h4>
      <ul>
        {rows.map((row) => {
          const def = row.stack ? items[row.stack.itemId] : undefined;
          const name = row.stack
            ? inventorySlotLabel(def?.name, row.stack.itemId)
            : "Empty";
          const selected = Boolean(row.stack && selectedId === row.stack.id);
          return (
            <li key={row.slot}>
              <button
                type="button"
                className={
                  selected
                    ? "inventory-panel__loadout-slot inventory-panel__loadout-slot--selected"
                    : "inventory-panel__loadout-slot"
                }
                data-testid={`inventory-loadout-${row.slot}`}
                data-empty={row.stack ? "false" : "true"}
                data-selected={selected ? "true" : "false"}
                disabled={!row.stack}
                onClick={() =>
                  onSelect(
                    row.stack
                      ? selectedId === row.stack.id
                        ? null
                        : row.stack.id
                      : null,
                  )
                }
              >
                <span className="inventory-panel__loadout-kind">{row.label}</span>
                <span className="inventory-panel__loadout-icon">
                  {row.stack ? (
                    <ItemIcon itemId={row.stack.itemId} />
                  ) : (
                    <span className="inventory-panel__loadout-empty" aria-hidden>
                      —
                    </span>
                  )}
                </span>
                <span className="inventory-panel__loadout-name">{name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
