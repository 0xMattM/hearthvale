"use client";

import {
  useEffect,
  useRef,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import {
  resolvePanelHotkey,
  toggleHudPanel,
  type HudPanelId,
} from "./panel-orchestration";

export interface UsePanelHotkeysOptions {
  /** Truthy when visiting another land (VisitLandDto ref is fine). */
  visitingRef: MutableRefObject<unknown>;
  /** True on the player's own private land (P opens the layout editor). */
  playerLandRef?: MutableRefObject<boolean>;
  /** Current panel — kept in sync so open accents can detect transitions. */
  panelRef: MutableRefObject<HudPanelId>;
  setPanel: Dispatch<SetStateAction<HudPanelId>>;
  setMarketBoardId: (id: string | null) => void;
  setRealmMarketId?: (id: string | null) => void;
  /** Escape while visiting: leave guest land. */
  onLeaveVisit: () => void;
  /** Escape on home/active map: close panel + clear craft. */
  onClosePanel: () => void;
  onInteract: () => void;
  /**
   * Fired when a hotkey opens a panel (not when closing / toggling off).
   * PL9.2 uses this for inventory open accent.
   */
  onPanelOpened?: (panel: Exclude<HudPanelId, null>) => void;
}

/**
 * Wires window keydown to panel toggle / escape / interact (CL6.2).
 * Listener is mounted once; callbacks are read from a ref so interact is not
 * delayed by GameApp re-renders rebinding keydown.
 *
 * @param options - Visit ref + panel setters + interact callback.
 */
export function usePanelHotkeys(options: UsePanelHotkeysOptions): void {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const {
        visitingRef,
        playerLandRef,
        panelRef,
        setPanel,
        setMarketBoardId,
        setRealmMarketId,
        onLeaveVisit,
        onClosePanel,
        onInteract,
        onPanelOpened,
      } = optionsRef.current;
      const result = resolvePanelHotkey(e, {
        visiting: Boolean(visitingRef.current),
        onPlayerLand: playerLandRef?.current,
      });
      if (result.preventDefault) e.preventDefault();
      if (result.action === "none") return;

      if (result.action === "toggle") {
        if (result.clearMarketBoard) setMarketBoardId(null);
        if (result.clearRealmMarket) setRealmMarketId?.(null);
        const current = panelRef.current;
        const next = toggleHudPanel(current, result.panel);
        panelRef.current = next;
        setPanel(next);
        if (next === result.panel && onPanelOpened) {
          onPanelOpened(result.panel);
        }
        return;
      }
      if (result.action === "escape") {
        if (visitingRef.current) {
          onLeaveVisit();
          return;
        }
        onClosePanel();
        return;
      }
      if (result.action === "interact") {
        void onInteract();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
