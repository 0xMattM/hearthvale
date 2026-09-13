"use client";

import { useState } from "react";
import {
  CREDITCOIN_TESTNET,
  REALM_TOKEN,
  formatRealmAmount,
  isEvmAddress,
  shortenWalletAddress,
  type CreditcoinSnapshotDto,
  type PlayerStateDto,
} from "@game/shared";
import {
  CreditcoinSection,
  openCreditcoinExplorer,
  type CreditcoinContractAddrs,
} from "@/components/hud/creditcoin-panel-ui";

interface CreditcoinWalletTabProps {
  state: PlayerStateDto;
  chain: CreditcoinSnapshotDto | null;
  busy: boolean;
  contractAddresses?: CreditcoinContractAddrs;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onSwapCoins: (coins: number) => void;
  onSendRealm: (to: string, amount: number) => void;
  onAddRealmToken?: () => void;
  onSwitchNetwork?: () => void;
}

/**
 * Wallet tab of the Creditcoin desk — connect, balances, coin burn, send REALM.
 *
 * @param props - Player snapshot plus wallet actions.
 * @returns Wallet tab body.
 */
export function CreditcoinWalletTab({
  state,
  chain,
  busy,
  contractAddresses,
  onConnectWallet,
  onDisconnectWallet,
  onSwapCoins,
  onSendRealm,
  onAddRealmToken,
  onSwitchNetwork,
}: CreditcoinWalletTabProps) {
  const [swapCoins, setSwapCoins] = useState<number>(REALM_TOKEN.minSwapCoins);
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState(1);
  const [copied, setCopied] = useState(false);

  const linked = Boolean(state.walletAddress);
  const realmLabel = formatRealmAmount(chain?.realmBalance ?? "0");
  const explorer = CREDITCOIN_TESTNET.blockExplorerUrls[0];
  const tctc = Number(chain?.tctcBalance ?? "0");
  const needsGas = Boolean(state.walletAddress) && tctc <= 0;

  return (
    <>
      <CreditcoinSection label="Wallet">
        {linked ? (
          <div className="creditcoin-panel__wallet">
            <div className="creditcoin-panel__wallet-addr">
              <button
                type="button"
                className="creditcoin-panel__wallet-link"
                title="View on Blockscout"
                onClick={() =>
                  openCreditcoinExplorer(
                    `${explorer}/address/${state.walletAddress}`,
                  )
                }
              >
                {shortenWalletAddress(state.walletAddress)} ↗
              </button>
              <button
                type="button"
                className="creditcoin-panel__btn-ghost"
                disabled={busy}
                onClick={onDisconnectWallet}
              >
                Disconnect
              </button>
            </div>
            <div className="creditcoin-panel__balances">
              <div className="creditcoin-panel__chip creditcoin-panel__chip--gas">
                <span className="creditcoin-panel__chip-label">
                  {chain?.nativeSymbol ?? "tCTC"}
                </span>
                <span className="creditcoin-panel__chip-value">
                  {tctc.toFixed(4)}
                </span>
                <span className="creditcoin-panel__chip-note">gas only</span>
              </div>
              <div className="creditcoin-panel__chip creditcoin-panel__chip--realm">
                <span className="creditcoin-panel__chip-label">
                  {REALM_TOKEN.symbol}
                </span>
                <span className="creditcoin-panel__chip-value">{realmLabel}</span>
                <span className="creditcoin-panel__chip-note">spendable</span>
              </div>
            </div>
            {needsGas ? (
              <p className="creditcoin-panel__warn">
                Need tCTC for gas —{" "}
                <button
                  type="button"
                  onClick={() =>
                    openCreditcoinExplorer(
                      "https://docs.creditcoin.org/wallets/using-testnet-faucet",
                    )
                  }
                >
                  Discord faucet
                </button>
              </p>
            ) : null}

            <div className="creditcoin-panel__mm-row">
              {onSwitchNetwork ? (
                <button
                  type="button"
                  className="creditcoin-panel__btn-ghost"
                  disabled={busy}
                  onClick={onSwitchNetwork}
                >
                  Use Creditcoin network
                </button>
              ) : null}
              {onAddRealmToken && contractAddresses?.realmToken ? (
                <button
                  type="button"
                  className="creditcoin-panel__btn-primary"
                  disabled={busy}
                  onClick={onAddRealmToken}
                >
                  Add REALM to MetaMask
                </button>
              ) : null}
            </div>
            <p className="creditcoin-panel__hint">
              If MetaMask says invalid chain id, click Use Creditcoin network
              ({CREDITCOIN_TESTNET.chainIdHex}). Delete any Custom 0x18e6f
              Creditcoin network first.
            </p>
            {contractAddresses?.realmToken ? (
              <p className="creditcoin-panel__token-addr">
                Token{" "}
                <button
                  type="button"
                  className="creditcoin-panel__link"
                  title="Copy contract address"
                  onClick={() => {
                    void navigator.clipboard.writeText(
                      contractAddresses.realmToken!,
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {shortenWalletAddress(contractAddresses.realmToken)}
                </button>
                {copied ? " · copied" : " · tap to copy"}
                <span className="creditcoin-panel__chip-note">
                  {" "}
                  · decimals 18 · chain {CREDITCOIN_TESTNET.chainId} (
                  {CREDITCOIN_TESTNET.chainIdHex})
                </span>
              </p>
            ) : null}

            <div className="creditcoin-panel__swap-card">
              <p className="creditcoin-panel__swap-title">
                Get REALM · burn game coins
              </p>
              <div className="creditcoin-panel__swap-flow">
                <strong>
                  {state.softCurrency} {state.softCurrencyName}
                </strong>
                <span className="creditcoin-panel__swap-arrow">→</span>
                <strong>
                  {Math.max(
                    0,
                    Math.floor(swapCoins / REALM_TOKEN.coinsPerRealm),
                  )}{" "}
                  {REALM_TOKEN.symbol}
                </strong>
                <span style={{ fontSize: "0.68rem" }}>
                  ({REALM_TOKEN.coinsPerRealm}c = 1)
                </span>
              </div>
              <div className="creditcoin-panel__row" style={{ marginBottom: 0 }}>
                <input
                  type="number"
                  min={REALM_TOKEN.minSwapCoins}
                  step={REALM_TOKEN.coinsPerRealm}
                  value={swapCoins}
                  disabled={busy}
                  onChange={(e) => setSwapCoins(Number(e.target.value))}
                  style={{ width: 88 }}
                  title="Coins to burn"
                />
                <button
                  type="button"
                  className="creditcoin-panel__btn-primary"
                  disabled={
                    busy ||
                    state.softCurrency < REALM_TOKEN.minSwapCoins ||
                    swapCoins < REALM_TOKEN.minSwapCoins ||
                    swapCoins % REALM_TOKEN.coinsPerRealm !== 0 ||
                    swapCoins > state.softCurrency
                  }
                  onClick={() => onSwapCoins(swapCoins)}
                >
                  Swap coins → REALM
                </button>
              </div>
              {state.softCurrency < REALM_TOKEN.minSwapCoins ? (
                <p className="creditcoin-panel__hint" style={{ margin: 0 }}>
                  Need {REALM_TOKEN.minSwapCoins} {state.softCurrencyName}{" "}
                  (you have {state.softCurrency}). Sell at the vendor or harvest
                  — tCTC cannot buy REALM.
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="creditcoin-panel__btn-primary"
              disabled={busy}
              onClick={onConnectWallet}
            >
              Connect MetaMask
            </button>
            <p className="creditcoin-panel__hint">
              Linking only signs a login message — MetaMask cannot move funds.
              Add Creditcoin Testnet later with Use Creditcoin network.
            </p>
          </>
        )}
      </CreditcoinSection>

      {linked ? (
        <CreditcoinSection
          label="Send REALM"
          hint="Transfer REALM to another wallet via MetaMask."
        >
          <div className="creditcoin-panel__row">
            <input
              type="text"
              placeholder="0x…"
              value={sendTo}
              disabled={busy}
              onChange={(e) => setSendTo(e.target.value)}
              style={{ flex: 1, minWidth: 140, fontSize: "0.78rem" }}
            />
            <input
              type="number"
              min={1}
              value={sendAmount}
              disabled={busy}
              onChange={(e) => setSendAmount(Number(e.target.value))}
              style={{ width: 64 }}
            />
            <button
              type="button"
              className="creditcoin-panel__btn-primary"
              disabled={busy || !isEvmAddress(sendTo) || sendAmount < 1}
              onClick={() => onSendRealm(sendTo, sendAmount)}
            >
              Send
            </button>
          </div>
        </CreditcoinSection>
      ) : null}
    </>
  );
}
