"use client";

import type { ItemDefinition, ItemId, PlantableSeed } from "@game/shared";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";

interface PlantPanelProps {
  seeds: PlantableSeed[];
  items: Record<string, ItemDefinition>;
  busy: boolean;
  onPlant: (seedItemId: ItemId) => void;
  onClose: () => void;
}

/**
 * Empty-plot seed picker — opens when the bag holds more than one crop seed.
 *
 * @param seeds - Plantable seeds the player currently owns.
 * @param items - Catalog map for display names.
 * @param busy - True while a plant request is in flight.
 * @param onPlant - Starts plant with the chosen seed.
 * @param onClose - Esc / Close.
 */
export function PlantPanel({
  seeds,
  items,
  busy,
  onPlant,
  onClose,
}: PlantPanelProps) {
  const copy = GAME_DESK.plant;

  return (
    <aside
      className={gameDeskClassName("plant-panel")}
      data-testid="plant-panel"
    >
      <SocialDeskHeader
        hotkey={copy.hotkey}
        kicker={copy.kicker}
        title={copy.title}
        headerClassName="plant-panel__header"
        onClose={onClose}
      />
      <p className="muted social-desk__lede">{copy.lede}</p>
      <div className="plant-panel__list">
        {seeds.map((entry) => {
          const name = items[entry.seedItemId]?.name ?? entry.seedItemId;
          const harvest = items[entry.crop.harvestItemId]?.name ?? entry.crop.harvestItemId;
          const waitMin = Math.max(1, Math.round(entry.crop.growMs / 60_000));
          return (
            <button
              key={entry.seedItemId}
              type="button"
              data-testid={`plant-seed-${entry.seedItemId}`}
              disabled={busy}
              onClick={() => onPlant(entry.seedItemId)}
              style={{ width: "100%", textAlign: "left" }}
            >
              {name} · {entry.qty}
              <div className="muted" style={{ fontSize: "0.8rem" }}>
                {harvest} · {waitMin} min grow
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
