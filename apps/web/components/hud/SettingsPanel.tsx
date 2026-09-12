"use client";

import { KEYBINDS, LAND_DEED, WALLET, shortenWalletAddress, type KeybindEntry, type LandDeedDto } from "@game/shared";
import type { ClientSettings } from "@/lib/settings";
import { SocialDeskHeader } from "@/components/hud/SocialDeskHeader";
import {
  GAME_DESK,
  gameDeskClassName,
} from "@/lib/hud/social-desk-chrome";

interface SettingsPanelProps {
  settings: ClientSettings;
  onChange: (next: ClientSettings) => void;
  onClose: () => void;
  binds?: KeybindEntry[];
  walletAddress?: string | null;
  deeds?: LandDeedDto[];
  softCurrency?: number;
  busy?: boolean;
  /** PL38.2 — brief header/border accent when Settings opens (H). */
  openAccent?: boolean;
  /** PL125.2 — brief mute-row flash when enabling mute. */
  muteEnableConfirm?: boolean;
  /** PL130.1 — brief day-night-row flash when enabling cycle. */
  dayNightEnableConfirm?: boolean;
  /** PL130.2 — brief tips-row flash when enabling onboarding tips. */
  tipsEnableConfirm?: boolean;
  onConnectWallet?: () => void;
  onDisconnectWallet?: () => void;
  onClaimDeed?: () => void;
}

/**
 * Settings + keybind help (H) — prefs, wallet stub, land deed (F13.5 / F15).
 * PL38.2: brief open accent when opened from H; mute confirm (PL37.2) unchanged.
 * PL125.2: soft mute-row visual confirm when enabling mute (complements TopBar Muted).
 * PL130.1–PL130.2: soft day-night / tips row confirms when enabling those prefs.
 */
export function SettingsPanel({
  settings,
  onChange,
  onClose,
  binds = KEYBINDS,
  walletAddress = null,
  deeds = [],
  softCurrency = 0,
  busy = false,
  openAccent = false,
  muteEnableConfirm = false,
  dayNightEnableConfirm = false,
  tipsEnableConfirm = false,
  onConnectWallet,
  onDisconnectWallet,
  onClaimDeed,
}: SettingsPanelProps) {
  const copy = GAME_DESK.settings;
  const groups: Array<{ id: KeybindEntry["group"]; title: string }> = [
    { id: "move", title: "Movement" },
    { id: "panels", title: "Panels" },
    { id: "system", title: "System" },
  ];

  return (
    <aside
      className={gameDeskClassName("settings-panel", [
        openAccent ? "settings-panel--open-accent" : "",
      ])}
      data-testid="settings-panel"
      data-open-accent={openAccent ? "true" : "false"}
    >
      <SocialDeskHeader
        hotkey={copy.hotkey}
        kicker={copy.kicker}
        title={copy.title}
        headerClassName="settings-panel__header"
        onClose={onClose}
      />
      <p className="muted social-desk__lede">{copy.lede}</p>

      <label
        className={
          tipsEnableConfirm
            ? "settings-panel__pref-row settings-panel__pref-row--confirm"
            : "settings-panel__pref-row"
        }
        data-testid="settings-tips-row"
        data-tips-confirm={tipsEnableConfirm ? "true" : "false"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
          fontSize: "0.9rem",
        }}
      >
        <input
          type="checkbox"
          checked={settings.showTips}
          onChange={(e) =>
            onChange({ ...settings, showTips: e.target.checked })
          }
        />
        Show onboarding tips
        {tipsEnableConfirm ? (
          <span className="settings-panel__pref-chip" aria-hidden>
            Tips on
          </span>
        ) : null}
      </label>
      <label
        className={
          muteEnableConfirm
            ? "settings-panel__mute-row settings-panel__mute-row--confirm"
            : "settings-panel__mute-row"
        }
        data-testid="settings-mute-row"
        data-mute-confirm={muteEnableConfirm ? "true" : "false"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
          fontSize: "0.9rem",
        }}
      >
        <input
          type="checkbox"
          checked={settings.muteAudio}
          onChange={(e) =>
            onChange({ ...settings, muteAudio: e.target.checked })
          }
        />
        Mute audio (BGM + SFX)
        {muteEnableConfirm ? (
          <span className="settings-panel__mute-chip" aria-hidden>
            Muted
          </span>
        ) : null}
      </label>
      <label
        className={
          dayNightEnableConfirm
            ? "settings-panel__pref-row settings-panel__pref-row--confirm"
            : "settings-panel__pref-row"
        }
        data-testid="settings-day-night-row"
        data-day-night-confirm={dayNightEnableConfirm ? "true" : "false"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
          fontSize: "0.9rem",
        }}
      >
        <input
          type="checkbox"
          checked={settings.dayNightCycle}
          onChange={(e) =>
            onChange({ ...settings, dayNightCycle: e.target.checked })
          }
        />
        Day / night lighting (cosmetic)
        {dayNightEnableConfirm ? (
          <span className="settings-panel__pref-chip" aria-hidden>
            Day/night
          </span>
        ) : null}
      </label>

      <h4 style={{ margin: "0 0 6px", fontSize: "0.95rem" }}>Wallet (optional)</h4>
      <p className="muted" style={{ fontSize: "0.75rem", marginTop: 0 }}>
        {WALLET.disclaimer}
      </p>
      {walletAddress ? (
        <div style={{ marginBottom: 14, fontSize: "0.85rem" }}>
          <div style={{ marginBottom: 6 }}>
            Linked:{" "}
            <code style={{ fontSize: "0.75rem" }}>
              {shortenWalletAddress(walletAddress) ?? walletAddress}
            </code>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDisconnectWallet?.()}
          >
            Disconnect wallet
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: 14 }}>
          <button
            type="button"
            disabled={busy}
            onClick={() => onConnectWallet?.()}
          >
            Connect MetaMask
          </button>
        </div>
      )}

      <h4 style={{ margin: "0 0 6px", fontSize: "0.95rem" }}>Land deed (off-chain)</h4>
      <p className="muted" style={{ fontSize: "0.75rem", marginTop: 0 }}>
        {LAND_DEED.disclaimer}
      </p>
      {deeds.length > 0 ? (
        <ul style={{ margin: "0 0 14px", paddingLeft: 18, fontSize: "0.85rem" }}>
          {deeds.map((d) => (
            <li key={d.id}>
              {d.title} · {d.landKind}
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ marginBottom: 14 }}>
          <button type="button" disabled={busy} onClick={() => onClaimDeed?.()}>
            Claim {LAND_DEED.title} ({LAND_DEED.claimCostCoins}c · you have{" "}
            {softCurrency}c)
          </button>
        </div>
      )}

      <h4 style={{ margin: "0 0 8px", fontSize: "0.95rem" }}>Keybinds</h4>
      {groups.map((g) => {
        const rows = binds.filter((b) => b.group === g.id);
        if (rows.length === 0) return null;
        return (
          <div key={g.id} style={{ marginBottom: 12 }}>
            <div className="muted" style={{ fontSize: "0.75rem", marginBottom: 4 }}>
              {g.title}
            </div>
            <div style={{ display: "grid", gap: 4 }}>
              {rows.map((b) => (
                <div
                  key={b.code}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    fontSize: "0.85rem",
                    borderTop: "1px solid #3a4b36",
                    paddingTop: 4,
                  }}
                >
                  <kbd
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      background: "rgba(20,28,18,0.65)",
                      padding: "2px 6px",
                      borderRadius: 4,
                      minWidth: 42,
                      textAlign: "center",
                    }}
                  >
                    {b.key}
                  </kbd>
                  <span style={{ flex: 1, textAlign: "right" }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
