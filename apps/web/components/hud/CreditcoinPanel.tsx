"use client";

import { useState } from "react";
import {
  CREDITCOIN_TESTNET,
  LAND_NFT,
  LAND_NFT_BIOMES,
  LAND_NFT_SIZES,
  NFT_LAND_BONUS,
  REALM_TOKEN,
  formatRealmAmount,
  realmWeiToWhole,
  shortenWalletAddress,
  type CreditcoinSnapshotDto,
  type LandNftBiome,
  type LandNftSize,
  type PlayerStateDto,
} from "@game/shared";
import { CreditcoinWalletTab } from "@/components/hud/CreditcoinWalletTab";
import {
  CreditcoinSection,
  creditcoinStatusClass,
  openCreditcoinExplorer,
  type CreditcoinContractAddrs,
} from "@/components/hud/creditcoin-panel-ui";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  SEPOLIA_EXPLORER_URL,
  creditcoinSwapExplorerKind,
} from "@/lib/hud/creditcoin-swap-cue";
import {
  CREDITCOIN_DEFAULT_TAB,
  CREDITCOIN_TAB_LABELS,
  CREDITCOIN_TABS,
  type CreditcoinTab,
} from "@/lib/hud/creditcoin-tabs";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";

interface CreditcoinPanelProps {
  state: PlayerStateDto;
  busy: boolean;
  onClose: () => void;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onSwapCoins: (coins: number) => void;
  onMintLand: (biome: LandNftBiome, size: LandNftSize) => void;
  onSendRealm: (to: string, amount: number) => void;
  /** Travel to a playable NFT homestead (landId or token id). */
  onTravelLand?: (land: {
    tokenId: string;
    biome: string;
    size: string;
    landId?: string | null;
  }) => void;
  /** Add REALM ERC-20 to MetaMask (wallet_watchAsset). */
  onAddRealmToken?: () => void;
  /** Force switch / add Creditcoin Testnet in MetaMask. */
  onSwitchNetwork?: () => void;
  /** Public contract addresses (from /api/chain/creditcoin). */
  contractAddresses?: CreditcoinContractAddrs;
  openAccent?: boolean;
}

/**
 * Creditcoin desk (B) — tabbed wallet, NFT lands, swap history, contracts.
 * REALM item listings are the indigo stall, not this panel.
 *
 * @param props - Player snapshot plus wallet / land actions.
 * @returns Creditcoin desk.
 */
export function CreditcoinPanel({
  state,
  busy,
  onClose,
  onConnectWallet,
  onDisconnectWallet,
  onSwapCoins,
  onMintLand,
  onSendRealm,
  onTravelLand,
  onAddRealmToken,
  onSwitchNetwork,
  contractAddresses,
  openAccent = false,
}: CreditcoinPanelProps) {
  const chain: CreditcoinSnapshotDto | null = state.chain ?? null;
  const [tab, setTab] = useState<CreditcoinTab>(CREDITCOIN_DEFAULT_TAB);
  const [biome, setBiome] = useState<LandNftBiome>("forest");
  const [size, setSize] = useState<LandNftSize>("small");

  const linked = Boolean(state.walletAddress);
  const realmWhole = realmWeiToWhole(chain?.realmBalance ?? "0");
  const realmLabel = formatRealmAmount(chain?.realmBalance ?? "0");
  const landPrice = LAND_NFT.priceRealm[size];
  const canBuyLand = linked && realmWhole >= landPrice;
  const explorer = CREDITCOIN_TESTNET.blockExplorerUrls[0];
  const lands = chain?.lands ?? [];
  const hasNftBonus = lands.length > 0 && Boolean(chain?.contractsConfigured);
  const mode = chain?.attestcoin.mode ?? "local_dev";
  const swaps = chain?.swaps ?? [];

  return (
    <aside
      className={gameDeskClassName("creditcoin-panel", [
        openAccent ? "creditcoin-panel--open-accent" : "",
      ])}
      data-testid="creditcoin-panel"
      data-open-accent={openAccent ? "true" : "false"}
    >
      <SocialDeskHeader
        hotkey={GAME_DESK.creditcoin.hotkey}
        kicker={GAME_DESK.creditcoin.kicker}
        title={GAME_DESK.creditcoin.title}
        headerClassName="creditcoin-panel__header"
        onClose={onClose}
      />

      <p className="creditcoin-panel__lede">
        1. Connect MetaMask (login signature only). Switch to Creditcoin
        Testnet when you mint or send (tCTC = gas only). 2. Burn
        in-game {state.softCurrencyName} for REALM (10 coins = 1 REALM, minted
        to your wallet). 3. Buy a land NFT with REALM — never combat power.
        REALM listings are at the indigo stall.
      </p>
      <div className="creditcoin-panel__net">
        <span className="creditcoin-panel__net-dot" aria-hidden />
        {chain?.network ?? "Creditcoin Testnet"} · {mode}
      </div>

      <div className="creditcoin-panel__tabs" role="tablist" aria-label="Creditcoin">
        {CREDITCOIN_TABS.map((id) => {
          const selected = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`creditcoin-tab-${id}`}
              aria-selected={selected}
              aria-controls={`creditcoin-tab-panel-${id}`}
              data-testid={`creditcoin-tab-${id}`}
              className={`creditcoin-panel__tab${
                selected ? " creditcoin-panel__tab--active" : ""
              }`}
              onClick={() => setTab(id)}
            >
              {CREDITCOIN_TAB_LABELS[id]}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`creditcoin-tab-panel-${tab}`}
        aria-labelledby={`creditcoin-tab-${tab}`}
        className="creditcoin-panel__tab-body"
      >
        {tab === "wallet" ? (
          <CreditcoinWalletTab
            state={state}
            chain={chain}
            busy={busy}
            contractAddresses={contractAddresses}
            onConnectWallet={onConnectWallet}
            onDisconnectWallet={onDisconnectWallet}
            onSwapCoins={onSwapCoins}
            onSendRealm={onSendRealm}
            onAddRealmToken={onAddRealmToken}
            onSwitchNetwork={onSwitchNetwork}
          />
        ) : null}

        {tab === "lands" ? (
          <CreditcoinSection
            label="NFT lands"
            hint="Buy production land with REALM. Ownership only — never combat."
          >
            <div className="creditcoin-panel__row">
              <select
                value={biome}
                disabled={busy}
                onChange={(e) => setBiome(e.target.value as LandNftBiome)}
              >
                {LAND_NFT_BIOMES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <select
                value={size}
                disabled={busy}
                onChange={(e) => setSize(e.target.value as LandNftSize)}
              >
                {LAND_NFT_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s} · {LAND_NFT.priceRealm[s]} REALM
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="creditcoin-panel__btn-primary"
                disabled={busy || !canBuyLand}
                onClick={() => onMintLand(biome, size)}
              >
                Buy · {landPrice}
              </button>
            </div>
            {!linked ? (
              <p className="creditcoin-panel__hint">Connect MetaMask first.</p>
            ) : realmWhole < landPrice ? (
              <p className="creditcoin-panel__hint">
                Need {landPrice} REALM on Creditcoin (swap{" "}
                {landPrice * REALM_TOKEN.coinsPerRealm} coins). You have{" "}
                {realmLabel} REALM.
              </p>
            ) : null}
            {lands.length === 0 ? (
              <p className="creditcoin-panel__empty">No land NFTs yet.</p>
            ) : (
              <>
                <div className="creditcoin-panel__list">
                  {lands.map((land) => {
                    const landHref =
                      contractAddresses?.landNft && chain?.contractsConfigured
                        ? `${explorer}/token/${contractAddresses.landNft}/instance/${land.tokenId}`
                        : null;
                    return (
                      <div key={land.tokenId} className="creditcoin-panel__item">
                        <div>
                          #{land.tokenId.slice(0, 8)} · {land.biome} ·{" "}
                          {land.size}
                          <div className="creditcoin-panel__item-meta">
                            {landHref ? (
                              <button
                                type="button"
                                className="creditcoin-panel__link"
                                onClick={() =>
                                  openCreditcoinExplorer(landHref)
                                }
                              >
                                Explorer ↗
                              </button>
                            ) : null}
                            {onTravelLand ? (
                              <button
                                type="button"
                                className="creditcoin-panel__btn-primary"
                                disabled={busy || state.landId === land.landId}
                                onClick={() => onTravelLand(land)}
                              >
                                {state.landId === land.landId
                                  ? "You are here"
                                  : "Work this land"}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {hasNftBonus ? (
                  <p className="creditcoin-panel__bonus">{NFT_LAND_BONUS.label}</p>
                ) : null}
              </>
            )}
          </CreditcoinSection>
        ) : null}

        {tab === "history" ? (
          <CreditcoinSection
            label="Recent swaps"
            hint="Coin burns notarized on Sepolia, then minted on Creditcoin."
          >
            {swaps.length === 0 ? (
              <p className="creditcoin-panel__empty">No swaps yet.</p>
            ) : (
              <div className="creditcoin-panel__list">
                {swaps.slice(0, 12).map((swap) => {
                  const explorerKind = creditcoinSwapExplorerKind(swap);
                  return (
                    <div key={swap.id} className="creditcoin-panel__item">
                      <div>
                        {swap.coinsBurned}c →{" "}
                        {formatRealmAmount(swap.realmAmount)} REALM
                        <span className={creditcoinStatusClass(swap.status)}>
                          {swap.status}
                        </span>
                        <div className="creditcoin-panel__item-meta">
                          {explorerKind === "creditcoin" ? (
                            <button
                              type="button"
                              className="creditcoin-panel__link"
                              onClick={() =>
                                openCreditcoinExplorer(
                                  `${explorer}/tx/${swap.creditcoinTxHash}`,
                                )
                              }
                            >
                              View tx ↗
                            </button>
                          ) : explorerKind === "sepolia" ? (
                            <button
                              type="button"
                              className="creditcoin-panel__link"
                              onClick={() =>
                                openCreditcoinExplorer(
                                  `${SEPOLIA_EXPLORER_URL}/tx/${swap.sepoliaTxHash}`,
                                )
                              }
                            >
                              Attesting… Sepolia tx ↗
                            </button>
                          ) : (
                            "Queued"
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CreditcoinSection>
        ) : null}

        {tab === "contracts" ? (
          <CreditcoinSection
            label="Contracts"
            hint="Live Creditcoin Testnet addresses. Never combat power."
          >
            {chain?.contractsConfigured && contractAddresses ? (
              <div className="creditcoin-panel__contracts">
                {(
                  [
                    ["REALM Token", contractAddresses.realmToken],
                    ["Land NFT", contractAddresses.landNft],
                    ["Marketplace", contractAddresses.marketplace],
                  ] as const
                ).map(([name, addr]) =>
                  addr ? (
                    <div key={name}>
                      {name}{" "}
                      <button
                        type="button"
                        className="creditcoin-panel__link"
                        onClick={() =>
                          openCreditcoinExplorer(`${explorer}/address/${addr}`)
                        }
                      >
                        {shortenWalletAddress(addr)} ↗
                      </button>
                    </div>
                  ) : null,
                )}
              </div>
            ) : (
              <p className="creditcoin-panel__empty">
                Contracts not configured on this server.
              </p>
            )}
          </CreditcoinSection>
        ) : null}
      </div>
    </aside>
  );
}
