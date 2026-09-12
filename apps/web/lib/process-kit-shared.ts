import {
  PROCESS_STATION_WORKING_EMISSIVE,
  processStationWorkingEmissiveEnvelope,
  processStationWorkingEmissiveIntensity,
  type LandKind,
} from "@game/shared";

export interface ProcessKitBaseProps {
  highlighted: boolean;
  showFirstWalkUpTip?: boolean;
  craftWorking?: boolean;
  nowMs?: number;
  landKind?: LandKind;
}

/**
 * Working / walk-up emissive shared by process kits.
 *
 * @param showFirstWalkUpTip - First-visit tip glow.
 * @param craftWorking - Craft panel open.
 * @param nowMs - Envelope clock.
 * @param walkUpColor - Tip tint.
 * @param walkUpIntensity - Tip emissive strength.
 */
export function processKitBodyEmissive(
  showFirstWalkUpTip: boolean,
  craftWorking: boolean,
  nowMs: number,
  walkUpColor: string,
  walkUpIntensity = 0.22,
): { emissive: string; intensity: number } {
  const workGlow = processStationWorkingEmissiveIntensity(
    craftWorking && !showFirstWalkUpTip,
    processStationWorkingEmissiveEnvelope(nowMs),
  );
  return {
    emissive: showFirstWalkUpTip
      ? walkUpColor
      : craftWorking
        ? PROCESS_STATION_WORKING_EMISSIVE.bodyEmissive
        : "#000000",
    intensity: showFirstWalkUpTip ? walkUpIntensity : workGlow,
  };
}

/**
 * Working-glow envelope used by ember / pot overlays.
 *
 * @param showFirstWalkUpTip - First-visit tip glow.
 * @param craftWorking - Craft panel open.
 * @param nowMs - Envelope clock.
 */
export function processKitWorkGlow(
  showFirstWalkUpTip: boolean,
  craftWorking: boolean,
  nowMs: number,
): number {
  return processStationWorkingEmissiveIntensity(
    craftWorking && !showFirstWalkUpTip,
    processStationWorkingEmissiveEnvelope(nowMs),
  );
}
