"use client";

import type { CanonicalLandKind, LandKind, PlayerStateDto } from "@game/shared";
import {
  LAND_DESTINATIONS,
  TRAVEL_YOU_ARE_HERE,
  isTravelDestinationHere,
  mapIdentityForLandKind,
} from "@game/shared";
import {
  travelDestinationMapTintAccent,
  travelDestinationMapTintClassName,
  travelDestinationMapTintStyle,
  travelPanelMapOpenAccentClassName,
  travelPanelMapOpenAccentStyle,
} from "@/lib/hud/travel-destination-map-tint";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";

interface TravelPanelProps {
  /** Retained for GameApp call-site compatibility (unused after free travel). */
  state: PlayerStateDto;
  currentKind: LandKind | CanonicalLandKind;
  /** Retained for GameApp call-site compatibility (unused after free travel). */
  nowMs: number;
  busy: boolean;
  onTravel: (
    kind: CanonicalLandKind,
    landId?: string,
    nft?: { tokenId: string; biome: string; size: string; landId?: string | null },
  ) => void;
  onClose: () => void;
  /** PL24.3 / PL144.2 — brief map-tint border/header when Travel opens (N / portal / gate). */
  openAccent?: boolean;
}

/**
 * Map select — four destination tiles (City / Land / Explore / Arena).
 * No intro, circuit strip, blurbs, or caravan disclaimer.
 */
export function TravelPanel({
  state,
  currentKind,
  busy,
  onTravel,
  onClose,
  openAccent = false,
}: TravelPanelProps) {
  const copy = GAME_DESK.travel;
  const mapOpenClass = travelPanelMapOpenAccentClassName(openAccent);
  const mapOpenStyle = travelPanelMapOpenAccentStyle(currentKind);
  const nftPlots = state.chain?.lands ?? [];

  return (
    <aside
      className={gameDeskClassName("travel-panel", [mapOpenClass])}
      data-testid="travel-panel"
      data-open-accent={openAccent ? "true" : "false"}
      data-map-open-accent={openAccent ? "true" : "false"}
      style={mapOpenStyle}
    >
      <SocialDeskHeader
        hotkey={copy.hotkey}
        kicker={copy.kicker}
        title={copy.title}
        headerClassName="travel-panel__header"
        onClose={onClose}
      />
      <p className="muted social-desk__lede">{copy.lede}</p>
      <div className="travel-panel__grid">
        {LAND_DESTINATIONS.map((dest) => {
          const atDest =
            dest.kind === "player_land"
              ? isTravelDestinationHere(dest.kind, currentKind) && !state.nftTokenId
              : isTravelDestinationHere(dest.kind, currentKind);
          const identity = mapIdentityForLandKind(dest.kind);
          const tint = travelDestinationMapTintStyle(dest.kind, atDest);
          const accent = travelDestinationMapTintAccent(dest.kind);
          return (
            <button
              key={dest.kind}
              type="button"
              className={travelDestinationMapTintClassName(atDest)}
              data-map-kind={dest.kind}
              data-map-tint="true"
              data-here={atDest ? "true" : "false"}
              disabled={busy || atDest}
              onClick={() => onTravel(dest.kind)}
              aria-current={atDest ? "true" : undefined}
              aria-label={dest.name}
              style={{
                border: tint.border,
                background: tint.background,
                boxShadow: tint.boxShadow,
                color: atDest ? accent : undefined,
              }}
            >
              <span className="travel-panel__glyph" aria-hidden="true">
                {identity.glyph}
              </span>
              <span className="travel-panel__word">{identity.word}</span>
              {atDest ? (
                <span className="travel-panel__here">{TRAVEL_YOU_ARE_HERE}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {nftPlots.length > 0 ? (
        <div className="travel-panel__grid" style={{ marginTop: 10 }}>
          {nftPlots.map((land) => {
            const here = Boolean(land.landId && state.landId === land.landId);
            return (
              <button
                key={land.tokenId}
                type="button"
                className="travel-panel__dest"
                data-map-kind="player_land"
                data-nft-plot="true"
                disabled={busy || here}
                onClick={() =>
                  onTravel("player_land", land.landId ?? land.tokenId, land)
                }
                aria-current={here ? "true" : undefined}
                aria-label={`${land.biome} ${land.size} NFT land`}
              >
                <span className="travel-panel__word">
                  {land.biome} · {land.size}
                </span>
                {here ? (
                  <span className="travel-panel__here">{TRAVEL_YOU_ARE_HERE}</span>
                ) : (
                  <span className="muted">NFT land</span>
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </aside>
  );
}
