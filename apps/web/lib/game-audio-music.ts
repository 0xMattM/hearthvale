/**
 * Looping map music beds — homestead, city, and shared wilds/arena.
 * Complements (does not replace) SFX and the brief arrive identity
 * stinger in `game-audio.ts`.
 */

import {
  normalizeLandKind,
  type CanonicalLandKind,
} from "@game/shared";

/** Which looping song should play. */
export type BgmMusicTrackId = "land" | "city" | "wilds";

/** One looping MP3 served from `apps/web/public/audio`. */
export interface BgmMusicTrack {
  /** Public URL path (Next.js `public/`). */
  src: string;
  /** Linear HTMLAudioElement volume (0–1). */
  volume: number;
}

/**
 * Cozy Game Loop on player land; Peaceful Affection in the city;
 * Calm Optimism on Explore and the Warrior Arena.
 */
export const BGM_MUSIC_TRACKS: Record<BgmMusicTrackId, BgmMusicTrack> = {
  land: {
    src: "/audio/cozy-game-loop.mp3",
    volume: 0.36,
  },
  city: {
    src: "/audio/peaceful-affection.mp3",
    volume: 0.36,
  },
  wilds: {
    src: "/audio/calm-optimism.mp3",
    volume: 0.34,
  },
};

/**
 * Soft crossfade when swapping land / city / wilds tracks.
 */
export const BGM_MUSIC_TRANSITION = {
  /** New track fade-in seconds. */
  fadeInSec: 0.85,
  /** Old track fade-out seconds (overlaps the new fade-in). */
  fadeOutSec: 0.55,
  /** Start the new track at this fraction of target volume. */
  quietStartGainFactor: 0.08,
} as const;

export interface MusicPlayOptions {
  /** Soft fade-in duration when swapping tracks. */
  fadeInSec?: number;
  /** Initial volume as a fraction of target. */
  startVolumeFactor?: number;
}

/**
 * Looping music sink. Tests inject a mock; the browser uses HTMLAudioElement.
 */
export interface MusicPlayer {
  playLoop: (
    src: string,
    volume: number,
    opts?: MusicPlayOptions,
  ) => () => void;
}

/**
 * Picks the looping song for a land kind (legacy aliases included).
 *
 * @param kind - Current or destination map kind.
 * @returns `city` in the hub, `wilds` on explore/arena, `land` on homestead.
 */
export function bgmMusicTrackFor(
  kind: string | null | undefined,
): BgmMusicTrackId {
  const n = kind ? normalizeLandKind(kind) : null;
  if (n === "city") return "city";
  if (n === "explore" || n === "warrior") return "wilds";
  return "land";
}

/**
 * Whether a map change should swap the looping song.
 * Explore and Arena share Calm Optimism so hops there stay on the same bed.
 * Mute and stopped BGM stay quiet.
 *
 * @param prevKind - Map before the swap.
 * @param nextKind - Map after the swap.
 * @param bgmWanted - Player wants music running.
 * @param muted - Client mute flag.
 * @returns True when the controller should fade into a different MP3.
 */
export function shouldSwapBgmMusicTrack(
  prevKind: CanonicalLandKind,
  nextKind: CanonicalLandKind,
  bgmWanted: boolean,
  muted: boolean,
): boolean {
  if (!bgmWanted || muted) return false;
  return bgmMusicTrackFor(prevKind) !== bgmMusicTrackFor(nextKind);
}

/**
 * Clamps a linear gain into the HTMLAudioElement 0–1 range.
 *
 * @param value - Requested volume.
 * @returns Volume safe to assign to `audio.volume`.
 */
function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/**
 * Linearly ramps `el.volume` then optionally runs `onDone`.
 *
 * @param el - Playing element.
 * @param from - Start volume.
 * @param to - End volume.
 * @param durationSec - Ramp length.
 * @param onDone - Called once the ramp finishes (not on cancel).
 * @returns Cancel function.
 */
function rampVolume(
  el: HTMLAudioElement,
  from: number,
  to: number,
  durationSec: number,
  onDone?: () => void,
): () => void {
  const start = performance.now();
  const durationMs = Math.max(16, durationSec * 1000);
  let raf = 0;
  let cancelled = false;

  function tick(now: number): void {
    if (cancelled) return;
    const t = Math.min(1, (now - start) / durationMs);
    el.volume = clamp01(from + (to - from) * t);
    if (t < 1) {
      raf = requestAnimationFrame(tick);
      return;
    }
    onDone?.();
  }

  raf = requestAnimationFrame(tick);
  return () => {
    cancelled = true;
    if (raf) cancelAnimationFrame(raf);
  };
}

/**
 * Browser looping-music sink. No-ops when `Audio` is unavailable (SSR / tests).
 *
 * @returns Music player whose `playLoop` stop fades out then releases the element.
 */
export function createHtmlMusicPlayer(): MusicPlayer {
  if (typeof window === "undefined" || typeof Audio === "undefined") {
    return {
      playLoop() {
        return () => undefined;
      },
    };
  }

  return {
    playLoop(src, volume, opts) {
      const el = new Audio();
      el.src = src;
      el.loop = true;
      el.preload = "auto";
      const target = clamp01(volume);
      const fadeInSec = opts?.fadeInSec ?? 0;
      const startFactor = opts?.startVolumeFactor ?? 1;
      el.volume =
        fadeInSec > 0 ? clamp01(target * startFactor) : target;

      let fadeCancel: (() => void) | null = null;
      let stopped = false;
      let unlockRetry: (() => void) | null = null;

      function clearUnlockRetry(): void {
        if (!unlockRetry) return;
        window.removeEventListener("pointerdown", unlockRetry);
        unlockRetry = null;
      }

      function tryPlay(): void {
        if (stopped) return;
        void el.play().catch(() => {
          // Reason: autoplay may wait for a click (refresh-while-logged-in).
          if (stopped || unlockRetry) return;
          unlockRetry = () => {
            unlockRetry = null;
            tryPlay();
          };
          window.addEventListener("pointerdown", unlockRetry, { once: true });
        });
      }

      tryPlay();
      if (fadeInSec > 0 && el.volume < target) {
        fadeCancel = rampVolume(el, el.volume, target, fadeInSec);
      }

      return () => {
        if (stopped) return;
        stopped = true;
        clearUnlockRetry();
        fadeCancel?.();
        const from = el.volume;
        fadeCancel = rampVolume(
          el,
          from,
          0,
          BGM_MUSIC_TRANSITION.fadeOutSec,
          () => {
            el.pause();
            el.removeAttribute("src");
            el.load();
          },
        );
      };
    },
  };
}
