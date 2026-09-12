"use client";

import { useState } from "react";
import type {
  ItemDefinition,
  PlayerStateDto,
  RecipeDefinition,
  StationId,
} from "@game/shared";
import {
  BUILDING_UPGRADES,
  fishToKitchenTip,
  getBuildingUpgrade,
  isUpgradableBuildingType,
  meatToKitchenTip,
} from "@game/shared";
import { ItemIcon } from "@/components/hud/ItemIcon";
import {
  craftRecipeAffordMode,
  craftUpgradeAffordMode,
  craftUpgradeShortFundsHint,
} from "@/lib/hud/craft-afford";
import {
  craftProfessionLabel,
  craftRecipeActionLabel,
  craftRecipeTileClassName,
  craftStationTitle,
  defaultSelectedCraftRecipeId,
} from "@/lib/hud/craft-panel-chrome";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";
import {
  buildRecipeBook,
  inventoryQty,
  type RecipeBookEntry,
  type RecipeInputStatus,
} from "@/lib/recipe-book";

interface CraftPanelProps {
  state: PlayerStateDto;
  station: StationId;
  stationBuildingId: string | null;
  recipes: RecipeDefinition[];
  items: Record<string, ItemDefinition>;
  busy: boolean;
  onCraft: (recipeId: string) => void;
  /** Collect finished craft at this station. */
  onCollect?: () => void;
  onUpgrade?: () => void;
  onClose: () => void;
  /** PL24.2 — brief border/header tint when craft station panel opens. */
  openAccent?: boolean;
  /** Server clock for remaining wait (ms). */
  serverNow?: number;
}

/**
 * Station recipe book — icon tiles plus a selected workbench (inputs → output).
 * Start → wait → Collect; land/explore Busy when a peer job holds the bench.
 */
export function CraftPanel({
  state,
  station,
  stationBuildingId,
  recipes,
  items,
  busy,
  onCraft,
  onCollect,
  onUpgrade,
  onClose,
  openAccent = false,
  serverNow = Date.now(),
}: CraftPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const building = state.buildings.find((b) => b.id === stationBuildingId);
  const craft = building?.craft ?? null;
  const tier = building?.tier ?? 1;
  const upgrade =
    isUpgradableBuildingType(station) && building
      ? getBuildingUpgrade(station, tier)
      : undefined;
  const upgradeDef = isUpgradableBuildingType(station)
    ? BUILDING_UPGRADES[station]
    : undefined;
  const book = buildRecipeBook(recipes, state, items, tier);
  const selectedRecipeId = defaultSelectedCraftRecipeId(
    book.map((row) => row.recipe.id),
    selectedId,
  );
  const selected =
    book.find((entry) => entry.recipe.id === selectedRecipeId) ?? null;
  const upgradeAffordInput =
    isUpgradableBuildingType(station) && upgrade && upgradeDef
      ? {
          buildingType: station,
          softCurrency: state.softCurrency,
          energy: state.energy,
          inventoryQty: (itemId: string) =>
            inventoryQty(state.inventory, itemId),
        }
      : null;
  const upgradeAfford = upgradeAffordInput
    ? craftUpgradeAffordMode(upgradeAffordInput)
    : null;
  const upgradeShortHint = upgradeAffordInput
    ? craftUpgradeShortFundsHint(upgradeAffordInput)
    : null;

  const peerBusy = Boolean(craft && !craft.isYours);
  const yoursWorking = Boolean(craft?.isYours && craft.state === "working");
  const yoursReady = Boolean(craft?.isYours && craft.state === "ready");
  const remainingSec =
    yoursWorking && craft?.readyAt != null
      ? Math.max(0, Math.ceil((craft.readyAt - serverNow) / 1000))
      : 0;

  return (
    <aside
      className={gameDeskClassName("craft-panel", [
        openAccent ? "craft-panel--open-accent" : "",
      ])}
      data-testid="craft-panel"
      data-station={station}
      data-open-accent={openAccent ? "true" : "false"}
      data-craft-state={
        yoursReady ? "ready" : yoursWorking ? "working" : peerBusy ? "busy" : "idle"
      }
    >
      <SocialDeskHeader
        hotkey={GAME_DESK.craft.hotkey}
        kicker={GAME_DESK.craft.kicker}
        title={craftStationTitle(station)}
        extra={
          tier >= 2 ? <span className="social-desk__extra">T2</span> : null
        }
        headerClassName="craft-panel__header"
        onClose={onClose}
      />
      <p className="craft-panel__lede muted social-desk__lede">
        {GAME_DESK.craft.lede} Esc to leave.
        {tier >= 2 ? " Upgraded: −2 energy, +1 stackable output." : ""}
      </p>
      {station === "kitchen" ? (
        <p className="craft-panel__tip muted">
          {fishToKitchenTip()} {meatToKitchenTip()}
        </p>
      ) : null}
      {peerBusy ? (
        <p className="craft-panel__banner craft-panel__banner--busy" data-testid="craft-peer-busy">
          Someone else is using this station — wait or try another.
        </p>
      ) : null}
      {yoursWorking ? (
        <p className="craft-panel__banner" data-testid="craft-working-status">
          Working… ready in ~{remainingSec}s. Walk away and come back to Collect.
        </p>
      ) : null}
      {yoursReady && onCollect ? (
        <button
          type="button"
          className="craft-panel__collect"
          data-testid="craft-collect"
          disabled={busy}
          onClick={onCollect}
        >
          Collect finished craft
        </button>
      ) : null}
      {upgrade && upgradeDef && onUpgrade && upgradeAfford ? (
        <button
          type="button"
          className={
            upgradeAfford === "affordable"
              ? "craft-panel__upgrade craft-panel__upgrade--affordable"
              : "craft-panel__upgrade craft-panel__upgrade--short"
          }
          data-afford={upgradeAfford}
          data-testid="craft-upgrade-t2"
          disabled={busy || upgradeAfford === "short" || yoursWorking || peerBusy}
          onClick={onUpgrade}
        >
          <span className="craft-panel__upgrade-title">
            Upgrade to T2 · {upgradeDef.coinCost} coins
            {upgradeShortHint ? (
              <span className="craft-panel__short-hint"> · {upgradeShortHint}</span>
            ) : null}
          </span>
          <span className="craft-panel__upgrade-mats">
            {upgradeDef.materials.map((m) => (
              <span key={m.itemId} className="craft-panel__chip" title={items[m.itemId]?.name}>
                <ItemIcon itemId={m.itemId} />
                <span className="craft-panel__chip-qty">×{m.qty}</span>
              </span>
            ))}
            <span className="muted">{upgradeDef.energyCost} energy</span>
          </span>
        </button>
      ) : null}
      <div className="craft-panel__book" role="list" aria-label="Recipes">
        {book.map((entry) => {
          const afford = craftRecipeAffordMode(entry);
          const isSelected = selected?.recipe.id === entry.recipe.id;
          return (
            <button
              key={entry.recipe.id}
              type="button"
              role="listitem"
              className={craftRecipeTileClassName(afford, isSelected)}
              data-afford={afford}
              data-testid={`craft-recipe-${entry.recipe.id}`}
              data-selected={isSelected ? "true" : "false"}
              aria-pressed={isSelected}
              aria-label={entry.recipe.name}
              title={entry.recipe.name}
              onClick={() => setSelectedId(entry.recipe.id)}
            >
              <ItemIcon itemId={entry.recipe.output.itemId} />
              <span className="craft-panel__tile-qty">×{entry.outputQty}</span>
            </button>
          );
        })}
      </div>
      {selected ? (
        <CraftRecipeWorkbench
          entry={selected}
          busy={busy}
          canStart={selected.canCraft && !yoursWorking && !yoursReady && !peerBusy}
          yoursWorking={yoursWorking}
          yoursReady={yoursReady}
          peerBusy={peerBusy}
          onCraft={onCraft}
        />
      ) : null}
    </aside>
  );
}

interface CraftRecipeWorkbenchProps {
  entry: RecipeBookEntry;
  busy: boolean;
  canStart: boolean;
  yoursWorking: boolean;
  yoursReady: boolean;
  peerBusy: boolean;
  onCraft: (recipeId: string) => void;
}

/**
 * Selected recipe: ingredient chips, output, energy/wait, and Start.
 *
 * @param props - Book entry plus occupancy flags and craft callback.
 */
function CraftRecipeWorkbench({
  entry,
  busy,
  canStart,
  yoursWorking,
  yoursReady,
  peerBusy,
  onCraft,
}: CraftRecipeWorkbenchProps) {
  const waitSec = Math.round((entry.recipe.craftMs ?? 60_000) / 1000);
  const action = craftRecipeActionLabel({
    canCraft: entry.canCraft,
    yoursWorking,
    yoursReady,
    peerBusy,
  });
  return (
    <div className="craft-panel__workbench" data-testid="craft-workbench">
      <div className="craft-panel__workbench-name">{entry.recipe.name}</div>
      <div className="craft-panel__io">
        <div className="craft-panel__inputs">
          {entry.inputs.map((input) => (
            <CraftInputChip key={input.itemId} input={input} />
          ))}
        </div>
        <span className="craft-panel__arrow" aria-hidden>
          →
        </span>
        <span className="craft-panel__chip craft-panel__chip--output" title={entry.outputName}>
          <ItemIcon itemId={entry.recipe.output.itemId} label={entry.outputName} />
          <span className="craft-panel__chip-qty">×{entry.outputQty}</span>
        </span>
      </div>
      <div className="craft-panel__meta">
        <span>{craftProfessionLabel(entry.recipe.profession)} XP {entry.professionXp}</span>
        <span>
          {entry.recipe.minProfessionXp > 0
            ? `need ${entry.recipe.minProfessionXp}`
            : "open"}
        </span>
        <span>{entry.energyCost} energy</span>
        <span>{waitSec}s wait</span>
      </div>
      {entry.gateLabel ? (
        <div className="craft-panel__gate">{entry.gateLabel}</div>
      ) : null}
      <button
        type="button"
        className={
          canStart
            ? "craft-panel__start craft-panel__start--ready"
            : "craft-panel__start"
        }
        disabled={busy || !canStart}
        onClick={() => onCraft(entry.recipe.id)}
      >
        {action}
      </button>
    </div>
  );
}

/**
 * One ingredient glyph with have/need overlay.
 *
 * @param props.input - Recipe input status from the book.
 */
function CraftInputChip({ input }: { input: RecipeInputStatus }) {
  return (
    <span
      className={
        input.ok
          ? "craft-panel__chip craft-panel__input craft-panel__input--ok"
          : "craft-panel__chip craft-panel__input craft-panel__input--short"
      }
      data-input-ok={input.ok ? "true" : "false"}
      title={`${input.name} ${input.have}/${input.need}${input.ok ? "" : " · short"}`}
    >
      <ItemIcon itemId={input.itemId} label={input.name} />
      <span className="craft-panel__chip-qty">
        {input.have}/{input.need}
      </span>
    </span>
  );
}
