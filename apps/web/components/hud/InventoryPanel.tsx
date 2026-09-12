"use client";

import { useMemo, useState } from "react";
import type { EdibleItemId, ItemDefinition, ItemId, PlayerStateDto } from "@game/shared";
import {
  canRepairTool,
  isEdibleItemId,
  isHomesteadKitItemId,
  isToolDurabilityLow,
  combatGearSlot,
} from "@game/shared";
import { ItemIcon } from "@/components/hud/ItemIcon";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";
import { InventoryLoadout } from "@/components/hud/InventoryLoadout";
import {
  INVENTORY_FILTER_CATEGORIES,
  INVENTORY_FILTER_LABELS,
  filterInventoryStacks,
  type InventoryFilterCategory,
} from "@/lib/hud/inventory-filter";
import {
  INVENTORY_PANE_LABELS,
  INVENTORY_PANE_TABS,
  type InventoryPaneTab,
} from "@/lib/hud/inventory-loadout";
import {
  inventoryEquippedPip,
  inventorySlotLabel,
} from "@/lib/hud/inventory-slot-label";
import {
  INVENTORY_PICKUP_SLOT_FLASH,
  inventoryPickupSlotFlashClassName,
} from "@/lib/hud/inventory-pickup-slot-flash";

interface InventoryPanelProps {
  state: PlayerStateDto;
  items: Record<string, ItemDefinition>;
  busy: boolean;
  /** True when on owned player land (kits can be placed). */
  canPlaceKits?: boolean;
  /** PL9.2 — brief open accent after hotkey open (same panel). */
  openAccent?: boolean;
  /** PL128.2 — stack ids briefly flashing after bag inflow. */
  pickupFlashStackIds?: ReadonlySet<string> | readonly string[];
  onClose: () => void;
  onEatFood: (itemId: EdibleItemId) => void;
  onEquipTool: (inventoryId: string | null) => void;
  /** Equip / unequip weapon, armor, or shield. */
  onEquipGear?: (
    inventoryId: string | null,
    slot: "weapon" | "armor" | "shield",
  ) => void;
  /** PL25.1 — repair worn tool (mat cost server-side). */
  onRepairTool: (inventoryId: string) => void;
  /** Start homestead place editor for a station kit. */
  onPlaceKit?: (inventoryId: string) => void;
}

/**
 * Inventory surface (I) — icon grid, search/filter, selected-stack actions.
 * PL9.2: brief header/border accent when opened from hotkey.
 * PL21.1: soft low-durability accent via TOOL.lowWarnPct (clears when repaired/replaced).
 * PL25.1: Repair button when worn; success cue wired in GameApp.
 * PL128.2: brief slot flash when qty rises / new stack after gather·craft·buy.
 */
export function InventoryPanel({
  state,
  items,
  busy,
  canPlaceKits = false,
  openAccent = false,
  pickupFlashStackIds = [],
  onClose,
  onEatFood,
  onEquipTool,
  onEquipGear,
  onRepairTool,
  onPlaceKit,
}: InventoryPanelProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<InventoryFilterCategory>("all");
  const [pane, setPane] = useState<InventoryPaneTab>("bag");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterInventoryStacks(state.inventory, items, query, category),
    [state.inventory, items, query, category],
  );
  const selected =
    state.inventory.find((stack) => stack.id === selectedId) ?? null;
  const copy = GAME_DESK.inventory;
  const isFiltering = query.trim().length > 0 || category !== "all";

  return (
    <aside
      className={gameDeskClassName("inventory-panel", [
        openAccent ? "inventory-panel--open-accent" : "",
      ])}
      data-testid="inventory-panel"
      data-open-accent={openAccent ? "true" : "false"}
    >
      <SocialDeskHeader
        hotkey={copy.hotkey}
        kicker={copy.kicker}
        title={copy.title}
        headerClassName="inventory-panel__header"
        onClose={onClose}
      />
      <p className="muted social-desk__lede">{copy.lede}</p>

      <div className="inventory-panel__panes" role="tablist" aria-label="Inventory views">
        {INVENTORY_PANE_TABS.map((id) => {
          const active = pane === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              className={
                active
                  ? "inventory-panel__pane inventory-panel__pane--active"
                  : "inventory-panel__pane"
              }
              data-testid={`inventory-pane-${id}`}
              data-active={active ? "true" : "false"}
              onClick={() => setPane(id)}
            >
              {INVENTORY_PANE_LABELS[id]}
            </button>
          );
        })}
      </div>

      {pane === "loadout" ? (
        <InventoryLoadout
          state={state}
          items={items}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      ) : null}

      {pane === "bag" ? (
      <>
      <label className="inventory-panel__search">
        <span className="visually-hidden">Search items</span>
        <input
          type="search"
          data-testid="inventory-search"
          placeholder="Search items…"
          value={query}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className="inventory-panel__filters" role="group" aria-label="Item category">
        {INVENTORY_FILTER_CATEGORIES.map((id) => {
          const active = category === id;
          return (
            <button
              key={id}
              type="button"
              className={
                active
                  ? "inventory-panel__filter inventory-panel__filter--active"
                  : "inventory-panel__filter"
              }
              data-testid={`inventory-filter-${id}`}
              data-active={active ? "true" : "false"}
              onClick={() => setCategory(id)}
            >
              {INVENTORY_FILTER_LABELS[id]}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="inventory-panel__empty muted" data-testid="inventory-empty">
          {state.inventory.length === 0
            ? "Bag is empty"
            : isFiltering
              ? "No items match"
              : "Bag is empty"}
        </p>
      ) : (
        <ul className="inventory-panel__grid" data-testid="inventory-grid">
          {filtered.map((stack) => {
            const def = items[stack.itemId];
            const name = inventorySlotLabel(def?.name, stack.itemId);
            const equipped =
              state.equippedToolInventoryId === stack.id ||
              state.equippedWeaponInventoryId === stack.id ||
              state.equippedArmorInventoryId === stack.id ||
              state.equippedShieldInventoryId === stack.id;
            const isTool = def?.equipSlot === "tool";
            const isGear = Boolean(combatGearSlot(stack.itemId));
            const pipKind = isGear ? "gear" : isTool ? "tool" : "other";
            const maxDur = def?.maxDurability;
            const lowDur = isToolDurabilityLow(stack.durability, maxDur);
            const canRepair = canRepairTool(stack.durability, maxDur);
            const isKit = isHomesteadKitItemId(stack.itemId);
            const pickupFlashClass = inventoryPickupSlotFlashClassName(
              stack.id,
              pickupFlashStackIds,
            );
            const pickupFlashing = pickupFlashClass.length > 0;
            const isSelected = selected?.id === stack.id;
            const slotClass = [
              "inventory-panel__slot",
              pickupFlashClass,
              isSelected ? "inventory-panel__slot--selected" : "",
              lowDur ? "inventory-panel__slot--low" : "",
              equipped ? "inventory-panel__slot--equipped" : "",
            ]
              .filter(Boolean)
              .join(" ");
            const durPct =
              (isTool || isGear) && maxDur && stack.durability != null && maxDur > 0
                ? Math.max(0, Math.min(100, (stack.durability / maxDur) * 100))
                : null;

            return (
              <li key={stack.id}>
                <button
                  type="button"
                  className={slotClass}
                  style={
                    pickupFlashing
                      ? {
                          borderColor: INVENTORY_PICKUP_SLOT_FLASH.borderRgba,
                          background: INVENTORY_PICKUP_SLOT_FLASH.backgroundRgba,
                        }
                      : undefined
                  }
                  data-durability-low={lowDur ? "true" : "false"}
                  data-equipped={equipped ? "true" : "false"}
                  data-can-repair={canRepair ? "true" : "false"}
                  data-pickup-flash={pickupFlashing ? "true" : "false"}
                  data-station-kit={isKit ? "true" : "false"}
                  data-selected={isSelected ? "true" : "false"}
                  data-item-id={stack.itemId}
                  aria-pressed={isSelected}
                  aria-label={name}
                  title={name}
                  onClick={() =>
                    setSelectedId((current) => (current === stack.id ? null : stack.id))
                  }
                >
                  <span className="inventory-panel__icon-wrap">
                    <ItemIcon itemId={stack.itemId} />
                    {def?.stackable ? (
                      <span className="inventory-panel__qty">×{stack.qty}</span>
                    ) : null}
                    {durPct != null ? (
                      <span className="inventory-panel__dur-bar" aria-hidden>
                        <span style={{ width: `${durPct}%` }} />
                      </span>
                    ) : null}
                  </span>
                  <span className="inventory-panel__slot-name">{name}</span>
                  {equipped ? (
                    <span className="inventory-panel__equipped-pip" aria-hidden>
                      {inventoryEquippedPip(pipKind)}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      </>
      ) : null}

      {selected ? (
        <InventorySelectedDetail
          stack={selected}
          def={items[selected.itemId]}
          equipped={
            state.equippedToolInventoryId === selected.id ||
            state.equippedWeaponInventoryId === selected.id ||
            state.equippedArmorInventoryId === selected.id ||
            state.equippedShieldInventoryId === selected.id
          }
          busy={busy}
          canPlaceKits={canPlaceKits}
          onEatFood={onEatFood}
          onEquipTool={onEquipTool}
          onEquipGear={onEquipGear}
          onRepairTool={onRepairTool}
          onPlaceKit={onPlaceKit}
        />
      ) : (
        <p className="inventory-panel__hint muted">
          {pane === "loadout" ? "Select a worn item" : "Select an item"}
        </p>
      )}
    </aside>
  );
}

interface InventorySelectedDetailProps {
  stack: PlayerStateDto["inventory"][number];
  def: ItemDefinition | undefined;
  equipped: boolean;
  busy: boolean;
  canPlaceKits: boolean;
  onEatFood: (itemId: EdibleItemId) => void;
  onEquipTool: (inventoryId: string | null) => void;
  onEquipGear?: (
    inventoryId: string | null,
    slot: "weapon" | "armor" | "shield",
  ) => void;
  onRepairTool: (inventoryId: string) => void;
  onPlaceKit?: (inventoryId: string) => void;
}

/**
 * Name, durability, and actions for the selected bag slot.
 *
 * @param props - Selected stack plus action callbacks.
 */
function InventorySelectedDetail({
  stack,
  def,
  equipped,
  busy,
  canPlaceKits,
  onEatFood,
  onEquipTool,
  onEquipGear,
  onRepairTool,
  onPlaceKit,
}: InventorySelectedDetailProps) {
  const name = inventorySlotLabel(def?.name, stack.itemId);
  const gearSlot = combatGearSlot(stack.itemId);
  const isTool = def?.equipSlot === "tool";
  const isGear = Boolean(gearSlot);
  const maxDur = def?.maxDurability;
  const lowDur = isToolDurabilityLow(stack.durability, maxDur);
  const canRepair = canRepairTool(stack.durability, maxDur);
  const edible = isEdibleItemId(stack.itemId) ? stack.itemId : null;
  const isKit = isHomesteadKitItemId(stack.itemId);

  return (
    <div className="inventory-panel__detail" data-testid="inventory-detail">
      <div className="inventory-panel__detail-name">
        {name}
        {def?.stackable ? ` × ${stack.qty}` : ""}
        {equipped ? " · equipped" : ""}
      </div>
      {isKit && stack.durability != null && stack.durability > 1 ? (
        <div className="muted" style={{ fontSize: "0.78rem" }}>
          Tier {stack.durability}
        </div>
      ) : null}
      {!isKit && stack.durability != null ? (
        <div
          className={lowDur ? undefined : "muted"}
          data-testid="inventory-tool-durability"
          style={{
            fontSize: "0.78rem",
            color: lowDur
              ? "color-mix(in srgb, var(--danger) 70%, var(--accent))"
              : undefined,
            fontWeight: lowDur ? 600 : undefined,
          }}
        >
          Durability {stack.durability}
          {maxDur != null ? `/${maxDur}` : ""}
          {lowDur ? " · nearly broken" : ""}
        </div>
      ) : null}
      <div className="inventory-panel__actions">
        {isTool ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onEquipTool(equipped ? null : stack.id)}
          >
            {equipped ? "Unequip" : "Equip"}
          </button>
        ) : null}
        {isGear && gearSlot && onEquipGear ? (
          <button
            type="button"
            disabled={busy}
            data-testid="inventory-equip-gear"
            onClick={() => onEquipGear(equipped ? null : stack.id, gearSlot)}
          >
            {equipped ? "Unequip" : `Equip ${gearSlot}`}
          </button>
        ) : null}
        {canRepair ? (
          <button
            type="button"
            disabled={busy}
            data-testid="inventory-repair-tool"
            onClick={() => onRepairTool(stack.id)}
          >
            Repair
          </button>
        ) : null}
        {edible ? (
          <button type="button" disabled={busy} onClick={() => onEatFood(edible)}>
            Eat (+energy)
          </button>
        ) : null}
        {isKit && canPlaceKits && onPlaceKit ? (
          <button
            type="button"
            disabled={busy}
            data-testid="inventory-place-kit"
            onClick={() => onPlaceKit(stack.id)}
          >
            Place
          </button>
        ) : null}
      </div>
    </div>
  );
}

export type { ItemId };
