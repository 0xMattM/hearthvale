"use client";

import type { ReactElement } from "react";
import { resolveInteractPrompt, type InteractPromptInput } from "@/lib/hud/interact-prompt";
import {
  HUD_CLOCK_INTERVAL_MS,
  useSyncedNow,
} from "@/lib/hud/use-synced-now";
import { InteractPrompt } from "@/components/hud/InteractPrompt";

export interface TickingInteractPromptProps {
  /** Prompt inputs except `gameNow` — clock is owned here. */
  input: Omit<InteractPromptInput, "gameNow">;
  serverNow: number;
  receivedAt: number;
  successPulse?: boolean;
  panelOpen?: boolean;
}

/**
 * Walk-up interact prompt that ticks remaining-time copy without re-rendering GameApp.
 *
 * @param props - Prompt inputs + snapshot clock.
 * @returns Interact prompt, or null when nothing is nearby.
 */
export function TickingInteractPrompt(
  props: TickingInteractPromptProps,
): ReactElement | null {
  const gameNow = useSyncedNow(
    props.serverNow,
    props.receivedAt,
    HUD_CLOCK_INTERVAL_MS,
  );
  const prompt = resolveInteractPrompt({
    ...props.input,
    gameNow,
  });
  return (
    <InteractPrompt
      label={prompt?.label ?? null}
      showKey={prompt?.showKey ?? true}
      successPulse={props.successPulse}
      panelOpen={props.panelOpen}
    />
  );
}
