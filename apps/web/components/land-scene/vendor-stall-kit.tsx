"use client";

import { WorldHtml } from "@/components/land-scene/WorldHtml";
import {
  StallHighlightRing,
  StallKitBody,
} from "@/components/land-scene/stall-kit-body";
import { VENDOR_STALL_LABEL_Y } from "@/lib/vendor-kit-scale";
import type { LandKind } from "@game/shared";
import {
  CITY_SERVICE_VISUAL_KITS,
  CITY_VENDOR_ATMOSPHERE_CUE,
  cityCommerceServicePad,
  cityVendorAtmosphereCue,
  cityVendorAtmosphereEmissiveIntensity,
  cityVendorAtmosphereHazeOpacity,
  cityVendorAtmospherePulseEnvelope,
  cityVendorLandmarkCue,
  cityVendorLandmarkEmissiveIntensity,
  cityVendorLandmarkHazeOpacity,
  cityVendorLandmarkPulseEnvelope,
  exploreVendorLandmarkCue,
  exploreVendorLandmarkEmissiveIntensity,
  exploreVendorLandmarkHazeOpacity,
  exploreVendorLandmarkPulseEnvelope,
  vendorFirstWalkUpWorldTip,
  vendorStallKitMaterials,
} from "@game/shared";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MeshStandardMaterial } from "three";

/**
 * City / Explore vendor stall: peaked canvas, oak table, crate + produce.
 */
export function VendorStall({
  highlighted,
  px,
  pz,
  landKind = "player_land",
  showFirstWalkUpTip = false,
}: {
  highlighted: boolean;
  px: number;
  pz: number;
  landKind?: LandKind;
  showFirstWalkUpTip?: boolean;
}) {
  const { worldLabel } = CITY_SERVICE_VISUAL_KITS.vendor_stall;
  const walkUpTip = vendorFirstWalkUpWorldTip();
  const commerce = cityCommerceServicePad("vendor");
  const exploreLandmark = exploreVendorLandmarkCue(landKind);
  const cityLandmark = cityVendorLandmarkCue(landKind);
  const stallAtmosphere = cityVendorAtmosphereCue(landKind);
  const stallLandmark = exploreLandmark.show
    ? exploreLandmark
    : cityLandmark.show
      ? cityLandmark
      : null;
  const stallLandmarkKind = exploreLandmark.show
    ? "explore"
    : cityLandmark.show
      ? "city"
      : null;
  const kit = vendorStallKitMaterials(highlighted);
  const hazeMatRef = useRef<MeshStandardMaterial | null>(null);
  const atmosphereHazeMatRef = useRef<MeshStandardMaterial | null>(null);
  const lanternMatRef = useRef<MeshStandardMaterial | null>(null);

  useFrame(() => {
    const now = performance.now();
    if (stallLandmark && stallLandmarkKind) {
      const envelope =
        stallLandmarkKind === "explore"
          ? exploreVendorLandmarkPulseEnvelope(now)
          : cityVendorLandmarkPulseEnvelope(now);
      const intensity =
        stallLandmarkKind === "explore"
          ? exploreVendorLandmarkEmissiveIntensity(envelope)
          : cityVendorLandmarkEmissiveIntensity(envelope);
      const hazeOpacity =
        stallLandmarkKind === "explore"
          ? exploreVendorLandmarkHazeOpacity(envelope)
          : cityVendorLandmarkHazeOpacity(envelope);
      if (hazeMatRef.current) hazeMatRef.current.opacity = hazeOpacity;
      if (lanternMatRef.current) {
        lanternMatRef.current.emissiveIntensity =
          commerce.lanternIntensity + intensity * 0.35;
      }
    }
    if (stallAtmosphere.show && atmosphereHazeMatRef.current) {
      const mistEnv = cityVendorAtmospherePulseEnvelope(now);
      atmosphereHazeMatRef.current.opacity =
        cityVendorAtmosphereHazeOpacity(mistEnv);
      atmosphereHazeMatRef.current.emissiveIntensity =
        cityVendorAtmosphereEmissiveIntensity(mistEnv);
    }
  });

  return (
    <group position={[px, 0, pz]}>
      {stallLandmark && stallLandmarkKind ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.035, 0]}
          userData={
            stallLandmarkKind === "explore"
              ? { exploreVendorLandmark: true }
              : { cityVendorLandmark: true }
          }
        >
          <circleGeometry args={[stallLandmark.hazeRadius, 24]} />
          <meshStandardMaterial
            ref={hazeMatRef}
            color={stallLandmark.hazeColor}
            emissive={stallLandmark.emissive}
            emissiveIntensity={0.14}
            transparent
            opacity={stallLandmark.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      {stallAtmosphere.show ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, CITY_VENDOR_ATMOSPHERE_CUE.hazeY, 0]}
          userData={{ cityVendorAtmosphere: true }}
        >
          <circleGeometry
            args={[CITY_VENDOR_ATMOSPHERE_CUE.hazeRadius, 24]}
          />
          <meshStandardMaterial
            ref={atmosphereHazeMatRef}
            color={CITY_VENDOR_ATMOSPHERE_CUE.hazeColor}
            emissive={CITY_VENDOR_ATMOSPHERE_CUE.emissive}
            emissiveIntensity={stallAtmosphere.intensity}
            transparent
            opacity={stallAtmosphere.hazeOpacity}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <StallKitBody
        highlighted={highlighted}
        goods="produce"
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
          stallLandmark ? stallLandmark.emissive : commerce.lanternEmissive
        }
        lanternIntensity={commerce.lanternIntensity}
        lanternMatRef={lanternMatRef}
        walkUpEmissive={showFirstWalkUpTip ? "#c04040" : "#000000"}
        walkUpIntensity={showFirstWalkUpTip ? 0.22 : 0}
      />
      <WorldHtml
        position={[0, VENDOR_STALL_LABEL_Y, 0]}
        center
        style={{ pointerEvents: "none" }}
      >
        <div
          data-testid="vendor-world-label"
          data-vendor-walkup-tip={showFirstWalkUpTip ? "1" : "0"}
          data-explore-vendor-landmark={exploreLandmark.show ? "1" : "0"}
          style={{
            background: "rgba(20,28,18,0.75)",
            color: "#e8f0e2",
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 11,
            whiteSpace: "nowrap",
            textAlign: "center",
            lineHeight: 1.2,
            border: showFirstWalkUpTip
              ? "1px solid #c04040"
              : exploreLandmark.show
                ? `1px solid ${exploreLandmark.emissive}`
                : "1px solid transparent",
            boxShadow: showFirstWalkUpTip
              ? "0 0 10px rgba(192,64,64,0.35)"
              : exploreLandmark.show
                ? `0 0 8px ${exploreLandmark.emissive}55`
                : "none",
          }}
        >
          <div>{worldLabel}</div>
          {showFirstWalkUpTip ? (
            <div
              data-testid="vendor-walkup-tip"
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
