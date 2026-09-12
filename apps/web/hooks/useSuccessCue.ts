"use client";

import {
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { SUCCESS_CUE_MS } from "@/lib/hud/success-cue";

export interface UseSuccessCueResult {
  /** TopBar / info ephemeral text. */
  info: string | null;
  setInfo: Dispatch<SetStateAction<string | null>>;
  promptPulse: boolean;
  flashSuccessCue: (
    message: string,
    opts?: { pulsePrompt?: boolean },
  ) => void;
  flashSuccessCueRef: MutableRefObject<
    (message: string, opts?: { pulsePrompt?: boolean }) => void
  >;
  successCueClearRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  promptPulseClearRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
}

/**
 * Ephemeral success cue + optional interact-prompt pulse (RF7.4 / PL6.2).
 *
 * @returns Cue flash helpers for GameApp orchestration.
 */
export function useSuccessCue(): UseSuccessCueResult {
  const [info, setInfo] = useState<string | null>(null);
  const [promptPulse, setPromptPulse] = useState(false);
  const successCueClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const promptPulseClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Reason: PL18.1 — socket effects may run before flashSuccessCue is assigned.
  const flashSuccessCueRef = useRef<
    (message: string, opts?: { pulsePrompt?: boolean }) => void
  >(() => undefined);

  const flashSuccessCue = useCallback(
    (message: string, opts?: { pulsePrompt?: boolean }) => {
      if (successCueClearRef.current) {
        clearTimeout(successCueClearRef.current);
        successCueClearRef.current = null;
      }
      setInfo(message);
      successCueClearRef.current = setTimeout(() => {
        setInfo((cur) => (cur === message ? null : cur));
        successCueClearRef.current = null;
      }, SUCCESS_CUE_MS);

      if (opts?.pulsePrompt) {
        if (promptPulseClearRef.current) {
          clearTimeout(promptPulseClearRef.current);
          promptPulseClearRef.current = null;
        }
        setPromptPulse(true);
        promptPulseClearRef.current = setTimeout(() => {
          setPromptPulse(false);
          promptPulseClearRef.current = null;
        }, 420);
      }
    },
    [],
  );
  flashSuccessCueRef.current = flashSuccessCue;

  return {
    info,
    setInfo,
    promptPulse,
    flashSuccessCue,
    flashSuccessCueRef,
    successCueClearRef,
    promptPulseClearRef,
  };
}
