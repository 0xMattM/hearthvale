"use client";

import { syncedNow } from "@game/shared";
import { useEffect, useState } from "react";

/** HUD remaining-time / prompt clock — isolated from the 3D tree. */
export const HUD_CLOCK_INTERVAL_MS = 500;

/** World labels / day-night inside the canvas — slower than HUD. */
export const SCENE_CLOCK_INTERVAL_MS = 1000;

/**
 * Quantizes a clock ms value into interval buckets.
 *
 * @param nowMs - Absolute clock ms.
 * @param intervalMs - Bucket size; non-positive returns `nowMs`.
 * @returns Bucket index, or `nowMs` when interval is invalid.
 */
export function clockBucket(nowMs: number, intervalMs: number): number {
  if (!(intervalMs > 0) || !Number.isFinite(intervalMs)) return nowMs;
  return Math.floor(nowMs / intervalMs);
}

/**
 * Whether a ticking clock should publish a React update.
 *
 * @param prevMs - Last published clock.
 * @param nextMs - Newly sampled clock.
 * @param intervalMs - Minimum visible step.
 * @returns True when the display bucket changed (or interval is invalid and the value moved).
 */
export function shouldPublishClockTick(
  prevMs: number,
  nextMs: number,
  intervalMs: number,
): boolean {
  if (!(intervalMs > 0) || !Number.isFinite(intervalMs)) {
    return nextMs !== prevMs;
  }
  return clockBucket(nextMs, intervalMs) !== clockBucket(prevMs, intervalMs);
}

/**
 * Advances a server snapshot on an interval without a parent setState loop.
 *
 * @param serverNow - Snapshot `serverNow` from the last state payload.
 * @param receivedAt - Local ms when that snapshot arrived.
 * @param intervalMs - Publish period (HUD vs scene).
 * @returns Synced clock ms.
 */
export function useSyncedNow(
  serverNow: number,
  receivedAt: number,
  intervalMs: number,
): number {
  const [nowMs, setNowMs] = useState(() =>
    syncedNow(serverNow, receivedAt),
  );

  useEffect(() => {
    setNowMs(syncedNow(serverNow, receivedAt));
    if (!(intervalMs > 0)) return;
    const id = window.setInterval(() => {
      const next = syncedNow(serverNow, receivedAt);
      setNowMs((prev) =>
        shouldPublishClockTick(prev, next, intervalMs) ? next : prev,
      );
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [serverNow, receivedAt, intervalMs]);

  return nowMs;
}
