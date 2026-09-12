# Chain Never Gates Combat (F15.5)

**Document Version:** 1.0.0  
**Status:** Active  
**Owner:** Security / Game Design  
**Last Updated:** 2026-09-11

---

## Purpose

Security review and implementation contract: **blockchain-adjacent features must never gate energy or combat power.**

This includes optional wallet link, REALM / Attestcoin coin→token, land NFTs, off-chain land deeds, mint/list stubs, and the read-only on-chain marketplace mirror.

---

## Policy

| Allowed | Forbidden |
| --- | --- |
| Ownership proofs, cosmetics, production/land upside messaging | Extra damage, defense, max health |
| Optional wallet / REALM / NFT land UX | Requiring wallet or REALM to hunt, craft, farm, or spend energy |
| Soft-currency deed claim fees | Energy cap or regen bonuses from wallet/deed/mint/REALM |
| Read-only chain price mirrors | Pay-to-win or chain-gated combat access |

Players must enjoy the full soft loop with **no wallet and no deeds**.

---

## Code asserts

| Layer | Mechanism |
| --- | --- |
| Shared | `CHAIN_COMBAT_INVARIANT`, `assertCombatPowerIndependentOfChain`, `combatUnaffectedByChainOp` |
| Shared | `walletNeverGatesCombat`, `canPlayWithoutWallet` |
| Server | `guardCombatIndependentOfChain(userId)` — loads wallet/deeds as hints only; returns combat unchanged |
| Tests | Pre/post snapshots across connect → claim → mint → list → market read; wallet-less vs deeded combat equality |

Combat derivation (`normalizeCombatStats`, hunt damage, `spendEnergy`) must not accept wallet or deed parameters that scale power.

---

## Related

- [BlockchainPhilosophy.md](./BlockchainPhilosophy.md)
- [MarketplaceBlockchain.md](./MarketplaceBlockchain.md)
- Soft combat SoT: `docs/05_gameplay_systems/Combat.md`
