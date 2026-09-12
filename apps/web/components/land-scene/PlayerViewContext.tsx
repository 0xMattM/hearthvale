"use client";

import { createContext, useContext, type ReactNode, type RefObject } from "react";

export interface PlayerViewPos {
  x: number;
  z: number;
}

const PlayerViewContext = createContext<RefObject<PlayerViewPos> | null>(null);

/**
 * Shares the live avatar XZ ref with env kits (foliage fade, etc.).
 */
export function PlayerViewProvider({
  playerPosRef,
  children,
}: {
  playerPosRef: RefObject<PlayerViewPos>;
  children: ReactNode;
}) {
  return (
    <PlayerViewContext.Provider value={playerPosRef}>
      {children}
    </PlayerViewContext.Provider>
  );
}

/**
 * Live player XZ, or null when mounted outside LandScene.
 *
 * @returns Player position ref, or null.
 */
export function usePlayerViewPos(): RefObject<PlayerViewPos> | null {
  return useContext(PlayerViewContext);
}
