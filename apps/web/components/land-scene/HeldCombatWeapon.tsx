"use client";

import type { HeldCombatWeaponKind } from "@game/shared";
import { useLayoutEffect, useMemo } from "react";
import type { Object3D } from "three";
import {
  attachHeldCombatWeapon,
  createHeldCombatWeaponGroup,
  detachHeldCombatWeapon,
  disposeHeldCombatWeaponGroup,
  type HeldCombatGrip,
} from "@/lib/held-combat-weapon";

interface HeldCombatWeaponProps {
  kind: HeldCombatWeaponKind | null;
  parentBone: Object3D | null;
  grip?: HeldCombatGrip;
}

/**
 * Parents the equipped combat weapon under the Hunter hand (or kit arm).
 *
 * @param props - Kind, bone, and local grip pose.
 */
export function HeldCombatWeapon({
  kind,
  parentBone,
  grip = "bone",
}: HeldCombatWeaponProps) {
  useLayoutEffect(() => {
    if (!parentBone || !kind) return;
    attachHeldCombatWeapon(parentBone, kind, grip);
    return () => {
      detachHeldCombatWeapon(parentBone);
    };
  }, [parentBone, kind, grip]);

  return null;
}

/**
 * Kit-arm child — no bone reparent, just a local grip pose.
 *
 * @param props - Weapon silhouette.
 */
export function KitHeldCombatWeapon({
  kind,
}: {
  kind: HeldCombatWeaponKind;
}) {
  const group = useMemo(
    () => createHeldCombatWeaponGroup(kind, "kit"),
    [kind],
  );
  useLayoutEffect(
    () => () => {
      disposeHeldCombatWeaponGroup(group);
    },
    [group],
  );
  return <primitive object={group} />;
}
