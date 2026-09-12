"use client";

import {
  TUTOR_CLAIMABLE_WORLD_CUE,
  TUTOR_VILLAGER_VARIANT,
  cityTutorialNpcYaw,
  interactHighlightRingMaterials,
  tutorialNpcLook,
  tutorClaimableWorldLabelParts,
  tutorFirstWalkUpWorldTip,
  tutorialNpcWorldLabel,
} from "@game/shared";
import { WorldHtml } from "@/components/land-scene/WorldHtml";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { AvatarKit } from "@/components/land-scene/AvatarKit";

interface TutorialNpcBuildingProps {
  highlighted: boolean;
  px: number;
  pz: number;
  professionId: string | null;
  claimable?: boolean;
  showFirstWalkUpTip?: boolean;
}

/**
 * Profession tutor — Blacksmith villager, profession color wash (not the player Hunter).
 */
export function TutorialNpcBuilding({
  highlighted,
  px,
  pz,
  professionId,
  claimable = false,
  showFirstWalkUpTip = false,
}: TutorialNpcBuildingProps) {
  const label = tutorialNpcWorldLabel(professionId);
  const claimParts = claimable ? tutorClaimableWorldLabelParts(label) : null;
  const walkUpTip = tutorFirstWalkUpWorldTip();
  const yaw = cityTutorialNpcYaw(professionId);
  const look = tutorialNpcLook(professionId);
  const sway = useRef<Group>(null);
  const idle = useRef(0);

  useFrame((_, dt) => {
    idle.current += dt;
    const g = sway.current;
    if (!g) return;
    g.position.y = Math.sin(idle.current * 1.6) * 0.01;
  });

  const kitFallback = (
    <AvatarKit
      variant="remote"
      meshVariant={TUTOR_VILLAGER_VARIANT}
      showTool={false}
      landKind="city"
      tintHex={look.cloak}
      cloakColor={look.cloak}
    />
  );

  return (
    <group position={[px, 0, pz]}>
      {claimable ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <circleGeometry args={[0.85, 20]} />
          <meshStandardMaterial
            color={TUTOR_CLAIMABLE_WORLD_CUE.padColor}
            transparent
            opacity={0.55}
          />
        </mesh>
      ) : null}
      {claimable ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <ringGeometry args={[0.75, 1.05, 24]} />
          <meshStandardMaterial
            color={TUTOR_CLAIMABLE_WORLD_CUE.haloColor}
            emissive={TUTOR_CLAIMABLE_WORLD_CUE.haloColor}
            emissiveIntensity={0.42}
            transparent
            opacity={0.78}
          />
        </mesh>
      ) : null}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.4, 24]} />
        <meshBasicMaterial
          color="#1a1814"
          transparent
          opacity={0.32}
          depthWrite={false}
        />
      </mesh>

      <group ref={sway} rotation={[0, yaw, 0]}>
        {kitFallback}
      </group>

      <WorldHtml position={[0, 2.05, 0]} center style={{ pointerEvents: "none" }}>
        <div
          data-testid="tutor-world-label"
          data-claimable={claimable ? "true" : "false"}
          style={{
            background: "rgba(20,28,18,0.75)",
            color: "#e8f0e2",
            padding: claimParts || showFirstWalkUpTip ? "3px 8px" : "2px 8px",
            borderRadius: claimParts || showFirstWalkUpTip ? 5 : 4,
            fontSize: 11,
            whiteSpace: "nowrap",
            textTransform: "capitalize",
            textAlign: "center",
            lineHeight: 1.2,
            border: claimable
              ? `1px solid ${TUTOR_CLAIMABLE_WORLD_CUE.labelBorder}`
              : showFirstWalkUpTip
                ? "1px solid #6a9e5a"
                : `1px solid ${look.cloak}`,
            boxShadow: showFirstWalkUpTip
              ? "0 0 10px rgba(106,158,90,0.35)"
              : undefined,
          }}
        >
          {claimParts ? (
            <>
              <div style={{ fontWeight: 650 }}>{claimParts.name}</div>
              <div
                style={{
                  fontSize: 9,
                  opacity: 0.75,
                  textTransform: "none",
                }}
              >
                {claimParts.soft}
              </div>
            </>
          ) : (
            label
          )}
          {showFirstWalkUpTip ? (
            <div
              data-testid="tutor-walkup-tip"
              data-tutor-walkup-tip="1"
              style={{
                fontSize: 9,
                opacity: 0.9,
                marginTop: 2,
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              {walkUpTip}
            </div>
          ) : null}
        </div>
      </WorldHtml>
      <TutorHighlightRing show={highlighted} />
    </group>
  );
}

function TutorHighlightRing({ show }: { show: boolean }) {
  if (!show) return null;
  const ring = interactHighlightRingMaterials();
  return (
    <mesh position={[0, ring.y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry
        args={[ring.innerRadius, ring.outerRadius, ring.segments]}
      />
      <meshBasicMaterial
        color={ring.color}
        transparent
        opacity={ring.opacity}
      />
    </mesh>
  );
}
