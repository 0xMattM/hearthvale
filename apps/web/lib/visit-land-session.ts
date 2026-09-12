import type { VisitLandDto } from "@game/shared";

/**
 * Stamps visit receive clock and applies land DTO (RF7.2).
 *
 * @param land - Visit land from the API.
 * @param visitReceivedAtRef - Mutable receive timestamp ref.
 * @param setVisitLand - State setter for the active visit.
 * @param nowMs - Clock ms (injectable for tests).
 */
export function applyVisitLandPayload(
  land: VisitLandDto,
  visitReceivedAtRef: { current: number },
  setVisitLand: (land: VisitLandDto) => void,
  nowMs: number = Date.now(),
): void {
  visitReceivedAtRef.current = nowMs;
  setVisitLand(land);
}
