"use client";

import type { HousingDecorId } from "@game/shared";
import { HOUSING_DECOR } from "@game/shared";
import {
  decorPlaceAffordMode,
  decorPlaceShortFundsHint,
} from "@/lib/hud/decor-afford";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";

interface DecorPanelProps {
  busy: boolean;
  /** Wallet for place afford clarity (PL39.2). */
  softCurrency: number;
  /** PL34.2 — brief header/border accent when Housing decor opens. */
  openAccent?: boolean;
  onPlace: (decorId: HousingDecorId) => void;
  onClose: () => void;
}

/**
 * Housing decor picker — cosmetic only (F11.5).
 * PL34.2: brief open accent when opened from walk-up pad.
 * PL39.2: soft Need Nc + muted/disabled place rows when short coins.
 */
export function DecorPanel({
  busy,
  softCurrency,
  openAccent = false,
  onPlace,
  onClose,
}: DecorPanelProps) {
  const copy = GAME_DESK.decor;

  return (
    <aside
      className={gameDeskClassName("decor-panel", [
        openAccent ? "decor-panel--open-accent" : "",
      ])}
      data-open-accent={openAccent ? "true" : "false"}
    >
      <SocialDeskHeader
        hotkey={copy.hotkey}
        kicker={copy.kicker}
        title={copy.title}
        headerClassName="decor-panel__header"
        onClose={onClose}
      />
      <p className="muted social-desk__lede">{copy.lede}</p>
      <div style={{ display: "grid", gap: 6 }}>
        {(Object.keys(HOUSING_DECOR) as HousingDecorId[]).map((id) => {
          const def = HOUSING_DECOR[id];
          // Reason: PL39.2 — soft Need Nc + muted row when short; coin costs unchanged.
          const afford = decorPlaceAffordMode(softCurrency, def.coinCost);
          const shortHint = decorPlaceShortFundsHint(softCurrency, def.coinCost);
          return (
            <button
              key={id}
              type="button"
              className={
                afford === "affordable"
                  ? "decor-panel__place decor-panel__place--affordable"
                  : "decor-panel__place decor-panel__place--short"
              }
              data-afford={afford}
              data-testid={`decor-place-${id}`}
              disabled={busy || afford === "short"}
              onClick={() => onPlace(id)}
              style={{ textAlign: "left" }}
            >
              {def.name} · {def.coinCost} coins
              {shortHint ? (
                <span className="decor-panel__short-hint">
                  {" "}
                  · {shortHint}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
