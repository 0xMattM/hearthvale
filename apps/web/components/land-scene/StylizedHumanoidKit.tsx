"use client";

import "@/components/land-scene/kit-box-geometry";
import type { Ref } from "react";
import type { Group } from "three";
import type { HeldCombatWeaponKind } from "@game/shared";
import { KitHeldCombatWeapon } from "@/components/land-scene/HeldCombatWeapon";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import {
  HumanoidHand,
  HumanoidHead,
  HumanoidSatchel,
  HumanoidVestFrontCue,
} from "@/components/land-scene/HumanoidDetail";
import {
  HUMANOID_BODY,
  HUMANOID_GROUND_ALIGN_Y,
  TRAVELER_HOOD_COLOR,
} from "@/lib/humanoid-layout";

export interface StylizedKitColors {
  skin: string;
  shirt: string;
  pants: string;
  vest: string;
  boots: string;
  hat: string;
  hatBand: string;
  vestEmissive?: string;
  vestEmissiveIntensity?: number;
  toolShaft?: string;
  toolHead?: string;
}

interface StylizedFarmerKitProps {
  colors: StylizedKitColors;
  showTool?: boolean;
  combatWeaponKind?: HeldCombatWeaponKind | null;
  cloakColor?: string;
  showCloakCape?: boolean;
  cloakEmissive?: string;
  cloakEmissiveIntensity?: number;
  leftLegRef?: Ref<Group>;
  rightLegRef?: Ref<Group>;
  leftArmRef?: Ref<Group>;
  rightArmRef?: Ref<Group>;
  bodyRef?: Ref<Group>;
  torsoRef?: Ref<Group>;
  kitMaterials?: {
    cloth: { roughness: number; metalness: number };
    pants: { roughness: number; metalness: number };
    vest: { roughness: number; metalness: number };
    boots: { roughness: number; metalness: number };
    hat: { roughness: number; metalness: number };
    hatBand: { roughness: number; metalness: number };
    beltColor: string;
    belt: { roughness: number; metalness: number };
    bootCuffColor: string;
    bootCuff: { roughness: number; metalness: number };
    toolShaft?: { roughness: number; metalness: number };
    toolHead?: { roughness: number; metalness: number };
    toolFerruleColor?: string;
    toolFerrule?: { roughness: number; metalness: number };
  };
  shadow?: {
    y: number;
    radius: number;
    segments: number;
    color: string;
    opacity: number;
    shadow: { roughness: number; metalness: number };
  };
}

/**
 * Traveler-chibi farmer — pear robe, hooded head, stub limbs, satchel (reference style).
 */
export function StylizedFarmerKit({
  colors,
  showTool = false,
  combatWeaponKind = null,
  cloakColor,
  showCloakCape = false,
  cloakEmissive = "#000000",
  cloakEmissiveIntensity = 0,
  leftLegRef,
  rightLegRef,
  leftArmRef,
  rightArmRef,
  bodyRef,
  torsoRef,
  kitMaterials,
  shadow,
}: StylizedFarmerKitProps) {
  const kit = kitMaterials!;
  const hoodColor =
    showCloakCape && cloakColor ? cloakColor : TRAVELER_HOOD_COLOR;
  const capColor =
    showCloakCape && cloakColor ? cloakColor : colors.hat;
  const vestEmissive = colors.vestEmissive ?? "#000000";
  const vestEmissiveIntensity = colors.vestEmissiveIntensity ?? 0;
  const lowerY =
    HUMANOID_BODY.beltY + HUMANOID_BODY.torsoLower[1] / 2 - 0.02;
  const upperY =
    lowerY +
    HUMANOID_BODY.torsoLower[1] / 2 +
    HUMANOID_BODY.torsoUpper[1] / 2;

  const clothRepeat = 1;

  return (
    <group scale={HUMANOID_BODY.worldScale}>
      <group position={[0, HUMANOID_GROUND_ALIGN_Y, 0]}>
        <group ref={bodyRef}>
        <TravelerLeg
          pivotRef={leftLegRef}
          x={-HUMANOID_BODY.hipSpan}
          boots={colors.boots}
          kit={kit}
        />
        <TravelerLeg
          pivotRef={rightLegRef}
          x={HUMANOID_BODY.hipSpan}
          boots={colors.boots}
          kit={kit}
        />

        <group ref={torsoRef}>
          {/* Pear robe — wide base */}
          <mesh position={[0, lowerY, 0]} castShadow>
            <kitBoxGeometry args={[...HUMANOID_BODY.torsoLower]} />
            <TexturedStandardMaterial
              kind="cloth"
              color={colors.shirt}
              roughness={kit.cloth.roughness}
              metalness={kit.cloth.metalness}
              repeat={clothRepeat}
            />
          </mesh>
          <mesh position={[0, upperY, 0]} castShadow>
            <kitBoxGeometry args={[...HUMANOID_BODY.torsoUpper]} />
            <TexturedStandardMaterial
              kind="cloth"
              color={colors.shirt}
              roughness={kit.cloth.roughness}
              metalness={kit.cloth.metalness}
              repeat={clothRepeat}
            />
          </mesh>

          {/* Wide tunic sleeves */}
          <mesh
            position={[
              -HUMANOID_BODY.sleeveSpan,
              HUMANOID_BODY.shoulderY - 0.04,
              0,
            ]}
            castShadow
          >
            <kitBoxGeometry args={[0.11, 0.16, 0.12]} />
            <TexturedStandardMaterial
              kind="cloth"
              color={colors.shirt}
              roughness={kit.cloth.roughness}
              metalness={kit.cloth.metalness}
              repeat={clothRepeat}
            />
          </mesh>
          <mesh
            position={[
              HUMANOID_BODY.sleeveSpan,
              HUMANOID_BODY.shoulderY - 0.04,
              0,
            ]}
            castShadow
          >
            <kitBoxGeometry args={[0.11, 0.16, 0.12]} />
            <TexturedStandardMaterial
              kind="cloth"
              color={colors.shirt}
              roughness={kit.cloth.roughness}
              metalness={kit.cloth.metalness}
              repeat={clothRepeat}
            />
          </mesh>

          <mesh
            position={[
              0,
              upperY + 0.02,
              HUMANOID_BODY.torsoUpper[2] * 0.38,
            ]}
            castShadow
          >
            <kitBoxGeometry args={[0.34, 0.2, 0.07]} />
            <TexturedStandardMaterial
              kind="leather"
              color={colors.vest}
              roughness={kit.vest.roughness}
              metalness={kit.vest.metalness}
              emissive={vestEmissive}
              emissiveIntensity={vestEmissiveIntensity}
              repeat={2}
            />
          </mesh>
          <HumanoidVestFrontCue
            color={colors.vest}
            emissive={vestEmissive}
            emissiveIntensity={vestEmissiveIntensity * 0.4}
          />

          <mesh position={[0, HUMANOID_BODY.beltY - 0.02, 0]} castShadow>
            <kitBoxGeometry
              args={[
                HUMANOID_BODY.torsoLower[0] + 0.02,
                0.035,
                HUMANOID_BODY.torsoLower[2] + 0.01,
              ]}
            />
            <TexturedStandardMaterial
              kind="leather"
              color={kit.beltColor}
              roughness={kit.belt.roughness}
              metalness={kit.belt.metalness}
              repeat={2}
            />
          </mesh>

          <group position={[0, HUMANOID_BODY.headAnchorY, 0]}>
            <HumanoidHead
              skin={colors.skin}
              hair={colors.hatBand}
              hoodColor={hoodColor}
              capColor={capColor}
            />
          </group>

          <HumanoidSatchel
            leatherColor={colors.boots}
            pouchColor={colors.vest}
          />

          {showTool && colors.toolShaft && colors.toolHead ? (
            <mesh
              position={[
                HUMANOID_BODY.sleeveSpan + 0.04,
                HUMANOID_BODY.shoulderY - 0.18,
                0.08,
              ]}
              rotation={[0.5, 0, -0.35]}
              castShadow
            >
              <kitBoxGeometry args={[0.04, 0.22, 0.05]} />
              <TexturedStandardMaterial
                kind="wood"
                color={colors.toolShaft}
                roughness={kit.toolShaft?.roughness ?? 0.88}
                metalness={kit.toolShaft?.metalness ?? 0.02}
                repeat={1}
              />
            </mesh>
          ) : null}
        </group>

        <TravelerArm
          pivotRef={leftArmRef}
          x={-HUMANOID_BODY.shoulderSpan}
          color={colors.shirt}
          skin={colors.skin}
          kit={kit}
          side="left"
        />
        <TravelerArm
          pivotRef={rightArmRef}
          x={HUMANOID_BODY.shoulderSpan}
          color={colors.shirt}
          skin={colors.skin}
          kit={kit}
          side="right"
          combatWeaponKind={combatWeaponKind}
        />
        </group>
      </group>

      {shadow ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, shadow.y, 0]}
          receiveShadow
        >
          <circleGeometry args={[shadow.radius, shadow.segments]} />
          <meshStandardMaterial
            color={shadow.color}
            transparent
            opacity={shadow.opacity}
            roughness={shadow.shadow.roughness}
            metalness={shadow.shadow.metalness}
            depthWrite={false}
          />
        </mesh>
      ) : null}
    </group>
  );
}

function TravelerLeg({
  pivotRef,
  x,
  boots,
  kit,
}: {
  pivotRef?: Ref<Group>;
  x: number;
  boots: string;
  kit: StylizedFarmerKitProps["kitMaterials"];
}) {
  const stub = HUMANOID_BODY.legStubHeight;
  const boot = HUMANOID_BODY.bootHeight;
  return (
    <group ref={pivotRef} position={[x, HUMANOID_BODY.hipY, 0]}>
      <mesh position={[0, -stub / 2, 0]} castShadow>
        <kitBoxGeometry args={[0.13, stub, 0.12]} />
        <TexturedStandardMaterial
          kind="cloth"
          color={kit!.bootCuffColor}
          roughness={kit!.pants.roughness}
          metalness={kit!.pants.metalness}
          repeat={1}
        />
      </mesh>
      <mesh position={[0, -stub - boot / 2 + 0.02, 0.02]} castShadow>
        <kitBoxGeometry args={[0.14, boot, 0.16]} />
        <TexturedStandardMaterial
          kind="leather"
          color={boots}
          roughness={kit!.boots.roughness}
          metalness={kit!.boots.metalness}
          repeat={2}
        />
      </mesh>
    </group>
  );
}

function TravelerArm({
  pivotRef,
  x,
  color,
  skin,
  kit,
  side,
  combatWeaponKind = null,
}: {
  pivotRef?: Ref<Group>;
  x: number;
  color: string;
  skin: string;
  kit: StylizedFarmerKitProps["kitMaterials"];
  side: "left" | "right";
  combatWeaponKind?: HeldCombatWeaponKind | null;
}) {
  const zRot =
    side === "left"
      ? HUMANOID_BODY.armRestAngle
      : -HUMANOID_BODY.armRestAngle;
  return (
    <group
      ref={pivotRef}
      position={[x, HUMANOID_BODY.shoulderY - 0.06, 0]}
      rotation={[0, 0, zRot]}
    >
      <mesh position={[0, -0.1, 0]} castShadow>
        <kitBoxGeometry args={[0.1, 0.18, 0.1]} />
        <TexturedStandardMaterial
          kind="cloth"
          color={color}
          roughness={kit!.cloth.roughness}
          metalness={kit!.cloth.metalness}
          repeat={1}
        />
      </mesh>
      <group position={[0, -0.22, 0.01]}>
        <HumanoidHand skin={skin} side={side} />
      </group>
      {side === "right" && combatWeaponKind ? (
        <KitHeldCombatWeapon kind={combatWeaponKind} />
      ) : null}
    </group>
  );
}
