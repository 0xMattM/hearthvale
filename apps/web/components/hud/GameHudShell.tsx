"use client";

import type { ReactNode } from "react";
import type { PlayerStateDto } from "@game/shared";
import { InteractPrompt } from "@/components/hud/InteractPrompt";
import { TickingInteractPrompt, type TickingInteractPromptProps } from "@/components/hud/TickingInteractPrompt";
import { OnboardingTips } from "@/components/hud/OnboardingTips";
import { TopBar } from "@/components/hud/TopBar";
import {
  COINS_GAIN_WORLD_REINFORCE,
  coinsGainWorldReinforceBackground,
} from "@/lib/hud/coins-gain-feedback";
import {
  CROP_PLANT_SUCCESS_WORLD_REINFORCE,
  cropPlantSuccessWorldReinforceBackground,
} from "@/lib/hud/crop-plant-feedback";
import {
  CROP_READY_WORLD_REINFORCE,
  cropReadyWorldReinforceBackground,
} from "@/lib/hud/crop-ready-feedback";
import {
  CROP_HARVEST_WORLD_REINFORCE,
  cropHarvestWorldReinforceBackground,
} from "@/lib/hud/crop-harvest-feedback";
import {
  ENERGY_LOW_WORLD_VIGNETTE,
  EAT_SUCCESS_WORLD_REINFORCE,
  HEALTH_LOW_WORLD_VIGNETTE,
  eatSuccessWorldReinforceBackground,
  energyLowWorldVignetteBackground,
  healthLowWorldVignetteBackground,
  shouldShowEnergyLowWorldVignette,
  shouldShowHealthLowWorldVignette,
} from "@/lib/hud/energy-food-feedback";
import {
  LEVEL_UP_WORLD_REINFORCE,
  levelUpWorldReinforceBackground,
} from "@/lib/hud/level-up-feedback";
import {
  ACHIEVEMENT_UNLOCK_WORLD_REINFORCE,
  achievementUnlockWorldReinforceBackground,
} from "@/lib/hud/achievement-unlock-feedback";
import {
  TITLE_CHANGE_WORLD_REINFORCE,
  titleChangeWorldReinforceBackground,
} from "@/lib/hud/title-change-feedback";
import {
  MARKET_LIST_WORLD_REINFORCE,
  marketListWorldReinforceBackground,
} from "@/lib/hud/market-list-feedback";
import {
  QUEST_CLAIM_WORLD_REINFORCE,
  questClaimWorldReinforceBackground,
} from "@/lib/hud/quest-claim-feedback";
import {
  VISIT_HOME_RETURN_WORLD_REINFORCE,
  visitHomeReturnWorldReinforceBackground,
} from "@/lib/hud/visit-home-return-feedback";
import {
  VISIT_ARRIVE_WORLD_REINFORCE,
  visitArriveWorldReinforceBackground,
} from "@/lib/hud/visit-arrive-feedback";
import {
  NEARBY_PEER_WORLD_REINFORCE,
  nearbyPeerWorldReinforceBackground,
} from "@/lib/hud/nearby-peer-feedback";
import {
  CHAT_SEND_WORLD_REINFORCE,
  chatSendWorldReinforceBackground,
} from "@/lib/hud/chat-send-feedback";
import {
  TRADE_ACCEPT_WORLD_REINFORCE,
  tradeAcceptWorldReinforceBackground,
} from "@/lib/hud/trade-accept-feedback";
import {
  GUILD_BANK_DEPOSIT_WORLD_REINFORCE,
  guildBankDepositWorldReinforceBackground,
} from "@/lib/hud/guild-bank-deposit-feedback";
import {
  GUILD_BANK_WITHDRAW_WORLD_REINFORCE,
  guildBankWithdrawWorldReinforceBackground,
} from "@/lib/hud/guild-bank-withdraw-feedback";
import {
  INVITE_ACCEPT_WORLD_REINFORCE,
  inviteAcceptWorldReinforceBackground,
} from "@/lib/hud/invite-accept-feedback";
import {
  MAIL_SEND_WORLD_REINFORCE,
  mailSendWorldReinforceBackground,
} from "@/lib/hud/mail-send-feedback";
import {
  DECOR_PLACE_WORLD_REINFORCE,
  decorPlaceWorldReinforceBackground,
} from "@/lib/hud/decor-place-feedback";
import {
  TOOL_REPAIR_WORLD_REINFORCE,
  toolRepairWorldReinforceBackground,
} from "@/lib/hud/tool-repair-feedback";
import {
  TOOL_EQUIP_WORLD_REINFORCE,
  toolEquipWorldReinforceBackground,
} from "@/lib/hud/tool-equip-feedback";
import {
  TOOL_UNEQUIP_WORLD_REINFORCE,
  toolUnequipWorldReinforceBackground,
} from "@/lib/hud/tool-unequip-feedback";
import {
  MAIL_CLAIM_WORLD_REINFORCE,
  mailClaimWorldReinforceBackground,
} from "@/lib/hud/mail-claim-feedback";
import {
  VENDOR_BUY_WORLD_REINFORCE,
  vendorBuyWorldReinforceBackground,
} from "@/lib/hud/vendor-buy-feedback";
import {
  MARKET_BUY_WORLD_REINFORCE,
  marketBuyWorldReinforceBackground,
} from "@/lib/hud/market-buy-feedback";
import {
  VENDOR_SELL_WORLD_REINFORCE,
  vendorSellWorldReinforceBackground,
} from "@/lib/hud/vendor-sell-feedback";
import {
  MARKET_CANCEL_WORLD_REINFORCE,
  marketCancelWorldReinforceBackground,
} from "@/lib/hud/market-cancel-feedback";
import {
  TRADE_CANCEL_WORLD_REINFORCE,
  tradeCancelWorldReinforceBackground,
} from "@/lib/hud/trade-cancel-feedback";
import {
  MAIL_CANCEL_WORLD_REINFORCE,
  mailCancelWorldReinforceBackground,
} from "@/lib/hud/mail-cancel-feedback";
import {
  GUILD_CREATE_WORLD_REINFORCE,
  guildCreateWorldReinforceBackground,
} from "@/lib/hud/guild-create-feedback";
import {
  GUILD_LEAVE_WORLD_REINFORCE,
  guildLeaveWorldReinforceBackground,
} from "@/lib/hud/guild-leave-feedback";
import {
  HUNT_WIN_WORLD_REINFORCE,
  huntWinWorldReinforceBackground,
} from "@/lib/hud/hunt-win-feedback";
import {
  HUNT_LOSE_WORLD_REINFORCE,
  huntLoseWorldReinforceBackground,
} from "@/lib/hud/hunt-lose-feedback";
import {
  CRAFT_COMPLETE_WORLD_REINFORCE,
  craftCompleteWorldReinforceBackground,
} from "@/lib/hud/craft-complete-feedback";
import {
  SOFT_REFUSE_BUSY_WORLD_REINFORCE,
  softRefuseBusyWorldReinforceBackground,
} from "@/lib/hud/soft-refuse-busy-world-reinforce-feedback";
import {
  MUTE_WORLD_REINFORCE,
  muteWorldReinforceBackground,
} from "@/lib/hud/mute-world-reinforce-feedback";
import {
  GATHER_SUCCESS_WORLD_REINFORCE,
  gatherSuccessWorldReinforceBackground,
} from "@/lib/hud/gather-success-feedback";
import {
  FISH_CATCH_WORLD_REINFORCE,
  fishCatchWorldReinforceBackground,
} from "@/lib/hud/fish-catch-feedback";
import {
  STATION_UPGRADE_WORLD_REINFORCE,
  stationUpgradeWorldReinforceBackground,
} from "@/lib/hud/station-upgrade-feedback";
import {
  EXPAND_FIELD_WORLD_REINFORCE,
  expandFieldWorldReinforceBackground,
} from "@/lib/hud/expand-field-feedback";
import {
  DAY_PHASE_WORLD_REINFORCE,
  dayPhaseWorldReinforceBackground,
} from "@/lib/hud/day-phase-feedback";
import {
  TRAVEL_ARRIVE_WORLD_REINFORCE,
  travelArriveWorldReinforceBackground,
} from "@/lib/hud/travel-arrive-feedback";
import {
  DAY_NIGHT_ENABLE_WORLD_REINFORCE,
  dayNightEnableWorldReinforceBackground,
} from "@/lib/hud/day-night-enable-feedback";
import {
  SCARCE_FREE_SETTLE_WORLD_REINFORCE,
  scarceFreeSettleWorldReinforceBackground,
} from "@/lib/hud/scarce-free-settle-feedback";
import {
  SCARCE_BUSY_WORLD_REINFORCE,
  scarceBusyWorldReinforceBackground,
} from "@/lib/hud/scarce-busy-world-reinforce-feedback";
import {
  DEED_CLAIM_WORLD_REINFORCE,
  deedClaimWorldReinforceBackground,
} from "@/lib/hud/deed-claim-feedback";
import {
  DEED_MINT_WORLD_REINFORCE,
  deedMintWorldReinforceBackground,
} from "@/lib/hud/deed-mint-feedback";
import {
  WALLET_LINK_WORLD_REINFORCE,
  walletLinkWorldReinforceBackground,
} from "@/lib/hud/wallet-link-feedback";
import {
  WALLET_DISCONNECT_WORLD_REINFORCE,
  walletDisconnectWorldReinforceBackground,
} from "@/lib/hud/wallet-disconnect-feedback";
import {
  ARENA_ENTER_WORLD_REINFORCE,
  arenaEnterWorldReinforceBackground,
} from "@/lib/hud/arena-enter-feedback";
import {
  ARENA_LEAVE_WORLD_REINFORCE,
  arenaLeaveWorldReinforceBackground,
} from "@/lib/hud/arena-leave-feedback";
import {
  SOFT_WAR_DELIVER_WORLD_REINFORCE,
  softWarDeliverWorldReinforceBackground,
} from "@/lib/hud/soft-war-deliver-feedback";
import {
  TOOL_LOW_WORLD_VIGNETTE,
  shouldShowToolLowWorldVignette,
  toolLowWorldVignetteBackground,
} from "@/lib/hud/tool-low-feedback";
import type { OnboardingTipId } from "@/lib/onboarding";
import { nextOnboardingTip } from "@/lib/onboarding";

type Tip = ReturnType<typeof nextOnboardingTip>;

export interface GameHudShellProps {
  state: PlayerStateDto;
  error: string | null;
  info: string | null;
  visitingUsername: string | null;
  /** PL53.1 — brief soft trade tip under visiting banner (first visit once). */
  visitFirstWalkUpTip?: boolean;
  /** PL114.2 — brief soft tip when returning home from a visit. */
  visitHomeReturnTip?: boolean;
  nearbyCount: number;
  dayPhaseLabel: string;
  onGoHome: () => void;
  onLogout: () => void;
  promptLabel: string | null;
  promptShowKey: boolean;
  /**
   * When set, the walk-up prompt ticks remaining-time copy locally
   * so GameApp does not re-render the 3D scene every 500ms.
   */
  livePrompt?: Omit<TickingInteractPromptProps, "successPulse" | "panelOpen">;
  /** Brief PL6.2 pulse on the walk-up prompt after plant/harvest. */
  promptSuccessPulse?: boolean;
  /** Brief PL40.2 pulse on the TopBar map chip after free travel arrive. */
  mapChipArrivePulse?: boolean;
  /**
   * PL133.1 — quiet L · Mail chip while inbox pending and Mail closed.
   * Null/empty when cleared.
   */
  mailPendingGlanceLabel?: string | null;
  /**
   * PL189.1 — quiet Q · Quest chip while claimable reward pending and Quest closed.
   * Null/empty when cleared.
   */
  questPendingGlanceLabel?: string | null;
  /**
   * PL189.2 — quiet G · Invite chip while unanswered guild invite pending and Guild closed.
   * Null/empty when cleared.
   */
  guildInviteGlanceLabel?: string | null;
  /**
   * PL195.1 — quiet T · Trade chip while incoming offer pending and Trade closed.
   * Null/empty when cleared.
   */
  tradePendingGlanceLabel?: string | null;
  /**
   * PL195.2 — quiet A · Unlock chip while new unlock pending and Achievements closed.
   * Null/empty when cleared.
   */
  achievementsPendingGlanceLabel?: string | null;
  /**
   * PL197.1 — quiet C · Chat chip while unread chat/guild lines pending and Chat closed.
   * Null/empty when cleared.
   */
  chatPendingGlanceLabel?: string | null;
  /**
   * PL197.2 — quiet Notice chip while unread tip ids pending and Notice closed.
   * Null/empty when cleared.
   */
  noticeUnreadGlanceLabel?: string | null;
  /**
   * PL198.2 — quiet I · Bag chip after recent pickup while Inventory closed.
   * Null/empty when cleared.
   */
  inventoryPickupGlanceLabel?: string | null;
  /**
   * PL199.2 — quiet E · Deliver chip while soft-war wood deliver is ready and
   * claim interact not focused. Null/empty when cleared.
   */
  softWarDeliverGlanceLabel?: string | null;
  /** PL124.2 — brief soft world rim flash after successful eat. */
  eatSuccessWorldReinforce?: boolean;
  /** PL126.2 — brief soft gold rim when soft currency rises (vendor/market/quest). */
  coinsGainWorldReinforce?: boolean;
  /** PL127.2 — brief soft sprout rim after successful crop plant. */
  cropPlantSuccessWorldReinforce?: boolean;
  /** PL142.2 — brief soft harvest rim when a crop plot flips to ready. */
  cropReadyWorldReinforce?: boolean;
  /** PL151.2 — brief soft wheat-gold rim after crop harvest ok. */
  cropHarvestWorldReinforce?: boolean;
  /** PL135.2 — brief soft progress rim when character level rises. */
  levelUpWorldReinforce?: boolean;
  /** PL136.1 — brief soft unlock rim when an achievement unlocks. */
  achievementUnlockWorldReinforce?: boolean;
  /** PL136.2 — brief soft title rim when cosmetic title changes. */
  titleChangeWorldReinforce?: boolean;
  /** PL138.1 — brief soft market rim when a listing posts successfully. */
  marketListWorldReinforce?: boolean;
  /** PL138.2 — brief soft quest rim when a quest claim succeeds. */
  questClaimWorldReinforce?: boolean;
  /** PL139.1 — brief soft meadow rim when returning home from a visit. */
  visitHomeReturnWorldReinforce?: boolean;
  /** PL184.1 — brief soft guest-teal rim after visit arrive ok. */
  visitArriveWorldReinforce?: boolean;
  /** PL184.2 — brief soft sage rim when a peer first enters interact range. */
  nearbyPeerWorldReinforce?: boolean;
  /** PL139.2 — brief quiet social rim after chat send ok. */
  chatSendWorldReinforce?: boolean;
  /** PL143.1 — brief soft handshake rim when a trade accept succeeds. */
  tradeAcceptWorldReinforce?: boolean;
  /** PL143.2 — brief quiet membership rim after guild bank deposit ok. */
  guildBankDepositWorldReinforce?: boolean;
  /** PL148.1 — brief quiet steel-slate rim after guild bank withdraw ok. */
  guildBankWithdrawWorldReinforce?: boolean;
  /** PL148.2 — brief soft welcome rim after guild invite accept ok. */
  inviteAcceptWorldReinforce?: boolean;
  /** PL149.1 — brief soft parchment rim after mail send ok. */
  mailSendWorldReinforce?: boolean;
  /** PL149.2 — brief soft rosewood rim after decor place ok. */
  decorPlaceWorldReinforce?: boolean;
  /** PL150.1 — brief soft forge-pewter rim after tool repair ok. */
  toolRepairWorldReinforce?: boolean;
  /** PL152.1 — brief soft ready-grip steel rim after tool equip ok. */
  toolEquipWorldReinforce?: boolean;
  /** PL154.2 — brief soft release-grip mist rim after tool unequip ok. */
  toolUnequipWorldReinforce?: boolean;
  /** PL152.2 — brief soft sage-parchment rim after mail claim ok. */
  mailClaimWorldReinforce?: boolean;
  /** PL153.1 — brief soft stall honey-copper rim after vendor buy ok. */
  vendorBuyWorldReinforce?: boolean;
  /** PL155.2 — brief soft parchment-gold rim after market buy ok. */
  marketBuyWorldReinforce?: boolean;
  /** PL156.1 — brief soft stall amber-copper rim after vendor sell ok. */
  vendorSellWorldReinforce?: boolean;
  /** PL156.2 — brief soft dusty board-ash rim after market cancel ok. */
  marketCancelWorldReinforce?: boolean;
  /** PL157.1 — brief soft release mist rim after outgoing trade cancel ok. */
  tradeCancelWorldReinforce?: boolean;
  /** PL157.2 — brief soft dusty parchment-ash rim after mail cancel ok. */
  mailCancelWorldReinforce?: boolean;
  /** PL158.1 — brief soft warm founding crest rim after guild create ok. */
  guildCreateWorldReinforce?: boolean;
  /** PL158.2 — brief soft cool membership-release rim after guild leave ok. */
  guildLeaveWorldReinforce?: boolean;
  /** PL159.1 — brief soft warm trail-gold rim after hunt win ok. */
  huntWinWorldReinforce?: boolean;
  /** PL179.1 — brief soft cool trail-ash rim after hunt lose ok. */
  huntLoseWorldReinforce?: boolean;
  /** PL159.2 — brief soft sprout-olive rim after craft ok. */
  craftCompleteWorldReinforce?: boolean;
  /** PL179.2 — brief soft dusty rose rim when scarce busy interact soft-refuses. */
  softRefuseBusyWorldReinforce?: boolean;
  /** PL180.1 — brief soft hush graphite rim when mute toggles on/off. */
  muteWorldReinforce?: boolean;
  /** PL161.1 — brief soft mint-lime rim after gather ok (stump/ore/pen). */
  gatherSuccessWorldReinforce?: boolean;
  /** PL161.2 — brief soft cool water rim after fish catch ok. */
  fishCatchWorldReinforce?: boolean;
  /** PL162.1 — brief soft warm copper rim after station upgrade ok. */
  stationUpgradeWorldReinforce?: boolean;
  /** PL162.2 — brief soft field-gold rim after land expand ok. */
  expandFieldWorldReinforce?: boolean;
  /** PL160.2 — brief soft twilight-sky rim when day phase flips. */
  dayPhaseWorldReinforce?: boolean;
  /** PL164.1 — brief soft Free cyan rim after map travel Arrived. */
  travelArriveWorldReinforce?: boolean;
  /** PL164.2 — brief soft dawn-slate rim when day/night is enabled. */
  dayNightEnableWorldReinforce?: boolean;
  /** PL165.2 — brief soft Free cyan rim when scarce station settles busy→Free. */
  scarceFreeSettleWorldReinforce?: boolean;
  /** PL166.1 — brief soft Busy coral rim when scarce station edges free→busy. */
  scarceBusyWorldReinforce?: boolean;
  /** PL166.2 — brief soft system-slate rim after cosmetic deed claim ok. */
  deedClaimWorldReinforce?: boolean;
  /** PL167.1 — brief soft mint-slate rim after mock deed mint ok. */
  deedMintWorldReinforce?: boolean;
  /** PL167.2 — brief soft link-slate rim after wallet link ok. */
  walletLinkWorldReinforce?: boolean;
  /** PL168.1 — brief soft disconnect ash-slate rim after wallet disconnect ok. */
  walletDisconnectWorldReinforce?: boolean;
  /** PL145.2 — brief soft warm rim when arriving on Arena map. */
  arenaEnterWorldReinforce?: boolean;
  /** PL147.1 — brief soft dusty rim when leaving the Arena map. */
  arenaLeaveWorldReinforce?: boolean;
  /** PL146.2 — brief soft ember rim when soft-war wood deliver scores. */
  softWarDeliverWorldReinforce?: boolean;
  /** Null while visiting — tips are home-map only. */
  onboardingTip: Tip;
  onDismissTip: (id: OnboardingTipId) => void;
  /**
   * When true, soft-dim the world and clear prompt/tips stacking so the
   * single contextual panel is the readable job (PL2.3).
   */
  panelOpen?: boolean;
  /** Contextual panels (closed by default); never always-on columns. */
  children?: ReactNode;
}

/**
 * Minimal walking chrome + slot for one contextual panel (CL6.1 / CL6.2 / PL2.3 / PL124.1 / PL126.1 / PL126.2 / PL127.2 / PL132.2 / PL135.2 / PL136.1 / PL136.2 / PL138.1 / PL138.2 / PL139.1 / PL139.2 / PL142.2 / PL143.1 / PL143.2 / PL145.2 / PL146.2 / PL147.1 / PL148.1 / PL148.2 / PL149.1 / PL149.2 / PL150.1 / PL151.2 / PL152.1 / PL152.2 / PL153.1 / PL155.2 / PL156.1 / PL156.2 / PL157.1 / PL157.2 / PL158.1 / PL158.2 / PL159.1 / PL159.2 / PL160.2 / PL161.1 / PL161.2 / PL162.1 / PL162.2 / PL164.1 / PL164.2 / PL165.2 / PL166.1 / PL166.2 / PL167.1 / PL167.2 / PL168.1 / PL179.1 / PL179.2 / PL180.1).
 *
 * @param props - Status chrome, prompt, tips, and panel children.
 * @returns Overlay HUD above the 3D scene.
 */
export function GameHudShell({
  state,
  error,
  info,
  visitingUsername,
  visitFirstWalkUpTip = false,
  visitHomeReturnTip = false,
  nearbyCount,
  dayPhaseLabel,
  onGoHome,
  onLogout,
  promptLabel,
  promptShowKey,
  livePrompt,
  promptSuccessPulse = false,
  mapChipArrivePulse = false,
  mailPendingGlanceLabel = null,
  questPendingGlanceLabel = null,
  guildInviteGlanceLabel = null,
  tradePendingGlanceLabel = null,
  achievementsPendingGlanceLabel = null,
  chatPendingGlanceLabel = null,
  noticeUnreadGlanceLabel = null,
  inventoryPickupGlanceLabel = null,
  softWarDeliverGlanceLabel = null,
  eatSuccessWorldReinforce = false,
  coinsGainWorldReinforce = false,
  cropPlantSuccessWorldReinforce = false,
  cropReadyWorldReinforce = false,
  cropHarvestWorldReinforce = false,
  levelUpWorldReinforce = false,
  achievementUnlockWorldReinforce = false,
  titleChangeWorldReinforce = false,
  marketListWorldReinforce = false,
  questClaimWorldReinforce = false,
  visitHomeReturnWorldReinforce = false,
  visitArriveWorldReinforce = false,
  nearbyPeerWorldReinforce = false,
  chatSendWorldReinforce = false,
  tradeAcceptWorldReinforce = false,
  guildBankDepositWorldReinforce = false,
  guildBankWithdrawWorldReinforce = false,
  inviteAcceptWorldReinforce = false,
  mailSendWorldReinforce = false,
  decorPlaceWorldReinforce = false,
  toolRepairWorldReinforce = false,
  toolEquipWorldReinforce = false,
  toolUnequipWorldReinforce = false,
  mailClaimWorldReinforce = false,
  vendorBuyWorldReinforce = false,
  marketBuyWorldReinforce = false,
  vendorSellWorldReinforce = false,
  marketCancelWorldReinforce = false,
  tradeCancelWorldReinforce = false,
  mailCancelWorldReinforce = false,
  guildCreateWorldReinforce = false,
  guildLeaveWorldReinforce = false,
  huntWinWorldReinforce = false,
  huntLoseWorldReinforce = false,
  craftCompleteWorldReinforce = false,
  softRefuseBusyWorldReinforce = false,
  muteWorldReinforce = false,
  gatherSuccessWorldReinforce = false,
  fishCatchWorldReinforce = false,
  stationUpgradeWorldReinforce = false,
  expandFieldWorldReinforce = false,
  dayPhaseWorldReinforce = false,
  travelArriveWorldReinforce = false,
  dayNightEnableWorldReinforce = false,
  scarceFreeSettleWorldReinforce = false,
  scarceBusyWorldReinforce = false,
  deedClaimWorldReinforce = false,
  deedMintWorldReinforce = false,
  walletLinkWorldReinforce = false,
  walletDisconnectWorldReinforce = false,
  arenaEnterWorldReinforce = false,
  arenaLeaveWorldReinforce = false,
  softWarDeliverWorldReinforce = false,
  onboardingTip,
  onDismissTip,
  panelOpen = false,
  children,
}: GameHudShellProps) {
  const energyLowVignette = shouldShowEnergyLowWorldVignette(
    state.energy,
    state.maxEnergy,
  );
  const healthLowVignette = shouldShowHealthLowWorldVignette(
    state.health,
    state.maxHealth,
  );
  const toolLowVignette = shouldShowToolLowWorldVignette(state);

  return (
    <>
      <TopBar
        state={state}
        error={error}
        info={info}
        visitingUsername={visitingUsername}
        visitFirstWalkUpTip={visitFirstWalkUpTip}
        visitHomeReturnTip={visitHomeReturnTip}
        nearbyCount={nearbyCount}
        dayPhaseLabel={dayPhaseLabel}
        mapChipArrivePulse={mapChipArrivePulse}
        mailPendingGlanceLabel={mailPendingGlanceLabel}
        questPendingGlanceLabel={questPendingGlanceLabel}
        guildInviteGlanceLabel={guildInviteGlanceLabel}
        tradePendingGlanceLabel={tradePendingGlanceLabel}
        achievementsPendingGlanceLabel={achievementsPendingGlanceLabel}
        chatPendingGlanceLabel={chatPendingGlanceLabel}
        noticeUnreadGlanceLabel={noticeUnreadGlanceLabel}
        inventoryPickupGlanceLabel={inventoryPickupGlanceLabel}
        softWarDeliverGlanceLabel={softWarDeliverGlanceLabel}
        panelOpen={panelOpen}
        onGoHome={onGoHome}
        onLogout={onLogout}
      />
      {energyLowVignette ? (
        <div
          className="hud-energy-low-vignette"
          data-testid="hud-energy-low-vignette"
          data-energy-low-vignette="true"
          aria-hidden
          style={{
            background: energyLowWorldVignetteBackground(),
            opacity: ENERGY_LOW_WORLD_VIGNETTE.opacity,
          }}
        />
      ) : null}
      {healthLowVignette ? (
        <div
          className="hud-health-low-vignette"
          data-testid="hud-health-low-vignette"
          data-health-low-vignette="true"
          aria-hidden
          style={{
            background: healthLowWorldVignetteBackground(),
            opacity: HEALTH_LOW_WORLD_VIGNETTE.opacity,
          }}
        />
      ) : null}
      {toolLowVignette ? (
        <div
          className="hud-tool-low-vignette"
          data-testid="hud-tool-low-vignette"
          data-tool-low-vignette="true"
          aria-hidden
          style={{
            background: toolLowWorldVignetteBackground(),
            opacity: TOOL_LOW_WORLD_VIGNETTE.opacity,
          }}
        />
      ) : null}
      {eatSuccessWorldReinforce ? (
        <div
          className="hud-eat-success-reinforce"
          data-testid="hud-eat-success-reinforce"
          data-eat-success-reinforce="true"
          aria-hidden
          style={{
            background: eatSuccessWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--eat-reinforce-opacity" as string]: String(
              EAT_SUCCESS_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {coinsGainWorldReinforce ? (
        <div
          className="hud-coins-gain-reinforce"
          data-testid="hud-coins-gain-reinforce"
          data-coins-gain-reinforce="true"
          aria-hidden
          style={{
            background: coinsGainWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--coins-reinforce-opacity" as string]: String(
              COINS_GAIN_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {cropPlantSuccessWorldReinforce ? (
        <div
          className="hud-crop-plant-success-reinforce"
          data-testid="hud-crop-plant-success-reinforce"
          data-crop-plant-success-reinforce="true"
          aria-hidden
          style={{
            background: cropPlantSuccessWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--crop-plant-reinforce-opacity" as string]: String(
              CROP_PLANT_SUCCESS_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {cropReadyWorldReinforce ? (
        <div
          className="hud-crop-ready-reinforce"
          data-testid="hud-crop-ready-reinforce"
          data-crop-ready-reinforce="true"
          aria-hidden
          style={{
            background: cropReadyWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--crop-ready-reinforce-opacity" as string]: String(
              CROP_READY_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {cropHarvestWorldReinforce ? (
        <div
          className="hud-crop-harvest-reinforce"
          data-testid="hud-crop-harvest-reinforce"
          data-crop-harvest-reinforce="true"
          aria-hidden
          style={{
            background: cropHarvestWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--crop-harvest-reinforce-opacity" as string]: String(
              CROP_HARVEST_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {levelUpWorldReinforce ? (
        <div
          className="hud-level-up-reinforce"
          data-testid="hud-level-up-reinforce"
          data-level-up-reinforce="true"
          aria-hidden
          style={{
            background: levelUpWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--level-up-reinforce-opacity" as string]: String(
              LEVEL_UP_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {achievementUnlockWorldReinforce ? (
        <div
          className="hud-achievement-unlock-reinforce"
          data-testid="hud-achievement-unlock-reinforce"
          data-achievement-unlock-reinforce="true"
          aria-hidden
          style={{
            background: achievementUnlockWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--achievement-unlock-reinforce-opacity" as string]: String(
              ACHIEVEMENT_UNLOCK_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {titleChangeWorldReinforce ? (
        <div
          className="hud-title-change-reinforce"
          data-testid="hud-title-change-reinforce"
          data-title-change-reinforce="true"
          aria-hidden
          style={{
            background: titleChangeWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--title-change-reinforce-opacity" as string]: String(
              TITLE_CHANGE_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {marketListWorldReinforce ? (
        <div
          className="hud-market-list-reinforce"
          data-testid="hud-market-list-reinforce"
          data-market-list-reinforce="true"
          aria-hidden
          style={{
            background: marketListWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--market-list-reinforce-opacity" as string]: String(
              MARKET_LIST_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {questClaimWorldReinforce ? (
        <div
          className="hud-quest-claim-reinforce"
          data-testid="hud-quest-claim-reinforce"
          data-quest-claim-reinforce="true"
          aria-hidden
          style={{
            background: questClaimWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--quest-claim-reinforce-opacity" as string]: String(
              QUEST_CLAIM_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {visitHomeReturnWorldReinforce ? (
        <div
          className="hud-visit-home-return-reinforce"
          data-testid="hud-visit-home-return-reinforce"
          data-visit-home-return-reinforce="true"
          aria-hidden
          style={{
            background: visitHomeReturnWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--visit-home-return-reinforce-opacity" as string]: String(
              VISIT_HOME_RETURN_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {visitArriveWorldReinforce ? (
        <div
          className="hud-visit-arrive-reinforce"
          data-testid="hud-visit-arrive-reinforce"
          data-visit-arrive-reinforce="true"
          aria-hidden
          style={{
            background: visitArriveWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--visit-arrive-reinforce-opacity" as string]: String(
              VISIT_ARRIVE_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {nearbyPeerWorldReinforce ? (
        <div
          className="hud-nearby-peer-reinforce"
          data-testid="hud-nearby-peer-reinforce"
          data-nearby-peer-reinforce="true"
          aria-hidden
          style={{
            background: nearbyPeerWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--nearby-peer-reinforce-opacity" as string]: String(
              NEARBY_PEER_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {chatSendWorldReinforce ? (
        <div
          className="hud-chat-send-reinforce"
          data-testid="hud-chat-send-reinforce"
          data-chat-send-reinforce="true"
          aria-hidden
          style={{
            background: chatSendWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--chat-send-reinforce-opacity" as string]: String(
              CHAT_SEND_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {tradeAcceptWorldReinforce ? (
        <div
          className="hud-trade-accept-reinforce"
          data-testid="hud-trade-accept-reinforce"
          data-trade-accept-reinforce="true"
          aria-hidden
          style={{
            background: tradeAcceptWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--trade-accept-reinforce-opacity" as string]: String(
              TRADE_ACCEPT_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {guildBankDepositWorldReinforce ? (
        <div
          className="hud-guild-bank-deposit-reinforce"
          data-testid="hud-guild-bank-deposit-reinforce"
          data-guild-bank-deposit-reinforce="true"
          aria-hidden
          style={{
            background: guildBankDepositWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--guild-bank-deposit-reinforce-opacity" as string]: String(
              GUILD_BANK_DEPOSIT_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {guildBankWithdrawWorldReinforce ? (
        <div
          className="hud-guild-bank-withdraw-reinforce"
          data-testid="hud-guild-bank-withdraw-reinforce"
          data-guild-bank-withdraw-reinforce="true"
          aria-hidden
          style={{
            background: guildBankWithdrawWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--guild-bank-withdraw-reinforce-opacity" as string]: String(
              GUILD_BANK_WITHDRAW_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {inviteAcceptWorldReinforce ? (
        <div
          className="hud-invite-accept-reinforce"
          data-testid="hud-invite-accept-reinforce"
          data-invite-accept-reinforce="true"
          aria-hidden
          style={{
            background: inviteAcceptWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--invite-accept-reinforce-opacity" as string]: String(
              INVITE_ACCEPT_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {mailSendWorldReinforce ? (
        <div
          className="hud-mail-send-reinforce"
          data-testid="hud-mail-send-reinforce"
          data-mail-send-reinforce="true"
          aria-hidden
          style={{
            background: mailSendWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--mail-send-reinforce-opacity" as string]: String(
              MAIL_SEND_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {decorPlaceWorldReinforce ? (
        <div
          className="hud-decor-place-reinforce"
          data-testid="hud-decor-place-reinforce"
          data-decor-place-reinforce="true"
          aria-hidden
          style={{
            background: decorPlaceWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--decor-place-reinforce-opacity" as string]: String(
              DECOR_PLACE_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {toolRepairWorldReinforce ? (
        <div
          className="hud-tool-repair-reinforce"
          data-testid="hud-tool-repair-reinforce"
          data-tool-repair-reinforce="true"
          aria-hidden
          style={{
            background: toolRepairWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--tool-repair-reinforce-opacity" as string]: String(
              TOOL_REPAIR_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {toolEquipWorldReinforce ? (
        <div
          className="hud-tool-equip-reinforce"
          data-testid="hud-tool-equip-reinforce"
          data-tool-equip-reinforce="true"
          aria-hidden
          style={{
            background: toolEquipWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--tool-equip-reinforce-opacity" as string]: String(
              TOOL_EQUIP_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {toolUnequipWorldReinforce ? (
        <div
          className="hud-tool-unequip-reinforce"
          data-testid="hud-tool-unequip-reinforce"
          data-tool-unequip-reinforce="true"
          aria-hidden
          style={{
            background: toolUnequipWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--tool-unequip-reinforce-opacity" as string]: String(
              TOOL_UNEQUIP_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {mailClaimWorldReinforce ? (
        <div
          className="hud-mail-claim-reinforce"
          data-testid="hud-mail-claim-reinforce"
          data-mail-claim-reinforce="true"
          aria-hidden
          style={{
            background: mailClaimWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--mail-claim-reinforce-opacity" as string]: String(
              MAIL_CLAIM_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {vendorBuyWorldReinforce ? (
        <div
          className="hud-vendor-buy-reinforce"
          data-testid="hud-vendor-buy-reinforce"
          data-vendor-buy-reinforce="true"
          aria-hidden
          style={{
            background: vendorBuyWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--vendor-buy-reinforce-opacity" as string]: String(
              VENDOR_BUY_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {marketBuyWorldReinforce ? (
        <div
          className="hud-market-buy-reinforce"
          data-testid="hud-market-buy-reinforce"
          data-market-buy-reinforce="true"
          aria-hidden
          style={{
            background: marketBuyWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--market-buy-reinforce-opacity" as string]: String(
              MARKET_BUY_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {vendorSellWorldReinforce ? (
        <div
          className="hud-vendor-sell-reinforce"
          data-testid="hud-vendor-sell-reinforce"
          data-vendor-sell-reinforce="true"
          aria-hidden
          style={{
            background: vendorSellWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--vendor-sell-reinforce-opacity" as string]: String(
              VENDOR_SELL_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {marketCancelWorldReinforce ? (
        <div
          className="hud-market-cancel-reinforce"
          data-testid="hud-market-cancel-reinforce"
          data-market-cancel-reinforce="true"
          aria-hidden
          style={{
            background: marketCancelWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--market-cancel-reinforce-opacity" as string]: String(
              MARKET_CANCEL_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {tradeCancelWorldReinforce ? (
        <div
          className="hud-trade-cancel-reinforce"
          data-testid="hud-trade-cancel-reinforce"
          data-trade-cancel-reinforce="true"
          aria-hidden
          style={{
            background: tradeCancelWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--trade-cancel-reinforce-opacity" as string]: String(
              TRADE_CANCEL_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {mailCancelWorldReinforce ? (
        <div
          className="hud-mail-cancel-reinforce"
          data-testid="hud-mail-cancel-reinforce"
          data-mail-cancel-reinforce="true"
          aria-hidden
          style={{
            background: mailCancelWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--mail-cancel-reinforce-opacity" as string]: String(
              MAIL_CANCEL_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {guildCreateWorldReinforce ? (
        <div
          className="hud-guild-create-reinforce"
          data-testid="hud-guild-create-reinforce"
          data-guild-create-reinforce="true"
          aria-hidden
          style={{
            background: guildCreateWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--guild-create-reinforce-opacity" as string]: String(
              GUILD_CREATE_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {guildLeaveWorldReinforce ? (
        <div
          className="hud-guild-leave-reinforce"
          data-testid="hud-guild-leave-reinforce"
          data-guild-leave-reinforce="true"
          aria-hidden
          style={{
            background: guildLeaveWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--guild-leave-reinforce-opacity" as string]: String(
              GUILD_LEAVE_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {huntWinWorldReinforce ? (
        <div
          className="hud-hunt-win-reinforce"
          data-testid="hud-hunt-win-reinforce"
          data-hunt-win-reinforce="true"
          aria-hidden
          style={{
            background: huntWinWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--hunt-win-reinforce-opacity" as string]: String(
              HUNT_WIN_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {huntLoseWorldReinforce ? (
        <div
          className="hud-hunt-lose-reinforce"
          data-testid="hud-hunt-lose-reinforce"
          data-hunt-lose-reinforce="true"
          aria-hidden
          style={{
            background: huntLoseWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--hunt-lose-reinforce-opacity" as string]: String(
              HUNT_LOSE_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {craftCompleteWorldReinforce ? (
        <div
          className="hud-craft-complete-reinforce"
          data-testid="hud-craft-complete-reinforce"
          data-craft-complete-reinforce="true"
          aria-hidden
          style={{
            background: craftCompleteWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--craft-complete-reinforce-opacity" as string]: String(
              CRAFT_COMPLETE_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {gatherSuccessWorldReinforce ? (
        <div
          className="hud-gather-success-reinforce"
          data-testid="hud-gather-success-reinforce"
          data-gather-success-reinforce="true"
          aria-hidden
          style={{
            background: gatherSuccessWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--gather-success-reinforce-opacity" as string]: String(
              GATHER_SUCCESS_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {fishCatchWorldReinforce ? (
        <div
          className="hud-fish-catch-reinforce"
          data-testid="hud-fish-catch-reinforce"
          data-fish-catch-reinforce="true"
          aria-hidden
          style={{
            background: fishCatchWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--fish-catch-reinforce-opacity" as string]: String(
              FISH_CATCH_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {stationUpgradeWorldReinforce ? (
        <div
          className="hud-station-upgrade-reinforce"
          data-testid="hud-station-upgrade-reinforce"
          data-station-upgrade-reinforce="true"
          aria-hidden
          style={{
            background: stationUpgradeWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--station-upgrade-reinforce-opacity" as string]: String(
              STATION_UPGRADE_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {expandFieldWorldReinforce ? (
        <div
          className="hud-expand-field-reinforce"
          data-testid="hud-expand-field-reinforce"
          data-expand-field-reinforce="true"
          aria-hidden
          style={{
            background: expandFieldWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--expand-field-reinforce-opacity" as string]: String(
              EXPAND_FIELD_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {dayPhaseWorldReinforce ? (
        <div
          className="hud-day-phase-reinforce"
          data-testid="hud-day-phase-reinforce"
          data-day-phase-reinforce="true"
          aria-hidden
          style={{
            background: dayPhaseWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--day-phase-reinforce-opacity" as string]: String(
              DAY_PHASE_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {travelArriveWorldReinforce ? (
        <div
          className="hud-travel-arrive-reinforce"
          data-testid="hud-travel-arrive-reinforce"
          data-travel-arrive-reinforce="true"
          aria-hidden
          style={{
            background: travelArriveWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--travel-arrive-reinforce-opacity" as string]: String(
              TRAVEL_ARRIVE_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {dayNightEnableWorldReinforce ? (
        <div
          className="hud-day-night-enable-reinforce"
          data-testid="hud-day-night-enable-reinforce"
          data-day-night-enable-reinforce="true"
          aria-hidden
          style={{
            background: dayNightEnableWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--day-night-enable-reinforce-opacity" as string]: String(
              DAY_NIGHT_ENABLE_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {scarceFreeSettleWorldReinforce ? (
        <div
          className="hud-scarce-free-settle-reinforce"
          data-testid="hud-scarce-free-settle-reinforce"
          data-scarce-free-settle-reinforce="true"
          aria-hidden
          style={{
            background: scarceFreeSettleWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--scarce-free-settle-reinforce-opacity" as string]: String(
              SCARCE_FREE_SETTLE_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {scarceBusyWorldReinforce ? (
        <div
          className="hud-scarce-busy-reinforce"
          data-testid="hud-scarce-busy-reinforce"
          data-scarce-busy-reinforce="true"
          aria-hidden
          style={{
            background: scarceBusyWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--scarce-busy-reinforce-opacity" as string]: String(
              SCARCE_BUSY_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {softRefuseBusyWorldReinforce ? (
        <div
          className="hud-soft-refuse-busy-reinforce"
          data-testid="hud-soft-refuse-busy-reinforce"
          data-soft-refuse-busy-reinforce="true"
          aria-hidden
          style={{
            background: softRefuseBusyWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--soft-refuse-busy-reinforce-opacity" as string]: String(
              SOFT_REFUSE_BUSY_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {muteWorldReinforce ? (
        <div
          className="hud-mute-reinforce"
          data-testid="hud-mute-reinforce"
          data-mute-reinforce="true"
          aria-hidden
          style={{
            background: muteWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--mute-reinforce-opacity" as string]: String(
              MUTE_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {deedClaimWorldReinforce ? (
        <div
          className="hud-deed-claim-reinforce"
          data-testid="hud-deed-claim-reinforce"
          data-deed-claim-reinforce="true"
          aria-hidden
          style={{
            background: deedClaimWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--deed-claim-reinforce-opacity" as string]: String(
              DEED_CLAIM_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {deedMintWorldReinforce ? (
        <div
          className="hud-deed-mint-reinforce"
          data-testid="hud-deed-mint-reinforce"
          data-deed-mint-reinforce="true"
          aria-hidden
          style={{
            background: deedMintWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--deed-mint-reinforce-opacity" as string]: String(
              DEED_MINT_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {walletLinkWorldReinforce ? (
        <div
          className="hud-wallet-link-reinforce"
          data-testid="hud-wallet-link-reinforce"
          data-wallet-link-reinforce="true"
          aria-hidden
          style={{
            background: walletLinkWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--wallet-link-reinforce-opacity" as string]: String(
              WALLET_LINK_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {walletDisconnectWorldReinforce ? (
        <div
          className="hud-wallet-disconnect-reinforce"
          data-testid="hud-wallet-disconnect-reinforce"
          data-wallet-disconnect-reinforce="true"
          aria-hidden
          style={{
            background: walletDisconnectWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--wallet-disconnect-reinforce-opacity" as string]: String(
              WALLET_DISCONNECT_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {arenaEnterWorldReinforce ? (
        <div
          className="hud-arena-enter-reinforce"
          data-testid="hud-arena-enter-reinforce"
          data-arena-enter-reinforce="true"
          aria-hidden
          style={{
            background: arenaEnterWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--arena-enter-reinforce-opacity" as string]: String(
              ARENA_ENTER_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {arenaLeaveWorldReinforce ? (
        <div
          className="hud-arena-leave-reinforce"
          data-testid="hud-arena-leave-reinforce"
          data-arena-leave-reinforce="true"
          aria-hidden
          style={{
            background: arenaLeaveWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--arena-leave-reinforce-opacity" as string]: String(
              ARENA_LEAVE_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {softWarDeliverWorldReinforce ? (
        <div
          className="hud-soft-war-deliver-reinforce"
          data-testid="hud-soft-war-deliver-reinforce"
          data-soft-war-deliver-reinforce="true"
          aria-hidden
          style={{
            background: softWarDeliverWorldReinforceBackground(),
            // Reason: peak opacity is CSS-animated; seed matches SoT constant.
            ["--soft-war-deliver-reinforce-opacity" as string]: String(
              SOFT_WAR_DELIVER_WORLD_REINFORCE.opacityPeak,
            ),
          }}
        />
      ) : null}
      {panelOpen ? (
        <div
          className="hud-panel-dim"
          data-testid="hud-panel-dim"
          aria-hidden
        />
      ) : null}
      {!panelOpen ? (
        livePrompt ? (
          <TickingInteractPrompt
            input={livePrompt.input}
            serverNow={livePrompt.serverNow}
            receivedAt={livePrompt.receivedAt}
            successPulse={promptSuccessPulse}
            panelOpen={panelOpen}
          />
        ) : (
          <InteractPrompt
            label={promptLabel}
            showKey={promptShowKey}
            successPulse={promptSuccessPulse}
          />
        )
      ) : null}
      {!panelOpen ? (
        <OnboardingTips tip={onboardingTip} onDismiss={onDismissTip} />
      ) : null}
      <div className="hud-panel-slot" data-panel-open={panelOpen ? "true" : "false"}>
        {children}
      </div>
    </>
  );
}
