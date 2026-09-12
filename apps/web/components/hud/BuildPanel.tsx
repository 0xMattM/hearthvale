"use client";

import {
  emptyLandBuildBoardTip,
  type BuildingDto,
  type PlayerStateDto,
} from "@game/shared";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";
import {
  landEditorBuildingLabel,
  landEditorPickupBuildings,
  landEditorPlaceableKits,
} from "@/lib/hud/land-editor";

interface BuildPanelProps {
  state: Pick<
    PlayerStateDto,
    "buildings" | "softCurrency" | "energy" | "inventory"
  >;
  busy: boolean;
  onPickup: (buildingId: string) => void;
  /** Pickup then enter place mode with the returned kit. */
  onMove: (buildingId: string) => void;
  /** Start homestead place editor for a bag kit. */
  onPlaceKit: (inventoryId: string) => void;
  onClose: () => void;
  /** Building selected by a world click in the editor. */
  selectedBuildingId?: string | null;
  onSelectBuilding?: (buildingId: string) => void;
  /** Kit currently in the place ghost, if any. */
  placingKitInventoryId?: string | null;
  /** PL24.1 — brief border/header tint when the land editor opens. */
  openAccent?: boolean;
}

/**
 * Land editor (P) — place kits from the bag; click stations to move or pick up.
 */
export function BuildPanel({
  state,
  busy,
  onPickup,
  onMove,
  onPlaceKit,
  onClose,
  selectedBuildingId = null,
  onSelectBuilding,
  placingKitInventoryId = null,
  openAccent = false,
}: BuildPanelProps) {
  const placed = landEditorPickupBuildings(state.buildings) as BuildingDto[];
  const kits = landEditorPlaceableKits(state.inventory);
  const copy = GAME_DESK.build;

  return (
    <aside
      className={gameDeskClassName("build-panel", [
        openAccent ? "build-panel--open-accent" : "",
      ])}
      data-testid="build-panel"
      data-open-accent={openAccent ? "true" : "false"}
      data-mode="editor"
    >
      <SocialDeskHeader
        hotkey={copy.hotkey}
        kicker={copy.kicker}
        title={copy.title}
        headerClassName="build-panel__header"
        onClose={onClose}
      />
      <p className="muted social-desk__lede">
        {emptyLandBuildBoardTip()} {copy.lede}
      </p>

      <section className="build-panel__section">
        <h4 className="build-panel__section-title">Bag</h4>
        {kits.length === 0 ? (
          <p className="muted" style={{ fontSize: "0.85rem" }}>
            No kits in your bag. Craft them at a Workshop.
          </p>
        ) : (
          <ul className="build-panel__placed" data-testid="land-editor-kit-list">
            {kits.map((kit) => (
              <li key={kit.id} className="build-panel__card">
                <div className="build-panel__card-name">
                  {kit.name}
                  {kit.qty > 1 ? ` × ${kit.qty}` : ""}
                </div>
                <button
                  type="button"
                  disabled={busy}
                  data-testid="land-editor-place-kit"
                  data-placing={
                    placingKitInventoryId === kit.id ? "true" : "false"
                  }
                  onClick={() => onPlaceKit(kit.id)}
                >
                  {placingKitInventoryId === kit.id ? "Placing…" : "Place"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="build-panel__section">
        <h4 className="build-panel__section-title">Yard</h4>
        {placed.length === 0 ? (
          <p className="muted" style={{ fontSize: "0.85rem" }}>
            Nothing placed yet. Place a kit from your bag, then click it to
            move or pick up.
          </p>
        ) : (
          <ul className="build-panel__placed" data-testid="land-editor-yard-list">
            {placed.map((b) => (
              <li
                key={b.id}
                className={
                  selectedBuildingId === b.id
                    ? "build-panel__card build-panel__card--selected"
                    : "build-panel__card"
                }
                data-selected={selectedBuildingId === b.id ? "true" : "false"}
              >
                <button
                  type="button"
                  className="build-panel__card-select"
                  disabled={busy}
                  onClick={() => onSelectBuilding?.(b.id)}
                >
                  {landEditorBuildingLabel(b)}
                  {(b.tier ?? 1) > 1 ? ` · T${b.tier}` : ""}
                </button>
                <div className="build-panel__card-actions">
                  <button
                    type="button"
                    disabled={busy}
                    data-testid="land-editor-move"
                    onClick={() => onMove(b.id)}
                  >
                    Move
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    data-testid="build-pickup"
                    onClick={() => onPickup(b.id)}
                  >
                    Pick up
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
