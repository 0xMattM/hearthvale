# Attestcoin Protocol Integration (BUIDL CTC 2026 Fall)

**Status:** Live on Creditcoin Testnet + Ethereum Sepolia  
**Track:** Gaming  
**Last Updated:** September 11, 2026

---

## Why Attestcoin is core

Realm is a player-driven sandbox. Soft **coins** stay in the game server (fast loop). **REALM** and **land NFTs** live on Creditcoin Testnet. The Attestcoin Protocol is the trustless join between those two worlds:

```
In-game coins burned
        ↓
Sepolia CoinBurnNotary.notarize (source-chain event)
        ↓
Creditcoin attestors + proof builder (Merkle + continuity)
        ↓
RealmMinterASC.execute → precompile 0x0FD2 verify
        ↓
REALM minted to the player's Creditcoin wallet
        ↓
Spend REALM on LandNFT / ItemMarketplace
```

No centralized oracle operator decides that a coin burn is valid. The ASC checks inclusion of the Sepolia receipt on Creditcoin, then mints.

Combat, energy, and profession XP are **never** gated by wallet, REALM, or land NFTs (`docs/10_blockchain/ChainNeverGatesCombat.md`).

---

## Contracts

| Contract | Chain | Role |
| --- | --- | --- |
| `CoinBurnNotary.sol` | Ethereum Sepolia | Source event `CoinBurnedForRealm` |
| `RealmMinterASC.sol` | Creditcoin Testnet | Attestcoin Smart Contract |
| `RealmToken.sol` | Creditcoin Testnet | ERC-20 REALM (ASC is minter) |
| `LandNFT.sol` | Creditcoin Testnet | ERC-721 lands bought with REALM |
| `ItemMarketplace.sol` | Creditcoin Testnet | List/buy escrowed items for REALM |

Sources: `contracts/`. Deploy notes: `contracts/DEPLOY.md`.

SDK worker: `apps/server/src/game/creditcoin/worker.ts` (`@gluwa/usc-sdk` ProofBuilder + PrecompileBlockProver).

### Live testnet addresses (2026-09-11)

| Contract | Chain | Address |
| --- | --- | --- |
| CoinBurnNotary | Ethereum Sepolia (`11155111`) | [`0x8ebd21b2934dBF67F7a09A6feB61bB05a31Ed36A`](https://sepolia.etherscan.io/address/0x8ebd21b2934dBF67F7a09A6feB61bB05a31Ed36A) |
| RealmToken | Creditcoin Testnet (`102031`) | [`0x8ebd21b2934dBF67F7a09A6feB61bB05a31Ed36A`](https://creditcoin-testnet.blockscout.com/address/0x8ebd21b2934dBF67F7a09A6feB61bB05a31Ed36A) |
| LandNFT | Creditcoin Testnet | [`0x843Da5c71F3703ea2Ec4220B2Ca4b5F948ba6769`](https://creditcoin-testnet.blockscout.com/address/0x843Da5c71F3703ea2Ec4220B2Ca4b5F948ba6769) |
| ItemMarketplace | Creditcoin Testnet | [`0x3c536377f9dAF9F8a0FA1BAcb020C174e65466c7`](https://creditcoin-testnet.blockscout.com/address/0x3c536377f9dAF9F8a0FA1BAcb020C174e65466c7) |
| EvmV1Decoder | Creditcoin Testnet | [`0x688F65363F22058E0cb89c90bA3EA5566cFF9e50`](https://creditcoin-testnet.blockscout.com/address/0x688F65363F22058E0cb89c90bA3EA5566cFF9e50) |
| RealmMinterASC | Creditcoin Testnet | [`0x7DA68C1C7775256b96D992167A057941BB964602`](https://creditcoin-testnet.blockscout.com/address/0x7DA68C1C7775256b96D992167A057941BB964602) |

JSON copies: `contracts/deployments/sepolia.json` and `contracts/deployments/creditcoin-testnet.json`. CoinBurnNotary (Sepolia) and RealmToken (Creditcoin) share the same hex because both were the deployer's first contract on that chain (`CREATE` nonce 0). They are different contracts on different networks; `RealmMinterASC` stores both and uses each on its own chain.

---

## Player flow in the game

1. Press **B** (or Settings → Wallet).
2. **Connect MetaMask** — wallet adds Creditcoin Testnet (`102031`, `tCTC`, Blockscout).
3. Sign the link message. The account stores the address (ownership only).
4. Swap coins → REALM (10 coins = 1 REALM). The server posts `CoinBurnNotary.notarize` on Sepolia; Attestcoin proofs drive `RealmMinterASC.execute` on Creditcoin; REALM arrives in the linked wallet. Land buys confirm in MetaMask.
5. Buy NFT lands with REALM.
6. List stackable inventory on the REALM item market; other players buy with REALM.

The HUD shows REALM next to coins when a wallet is linked.

---

## Environment

```
GAME_CREDITCOIN_MODE=attestcoin
CREDITCOIN_RPC_URL=https://rpc.cc3-testnet.creditcoin.network
CREDITCOIN_PROOF_BUILDER_URL=https://proof-gen-api.cc3-testnet.creditcoin.network/
CREDITCOIN_REALM_TOKEN=
CREDITCOIN_LAND_NFT=
CREDITCOIN_MARKETPLACE=
CREDITCOIN_ASC=
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
SEPOLIA_NOTARY=
SEPOLIA_RELAYER_KEY=
CREDITCOIN_DEPLOY_KEY=
CREDITCOIN_WORKER_KEY=
```

Deploy order: `npm run chain:deploy` (REALM / lands / market) → faucet Sepolia ETH to the deployer → `npm run chain:deploy:sepolia` → `npm run chain:deploy:asc`. Details: `contracts/DEPLOY.md`.

`local_dev` is the offline fallback (SQLite REALM ledger, or direct minter key if Creditcoin contracts are already live). For the hackathon submission keep `GAME_CREDITCOIN_MODE=attestcoin` so coin burns go through Sepolia `CoinBurnNotary` + `RealmMinterASC` / precompile `0x0FD2`.

---

## Scoring notes

- Working integration: Solidity ASC + Sepolia notary + USC SDK worker + in-game wallet/txs. Live testnet addresses above.
- Depth: coin burns are the attested cross-chain message; REALM is Creditcoin business logic; lands + marketplace are the gaming economy.
- Never pay-to-win: chain does not change damage, defense, health, or energy.
- Settlement: server only releases escrowed items after `ItemSold` for the linked wallet + matching `gameListingId`. Land confirm uses `ownerOf`.
- Contract tests: `forge test` (`test/RealmEconomy.t.sol`, `test/RealmMinterASC.t.sol`).
- Demo script: [DemoScript.md](DemoScript.md) (3 minutes, Attestcoin in the middle).
