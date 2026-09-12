/**
 * F15.5 — Chain / wallet / deed features must never gate energy or combat power.
 * Ownership and cosmetics only. See docs/10_blockchain/ChainNeverGatesCombat.md.
 */

import {
  type CombatSnapshot,
  walletNeverGatesCombat,
} from "./wallet.js";

export const CHAIN_COMBAT_INVARIANT = {
  id: "F15.5",
  policy:
    "Wallet link, REALM, Attestcoin swaps, land NFTs, land deeds, mint/list stubs, and on-chain marketplace mirrors must never gate play, energy regen/spend, or combat attributes (health, damage, defense).",
  /** Field names that must not scale combat or energy. */
  forbiddenGates: [
    "walletAddress",
    "mintTxStub",
    "listPriceCoins",
    "chainPriceWei",
    "deedId",
    "listedDeedCount",
    "realmBalance",
    "landNftCount",
  ] as const,
  disclaimer:
    "Security invariant: blockchain is ownership / cosmetics / production upside only — never combat power.",
} as const;

export type ChainCombatHints = {
  walletAddress?: string | null;
  deedCount?: number;
  listedDeedCount?: number;
  mintTxStub?: string | null;
  listPriceCoins?: number | null;
  chainPriceWei?: string | null;
  realmBalance?: string | null;
  landNftCount?: number;
};

/**
 * Returns combat unchanged. Chain hints are accepted only to prove they are ignored.
 * Reason: any future author who multiplies damage by deedCount must fail this API contract.
 */
export function assertCombatPowerIndependentOfChain(input: {
  combat: CombatSnapshot;
  chainHints?: ChainCombatHints;
}): CombatSnapshot {
  void input.chainHints;
  return { ...input.combat };
}

/**
 * True when two combat snapshots match (pre/post chain operation).
 */
export function combatUnaffectedByChainOp(
  before: CombatSnapshot,
  after: CombatSnapshot,
): boolean {
  return walletNeverGatesCombat(before, after);
}

/**
 * Play, hunt, and energy spend are always allowed without wallet or deeds.
 */
export function canEngageCombatWithoutChain(hints?: ChainCombatHints): boolean {
  void hints;
  return true;
}
