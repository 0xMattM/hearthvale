"use client";

import type { LandKind, HeldCombatWeaponKind } from "@game/shared";
import { useFrame } from "@react-three/fiber";
import { Suspense, type Ref, type RefObject } from "react";
import { useRef, Component, type ReactNode } from "react";
import type { Group } from "three";
import { GltfAvatarModel } from "@/components/land-scene/GltfAvatarModel";
import { StylizedFarmerKit } from "@/components/land-scene/StylizedHumanoidKit";
import {
  avatarGltfModel,
  resolveAvatarKitColors,
  type AvatarKitResolvedColors,
} from "@/lib/avatar-art";
import { applyAvatarWalkPose, avatarWalkPose } from "@/lib/avatar-walk";
import { avatarFarmerKitMaterials, avatarGroundShadowMaterials } from "@game/shared";
import type { VillagerAvatarVariant } from "@/lib/avatar-villager";

interface AvatarKitProps {
  variant: "local" | "remote";
  /** FBX mesh when it should differ from the palette variant (tutors). */
  meshVariant?: VillagerAvatarVariant;
  showTool?: boolean;
  landKind?: LandKind;
  /** Profession cloak wash + kit cape (tutors). */
  tintHex?: string;
  cloakColor?: string;
  /** Walk blend 0…1 — bob / clip when moving. */
  moveAmpRef?: RefObject<number>;
  combatSwingAtRef?: RefObject<number | null>;
  combatGuardRef?: RefObject<boolean>;
  combatWeaponKind?: HeldCombatWeaponKind | null;
  leftLegRef?: Ref<Group>;
  rightLegRef?: Ref<Group>;
  leftArmRef?: Ref<Group>;
  rightArmRef?: Ref<Group>;
  bodyRef?: Ref<Group>;
  torsoRef?: Ref<Group>;
}

/**
 * Player avatar — Villager NPC GLB with procedural kit fallback.
 */
export function AvatarKit({
  variant,
  meshVariant,
  showTool = false,
  landKind,
  tintHex,
  cloakColor,
  moveAmpRef,
  combatSwingAtRef,
  combatGuardRef,
  combatWeaponKind = null,
  leftLegRef,
  rightLegRef,
  leftArmRef,
  rightArmRef,
  bodyRef,
  torsoRef,
}: AvatarKitProps) {
  const colors = resolveAvatarKitColors(variant, landKind);
  const idleTime = useRef(0);
  const idleLeftLeg = useRef<Group>(null);
  const idleRightLeg = useRef<Group>(null);
  const idleLeftArm = useRef<Group>(null);
  const idleRightArm = useRef<Group>(null);
  const idleBody = useRef<Group>(null);
  const idleTorso = useRef<Group>(null);
  const parentDrives = Boolean(leftLegRef);
  const gltfModel = avatarGltfModel();

  useFrame((_, dt) => {
    if (parentDrives || gltfModel) return;
    idleTime.current += dt;
    applyAvatarWalkPose(avatarWalkPose(0, 0, idleTime.current), {
      leftLeg: idleLeftLeg.current,
      rightLeg: idleRightLeg.current,
      leftArm: idleLeftArm.current,
      rightArm: idleRightArm.current,
      body: idleBody.current,
      torso: idleTorso.current,
    });
  });

  const gltfVariant = meshVariant ?? variant;

  const kit = (
    <KitFallback
      colors={colors}
      showTool={showTool}
      combatWeaponKind={combatWeaponKind}
      cloakColor={cloakColor}
      leftLegRef={leftLegRef ?? idleLeftLeg}
      rightLegRef={rightLegRef ?? idleRightLeg}
      leftArmRef={leftArmRef ?? idleLeftArm}
      rightArmRef={rightArmRef ?? idleRightArm}
      bodyRef={bodyRef ?? idleBody}
      torsoRef={torsoRef ?? idleTorso}
    />
  );

  if (!gltfModel) return kit;

  return (
    <GltfErrorBoundary fallback={kit}>
      <Suspense fallback={null}>
        <GltfAvatarModel
          variant={gltfVariant}
          tintHex={tintHex}
          moveAmpRef={moveAmpRef}
          combatSwingAtRef={combatSwingAtRef}
          combatGuardRef={combatGuardRef}
          combatWeaponKind={combatWeaponKind}
        />
      </Suspense>
    </GltfErrorBoundary>
  );
}

class GltfErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

function KitFallback({
  colors,
  showTool,
  combatWeaponKind,
  cloakColor,
  leftLegRef,
  rightLegRef,
  leftArmRef,
  rightArmRef,
  bodyRef,
  torsoRef,
}: {
  colors: AvatarKitResolvedColors;
  showTool: boolean;
  combatWeaponKind: HeldCombatWeaponKind | null;
  cloakColor?: string;
  leftLegRef?: Ref<Group>;
  rightLegRef?: Ref<Group>;
  leftArmRef?: Ref<Group>;
  rightArmRef?: Ref<Group>;
  bodyRef?: Ref<Group>;
  torsoRef?: Ref<Group>;
}) {
  const kit = avatarFarmerKitMaterials();
  const shadow = avatarGroundShadowMaterials();
  return (
    <StylizedFarmerKit
      colors={
        cloakColor
          ? { ...colors, vest: cloakColor, hat: cloakColor }
          : colors
      }
      showTool={showTool}
      combatWeaponKind={combatWeaponKind}
      cloakColor={cloakColor}
      showCloakCape={Boolean(cloakColor)}
      leftLegRef={leftLegRef}
      rightLegRef={rightLegRef}
      leftArmRef={leftArmRef}
      rightArmRef={rightArmRef}
      bodyRef={bodyRef}
      torsoRef={torsoRef}
      kitMaterials={{
        cloth: kit.cloth,
        pants: kit.pants,
        vest: kit.vest,
        boots: kit.boots,
        hat: kit.hat,
        hatBand: kit.hatBand,
        beltColor: kit.beltColor,
        belt: kit.belt,
        bootCuffColor: kit.bootCuffColor,
        bootCuff: kit.bootCuff,
        toolShaft: kit.toolShaft,
        toolHead: kit.toolHead,
        toolFerruleColor: kit.toolFerruleColor,
        toolFerrule: kit.toolFerrule,
      }}
      shadow={shadow}
    />
  );
}
