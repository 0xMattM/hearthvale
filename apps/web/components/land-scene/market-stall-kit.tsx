"use client";

import { WorldHtml } from "@/components/land-scene/WorldHtml";
import {
  StallHighlightRing,
  StallKitBody,
} from "@/components/land-scene/stall-kit-body";
import { VENDOR_STALL_LABEL_Y } from "@/lib/vendor-kit-scale";
import type { LandKind } from "@game/shared";
import {
  CITY_MARKET_BOARD_ATMOSPHERE_CUE,
  CITY_SERVICE_VISUAL_KITS,
  cityCommerceServicePad,
  cityMarketBoardAtmosphereCue,
  cityMarketBoardAtmosphereEmissiveIntensity,
  cityMarketBoardAtmosphereHazeOpacity,
  cityMarketBoardAtmospherePulseEnvelope,
  cityMarketBoardLandmarkCue,
  cityMarketBoardLandmarkEmissiveIntensity,
  cityMarketBoardLandmarkHazeOpacity,
  cityMarketBoardLandmarkPulseEnvelope,
  marketFirstWalkUpWorldTip,
  marketStallKitMaterials,
  realmMarketStallKitMaterials,
} from "@game/shared";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MeshStandardMaterial } from "three";

/**
 * City listing stall — peaked canvas; coin Market (sage) or REALM Market (indigo).
 */
export function MarketStall({
  highlighted,
  px,
  pz,
  landKind = "player_land",
  showFirstWalkUpTip = false,
  currency = "coins",
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  landKind?: LandKind;
  showFirstWalkUpTip?: boolean;
  /** Coin listings vs REALM / Creditcoin listings. */
  currency?: "coins" | "realm";
}) {
  const isRealm = currency === "realm";
  const worldLabel = isRealm
    ? "REALM Market"
    : CITY_SERVICE_VISUAL_KITS.market_board.worldLabel;
  const walkUpTip = marketFirstWalkUpWorldTip();
  const commerce = cityCommerceServicePad("market");
  const cityLandmark = cityMarketBoardLandmarkCue(landKind);
  const boardAtmosphere = cityMarketBoardAtmosphereCue(landKind);
  const kit = isRealm
    ? realmMarketStallKitMaterials(highlighted)
    : marketStallKitMaterials(highlighted);
  const hazeMatRef = useRef<MeshStandardMaterial | null>(null);
  const atmosphereHazeMatRef = useRef<MeshStandardMaterial | null>(null);
  const lanternMatRef = useRef<MeshStandardMaterial | null>(null);

  useFrame(() => {
    if (isRealm) return;
    const now = performance.now();
    if (cityLandmark.show) {
      const envelope = cityMarketBoardLandmarkPulseEnvelope(now);
      const intensity = cityMarketBoardLandmarkEmissiveIntensity(envelope);
      const hazeOpacity = cityMarketBoardLandmarkHazeOpacity(envelope);
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
      if (lanternMatRef.current) {
        lanternMatRef.current.emissiveIntensity =
          commerce.lanternIntensity + intensity * 0.35;
      }
    }
    if (boardAtmosphere.show && atmosphereHazeMatRef.current) {
      const mistEnv = cityMarketBoardAtmospherePulseEnvelope(now);
      atmosphereHazeMatRef.current.opacity =
        cityMarketBoardAtmosphereHazeOpacity(mistEnv);
      atmosphereHazeMatRef.current.emissiveIntensity =
        cityMarketBoardAtmosphereEmissiveIntensity(mistEnv);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      {!isRealm && cityLandmark.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.035, 0]}
          userData={{ cityMarketBoardLandmark: true }}
        >
          <circleGeometry args={[cityLandmark.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={hazeMatRef}
            color={cityLandmark.hazeColor}
            emissive={cityLandmark.emissive}
            emissiveIntensity={0.12}
            transparent
            opacity={cityLandmark.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {!isRealm && boardAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, CITY_MARKET_BOARD_ATMOSPHERE_CUE.hazeY, 0]}
          userData={{ cityMarketBoardAtmosphere: true }}
        >
          <circleGeometry
            args={[CITY_MARKET_BOARD_ATMOSPHERE_CUE.hazeRadius, 24]}
          />
          <meshStandardMaterial
            ref={atmosphereHazeMatRef}
            color={CITY_MARKET_BOARD_ATMOSPHERE_CUE.hazeColor}
            emissive={CITY_MARKET_BOARD_ATMOSPHERE_CUE.emissive}
            emissiveIntensity={boardAtmosphere.intensity}
            transparent
            opacity={boardAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <StallKitBody
        highlighted={highlighted}
        goods="listings"
        awningColor={kit.awningColor}
        stripeColor={kit.stripeColor}
        goodsFreshColor={kit.goodsFreshColor}
        awning={kit.awning}
        stripe={kit.stripe}
        post={kit.post}
        counter={kit.counter}
        goodsCrate={kit.goodsCrate}
        goodsFresh={kit.goodsFresh}
        lanternColor={commerce.lanternColor}
        lanternEmissive={
          cityLandmark.show ? cityLandmark.emissive : commerce.lanternEmissive
        }
        lanternIntensity={commerce.lanternIntensity}
        lanternMatRef={lanternMatRef}
        walkUpEmissive={showFirstWalkUpTip ? "#d4b56a" : "#000000"}
        walkUpIntensity={showFirstWalkUpTip ? 0.22 : 0}
      />
      <WorldHtml
        position={[0, VENDOR_STALL_LABEL_Y, 0]}
        center
        style={{ pointerEvents: "none" }}
      >
        <div
          data-testid={isRealm ? "realm-market-world-label" : "market-world-label"}
          data-market-walkup-tip={showFirstWalkUpTip ? "1" : "0"}
          style={{
            background: isRealm
              ? "rgba(18,22,40,0.78)"
              : "rgba(20,28,18,0.75)",
            color: isRealm ? "#e4e8f4" : "#e8f0e2",
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 11,
            whiteSpace: "nowrap",
            textAlign: "center",
            lineHeight: 1.2,
            border: showFirstWalkUpTip
              ? "1px solid #d4b56a"
              : "1px solid transparent",
            boxShadow: showFirstWalkUpTip
              ? "0 0 10px rgba(212,181,106,0.4)"
              : "none",
          }}
        >
          <div>{worldLabel}</div>
          {showFirstWalkUpTip ? (
            <div
              data-testid="market-walkup-tip"
              style={{ fontSize: 9, opacity: 0.9, marginTop: 2, fontWeight: 600 }}
            >
              {walkUpTip}
            </div>
          ) : null}
        </div>
      </WorldHtml>
      <StallHighlightRing show={highlighted} />
    </group>
  );
}
