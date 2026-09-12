/**
 * Shared timed boolean flash (RF7.5) — open accents / world reinforce / confirms.
 * GameApp used ~60 copy-paste clearTimeout + setTrue + setTimeout(setFalse) blocks.
 */

export type TimeoutHandle = ReturnType<typeof setTimeout>;

export interface TimedFlagClearRef {
  current: TimeoutHandle | null;
}

/**
 * Turns a flag on and schedules it off after `durationMs`.
 * Re-arming cancels the previous timer so only the latest flash completes.
 *
 * @param clearRef - Timer slot shared with unmount / explicit clear.
 * @param setOn - React (or test) setter for the visible flag.
 * @param durationMs - How long the flag stays true. Non-positive durations clear immediately.
 */
export function armTimedFlag(
  clearRef: TimedFlagClearRef,
  setOn: (on: boolean) => void,
  durationMs: number,
): void {
  if (clearRef.current) {
    clearTimeout(clearRef.current);
    clearRef.current = null;
  }
  if (durationMs <= 0) {
    setOn(false);
    return;
  }
  setOn(true);
  clearRef.current = setTimeout(() => {
    setOn(false);
    clearRef.current = null;
  }, durationMs);
}

/**
 * Cancels a pending flash and forces the flag off.
 *
 * @param clearRef - Timer slot from `armTimedFlag`.
 * @param setOn - Same setter passed to `armTimedFlag`.
 */
export function clearTimedFlag(
  clearRef: TimedFlagClearRef,
  setOn: (on: boolean) => void,
): void {
  if (clearRef.current) {
    clearTimeout(clearRef.current);
    clearRef.current = null;
  }
  setOn(false);
}
