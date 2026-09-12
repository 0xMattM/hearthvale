/**
 * Optional wallet link stub (F15.1). Ownership only — never combat power.
 */

export const WALLET = {
  /** Prefix for mock/testnet stub addresses. */
  stubPrefix: "0xstub",
  /** Human-readable disclaimer. */
  disclaimer:
    "Optional. Link MetaMask (or any EIP-1193 wallet) to Creditcoin Testnet. Ownership / REALM / lands only — never combat power. Play works without a wallet.",
} as const;

/**
 * Builds a deterministic stub EVM-like address from a seed (user id).
 */
export function stubWalletAddress(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0");
  let out = "";
  for (let i = 0; i < 5; i++) {
    const n = Math.imul(h ^ (i * 2654435761), 1597334677) >>> 0;
    out += n.toString(16).padStart(8, "0");
  }
  return `${WALLET.stubPrefix}${hex}${out}`.slice(0, 42);
}

/**
 * Short display form for HUD (0xstub…abcd).
 */
export function shortenWalletAddress(address: string | null | undefined): string | null {
  if (!address || address.length < 10) return null;
  return `${address.slice(0, 8)}…${address.slice(-4)}`;
}

export interface CombatSnapshot {
  health: number;
  maxHealth: number;
  damage: number;
  defense: number;
  energy: number;
  maxEnergy: number;
}

/**
 * Asserts linking a wallet did not change combat/energy stats.
 */
export function walletNeverGatesCombat(
  before: CombatSnapshot,
  after: CombatSnapshot,
): boolean {
  return (
    before.health === after.health &&
    before.maxHealth === after.maxHealth &&
    before.damage === after.damage &&
    before.defense === after.defense &&
    before.energy === after.energy &&
    before.maxEnergy === after.maxEnergy
  );
}

/**
 * True when play is allowed without a linked wallet (always for F15.1).
 */
export function canPlayWithoutWallet(walletAddress: string | null | undefined): boolean {
  void walletAddress;
  return true;
}
