/**
 * Trade-pending closed glance (PL195.1).
 * Quiet TopBar/T chip while an unanswered incoming trade invite/offer is
 * pending and Trade panel closed — complements receive cue PL18.1 + accept
 * rim PL143.1; no always-on trade column. Escrow / accept rules unchanged;
 * clears when none incoming or panel open; mute ok.
 */

/**
 * Soft closed-glance chip chrome (PL195.1).
 * Sage kinship with trade open accent + accept rim — not a permanent Trade column.
 */
export const TRADE_PENDING_CLOSED_GLANCE = {
  /** Hotkey letter (KEYBINDS KeyT). */
  hotkey: "T",
  /** Quiet chip word — not a Trade column. */
  word: "Trade",
  borderColor: "#78a890",
  textColor: "#a8d4bc",
  className: "topbar-trade-glance",
} as const;

/** Minimal trade row shape for glance gating (incoming unanswered offers). */
export interface TradePendingGlanceRow {
  direction: "incoming" | "outgoing" | string;
}

/**
 * Count unanswered incoming trade offers (PL195.1).
 * Outgoing waits on the other player — not a closed-glance arm.
 *
 * @param trades - Pending trade rows with direction.
 * @returns Number of incoming offers awaiting accept/reject.
 */
export function countPendingIncomingTrades(
  trades: ReadonlyArray<TradePendingGlanceRow>,
): number {
  let n = 0;
  for (const t of trades) {
    if (t.direction === "incoming") n += 1;
  }
  return n;
}

/**
 * Whether any unanswered incoming trade offer is pending (PL195.1).
 *
 * @param trades - Pending trade rows with direction.
 * @returns True when at least one incoming offer awaits a response.
 */
export function hasPendingIncomingTrade(
  trades: ReadonlyArray<TradePendingGlanceRow>,
): boolean {
  return countPendingIncomingTrades(trades) > 0;
}

/**
 * Whether the closed trade glance chip should render (PL195.1).
 * True only while an unanswered incoming offer is pending and Trade is closed.
 *
 * @param trades - Pending trade rows with direction.
 * @param tradePanelOpen - True when the Trade panel is the open contextual panel.
 * @returns True when the quiet TopBar/T chip should show.
 */
export function shouldShowTradePendingClosedGlance(
  trades: ReadonlyArray<TradePendingGlanceRow>,
  tradePanelOpen: boolean,
): boolean {
  if (tradePanelOpen) return false;
  return hasPendingIncomingTrade(trades);
}

/**
 * Compact chip label for pending closed glance (PL195.1).
 * `T · Trade` or `T · Trade · N` when more than one incoming offer.
 *
 * @param trades - Pending trade rows with direction.
 * @returns Chip text; empty string when nothing incoming (caller should gate).
 */
export function tradePendingClosedGlanceLabel(
  trades: ReadonlyArray<TradePendingGlanceRow>,
): string {
  const n = countPendingIncomingTrades(trades);
  if (n <= 0) return "";
  const { hotkey, word } = TRADE_PENDING_CLOSED_GLANCE;
  if (n > 1) return `${hotkey} · ${word} · ${n}`;
  return `${hotkey} · ${word}`;
}
