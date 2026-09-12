# Hearthvale — 3-minute demo (BUIDL CTC 2026 Fall)

Record this in one take. Judges score **Attestcoin depth**, not farm-loop length.

| Time | On screen | Say |
| --- | --- | --- |
| 0:00–0:15 | Title cover → register | Hearthvale is a persistent sandbox. You play with a local account — no wallet required. |
| 0:15–0:40 | City plaza, walk, talk to Farmer | Four maps, player-driven economy. Combat and energy never depend on chain. |
| 0:40–1:05 | Plant / harvest on Your Land (P editor) | Soft coins stay on the game server for a fast loop. |
| 1:05–1:35 | **B** → Connect MetaMask → Creditcoin Testnet 102031 | Ownership lives on Creditcoin. Link is a signature, not pay-to-win. |
| 1:35–2:10 | Swap coins → REALM | Coins burn in-game. Relayer posts `CoinBurnNotary` on **Sepolia**. Attestcoin proves that receipt. `RealmMinterASC` calls precompile `0x0FD2` and mints REALM. No centralized oracle. |
| 2:10–2:35 | Buy a land NFT with REALM | `LandNFT.mintLand` — forest / mountain / fertile. Production on-chain, combat still off-chain. |
| 2:35–2:50 | REALM stall (indigo) list or buy | `ItemMarketplace` settles REALM; the server only releases escrow after `ItemSold` for *this* wallet. |
| 2:50–3:00 | Attack a hare / show HUD | Wallet linked, same damage. Chain never gates combat. |

**Cut if short on time:** skip the hare; keep the Sepolia → ASC mint (that's the scoring criterion).

**Addresses:** [AttestcoinIntegration.md](AttestcoinIntegration.md).
