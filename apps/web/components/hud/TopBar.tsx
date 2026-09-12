"use client";

import type { PlayerStateDto } from "@game/shared";
import {
  ENERGY,
  ITEMS,
  formatEnergyFullEta,
  formatRealmAmount,
  isEnergyLow,
  isHealthLow,
  isToolDurabilityLow,
  visitHomeReturnWorldTip,
  visitLandFirstWalkUpWorldTip,
} from "@game/shared";
import {
  ENERGY_LOW_BAR_GRADIENT,
  ENERGY_METER_IDLE_GLANCE,
  ENERGY_OK_BAR_GRADIENT,
  HEALTH_METER_IDLE_GLANCE,
  HEALTH_OK_BAR_GRADIENT,
  MAP_CHIP_IDLE_GLANCE,
  formatCurrentMapChip,
  formatQuietHudExtras,
  shouldShowEnergyMeterIdleGlance,
  shouldShowHealthMeterIdleGlance,
  shouldShowMapChipIdleGlance,
} from "@/lib/hud/topbar-chrome";
import { MAIL_PENDING_CLOSED_GLANCE } from "@/lib/hud/mail-pending-closed-glance";
import { QUEST_PENDING_CLOSED_GLANCE } from "@/lib/hud/quest-pending-closed-glance";
import { GUILD_INVITE_CLOSED_GLANCE } from "@/lib/hud/guild-invite-closed-glance";
import { TRADE_PENDING_CLOSED_GLANCE } from "@/lib/hud/trade-pending-closed-glance";
import { ACHIEVEMENTS_PENDING_CLOSED_GLANCE } from "@/lib/hud/achievements-pending-closed-glance";
import { CHAT_PENDING_CLOSED_GLANCE } from "@/lib/hud/chat-pending-closed-glance";
import { NOTICE_UNREAD_CLOSED_GLANCE } from "@/lib/hud/notice-unread-closed-glance";
import { INVENTORY_PICKUP_IDLE_GLANCE } from "@/lib/hud/inventory-pickup-idle-glance";
import { SOFT_WAR_DELIVER_CLOSED_GLANCE } from "@/lib/hud/soft-war-deliver-closed-glance";
import { isCoreSuccessCueText } from "@/lib/hud/success-cue";
import { HudGlanceChip, HudHotkeyStrip, HudMeter } from "@/components/hud/HudChrome";

interface TopBarProps {
  state: PlayerStateDto;
  error: string | null;
  info: string | null;
  visitingUsername: string | null;
  /** PL53.1 — brief soft trade tip under visiting banner (first visit once). */
  visitFirstWalkUpTip?: boolean;
  /** PL114.2 — brief soft tip when returning home from a visit. */
  visitHomeReturnTip?: boolean;
  nearbyCount?: number;
  /** Cosmetic sky phase label (F14.5). */
  dayPhaseLabel?: string | null;
  /** Brief pulse after free travel arrive (PL40.2) or visit-home return (PL114.2). */
  mapChipArrivePulse?: boolean;
  /**
   * PL185.2 — quiet idle map-chip breath while walking (no panel open).
   * False while any contextual panel is open.
   */
  panelOpen?: boolean;
  mailPendingGlanceLabel?: string | null;
  questPendingGlanceLabel?: string | null;
  guildInviteGlanceLabel?: string | null;
  tradePendingGlanceLabel?: string | null;
  achievementsPendingGlanceLabel?: string | null;
  chatPendingGlanceLabel?: string | null;
  noticeUnreadGlanceLabel?: string | null;
  inventoryPickupGlanceLabel?: string | null;
  softWarDeliverGlanceLabel?: string | null;
  onGoHome: () => void;
  onLogout: () => void;
}

/**
 * Absolute-minimum always-on HUD — identity, map, vitals meters, quiet glances.
 * Full key list is Settings (H); walking strip is keys only.
 */
export function TopBar({
  state,
  error,
  info,
  visitingUsername,
  visitFirstWalkUpTip = false,
  visitHomeReturnTip = false,
  nearbyCount = 0,
  dayPhaseLabel = null,
  mapChipArrivePulse = false,
  panelOpen = false,
  mailPendingGlanceLabel = null,
  questPendingGlanceLabel = null,
  guildInviteGlanceLabel = null,
  tradePendingGlanceLabel = null,
  achievementsPendingGlanceLabel = null,
  chatPendingGlanceLabel = null,
  noticeUnreadGlanceLabel = null,
  inventoryPickupGlanceLabel = null,
  softWarDeliverGlanceLabel = null,
  onGoHome,
  onLogout,
}: TopBarProps) {
  const energyLow = isEnergyLow(state.energy, state.maxEnergy);
  const healthLow = isHealthLow(state.health, state.maxHealth);
  const tool = state.inventory.find((i) => i.id === state.equippedToolInventoryId);
  const toolDef = tool ? ITEMS[tool.itemId as keyof typeof ITEMS] : null;
  const toolName = toolDef?.name ?? (tool ? "Tool" : null);
  const toolLow = isToolDurabilityLow(tool?.durability, toolDef?.maxDurability);
  const energyEta = formatEnergyFullEta(
    state.energy,
    state.maxEnergy,
    ENERGY.regenAmount,
    ENERGY.regenIntervalMs,
  );
  const quietExtras = formatQuietHudExtras(nearbyCount, dayPhaseLabel);
  const mapChip = formatCurrentMapChip(state.landKind);
  const mapChipIdleGlance =
    !mapChipArrivePulse && shouldShowMapChipIdleGlance(panelOpen);
  const mapChipClassName = mapChipArrivePulse
    ? "topbar-map-chip topbar-map-chip--arrive-pulse"
    : mapChipIdleGlance
      ? `topbar-map-chip ${MAP_CHIP_IDLE_GLANCE.className}`
      : "topbar-map-chip";
  const energyMeterIdleGlance = shouldShowEnergyMeterIdleGlance(
    panelOpen,
    energyLow,
  );
  const energyMeterClassName = energyLow
    ? "topbar-energy-meter topbar-energy-meter--low"
    : energyMeterIdleGlance
      ? `topbar-energy-meter ${ENERGY_METER_IDLE_GLANCE.className}`
      : "topbar-energy-meter";
  const healthMeterIdleGlance = shouldShowHealthMeterIdleGlance(
    panelOpen,
    healthLow,
  );
  const healthMeterClassName = healthMeterIdleGlance
    ? HEALTH_METER_IDLE_GLANCE.className
    : undefined;
  const energyTitle = [
    `Energy ${state.energy}/${state.maxEnergy}`,
    energyLow ? "low" : null,
    energyEta ? `full in ${energyEta}` : "full",
  ]
    .filter(Boolean)
    .join(" · ");
  const healthTitle = `HP ${state.health}/${state.maxHealth}${healthLow ? " · low" : ""}`;

  return (
    <div className="hud-top">
      <div
        className="hud-vitals"
        data-energy-low={energyLow ? "true" : "false"}
        data-health-low={healthLow ? "true" : "false"}
        data-testid="topbar-identity"
      >
        <div className="hud-vitals__who">
          <strong>{state.username}</strong>
          <span className="hud-vitals__lv">Lv {state.characterLevel}</span>
          <span
            className="hud-vitals__coins"
            title={`${state.softCurrencyName} ${state.softCurrency}`}
          >
            <span className="hud-coin" aria-hidden />
            {state.softCurrency}
          </span>
          {state.chain?.walletAddress ? (
            <span
              className="topbar-realm-chip"
              data-testid="topbar-realm-chip"
              title="REALM balance (Creditcoin)"
            >
              {formatRealmAmount(state.chain.realmBalance)}
            </span>
          ) : null}
          <span
            className={mapChipClassName}
            data-testid="topbar-map-chip"
            data-map-kind={mapChip.word.toLowerCase()}
            data-arrive-pulse={mapChipArrivePulse ? "true" : "false"}
            data-idle-glance={mapChipIdleGlance ? "true" : "false"}
            style={{
              borderColor: `color-mix(in srgb, ${mapChip.accent} 55%, #3a4b36)`,
              color: mapChip.accent,
              ...(mapChipIdleGlance
                ? {
                    ["--map-chip-idle-period" as string]: `${MAP_CHIP_IDLE_GLANCE.periodMs}ms`,
                  }
                : null),
            }}
            title={mapChip.word}
          >
            <span className="topbar-map-chip__glyph" aria-hidden>
              {mapChip.glyph}
            </span>
            {mapChip.word}
          </span>
          {mailPendingGlanceLabel ? (
            <HudGlanceChip
              label={mailPendingGlanceLabel}
              className={MAIL_PENDING_CLOSED_GLANCE.className}
              testId="topbar-mail-glance"
              title="Mail (L)"
              dataAttr="data-mail-pending-glance"
              color={MAIL_PENDING_CLOSED_GLANCE.textColor}
            />
          ) : null}
          {questPendingGlanceLabel ? (
            <HudGlanceChip
              label={questPendingGlanceLabel}
              className={QUEST_PENDING_CLOSED_GLANCE.className}
              testId="topbar-quest-glance"
              title="Quest (Q)"
              dataAttr="data-quest-pending-glance"
              color={QUEST_PENDING_CLOSED_GLANCE.textColor}
            />
          ) : null}
          {guildInviteGlanceLabel ? (
            <HudGlanceChip
              label={guildInviteGlanceLabel}
              className={GUILD_INVITE_CLOSED_GLANCE.className}
              testId="topbar-guild-invite-glance"
              title="Guild invite (G)"
              dataAttr="data-guild-invite-glance"
              color={GUILD_INVITE_CLOSED_GLANCE.textColor}
            />
          ) : null}
          {tradePendingGlanceLabel ? (
            <HudGlanceChip
              label={tradePendingGlanceLabel}
              className={TRADE_PENDING_CLOSED_GLANCE.className}
              testId="topbar-trade-glance"
              title="Trade (T)"
              dataAttr="data-trade-pending-glance"
              color={TRADE_PENDING_CLOSED_GLANCE.textColor}
            />
          ) : null}
          {achievementsPendingGlanceLabel ? (
            <HudGlanceChip
              label={achievementsPendingGlanceLabel}
              className={ACHIEVEMENTS_PENDING_CLOSED_GLANCE.className}
              testId="topbar-achievements-glance"
              title="Achievements (J)"
              dataAttr="data-achievements-pending-glance"
              color={ACHIEVEMENTS_PENDING_CLOSED_GLANCE.textColor}
            />
          ) : null}
          {chatPendingGlanceLabel ? (
            <HudGlanceChip
              label={chatPendingGlanceLabel}
              className={CHAT_PENDING_CLOSED_GLANCE.className}
              testId="topbar-chat-glance"
              title="Chat (C)"
              dataAttr="data-chat-pending-glance"
              color={CHAT_PENDING_CLOSED_GLANCE.textColor}
            />
          ) : null}
          {noticeUnreadGlanceLabel ? (
            <HudGlanceChip
              label={noticeUnreadGlanceLabel}
              className={NOTICE_UNREAD_CLOSED_GLANCE.className}
              testId="topbar-notice-glance"
              title="Notice board"
              dataAttr="data-notice-unread-glance"
              color={NOTICE_UNREAD_CLOSED_GLANCE.textColor}
            />
          ) : null}
          {inventoryPickupGlanceLabel ? (
            <HudGlanceChip
              label={inventoryPickupGlanceLabel}
              className={INVENTORY_PICKUP_IDLE_GLANCE.className}
              testId="topbar-inventory-pickup-glance"
              title="Inventory (I)"
              dataAttr="data-inventory-pickup-glance"
              color={INVENTORY_PICKUP_IDLE_GLANCE.textColor}
              extraStyle={{
                ["--inventory-pickup-idle-period" as string]: `${INVENTORY_PICKUP_IDLE_GLANCE.periodMs}ms`,
              }}
              idleGlance
            />
          ) : null}
          {softWarDeliverGlanceLabel ? (
            <HudGlanceChip
              label={softWarDeliverGlanceLabel}
              className={SOFT_WAR_DELIVER_CLOSED_GLANCE.className}
              testId="topbar-soft-war-deliver-glance"
              title="Deliver wood at claim beacon (E)"
              dataAttr="data-soft-war-deliver-glance"
              color={SOFT_WAR_DELIVER_CLOSED_GLANCE.textColor}
            />
          ) : null}
        </div>
        {visitingUsername ? (
          <div className="hud-vitals__visit">
            Visiting {visitingUsername}
            {visitFirstWalkUpTip ? (
              <span data-testid="visit-land-walkup-tip">
                {visitLandFirstWalkUpWorldTip()}
              </span>
            ) : null}
          </div>
        ) : visitHomeReturnTip ? (
          <div className="hud-vitals__visit" data-testid="visit-home-return-tip">
            {visitHomeReturnWorldTip()}
          </div>
        ) : null}
        <div className="hud-meters">
          <HudMeter
            kind="health"
            current={state.health}
            max={state.maxHealth}
            fill={healthLow ? ENERGY_LOW_BAR_GRADIENT : HEALTH_OK_BAR_GRADIENT}
            title={healthTitle}
            low={healthLow}
            idleGlance={healthMeterIdleGlance}
            className={healthMeterClassName}
            labelTestId="topbar-health-label"
            style={
              healthMeterIdleGlance
                ? {
                    ["--health-meter-idle-period" as string]: `${HEALTH_METER_IDLE_GLANCE.periodMs}ms`,
                  }
                : undefined
            }
          />
          <HudMeter
            kind="energy"
            current={state.energy}
            max={state.maxEnergy}
            fill={energyLow ? ENERGY_LOW_BAR_GRADIENT : ENERGY_OK_BAR_GRADIENT}
            title={energyTitle}
            low={energyLow}
            idleGlance={energyMeterIdleGlance}
            className={energyMeterClassName}
            testId="topbar-energy-meter"
            labelTestId="topbar-energy-label"
            style={
              energyMeterIdleGlance
                ? {
                    ["--energy-meter-idle-period" as string]: `${ENERGY_METER_IDLE_GLANCE.periodMs}ms`,
                  }
                : undefined
            }
          />
          {toolName && tool?.durability != null && toolDef?.maxDurability ? (
            <HudMeter
              kind="tool"
              current={tool.durability}
              max={toolDef.maxDurability}
              fill={
                toolLow ? ENERGY_LOW_BAR_GRADIENT : "linear-gradient(90deg,#8aa070,#c4a35a)"
              }
              title={`${toolName} ${tool.durability}/${toolDef.maxDurability}${toolLow ? " · low" : ""}`}
              low={toolLow}
              labelTestId="topbar-equipped-tool"
            />
          ) : null}
        </div>
        {quietExtras ? (
          <div className="hud-vitals__quiet" data-testid="topbar-quiet-extras">
            {quietExtras}
          </div>
        ) : null}
        {error ? <div className="hud-vitals__error">{error}</div> : null}
        {info ? (
          <div
            className={
              isCoreSuccessCueText(info) ? "hud-success-cue" : "hud-vitals__info"
            }
            data-testid={
              isCoreSuccessCueText(info) ? "hud-success-cue" : undefined
            }
          >
            {info}
          </div>
        ) : null}
      </div>
      <div className="hud-top__actions">
        <HudHotkeyStrip />
        {visitingUsername ? (
          <button type="button" onClick={onGoHome}>
            Go home
          </button>
        ) : null}
        <button type="button" className="hud-ghost-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
