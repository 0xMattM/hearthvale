"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import type { VisitLandDto } from "@game/shared";
import { applyVisitLandPayload } from "@/lib/visit-land-session";

export interface UseVisitLandStateResult {
  visitLand: VisitLandDto | null;
  setVisitLand: Dispatch<SetStateAction<VisitLandDto | null>>;
  visitLandRef: MutableRefObject<VisitLandDto | null>;
  visitReceivedAtRef: MutableRefObject<number>;
  /**
   * Apply a successful visit payload (sets land + receive clock).
   *
   * @param land - Visit land DTO from the API.
   */
  applyVisitLand: (land: VisitLandDto) => void;
  /** Drop visit without leave cues (logout / hard reset). */
  clearVisitSilent: () => void;
}

/**
 * Visit-land session state + refs (RF7.2).
 * Leave/travel cues stay in GameApp so flash helpers can stay declaration-ordered.
 *
 * @returns Visit session state for map/travel UX.
 */
export function useVisitLandState(): UseVisitLandStateResult {
  const [visitLand, setVisitLand] = useState<VisitLandDto | null>(null);
  const visitLandRef = useRef<VisitLandDto | null>(null);
  const visitReceivedAtRef = useRef(0);

  useEffect(() => {
    visitLandRef.current = visitLand;
  }, [visitLand]);

  const applyVisitLand = useCallback((land: VisitLandDto) => {
    applyVisitLandPayload(land, visitReceivedAtRef, setVisitLand);
  }, []);

  const clearVisitSilent = useCallback(() => {
    setVisitLand(null);
  }, []);

  return {
    visitLand,
    setVisitLand,
    visitLandRef,
    visitReceivedAtRef,
    applyVisitLand,
    clearVisitSilent,
  };
}
