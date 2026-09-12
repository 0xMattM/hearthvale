"use client";

import { useMemo } from "react";
import type { LandKind } from "@game/shared";
import {
  dayCycleProgress,
  dayNightPalette,
  dayPhaseEdgeHazeEnvelope,
  dayPhaseEdgeHazeFogColor,
  dayPhaseEdgeHazeFogRange,
  dayPhaseEdgeHazeHemiIntensity,
  dayPhaseEdgeHazeKind,
  dayPhaseEdgeHazeSunIntensity,
  fillLightPosition,
  LIGHTING_READABILITY,
  readableLightIntensities,
} from "@/lib/day-night";
import { sceneTemplateForLandKind } from "@/lib/scene-template";

interface DayNightLightingProps {
  landKind: LandKind;
  nowMs: number;
  /** When false, lock midday look (settings). */
  enabled?: boolean;
}

/**
 * Cosmetic sky, fog, and sun — no gameplay effect (F14.5).
 * Soft haze reinforce on dusk↔night / night↔dawn edges (PL122.2).
 * Readability floors keep dusk/night from crushing the world dark.
 */
export function DayNightLighting({
  landKind,
  nowMs,
  enabled = true,
}: DayNightLightingProps) {
  const template = sceneTemplateForLandKind(landKind);
  const palette = useMemo(
    () => dayNightPalette(nowMs, template, enabled),
    [nowMs, template, enabled],
  );
  const baseFogNear = template === "explore" ? 24 : template === "city" ? 28 : 18;
  const baseFogFar =
    template === "explore" ? 70 : template === "warrior" ? 40 : template === "city" ? 80 : 48;

  // Reason: PL122.2 — brief haze/light reinforce at dusk↔night and night↔dawn.
  const edge = useMemo(() => {
    const progress = enabled ? dayCycleProgress(nowMs) : 0.35;
    const envelope = dayPhaseEdgeHazeEnvelope(progress, enabled);
    const kind = dayPhaseEdgeHazeKind(progress, enabled);
    const [fogNear, fogFar] = dayPhaseEdgeHazeFogRange(
      baseFogNear,
      baseFogFar,
      envelope,
    );
    const rawHemi = dayPhaseEdgeHazeHemiIntensity(
      palette.hemiIntensity,
      envelope,
    );
    const rawSun = dayPhaseEdgeHazeSunIntensity(
      palette.sunIntensity,
      envelope,
    );
    const readable = readableLightIntensities(rawHemi, rawSun);
    return {
      envelope,
      kind,
      fogNear,
      fogFar,
      fog: dayPhaseEdgeHazeFogColor(palette.fog, kind, envelope),
      hemiIntensity: readable.hemi,
      sunIntensity: readable.sun,
    };
  }, [
    nowMs,
    enabled,
    baseFogNear,
    baseFogFar,
    palette.fog,
    palette.hemiIntensity,
    palette.sunIntensity,
  ]);

  return (
    <group>
      <color attach="background" args={[palette.background]} />
      <fog attach="fog" args={[edge.fog, edge.fogNear, edge.fogFar]} />
      <hemisphereLight
        args={[palette.hemiSky, palette.hemiGround, edge.hemiIntensity]}
      />
      <directionalLight
        castShadow
        position={palette.sunPosition}
        intensity={edge.sunIntensity * LIGHTING_READABILITY.keySunFactor}
        color="#fff6e4"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.035}
        shadow-camera-far={60}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
      />
      <directionalLight
        position={fillLightPosition(palette.sunPosition)}
        intensity={edge.sunIntensity * LIGHTING_READABILITY.fillSunFactor}
        color="#c8daf0"
      />
      <ambientLight
        intensity={LIGHTING_READABILITY.ambient}
        color="#f0e8d8"
      />
    </group>
  );
}
