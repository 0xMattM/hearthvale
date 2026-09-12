/**
 * Soft-war deliver soft glance leftover (PL199.2).
 * Quiet TopBar E · Deliver chip while wood deliver is ready during an open
 * soft-war contest and claim interact is not focused (no claim panel) —
 * complements contest atmosphere PL183.2 + deliver rim PL146.2.
 * Scoring / window SoT unchanged; min HUD; mute ok.
 */

import {
  CLAIM_WAR,
  CLAIM_NODE_CONTEST_SOFT_CUE,
  claimNodeContestSoftCueActive,
  type BuildingDto,
  type InventoryStackDto,
} from "@game/shared";

/**
 * Soft closed-glance chip chrome (PL199.2).
 * Warm ember kinship with contest beacon — not a permanent claim column.
 */
export const SOFT_WAR_DELIVER_CLOSED_GLANCE = {
  /** Interact key at the claim beacon (no dedicated claim panel hotkey). */
  hotkey: "E",
  /** Quiet chip word — not a claim / war column. */
  word: "Deliver",
  borderColor: CLAIM_NODE_CONTEST_SOFT_CUE.emissive,
  textColor: "#d89868",
  className: "topbar-soft-war-deliver-glance",
} as const;

/**
 * Counts deliver mats (wood) held for soft-war scoring (PL199.2).
 *
 * @param inventory - Player inventory stacks.
 * @returns Total qty of `CLAIM_WAR.deliverItemId`.
 */
export function softWarDeliverWoodQty(
  inventory: ReadonlyArray<Pick<InventoryStackDto, "itemId" | "qty">>,
): number {
  const id = CLAIM_WAR.deliverItemId;
  let n = 0;
  for (const stack of inventory) {
    if (stack.itemId === id && Number.isFinite(stack.qty) && stack.qty > 0) {
      n += stack.qty;
    }
  }
  return n;
}

/**
 * Whether any claim node on the active land has an open soft-war contest (PL199.2).
 *
 * @param buildings - Active land buildings (claim_node carries contestEndsAt).
 * @param nowMs - Wall clock ms (e.g. `Date.now()`).
 * @returns True when at least one contest window is still open.
 */
export function hasOpenSoftWarContest(
  buildings: ReadonlyArray<
    Pick<BuildingDto, "type"> & {
      claim?: { contestEndsAt?: number | null } | null;
    }
  >,
  nowMs: number,
): boolean {
  for (const b of buildings) {
    if (b.type !== "claim_node") continue;
    if (claimNodeContestSoftCueActive(b.claim?.contestEndsAt, nowMs)) {
      return true;
    }
  }
  return false;
}

/**
 * Whether soft-war wood deliver is ready (PL199.2).
 * Contest open + in a guild + holding deliver mats — scoring SoT unchanged.
 *
 * @param buildings - Active land buildings.
 * @param inventory - Player inventory stacks.
 * @param inGuild - True when the player is in a guild.
 * @param nowMs - Wall clock ms.
 * @returns True when deliver can score if the player reaches the beacon.
 */
export function isSoftWarDeliverReady(
  buildings: ReadonlyArray<
    Pick<BuildingDto, "type"> & {
      claim?: { contestEndsAt?: number | null } | null;
    }
  >,
  inventory: ReadonlyArray<Pick<InventoryStackDto, "itemId" | "qty">>,
  inGuild: boolean,
  nowMs: number,
): boolean {
  if (!inGuild) return false;
  if (!hasOpenSoftWarContest(buildings, nowMs)) return false;
  return softWarDeliverWoodQty(inventory) > 0;
}

/**
 * Whether the closed soft-war deliver glance chip should render (PL199.2).
 * True while deliver is ready and claim interact is not focused (beacon prompt
 * already covers deliver — TopBar chip is the away-from-beacon leftover).
 *
 * @param buildings - Active land buildings.
 * @param inventory - Player inventory stacks.
 * @param inGuild - True when the player is in a guild.
 * @param claimInteractFocused - True when interact target is claim_node.
 * @param nowMs - Wall clock ms.
 * @returns True when the quiet TopBar chip should show.
 */
export function shouldShowSoftWarDeliverClosedGlance(
  buildings: ReadonlyArray<
    Pick<BuildingDto, "type"> & {
      claim?: { contestEndsAt?: number | null } | null;
    }
  >,
  inventory: ReadonlyArray<Pick<InventoryStackDto, "itemId" | "qty">>,
  inGuild: boolean,
  claimInteractFocused: boolean,
  nowMs: number,
): boolean {
  if (claimInteractFocused) return false;
  return isSoftWarDeliverReady(buildings, inventory, inGuild, nowMs);
}

/**
 * Compact chip label for soft-war deliver closed glance (PL199.2).
 * `E · Deliver` when ready; empty when not (caller should gate).
 *
 * @param ready - From `isSoftWarDeliverReady` (or equivalent).
 * @returns Chip text; empty string when not ready.
 */
export function softWarDeliverClosedGlanceLabel(ready: boolean): string {
  if (!ready) return "";
  const { hotkey, word } = SOFT_WAR_DELIVER_CLOSED_GLANCE;
  return `${hotkey} · ${word}`;
}
