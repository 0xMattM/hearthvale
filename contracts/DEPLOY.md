# Creditcoin + Attestcoin deployment (BUIDL CTC 2026 Fall)

Realm contracts live in this folder. Gameplay stays off-chain; these contracts own **REALM**, **land NFTs**, and **token-market settlement**. Combat / energy are never gated.

## Networks

| Role | Network | Chain ID |
| --- | --- | --- |
| Game settlement (ASC, REALM, lands, marketplace) | Creditcoin Testnet | `102031` |
| Attestcoin source (coin-burn notary) | Ethereum Sepolia | `11155111` |

RPC (Creditcoin): `https://rpc.cc3-testnet.creditcoin.network`  
Explorer: `https://creditcoin-testnet.blockscout.com`  
Native symbol in wallets: `tCTC`  
Proof builder: `https://proof-gen-api.cc3-testnet.creditcoin.network/`  
Sepolia chain key on CC3 testnet: `1` (not the EVM chainId)

Faucet: Discord `#token-faucet` — `/faucet address:0xYourEvmAddress` (~100 tCTC/day). Docs: [Using Testnet Faucet](https://docs.creditcoin.org/wallets/using-testnet-faucet).

## npm deploy (preferred)

From the repo root, with Node (no Foundry required):

```bash
npm run chain:deploy
```

The script compiles `RealmToken`, `LandNFT`, and `ItemMarketplace` with `solc`, deploys them to Creditcoin Testnet (chain `102031`), and writes addresses plus the deployer key into `.env` (`CREDITCOIN_WORKER_KEY` is the REALM minter). Restart `npm run dev` afterwards.

If the deployer has 0 tCTC it prints the Discord faucet command and exits. Fund the address, then run `npm run chain:deploy` again.

Public addresses are also stored in `contracts/deployments/creditcoin-testnet.json` and `contracts/deployments/sepolia.json` (no private keys). Live Attestcoin path (2026-09-11): CoinBurnNotary on Sepolia, EvmV1Decoder + RealmMinterASC on Creditcoin Testnet. See `docs/10_blockchain/AttestcoinIntegration.md`.

Attestcoin (required for BUIDL CTC) is a second step. Fund the **same deployer address** with Sepolia ETH, then:

```bash
npm run chain:deploy:sepolia
npm run chain:deploy:asc
```

`chain:deploy:sepolia` deploys `CoinBurnNotary` on Ethereum Sepolia.  
`chain:deploy:asc` deploys `EvmV1Decoder` + `RealmMinterASC` on Creditcoin Testnet and grants the ASC the REALM minter role.

Set `GAME_CREDITCOIN_MODE=attestcoin` and restart `npm run dev`. Coin→REALM then goes Sepolia notary → proof builder → `RealmMinterASC.execute` (precompile `0x0FD2`). Keep `local_dev` only as an offline fallback.

Land buys and the item market go through MetaMask against the live Creditcoin contracts either way.

Sepolia ETH faucet (Google login): <https://cloud.google.com/application/web3/faucet/ethereum/sepolia>  
PoW alternative: <https://sepolia-faucet.pk910.de/>

## Remix (no local toolchain)

1. Deploy `CoinBurnNotary.sol` on **Sepolia**. Keep the deployer key as the game relayer.
2. Deploy `RealmToken.sol` on **Creditcoin Testnet**.
3. Deploy `LandNFT.sol` with the REALM address.
4. Deploy `ItemMarketplace.sol` with the REALM address.
5. Deploy `EvmV1Decoder` library from `@gluwa/usc-contracts` (or the official examples), then `RealmMinterASC.sol` with `(realmToken, sepoliaNotary)`.
6. On REALM, call `setMinter(ascAddress, true)`.
7. Put addresses in `.env` (see `docs/10_blockchain/AttestcoinIntegration.md`).

`RealmMinterASC` imports `EvmV1Decoder` from `@gluwa/usc-contracts`. In Remix, enable GitHub/`@gluwa/usc-contracts` or paste the library. Foundry remapping:

```
@gluwa/usc-contracts/=node_modules/@gluwa/usc-contracts/contracts/
```

## Foundry (optional)

```bash
npm install
npm run test:contracts
```

`forge test` covers REALM mint, land buy, marketplace rollback, notary owner/nonce, and ASC constructor (`test/*.t.sol`). Install Foundry (`foundryup`) if `forge` is missing.

```bash
npm install
# from repo root, after npm i -w @game/server (pulls @gluwa/usc-contracts if added)
forge create --broadcast --rpc-url $SEPOLIA_RPC_URL --private-key $SEPOLIA_RELAYER_KEY \
  contracts/CoinBurnNotary.sol:CoinBurnNotary
forge create --broadcast --rpc-url $CREDITCOIN_RPC_URL --private-key $CREDITCOIN_DEPLOY_KEY \
  contracts/RealmToken.sol:RealmToken
```

Then LandNFT, ItemMarketplace, decoder library, RealmMinterASC. Grant ASC the REALM minter role.

## Attestcoin flow

```
Player burns coins in-game
        ↓
Relayer calls CoinBurnNotary.notarize on Sepolia
        ↓
Attestors record Sepolia block on Creditcoin
        ↓
Worker fetches Merkle + continuity proofs (@gluwa/usc-sdk)
        ↓
RealmMinterASC.execute → precompile 0x0FD2 verify → mint REALM
        ↓
Player spends REALM on LandNFT / ItemMarketplace
```

Local play without faucet keys uses `GAME_CREDITCOIN_MODE=local_dev` and a SQLite REALM ledger. After `npm run chain:deploy`, keep `local_dev`: the worker mints REALM on Creditcoin with the deployer minter key, and the client buys lands / settles the item market from MetaMask. Switch to `attestcoin` once CoinBurnNotary (Sepolia) and RealmMinterASC are live.

