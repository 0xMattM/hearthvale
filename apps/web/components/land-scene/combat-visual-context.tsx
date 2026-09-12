"use client";

import { createContext, useContext } from "react";

/** World-space combat pose for the creature / dummy currently in a fight. */
export interface CombatVisualState {
  buildingId: string | null;
  active: boolean;
  foeHealthRatio: number;
  pose: "idle" | "chase" | "lunge" | "hit" | "block";
  hitAt: number | null;
  foeName: string;
  /** Foe X offset from the den / dummy pad (world units). */
  offsetX: number;
  /** Foe Z offset from the den / dummy pad (world units). */
  offsetZ: number;
  yaw: number;
}

const DEFAULT_COMBAT_VISUAL: CombatVisualState = {
  buildingId: null,
  active: false,
  foeHealthRatio: 1,
  pose: "idle",
  hitAt: null,
  foeName: "",
  offsetX: 0,
  offsetZ: 0,
  yaw: 0,
};

const CombatVisualContext = createContext<CombatVisualState>(DEFAULT_COMBAT_VISUAL);

export const CombatVisualProvider = CombatVisualContext.Provider;

/**
 * Live-fight visual snapshot for hunt creatures and the arena dummy.
 *
 * @returns Current combat visual, or idle defaults.
 */
export function useCombatVisual(): CombatVisualState {
  return useContext(CombatVisualContext);
}

/**
 * Visual slice for one building (creature or dummy).
 *
 * @param buildingId - World building id.
 * @param visual - Provider snapshot.
 */
export function combatVisualForBuilding(
  buildingId: string,
  visual: CombatVisualState,
): CombatVisualState {
  if (!visual.active || visual.buildingId !== buildingId) {
    return DEFAULT_COMBAT_VISUAL;
  }
  return visual;
}
