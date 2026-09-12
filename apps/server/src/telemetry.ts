/**
 * MVP telemetry stubs — in-memory counters + stdout JSON lines.
 * Replace with a real pipeline later; do not invent gameplay from these.
 */

import { getAllRegionalVendorPrices, getVendorPrices, VENDOR } from "@game/shared";

export type TelemetryEvent =
  | "plant"
  | "harvest"
  | "craft"
  | "craft_collect"
  | "trade_offer"
  | "trade_accept"
  | "trade_reject"
  | "vendor_buy"
  | "vendor_sell"
  | "land_expand"
  | "land_build"
  | "land_place_kit"
  | "land_pickup"
  | "land_visit"
  | "market_list"
  | "market_buy"
  | "market_cancel"
  | "eat_bread"
  | "gather_ore"
  | "claim_node"
  | "repair_tool"
  | "hunt"
  | "chat"
  | "guild_chat"
  | "guild_create"
  | "guild_join"
  | "guild_leave"
  | "guild_invite_regen"
  | "guild_invite_offer"
  | "guild_rank"
  | "guild_bank_deposit"
  | "guild_bank_withdraw"
  | "travel"
  | "building_upgrade"
  | "decor_place"
  | "quest_claim"
  | "tutorial_npc_claim"
  | "mail_send"
  | "mail_claim"
  | "mail_cancel"
  | "wallet_connect_stub"
  | "wallet_disconnect_stub"
  | "wallet_link_creditcoin"
  | "creditcoin_coin_swap"
  | "creditcoin_token_list"
  | "creditcoin_token_buy"
  | "creditcoin_token_cancel"
  | "creditcoin_land_mint"
  | "combat_start"
  | "combat_act"
  | "deed_claim"
  | "deed_mint_stub"
  | "deed_list_stub"
  | "deed_unlist_stub";

const startedAt = Date.now();
const counts: Record<string, number> = {};

/**
 * Records one gameplay event for local playtest counters.
 */
export function track(
  event: TelemetryEvent,
  props: Record<string, unknown> = {},
): void {
  counts[event] = (counts[event] ?? 0) + 1;
  // Reason: plain stdout so `npm run dev` shows session activity without a warehouse.
  console.log(
    JSON.stringify({
      type: "telemetry",
      event,
      count: counts[event],
      ...props,
      t: Date.now(),
    }),
  );
}

/**
 * Snapshot of counters since process start.
 */
export function getTelemetryCounts(): Record<string, number> {
  return { ...counts };
}

/**
 * Playtest snapshot: counters, uptime, regional vendor prices, trade volume.
 */
export function getTelemetrySnapshot() {
  const tradeVolume =
    (counts.trade_accept ?? 0) + (counts.trade_offer ?? 0);
  const byRegion = getAllRegionalVendorPrices();
  return {
    counts: getTelemetryCounts(),
    startedAt,
    uptimeMs: Date.now() - startedAt,
    tradeVolume,
    /** Homestead baseline (compat). Prefer vendorPricesByRegion. */
    vendorPrices: {
      buy: { ...VENDOR.buy },
      sell: { ...VENDOR.sell },
    },
    vendorPricesByRegion: byRegion,
    /** Compat aliases — prefer vendorPricesByRegion.player_land / .explore. */
    homesteadVendor: getVendorPrices("player_land"),
    forestVendor: getVendorPrices("explore"),
  };
}

/**
 * HTTP body for `GET /telemetry`. Anonymous callers must not see counters.
 *
 * @param authenticated - True when the Bearer session is valid.
 */
export function telemetryHttpPayload(
  authenticated: false,
): { ok: true };
export function telemetryHttpPayload(
  authenticated: true,
): { ok: true } & ReturnType<typeof getTelemetrySnapshot>;
export function telemetryHttpPayload(authenticated: boolean) {
  if (!authenticated) return { ok: true as const };
  return { ok: true as const, ...getTelemetrySnapshot() };
}

/**
 * Test helper — clears counters.
 */
export function resetTelemetryCounts(): void {
  for (const key of Object.keys(counts)) delete counts[key];
}
