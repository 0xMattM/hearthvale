"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  armTimedFlag,
  clearTimedFlag,
} from "@/lib/hud/timed-flag";

export interface UseTimedFlagResult {
  /** Whether the flash is currently on. */
  on: boolean;
  /** Arm the flag for `durationMs`. */
  flash: () => void;
  /** Cancel the timer and force the flag off. */
  clear: () => void;
}

/**
 * Boolean that turns on briefly then clears (panel open accents, confirms).
 *
 * @param durationMs - Visible flash length.
 * @returns Flag + flash/clear helpers. Unmount clears the timer.
 */
export function useTimedFlag(durationMs: number): UseTimedFlagResult {
  const [on, setOn] = useState(false);
  const clearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback(() => {
    armTimedFlag(clearRef, setOn, durationMs);
  }, [durationMs]);

  const clear = useCallback(() => {
    clearTimedFlag(clearRef, setOn);
  }, []);

  useEffect(
    () => () => {
      if (clearRef.current) clearTimeout(clearRef.current);
    },
    [],
  );

  return { on, flash, clear };
}
