"use client";

import type {
  BuildingDto,
  GuildRank,
  ItemId,
  PlayerStateDto,
  StationId,
} from "@game/shared";
import {
  CRAFT_COMPLETE_BENCH_FLASH,
  FISH_CATCH_SPLASH_FLASH,
  GATHER_SUCCESS_PAD_FLASH,
  BUILD_PLACE_SPAWN_FLASH,
  STATION_UPGRADE_PAD_FLASH,
  EXPAND_FIELD_PAD_FLASH,
  expandPadAffordMode,
  emptyLandBuildBeaconMode,
  getVendorPrices,
  hasExtraDecorPadUnlock,
  hasUnreadNoticeTips,
  isFirstHomesteadStationPlace,
  ACTION_ERROR,
  isCombatBuildingType,
  isExploreLandKind,
  isWarriorLandKind,
  LIVE_COMBAT,
  isPlayerLandKind,
  isPlayerLandStationType,
  canPickupHomesteadBuilding,
  buildingTypeFromKitItemId,
  ITEMS,
  nextSlotExpansion,
  ORE_NODE,
  plantableSeedsFromInventory,
  RECIPES,
  shouldFlashBuildPlaceSpawn,
  shouldFlashCraftCompleteBench,
  shouldFlashExpandFieldPad,
  shouldFlashFishCatchSplash,
  shouldFlashGatherSuccessPad,
  shouldFlashStationUpgradePad,
  shouldShowVisitHomeReturnWorldTip,
  shouldReinforceVisitHostNameplateOnArrive,
  VISIT_HOST_NAMEPLATE,
  syncedNow,
  tutorClaimableProfessionIds,
  realmToWei,
  isEvmAddress,
  homesteadGateWorldZ,
} from "@game/shared";
import {
  sceneAllowsExpandPad,
  sceneTemplateForLandKind,
} from "@/lib/scene-template";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  apiAcceptTrade,
  apiCreateTrade,
  apiCraft,
  apiCollectCraft,
  apiCreateGuild,
  apiEatFood,
  apiEquipTool,
  apiEquipGear,
  apiRepairTool,
  apiExpandLand,
  apiPlaceStationKit,
  apiPickupStation,
  apiTravel,
  apiPlaceDecor,
  apiUpgradeBuilding,
  apiGatherOre,
  apiClaimNode,
  apiHarvest,
  apiCombatStart,
  apiCombatAct,
  apiCombatTick,
  apiJoinGuild,
  apiLeaveGuild,
  apiListChat,
  apiListGuildChat,
  apiPostGuildChat,
  apiListGuilds,
  apiListGuildMembers,
  apiListGuildBank,
  apiDepositGuildBank,
  apiWithdrawGuildBank,
  apiRegenerateGuildInvite,
  apiOfferGuildInvite,
  apiSetGuildRank,
  apiListQuests,
  apiGetTutorialNpc,
  apiClaimTutorialNpc,
  apiListTutorialNpcs,
  apiListAchievements,
  apiSendMail,
  apiClaimMail,
  apiCancelMail,
  apiDisconnectWallet,
  apiClaimLandDeed,
  apiCreditcoinBuyItem,
  apiCreditcoinCancelItem,
  apiCreditcoinConfig,
  apiCreditcoinListItem,
  apiCreditcoinMintLand,
  apiCreditcoinConfirmLand,
  apiCreditcoinEnterLand,
  apiCreditcoinSnapshot,
  apiCreditcoinAttachOnchain,
  apiCreditcoinSwap,
  apiLinkWallet,
  apiWalletChallenge,
  apiListDeedMarket,
  apiChainMarketplace,
  apiListTrades,
  apiMe,
  apiPlant,
  apiPostChat,
  apiRejectTrade,
  apiReportPresence,
  apiVendorBuy,
  apiVendorSell,
  apiVisitLand,
  apiListMarket,
  apiCreateMarketListing,
  apiBuyMarketListing,
  apiCancelMarketListing,
} from "@/lib/api";
import { TitleCover } from "@/components/TitleCover";
import { useGameAuth } from "@/hooks/useGameAuth";
import { useVisitLandState } from "@/hooks/useVisitLand";
import { useEconomyPanels } from "@/hooks/useEconomyPanels";
import { useSuccessCue } from "@/hooks/useSuccessCue";
import { useTimedFlag } from "@/hooks/useTimedFlag";
import { resolveSoftRefuseFlash } from "@/lib/hud/soft-refuse-flash";
import { BuildPanel } from "@/components/hud/BuildPanel";
import { ChatPanel, type ChatChannel } from "@/components/hud/ChatPanel";
import { CraftPanel } from "@/components/hud/CraftPanel";
import { PlantPanel } from "@/components/hud/PlantPanel";
import { MailPanel } from "@/components/hud/MailPanel";
import { CreditcoinPanel } from "@/components/hud/CreditcoinPanel";
import { RealmMarketPanel } from "@/components/hud/RealmMarketPanel";
import { SettingsPanel } from "@/components/hud/SettingsPanel";
import { AchievementsPanel } from "@/components/hud/AchievementsPanel";
import { QuestPanel } from "@/components/hud/QuestPanel";
import { TutorialNpcPanel } from "@/components/hud/TutorialNpcPanel";
import { GuildPanel } from "@/components/hud/GuildPanel";
import { InventoryPanel } from "@/components/hud/InventoryPanel";
import { CombatHud } from "@/components/hud/CombatHud";
import { findAutoEngagePrey } from "@/lib/hud/combat-engage";
import { CombatVisualProvider } from "@/components/land-scene/combat-visual-context";
import { MarketPanel } from "@/components/hud/MarketPanel";
import { TradePanel } from "@/components/hud/TradePanel";
import { VendorPanel } from "@/components/hud/VendorPanel";
import { VisitPanel } from "@/components/hud/VisitPanel";
import { DecorPanel } from "@/components/hud/DecorPanel";
import { TravelPanel } from "@/components/hud/TravelPanel";
import { ArenaStubPanel } from "@/components/hud/ArenaStubPanel";
import { NoticeBoardPanel } from "@/components/hud/NoticeBoardPanel";
import { GameHudShell } from "@/components/hud/GameHudShell";
import { mergeRemotePresence } from "@/lib/remotePresence";
import { connectGameSocket } from "@/lib/gameSocket";
import { preferWsChat } from "@/lib/chatTransport";
import {
  connectAndSignCreditcoin,
  switchToCreditcoin,
  watchRealmToken,
} from "@/lib/creditcoin-wallet";
import {
  asPublicConfig,
  buyItemOnchain,
  cancelListingOnchain,
  listItemOnchain,
  mintLandOnchain,
  transferRealmOnchain,
} from "@/lib/creditcoin-txs";
import {
  clientCropState,
  readyCropPlotIds,
  readyWoodStumpIds,
  readyFishingDockIds,
  readyOreNodeIds,
  readyAnimalPenIds,
  findInteractTarget,
  type InteractTarget,
} from "@/components/land-scene/landProximity";
import {
  nextOnboardingTip,
  onboardingFlagsFromState,
  type OnboardingTipId,
} from "@/lib/onboarding";
import {
  loadClientSettings,
  saveClientSettings,
  type ClientSettings,
} from "@/lib/settings";
import {
  createGameAudio,
  isSoftRefuseError,
  shouldPlayBgmArriveIdentityStinger,
  travelSfxFor,
  type GameAudioController,
} from "@/lib/game-audio";
import { dayNightPalette } from "@/lib/day-night";
import {
  buildingPanelIntent,
  resolveContextualWalkAway,
  shouldSkipTutorialNpcReopen,
  type HudPanelId,
} from "@/lib/hud/panel-orchestration";
import { resolveInteractPrompt } from "@/lib/hud/interact-prompt";
import { visitInteractStickyInfo } from "@/lib/hud/visit-interact";
import { inventoryQty } from "@/lib/recipe-book";
import {
  SUCCESS_CUE_MS,
  travelArriveSuccessCueText,
  shouldFlashTravelArriveSuccessCue,
  decorPlaceSuccessCueText,
  eatFoodSuccessCueText,
  equipToolSuccessCueText,
  expandFieldSuccessCueText,
  guildClaimSuccessCueText,
  guildCollectSuccessCueText,
  guildDeliverSuccessCueText,
  softWarStartSuccessCueText,
  shouldFlashToolBrokeCue,
  shouldFlashEnergyLowCue,
  shouldFlashHealthLowCue,
  shouldFlashToolDurabilityLowBetweenStates,
  shouldFlashFirstPortalWalkUpCue,
  shouldFlashFirstExploreWalkUpCue,
  shouldFlashFirstArenaWalkUpCue,
  shouldFlashFirstEmptyLandBuildBoardCue,
  shouldFlashFirstMarketWalkUpCue,
  shouldFlashFirstVendorWalkUpCue,
  shouldFlashFirstFishingDockWalkUpCue,
  shouldFlashFirstAnimalPenWalkUpCue,
  shouldFlashFirstTreeStumpWalkUpCue,
  shouldFlashFirstOreNodeWalkUpCue,
  shouldFlashFirstCropPlotWalkUpCue,
  shouldFlashFirstHuntTrailWalkUpCue,
  shouldFlashFirstKitchenWalkUpCue,
  shouldFlashFirstNoticeBoardWalkUpCue,
  shouldFlashFirstExpandPadWalkUpCue,
  shouldFlashFirstMillWalkUpCue,
  shouldFlashFirstWorkshopWalkUpCue,
  shouldFlashFirstForgeWalkUpCue,
  shouldFlashFirstLoomWalkUpCue,
  shouldFlashFirstAlchemyBenchWalkUpCue,
  shouldFlashFirstDecorPadWalkUpCue,
  shouldFlashFirstTutorWalkUpCue,
  shouldFlashFirstClaimNodeWalkUpCue,
  shouldFlashTutorClaimReadyEdgeCue,
  shouldFlashFirstVisitLandCue,
  shouldFlashFirstWarriorMapCue,
  shouldFlashFirstCityHubCue,
  shouldFlashDayPhaseChangeCue,
  shouldFlashCropReadyEdgeCue,
  shouldFlashWoodStumpReadyEdgeCue,
  shouldFlashFishingDockReadyEdgeCue,
  shouldFlashOreNodeReadyEdgeCue,
  shouldFlashAnimalPenReadyEdgeCue,
  shouldFlashCharacterLevelUpCue,
  shouldFlashCharacterTitleChangeCue,
  shouldFlashExtraDecorPadUnlockCue,
  isEnteringExploreMap,
  isEnteringWarriorMap,
  isLeavingWarriorMap,
  isEnteringCityMap,
  energyLowThresholdCueText,
  healthLowThresholdCueText,
  toolDurabilityLowThresholdCueText,
  firstPortalWalkUpCueText,
  firstExploreWalkUpCueText,
  firstArenaWalkUpCueText,
  firstEmptyLandBuildBoardCueText,
  firstMarketWalkUpCueText,
  firstVendorWalkUpCueText,
  firstFishingDockWalkUpCueText,
  firstAnimalPenWalkUpCueText,
  firstTreeStumpWalkUpCueText,
  firstOreNodeWalkUpCueText,
  firstCropPlotWalkUpCueText,
  firstHuntTrailWalkUpCueText,
  firstKitchenWalkUpCueText,
  firstNoticeBoardWalkUpCueText,
  firstExpandPadWalkUpCueText,
  firstMillWalkUpCueText,
  firstWorkshopWalkUpCueText,
  firstForgeWalkUpCueText,
  firstLoomWalkUpCueText,
  firstAlchemyBenchWalkUpCueText,
  firstDecorPadWalkUpCueText,
  firstTutorWalkUpCueText,
  firstClaimNodeWalkUpCueText,
  firstVisitLandCueText,
  firstWarriorMapCueText,
  firstCityHubCueText,
  dayPhaseChangeCueText,
  cropReadyEdgeCueText,
  woodStumpReadyEdgeCueText,
  fishingDockReadyEdgeCueText,
  oreNodeReadyEdgeCueText,
  animalPenReadyEdgeCueText,
  tutorClaimReadyEdgeCueText,
  characterLevelUpCueText,
  characterTitleChangeCueText,
  extraDecorPadUnlockCueText,
  titleWithDecorPadUnlockCueText,
  achievementUnlockSuccessCueText,
  newlyUnlockedAchievementTitles,
  gatherSuccessCueText,
  vendorSellSuccessCueText,
  vendorBuySuccessCueText,
  toolBrokeSuccessCueText,
  huntEncounterSuccessCueText,
  deedClaimSuccessCueText,
  walletLinkSuccessCueText,
  walletDisconnectSuccessCueText,
  muteToggleSuccessCueText,
  homesteadFirstPlaceSuccessCueText,
  mailCancelSuccessCueText,
  mailClaimSuccessCueText,
  mailSendSuccessCueText,
  marketSuccessCueText,
  repairToolSuccessCueText,
  stationBuiltSuccessCueText,
  stationUpgradeSuccessCueText,
  guildBankDepositSuccessCueText,
  guildBankWithdrawSuccessCueText,
  guildCreateSuccessCueText,
  guildJoinSuccessCueText,
  guildLeaveSuccessCueText,
  guildInviteRefreshSuccessCueText,
  guildRankChangeSuccessCueText,
  tradeAcceptSuccessCueText,
  tradeCancelSuccessCueText,
  shouldFlashTradeCancelCue,
  tradeInviteReceiveCueText,
  tradeOfferSentCueText,
  tutorClaimSuccessCueText,
  visitLeaveSuccessCueText,
  visitSuccessCueText,
  chatReceiveSuccessCueText,
  chatSendSuccessCueText,
} from "@/lib/hud/success-cue";
import {
  craftCollectCueText,
  craftStartCueText,
  harvestSuccessCueText,
  plantSuccessCueText,
  resolveCraftOutputLoot,
  resolveGatherLootCue,
  resolveHarvestLootCue,
} from "@/lib/hud/action-loot-cue";
import { creditcoinSwapSuccessCueText } from "@/lib/hud/creditcoin-swap-cue";
import {
  shouldAllowChatReceivePingAt,
  shouldPlayChatReceivePing,
} from "@/lib/hud/chat-receive-ping";
import {
  INVENTORY_OPEN_ACCENT_MS,
  shouldPlayGuildMembershipOpenAccent,
  shouldPlayRealmMarketOpenAccent,
} from "@/lib/hud/inventory-open-accent";
import {
  INVENTORY_PICKUP_SLOT_FLASH,
  inventoryPickupFlashStackIds,
  shouldFlashInventoryPickupSlots,
} from "@/lib/hud/inventory-pickup-slot-flash";
import {
  INVENTORY_PICKUP_IDLE_GLANCE,
  inventoryPickupIdleGlanceLabel,
  shouldArmInventoryPickupIdleGlance,
  shouldShowInventoryPickupIdleGlance,
} from "@/lib/hud/inventory-pickup-idle-glance";
import {
  kitInventoryIdAfterPickup,
  kitItemIdForHomesteadBuilding,
} from "@/lib/hud/land-editor";
import {
  MUTE_ENABLE_CONFIRM_MS,
  shouldFlashMuteEnableConfirm,
} from "@/lib/hud/mute-enable-confirm";
import {
  DAY_NIGHT_ENABLE_CONFIRM_MS,
  shouldFlashDayNightEnableConfirm,
} from "@/lib/hud/day-night-enable-confirm";
import {
  TIPS_ENABLE_CONFIRM_MS,
  shouldFlashTipsEnableConfirm,
} from "@/lib/hud/tips-enable-confirm";
import {
  ECONOMY_PANEL_OPEN_ACCENT_MS,
  shouldPlayMarketOpenAccent,
  shouldPlayVendorOpenAccent,
} from "@/lib/hud/economy-panel-open-accent";
import {
  WORKSPACE_PANEL_OPEN_ACCENT_MS,
  shouldPlayArenaOpenAccent,
  shouldPlayBuildOpenAccent,
  shouldPlayCraftOpenAccent,
  shouldPlayDecorOpenAccent,
  shouldPlayTravelOpenAccent,
} from "@/lib/hud/workspace-panel-open-accent";
import {
  SOCIAL_PANEL_OPEN_ACCENT_MS,
  shouldPlayNoticeOpenAccent,
  shouldPlayTutorialNpcOpenAccent,
} from "@/lib/hud/social-panel-open-accent";
import {
  mailPendingClosedGlanceLabel,
  shouldShowMailPendingClosedGlance,
} from "@/lib/hud/mail-pending-closed-glance";
import {
  questPendingClosedGlanceLabel,
  shouldShowQuestPendingClosedGlance,
} from "@/lib/hud/quest-pending-closed-glance";
import {
  dismissPendingGuildInvite,
  guildInviteClosedGlanceLabel,
  mergePendingGuildInvite,
  shouldShowGuildInviteClosedGlance,
  type PendingGuildInvite,
} from "@/lib/hud/guild-invite-closed-glance";
import {
  tradePendingClosedGlanceLabel,
  shouldShowTradePendingClosedGlance,
} from "@/lib/hud/trade-pending-closed-glance";
import {
  achievementsPendingClosedGlanceLabel,
  clearPendingAchievementUnlocks,
  mergePendingAchievementUnlocks,
  newlyUnlockedAchievementGlanceRows,
  shouldShowAchievementsPendingClosedGlance,
  type PendingAchievementUnlock,
} from "@/lib/hud/achievements-pending-closed-glance";
import {
  chatPendingClosedGlanceLabel,
  clearPendingChatGlanceLines,
  mergePendingChatGlanceLine,
  shouldShowChatPendingClosedGlance,
  shouldStageChatPendingClosedGlance,
  type PendingChatGlanceLine,
} from "@/lib/hud/chat-pending-closed-glance";
import {
  noticeUnreadClosedGlanceLabel,
  shouldShowNoticeUnreadClosedGlance,
} from "@/lib/hud/notice-unread-closed-glance";
import {
  EAT_SUCCESS_WORLD_REINFORCE,
  shouldFlashEatSuccessWorldReinforce,
} from "@/lib/hud/energy-food-feedback";
import {
  COINS_GAIN_WORLD_REINFORCE,
  shouldFlashCoinsGainWorldReinforce,
} from "@/lib/hud/coins-gain-feedback";
import {
  CROP_PLANT_SUCCESS_WORLD_REINFORCE,
  shouldFlashCropPlantSuccessWorldReinforce,
} from "@/lib/hud/crop-plant-feedback";
import {
  CROP_READY_WORLD_REINFORCE,
  shouldFlashCropReadyWorldReinforce,
} from "@/lib/hud/crop-ready-feedback";
import {
  CROP_HARVEST_WORLD_REINFORCE,
  shouldFlashCropHarvestWorldReinforce,
} from "@/lib/hud/crop-harvest-feedback";
import {
  LEVEL_UP_WORLD_REINFORCE,
  shouldFlashLevelUpWorldReinforce,
} from "@/lib/hud/level-up-feedback";
import {
  ACHIEVEMENT_UNLOCK_WORLD_REINFORCE,
  shouldFlashAchievementUnlockWorldReinforce,
} from "@/lib/hud/achievement-unlock-feedback";
import {
  TITLE_CHANGE_WORLD_REINFORCE,
  shouldFlashTitleChangeWorldReinforce,
} from "@/lib/hud/title-change-feedback";
import {
  MARKET_LIST_WORLD_REINFORCE,
  shouldFlashMarketListWorldReinforce,
} from "@/lib/hud/market-list-feedback";
import {
  MARKET_BUY_WORLD_REINFORCE,
  shouldFlashMarketBuyWorldReinforce,
} from "@/lib/hud/market-buy-feedback";
import {
  VENDOR_SELL_WORLD_REINFORCE,
  shouldFlashVendorSellWorldReinforce,
} from "@/lib/hud/vendor-sell-feedback";
import {
  MARKET_CANCEL_WORLD_REINFORCE,
  shouldFlashMarketCancelWorldReinforce,
} from "@/lib/hud/market-cancel-feedback";
import {
  TRADE_CANCEL_WORLD_REINFORCE,
  shouldFlashTradeCancelWorldReinforce,
} from "@/lib/hud/trade-cancel-feedback";
import {
  MAIL_CANCEL_WORLD_REINFORCE,
  shouldFlashMailCancelWorldReinforce,
} from "@/lib/hud/mail-cancel-feedback";
import {
  GUILD_CREATE_WORLD_REINFORCE,
  shouldFlashGuildCreateWorldReinforce,
} from "@/lib/hud/guild-create-feedback";
import {
  GUILD_LEAVE_WORLD_REINFORCE,
  shouldFlashGuildLeaveWorldReinforce,
} from "@/lib/hud/guild-leave-feedback";
import {
  HUNT_WIN_WORLD_REINFORCE,
  shouldFlashHuntWinWorldReinforce,
} from "@/lib/hud/hunt-win-feedback";
import {
  HUNT_LOSE_WORLD_REINFORCE,
  shouldFlashHuntLoseWorldReinforce,
} from "@/lib/hud/hunt-lose-feedback";
import {
  CRAFT_COMPLETE_WORLD_REINFORCE,
  shouldFlashCraftCompleteWorldReinforce,
} from "@/lib/hud/craft-complete-feedback";
import {
  SOFT_REFUSE_BUSY_WORLD_REINFORCE,
  shouldFlashSoftRefuseBusyWorldReinforce,
} from "@/lib/hud/soft-refuse-busy-world-reinforce-feedback";
import {
  MUTE_WORLD_REINFORCE,
  shouldFlashMuteWorldReinforce,
} from "@/lib/hud/mute-world-reinforce-feedback";
import {
  GATHER_SUCCESS_WORLD_REINFORCE,
  shouldFlashGatherSuccessWorldReinforce,
} from "@/lib/hud/gather-success-feedback";
import {
  FISH_CATCH_WORLD_REINFORCE,
  shouldFlashFishCatchWorldReinforce,
} from "@/lib/hud/fish-catch-feedback";
import {
  STATION_UPGRADE_WORLD_REINFORCE,
  shouldFlashStationUpgradeWorldReinforce,
} from "@/lib/hud/station-upgrade-feedback";
import {
  EXPAND_FIELD_WORLD_REINFORCE,
  shouldFlashExpandFieldWorldReinforce,
} from "@/lib/hud/expand-field-feedback";
import {
  DAY_PHASE_WORLD_REINFORCE,
  shouldFlashDayPhaseWorldReinforce,
} from "@/lib/hud/day-phase-feedback";
import {
  TRAVEL_ARRIVE_WORLD_REINFORCE,
  shouldFlashTravelArriveWorldReinforce,
} from "@/lib/hud/travel-arrive-feedback";
import {
  DAY_NIGHT_ENABLE_WORLD_REINFORCE,
  shouldFlashDayNightEnableWorldReinforce,
} from "@/lib/hud/day-night-enable-feedback";
import {
  SCARCE_FREE_SETTLE_WORLD_REINFORCE,
  shouldFlashScarceFreeSettleWorldReinforce,
} from "@/lib/hud/scarce-free-settle-feedback";
import {
  SCARCE_BUSY_WORLD_REINFORCE,
  shouldFlashScarceBusyWorldReinforce,
} from "@/lib/hud/scarce-busy-world-reinforce-feedback";
import {
  DEED_CLAIM_WORLD_REINFORCE,
  shouldFlashDeedClaimWorldReinforce,
} from "@/lib/hud/deed-claim-feedback";
import {
  DEED_MINT_WORLD_REINFORCE,
  shouldFlashDeedMintWorldReinforce,
} from "@/lib/hud/deed-mint-feedback";
import {
  WALLET_LINK_WORLD_REINFORCE,
  shouldFlashWalletLinkWorldReinforce,
} from "@/lib/hud/wallet-link-feedback";
import {
  WALLET_DISCONNECT_WORLD_REINFORCE,
  shouldFlashWalletDisconnectWorldReinforce,
} from "@/lib/hud/wallet-disconnect-feedback";
import {
  QUEST_CLAIM_WORLD_REINFORCE,
  shouldFlashQuestClaimWorldReinforce,
} from "@/lib/hud/quest-claim-feedback";
import {
  VISIT_HOME_RETURN_WORLD_REINFORCE,
  shouldFlashVisitHomeReturnWorldReinforce,
} from "@/lib/hud/visit-home-return-feedback";
import {
  VISIT_ARRIVE_WORLD_REINFORCE,
  shouldFlashVisitArriveWorldReinforce,
} from "@/lib/hud/visit-arrive-feedback";
import {
  NEARBY_PEER_WORLD_REINFORCE,
} from "@/lib/hud/nearby-peer-feedback";
import {
  CHAT_SEND_WORLD_REINFORCE,
  shouldFlashChatSendWorldReinforce,
} from "@/lib/hud/chat-send-feedback";
import {
  TRADE_ACCEPT_WORLD_REINFORCE,
  shouldFlashTradeAcceptWorldReinforce,
} from "@/lib/hud/trade-accept-feedback";
import {
  GUILD_BANK_DEPOSIT_WORLD_REINFORCE,
  shouldFlashGuildBankDepositWorldReinforce,
} from "@/lib/hud/guild-bank-deposit-feedback";
import {
  GUILD_BANK_WITHDRAW_WORLD_REINFORCE,
  shouldFlashGuildBankWithdrawWorldReinforce,
} from "@/lib/hud/guild-bank-withdraw-feedback";
import {
  INVITE_ACCEPT_WORLD_REINFORCE,
  shouldFlashInviteAcceptWorldReinforce,
} from "@/lib/hud/invite-accept-feedback";
import {
  MAIL_SEND_WORLD_REINFORCE,
  shouldFlashMailSendWorldReinforce,
} from "@/lib/hud/mail-send-feedback";
import {
  DECOR_PLACE_WORLD_REINFORCE,
  shouldFlashDecorPlaceWorldReinforce,
} from "@/lib/hud/decor-place-feedback";
import {
  TOOL_REPAIR_WORLD_REINFORCE,
  shouldFlashToolRepairWorldReinforce,
} from "@/lib/hud/tool-repair-feedback";
import {
  TOOL_EQUIP_WORLD_REINFORCE,
  shouldFlashToolEquipWorldReinforce,
} from "@/lib/hud/tool-equip-feedback";
import {
  TOOL_UNEQUIP_WORLD_REINFORCE,
  shouldFlashToolUnequipWorldReinforce,
} from "@/lib/hud/tool-unequip-feedback";
import {
  MAIL_CLAIM_WORLD_REINFORCE,
  shouldFlashMailClaimWorldReinforce,
} from "@/lib/hud/mail-claim-feedback";
import {
  VENDOR_BUY_WORLD_REINFORCE,
  shouldFlashVendorBuyWorldReinforce,
} from "@/lib/hud/vendor-buy-feedback";
import {
  ARENA_ENTER_WORLD_REINFORCE,
  shouldFlashArenaEnterWorldReinforce,
} from "@/lib/hud/arena-enter-feedback";
import {
  ARENA_LEAVE_WORLD_REINFORCE,
  shouldFlashArenaLeaveWorldReinforce,
} from "@/lib/hud/arena-leave-feedback";
import {
  SOFT_WAR_DELIVER_WORLD_REINFORCE,
  shouldFlashSoftWarDeliverWorldReinforce,
} from "@/lib/hud/soft-war-deliver-feedback";
import {
  softWarDeliverClosedGlanceLabel,
  shouldShowSoftWarDeliverClosedGlance,
} from "@/lib/hud/soft-war-deliver-closed-glance";
import {
  MAP_CHIP_ARRIVE_PULSE_MS,
  shouldPulseMapChipOnTravelArrive,
  shouldPulseMapChipOnVisitHomeReturn,
} from "@/lib/hud/topbar-chrome";
import { usePanelHotkeys } from "@/lib/hud/usePanelHotkeys";

const LandScene = dynamic(
  () =>
    import("@/components/land-scene/LandScene").then((mod) => mod.LandScene),
  { ssr: false, loading: () => <div className="panel">Loading starter land…</div> },
);

import {
  loadDismissedTips,
  saveDismissedTips,
  loadSeenNoticeTips,
  saveSeenNoticeTips,
  loadPortalWalkUpSeen,
  savePortalWalkUpSeen,
  loadExploreWalkUpSeen,
  saveExploreWalkUpSeen,
  loadArenaWalkUpSeen,
  saveArenaWalkUpSeen,
  loadEmptyLandBuildWalkUpSeen,
  saveEmptyLandBuildWalkUpSeen,
  loadVisitLandWalkUpSeen,
  saveVisitLandWalkUpSeen,
  loadWarriorMapWalkUpSeen,
  saveWarriorMapWalkUpSeen,
  loadCityHubWalkUpSeen,
  saveCityHubWalkUpSeen,
  loadMarketWalkUpSeen,
  saveMarketWalkUpSeen,
  loadVendorWalkUpSeen,
  saveVendorWalkUpSeen,
  loadFishingDockWalkUpSeen,
  saveFishingDockWalkUpSeen,
  loadAnimalPenWalkUpSeen,
  saveAnimalPenWalkUpSeen,
  loadTreeStumpWalkUpSeen,
  saveTreeStumpWalkUpSeen,
  loadOreNodeWalkUpSeen,
  saveOreNodeWalkUpSeen,
  loadCropPlotWalkUpSeen,
  saveCropPlotWalkUpSeen,
  loadHuntTrailWalkUpSeen,
  saveHuntTrailWalkUpSeen,
  loadKitchenWalkUpSeen,
  saveKitchenWalkUpSeen,
  loadNoticeBoardWalkUpSeen,
  saveNoticeBoardWalkUpSeen,
  loadExpandPadWalkUpSeen,
  saveExpandPadWalkUpSeen,
  loadMillWalkUpSeen,
  saveMillWalkUpSeen,
  loadWorkshopWalkUpSeen,
  saveWorkshopWalkUpSeen,
  loadForgeWalkUpSeen,
  saveForgeWalkUpSeen,
  loadLoomWalkUpSeen,
  saveLoomWalkUpSeen,
  loadAlchemyBenchWalkUpSeen,
  saveAlchemyBenchWalkUpSeen,
  loadDecorPadWalkUpSeen,
  saveDecorPadWalkUpSeen,
  loadTutorWalkUpSeen,
  saveTutorWalkUpSeen,
  loadClaimNodeWalkUpSeen,
  saveClaimNodeWalkUpSeen,
} from "@/lib/walkup-persistence";

function targetKey(t: InteractTarget | null): string | null {
  if (!t) return null;
  if (t.kind === "expand") return "expand";
  if (t.kind === "gate") return "gate";
  return `b:${t.building.id}`;
}

function withFreshBuilding(
  t: InteractTarget | null,
  buildings: BuildingDto[],
): InteractTarget | null {
  if (!t) return null;
  if (t.kind === "expand" || t.kind === "gate") return t;
  const fresh = buildings.find((b) => b.id === t.building.id);
  if (!fresh) return null;
  return { kind: "building", building: fresh, dist: t.dist };
}

/**
 * MMO-style client: move avatar, approach buildings, one surface at a time.
 */
export function GameApp() {
  const [state, setState] = useState<PlayerStateDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const {
    info,
    setInfo,
    promptPulse,
    flashSuccessCue,
    flashSuccessCueRef,
    successCueClearRef,
    promptPulseClearRef,
  } = useSuccessCue();
  const {
    visitLand,
    setVisitLand,
    visitLandRef,
    visitReceivedAtRef,
    applyVisitLand,
    clearVisitSilent,
  } = useVisitLandState();
  const {
    trades,
    setTrades,
    players,
    listings,
    setListings,
    mail,
    setMail,
    refreshPlayers,
    refreshMarket,
    refreshMail,
    refreshTrades,
  } = useEconomyPanels();
  const [panel, setPanel] = useState<HudPanelId>(null);
  const [craftStation, setCraftStation] = useState<StationId | null>(null);
  const [plantBuildingId, setPlantBuildingId] = useState<string | null>(null);
  const [placingKitInventoryId, setPlacingKitInventoryId] = useState<
    string | null
  >(null);
  const [placeFacing, setPlaceFacing] = useState(0);
  const [landEditorSelectedId, setLandEditorSelectedId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (panel !== "build") setLandEditorSelectedId(null);
  }, [panel]);

  useEffect(() => {
    if (!landEditorSelectedId || !state) return;
    if (!state.buildings.some((b) => b.id === landEditorSelectedId)) {
      setLandEditorSelectedId(null);
    }
  }, [landEditorSelectedId, state]);

  useEffect(() => {
    if (!placingKitInventoryId) return;
    function onKey(ev: KeyboardEvent) {
      if (ev.code === "Escape") {
        setPlacingKitInventoryId(null);
        setPlaceFacing(0);
      }
      if (ev.code === "KeyR") {
        setPlaceFacing((f) => (f + 1) % 4);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [placingKitInventoryId]);

  const placePreviewBuildingType = useMemo(() => {
    if (!placingKitInventoryId || !state) return null;
    const row = state.inventory.find((i) => i.id === placingKitInventoryId);
    if (!row) return null;
    return buildingTypeFromKitItemId(row.itemId);
  }, [placingKitInventoryId, state]);

  const [craftCompleteFlashStation, setCraftCompleteFlashStation] = useState<
    string | null
  >(null);
  const [craftCompleteFlashStartedAt, setCraftCompleteFlashStartedAt] =
    useState<number | null>(null);
  const craftCompleteFlashClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [stationUpgradeFlashBuildingId, setStationUpgradeFlashBuildingId] =
    useState<string | null>(null);
  const [stationUpgradeFlashStartedAt, setStationUpgradeFlashStartedAt] =
    useState<number | null>(null);
  const stationUpgradeFlashClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [gatherSuccessFlashBuildingId, setGatherSuccessFlashBuildingId] =
    useState<string | null>(null);
  const [gatherSuccessFlashStartedAt, setGatherSuccessFlashStartedAt] =
    useState<number | null>(null);
  const gatherSuccessFlashClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [fishCatchSplashBuildingId, setFishCatchSplashBuildingId] = useState<
    string | null
  >(null);
  const [fishCatchSplashStartedAt, setFishCatchSplashStartedAt] = useState<
    number | null
  >(null);
  const fishCatchSplashClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [buildPlaceSpawnFlashBuildingId, setBuildPlaceSpawnFlashBuildingId] =
    useState<string | null>(null);
  const [buildPlaceSpawnFlashStartedAt, setBuildPlaceSpawnFlashStartedAt] =
    useState<number | null>(null);
  const buildPlaceSpawnFlashClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [expandFieldFlashX, setExpandFieldFlashX] = useState<number | null>(
    null,
  );
  const [expandFieldFlashZ, setExpandFieldFlashZ] = useState<number | null>(
    null,
  );
  const [expandFieldFlashStartedAt, setExpandFieldFlashStartedAt] = useState<
    number | null
  >(null);
  const expandFieldFlashClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [craftBuildingId, setCraftBuildingId] = useState<string | null>(null);
  const [decorBuildingId, setDecorBuildingId] = useState<string | null>(null);
  const [target, setTarget] = useState<InteractTarget | null>(null);
  const targetRef = useRef<InteractTarget | null>(null);
  targetRef.current = target;
  const [hasMoved, setHasMoved] = useState(false);
  const [hasVendorVisit, setHasVendorVisit] = useState(false);
  const [dismissedTips, setDismissedTips] = useState<OnboardingTipId[]>([]);
  const [seenNoticeTips, setSeenNoticeTips] = useState<string[]>([]);
  const [portalWalkUpWorldTip, setPortalWalkUpWorldTip] = useState(false);
  const [exploreWalkUpWorldTip, setExploreWalkUpWorldTip] = useState(false);
  const [arenaWalkUpWorldTip, setArenaWalkUpWorldTip] = useState(false);
  const [emptyLandBuildWalkUpWorldTip, setEmptyLandBuildWalkUpWorldTip] =
    useState(false);
  const [visitLandWalkUpWorldTip, setVisitLandWalkUpWorldTip] = useState(false);
  const [visitHomeReturnWorldTip, setVisitHomeReturnWorldTip] = useState(false);
  const [visitHostNameplateReinforce, setVisitHostNameplateReinforce] =
    useState(false);
  const [warriorMapWalkUpWorldTip, setWarriorMapWalkUpWorldTip] =
    useState(false);
  const [cityHubWalkUpWorldTip, setCityHubWalkUpWorldTip] = useState(false);
  const [marketWalkUpWorldTip, setMarketWalkUpWorldTip] = useState(false);
  const [vendorWalkUpWorldTip, setVendorWalkUpWorldTip] = useState(false);
  const [fishingDockWalkUpWorldTip, setFishingDockWalkUpWorldTip] =
    useState(false);
  const [animalPenWalkUpWorldTip, setAnimalPenWalkUpWorldTip] = useState(false);
  const [treeStumpWalkUpWorldTip, setTreeStumpWalkUpWorldTip] = useState(false);
  const [oreNodeWalkUpWorldTip, setOreNodeWalkUpWorldTip] = useState(false);
  const [cropPlotWalkUpWorldTip, setCropPlotWalkUpWorldTip] = useState(false);
  const [huntTrailWalkUpWorldTip, setHuntTrailWalkUpWorldTip] = useState(false);
  const [combatHitAt, setCombatHitAt] = useState<number | null>(null);
  const [combatSwingAt, setCombatSwingAt] = useState<number | null>(null);
  const prevFoeHealthRef = useRef<number | null>(null);
  const combatBusyRef = useRef(false);
  const lastCombatAttackAtRef = useRef(0);
  const combatStartBusyRef = useRef(false);
  const combatTickInFlightRef = useRef(false);
  const tryAutoEngageCombatRef = useRef<() => void>(() => {});
  const [kitchenWalkUpWorldTip, setKitchenWalkUpWorldTip] = useState(false);
  const [noticeBoardWalkUpWorldTip, setNoticeBoardWalkUpWorldTip] =
    useState(false);
  const [expandPadWalkUpWorldTip, setExpandPadWalkUpWorldTip] = useState(false);
  const [millWalkUpWorldTip, setMillWalkUpWorldTip] = useState(false);
  const [workshopWalkUpWorldTip, setWorkshopWalkUpWorldTip] = useState(false);
  const [forgeWalkUpWorldTip, setForgeWalkUpWorldTip] = useState(false);
  const [loomWalkUpWorldTip, setLoomWalkUpWorldTip] = useState(false);
  const [alchemyBenchWalkUpWorldTip, setAlchemyBenchWalkUpWorldTip] =
    useState(false);
  const [decorPadWalkUpWorldTip, setDecorPadWalkUpWorldTip] = useState(false);
  const [tutorWalkUpWorldTip, setTutorWalkUpWorldTip] = useState(false);
  const [claimNodeWalkUpWorldTip, setClaimNodeWalkUpWorldTip] = useState(false);
  const [clientSettings, setClientSettings] = useState<ClientSettings>(() =>
    loadClientSettings(),
  );
  const audioRef = useRef<GameAudioController | null>(null);
  if (!audioRef.current) audioRef.current = createGameAudio();
  // Reason: PL27.2 — throttle chat receive pings across rapid socket lines.
  const chatReceivePingAtRef = useRef<number | null>(null);
  const {
    on: mapChipArrivePulse,
    flash: flashMapChipArrivePulse,
  } = useTimedFlag(MAP_CHIP_ARRIVE_PULSE_MS);
  const [eatSuccessWorldReinforce, setEatSuccessWorldReinforce] =
    useState(false);
  const eatSuccessWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [coinsGainWorldReinforce, setCoinsGainWorldReinforce] =
    useState(false);
  const coinsGainWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [cropPlantSuccessWorldReinforce, setCropPlantSuccessWorldReinforce] =
    useState(false);
  const cropPlantSuccessWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [cropReadyWorldReinforce, setCropReadyWorldReinforce] =
    useState(false);
  const cropReadyWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [cropHarvestWorldReinforce, setCropHarvestWorldReinforce] =
    useState(false);
  const cropHarvestWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [levelUpWorldReinforce, setLevelUpWorldReinforce] = useState(false);
  const levelUpWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [achievementUnlockWorldReinforce, setAchievementUnlockWorldReinforce] =
    useState(false);
  const achievementUnlockWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [titleChangeWorldReinforce, setTitleChangeWorldReinforce] =
    useState(false);
  const titleChangeWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [marketListWorldReinforce, setMarketListWorldReinforce] =
    useState(false);
  const marketListWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [questClaimWorldReinforce, setQuestClaimWorldReinforce] =
    useState(false);
  const questClaimWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [visitHomeReturnWorldReinforce, setVisitHomeReturnWorldReinforce] =
    useState(false);
  const visitHomeReturnWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [visitArriveWorldReinforce, setVisitArriveWorldReinforce] =
    useState(false);
  const visitArriveWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [nearbyPeerWorldReinforce, setNearbyPeerWorldReinforce] =
    useState(false);
  const nearbyPeerWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [chatSendWorldReinforce, setChatSendWorldReinforce] =
    useState(false);
  const chatSendWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [tradeAcceptWorldReinforce, setTradeAcceptWorldReinforce] =
    useState(false);
  const tradeAcceptWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [guildBankDepositWorldReinforce, setGuildBankDepositWorldReinforce] =
    useState(false);
  const guildBankDepositWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [guildBankWithdrawWorldReinforce, setGuildBankWithdrawWorldReinforce] =
    useState(false);
  const guildBankWithdrawWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [inviteAcceptWorldReinforce, setInviteAcceptWorldReinforce] =
    useState(false);
  const inviteAcceptWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [mailSendWorldReinforce, setMailSendWorldReinforce] =
    useState(false);
  const mailSendWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [decorPlaceWorldReinforce, setDecorPlaceWorldReinforce] =
    useState(false);
  const decorPlaceWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [toolRepairWorldReinforce, setToolRepairWorldReinforce] =
    useState(false);
  const toolRepairWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [toolEquipWorldReinforce, setToolEquipWorldReinforce] =
    useState(false);
  const toolEquipWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [toolUnequipWorldReinforce, setToolUnequipWorldReinforce] =
    useState(false);
  const toolUnequipWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [mailClaimWorldReinforce, setMailClaimWorldReinforce] =
    useState(false);
  const mailClaimWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [vendorBuyWorldReinforce, setVendorBuyWorldReinforce] =
    useState(false);
  const vendorBuyWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [marketBuyWorldReinforce, setMarketBuyWorldReinforce] =
    useState(false);
  const marketBuyWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [vendorSellWorldReinforce, setVendorSellWorldReinforce] =
    useState(false);
  const vendorSellWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [marketCancelWorldReinforce, setMarketCancelWorldReinforce] =
    useState(false);
  const marketCancelWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [tradeCancelWorldReinforce, setTradeCancelWorldReinforce] =
    useState(false);
  const tradeCancelWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [mailCancelWorldReinforce, setMailCancelWorldReinforce] =
    useState(false);
  const mailCancelWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [guildCreateWorldReinforce, setGuildCreateWorldReinforce] =
    useState(false);
  const guildCreateWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [guildLeaveWorldReinforce, setGuildLeaveWorldReinforce] =
    useState(false);
  const guildLeaveWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [huntWinWorldReinforce, setHuntWinWorldReinforce] = useState(false);
  const huntWinWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [huntLoseWorldReinforce, setHuntLoseWorldReinforce] = useState(false);
  const huntLoseWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [craftCompleteWorldReinforce, setCraftCompleteWorldReinforce] =
    useState(false);
  const craftCompleteWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [softRefuseBusyWorldReinforce, setSoftRefuseBusyWorldReinforce] =
    useState(false);
  const softRefuseBusyWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [muteWorldReinforce, setMuteWorldReinforce] = useState(false);
  const muteWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [gatherSuccessWorldReinforce, setGatherSuccessWorldReinforce] =
    useState(false);
  const gatherSuccessWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [fishCatchWorldReinforce, setFishCatchWorldReinforce] =
    useState(false);
  const fishCatchWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [stationUpgradeWorldReinforce, setStationUpgradeWorldReinforce] =
    useState(false);
  const stationUpgradeWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [expandFieldWorldReinforce, setExpandFieldWorldReinforce] =
    useState(false);
  const expandFieldWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [dayPhaseWorldReinforce, setDayPhaseWorldReinforce] = useState(false);
  const dayPhaseWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [travelArriveWorldReinforce, setTravelArriveWorldReinforce] =
    useState(false);
  const travelArriveWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [dayNightEnableWorldReinforce, setDayNightEnableWorldReinforce] =
    useState(false);
  const dayNightEnableWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [scarceFreeSettleWorldReinforce, setScarceFreeSettleWorldReinforce] =
    useState(false);
  const scarceFreeSettleWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [scarceBusyWorldReinforce, setScarceBusyWorldReinforce] =
    useState(false);
  const scarceBusyWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [deedClaimWorldReinforce, setDeedClaimWorldReinforce] = useState(false);
  const deedClaimWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [deedMintWorldReinforce, setDeedMintWorldReinforce] = useState(false);
  const deedMintWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [walletLinkWorldReinforce, setWalletLinkWorldReinforce] =
    useState(false);
  const walletLinkWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [walletDisconnectWorldReinforce, setWalletDisconnectWorldReinforce] =
    useState(false);
  const walletDisconnectWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [arenaEnterWorldReinforce, setArenaEnterWorldReinforce] =
    useState(false);
  const arenaEnterWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [arenaLeaveWorldReinforce, setArenaLeaveWorldReinforce] =
    useState(false);
  const arenaLeaveWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [softWarDeliverWorldReinforce, setSoftWarDeliverWorldReinforce] =
    useState(false);
  const softWarDeliverWorldReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const {
    on: inventoryOpenAccent,
    flash: flashInventoryOpenAccent,
    clear: clearInventoryOpenAccent,
  } = useTimedFlag(INVENTORY_OPEN_ACCENT_MS);
  // Reason: PL128.2 — brief slot flash ids after bag inflow (gather/craft/buy).
  const [inventoryPickupFlashIds, setInventoryPickupFlashIds] = useState<
    string[]
  >([]);
  const inventoryPickupFlashClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  // Reason: PL198.2 — quiet I · Bag TopBar glance after recent pickup while bag closed.
  const [inventoryPickupIdleGlance, setInventoryPickupIdleGlance] =
    useState(false);
  const inventoryPickupIdleGlanceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const {
    on: vendorOpenAccent,
    flash: flashVendorOpenAccent,
    clear: clearVendorOpenAccent,
  } = useTimedFlag(ECONOMY_PANEL_OPEN_ACCENT_MS);
  const {
    on: marketOpenAccent,
    flash: flashMarketOpenAccent,
    clear: clearMarketOpenAccent,
  } = useTimedFlag(ECONOMY_PANEL_OPEN_ACCENT_MS);
  const {
    on: buildOpenAccent,
    flash: flashBuildOpenAccent,
    clear: clearBuildOpenAccent,
  } = useTimedFlag(WORKSPACE_PANEL_OPEN_ACCENT_MS);
  const {
    on: craftOpenAccent,
    flash: flashCraftOpenAccent,
    clear: clearCraftOpenAccent,
  } = useTimedFlag(WORKSPACE_PANEL_OPEN_ACCENT_MS);
  const {
    on: travelOpenAccent,
    flash: flashTravelOpenAccent,
    clear: clearTravelOpenAccent,
  } = useTimedFlag(WORKSPACE_PANEL_OPEN_ACCENT_MS);
  const {
    on: tradeOpenAccent,
    flash: flashTradeOpenAccent,
    clear: clearTradeOpenAccent,
  } = useTimedFlag(SOCIAL_PANEL_OPEN_ACCENT_MS);
  const {
    on: questOpenAccent,
    flash: flashQuestOpenAccent,
    clear: clearQuestOpenAccent,
  } = useTimedFlag(SOCIAL_PANEL_OPEN_ACCENT_MS);
  const {
    on: mailOpenAccent,
    flash: flashMailOpenAccent,
    clear: clearMailOpenAccent,
  } = useTimedFlag(SOCIAL_PANEL_OPEN_ACCENT_MS);
  const {
    on: decorOpenAccent,
    flash: flashDecorOpenAccent,
    clear: clearDecorOpenAccent,
  } = useTimedFlag(WORKSPACE_PANEL_OPEN_ACCENT_MS);
  const {
    on: noticeOpenAccent,
    flash: flashNoticeOpenAccent,
    clear: clearNoticeOpenAccent,
  } = useTimedFlag(SOCIAL_PANEL_OPEN_ACCENT_MS);
  const {
    on: chatOpenAccent,
    flash: flashChatOpenAccent,
    clear: clearChatOpenAccent,
  } = useTimedFlag(SOCIAL_PANEL_OPEN_ACCENT_MS);
  const {
    on: settingsOpenAccent,
    flash: flashSettingsOpenAccent,
    clear: clearSettingsOpenAccent,
  } = useTimedFlag(INVENTORY_OPEN_ACCENT_MS);
  const {
    on: muteEnableConfirm,
    flash: flashMuteEnableConfirm,
  } = useTimedFlag(MUTE_ENABLE_CONFIRM_MS);
  const {
    on: dayNightEnableConfirm,
    flash: flashDayNightEnableConfirm,
  } = useTimedFlag(DAY_NIGHT_ENABLE_CONFIRM_MS);
  const {
    on: tipsEnableConfirm,
    flash: flashTipsEnableConfirm,
  } = useTimedFlag(TIPS_ENABLE_CONFIRM_MS);
  const {
    on: guildOpenAccent,
    flash: flashGuildOpenAccentBase,
    clear: clearGuildOpenAccent,
  } = useTimedFlag(INVENTORY_OPEN_ACCENT_MS);
  const {
    on: guildMembershipOpenAccent,
    flash: flashGuildMembershipOpenAccent,
    clear: clearGuildMembershipOpenAccent,
  } = useTimedFlag(INVENTORY_OPEN_ACCENT_MS);
  const {
    on: achievementsOpenAccent,
    flash: flashAchievementsOpenAccent,
    clear: clearAchievementsOpenAccent,
  } = useTimedFlag(INVENTORY_OPEN_ACCENT_MS);
  const {
    on: arenaOpenAccent,
    flash: flashArenaOpenAccent,
    clear: clearArenaOpenAccent,
  } = useTimedFlag(WORKSPACE_PANEL_OPEN_ACCENT_MS);
  const {
    on: tutorialNpcOpenAccent,
    flash: flashTutorialNpcOpenAccent,
    clear: clearTutorialNpcOpenAccent,
  } = useTimedFlag(SOCIAL_PANEL_OPEN_ACCENT_MS);
  const {
    on: deedOpenAccent,
    flash: flashDeedOpenAccent,
    clear: clearDeedOpenAccent,
  } = useTimedFlag(INVENTORY_OPEN_ACCENT_MS);
  const [creditcoinContracts, setCreditcoinContracts] = useState<{
    realmToken?: string | null;
    landNft?: string | null;
    marketplace?: string | null;
  } | null>(null);
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; username: string; text: string; t: number }>
  >([]);
  const [guildChatMessages, setGuildChatMessages] = useState<
    Array<{ id: string; username: string; text: string; t: number }>
  >([]);
  const chatMessagesRef = useRef(chatMessages);
  chatMessagesRef.current = chatMessages;
  const guildChatMessagesRef = useRef(guildChatMessages);
  guildChatMessagesRef.current = guildChatMessages;
  const [chatChannel, setChatChannel] = useState<ChatChannel>("world");
  const [guilds, setGuilds] = useState<Array<{ name: string; members: number }>>(
    [],
  );
  const [guildMembers, setGuildMembers] = useState<
    Array<{ username: string; rank: GuildRank }>
  >([]);
  const [guildBank, setGuildBank] = useState<
    Array<{ itemId: string; qty: number }>
  >([]);
  /** PL189.2 — unanswered soft guild invite offers (client-staged). */
  const [pendingGuildInvites, setPendingGuildInvites] = useState<
    PendingGuildInvite[]
  >([]);
  /** PL195.2 — new achievement unlocks awaiting A panel review (client-staged). */
  const [pendingAchievementUnlocks, setPendingAchievementUnlocks] = useState<
    PendingAchievementUnlock[]
  >([]);
  /** PL197.1 — unread world/guild chat lines awaiting C panel review (client-staged). */
  const [pendingChatGlanceLines, setPendingChatGlanceLines] = useState<
    PendingChatGlanceLine[]
  >([]);
  const [quests, setQuests] = useState<
    Array<{
      id: string;
      title: string;
      blurb: string;
      status: import("@game/shared").QuestStatus;
      rewardCoins: number;
      rewardCharacterXp: number;
      claimAtNpc?: string;
    }>
  >([]);
  const [tutorialNpc, setTutorialNpc] = useState<
    import("@/lib/api").TutorialNpcView | null
  >(null);
  const [tutorialProfessionId, setTutorialProfessionId] = useState<string | null>(
    null,
  );
  const tutorialProfessionIdRef = useRef(tutorialProfessionId);
  tutorialProfessionIdRef.current = tutorialProfessionId;
  /** PL30.3 — city tutors with claimable objectives (world pad/halo). */
  const [tutorClaimableIds, setTutorClaimableIds] = useState<string[]>([]);
  /** When set, market panel was opened at a city board and closes on walk-away. */
  const [marketBoardId, setMarketBoardId] = useState<string | null>(null);
  /** When set, deeds panel was opened at the REALM stall and closes on walk-away. */
  const [realmMarketId, setRealmMarketId] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<
    Array<{
      id: string;
      title: string;
      blurb: string;
      counter: number;
      target: number;
      unlocked: boolean;
      unlockedAt: number | null;
    }>
  >([]);
  /** PL47.2 — null until first achievements hydrate (skip unlock flash on load). */
  const achievementsRef = useRef<typeof achievements | null>(null);
  /** PL47.1 — prior characterLevel for post-render Level N flash (after action cues). */
  const characterLevelCueRef = useRef<number | null>(null);
  /** PL49.1 — prior cosmetic title for post-render title-change flash. */
  const characterTitleCueRef = useRef<string | null>(null);
  /** PL49.2 — prior extra-decor unlock for one-shot pad tip. */
  const extraDecorPadUnlockCueRef = useRef<boolean | null>(null);
  const [deedMarket, setDeedMarket] = useState<
    Array<{
      id: string;
      title: string;
      landId: string;
      landKind: string;
      createdAt: number;
      status: string;
      listPriceCoins: number | null;
      mintTxStub: string | null;
      sellerUsername?: string;
    }>
  >([]);
  const [chainMarket, setChainMarket] = useState<{
    network: string;
    listings: Array<{
      id: string;
      title: string;
      seller: string;
      landKind: string;
      softPriceCoins: number;
      chainPriceWei: string;
      mintTxStub: string | null;
      source: "live_listing" | "catalog_floor";
    }>;
  }>({ network: "stub-testnet", listings: [] });
  const [presenceOthers, setPresenceOthers] = useState<
    Array<{ username: string; x: number; z: number }>
  >([]);

  const buildingsRef = useRef<BuildingDto[]>([]);
  const stateRef = useRef<PlayerStateDto | null>(null);
  const panelRef = useRef<HudPanelId>(null);
  const targetKeyRef = useRef<string | null>(null);
  const portalNearRef = useRef(false);
  const portalWalkUpSeenRef = useRef(false);
  const portalWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const exploreWalkUpSeenRef = useRef(false);
  const exploreWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const arenaNearRef = useRef(false);
  const arenaWalkUpSeenRef = useRef(false);
  const arenaWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const buildBoardNearRef = useRef(false);
  const emptyLandBuildWalkUpSeenRef = useRef(false);
  const emptyLandBuildWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const visitLandWalkUpSeenRef = useRef(false);
  const visitLandWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const visitHomeReturnClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const visitHostNameplateReinforceClearRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const warriorMapWalkUpSeenRef = useRef(false);
  const warriorMapWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const cityHubWalkUpSeenRef = useRef(false);
  const cityHubWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const marketNearRef = useRef(false);
  const marketWalkUpSeenRef = useRef(false);
  const marketWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const vendorNearRef = useRef(false);
  const vendorWalkUpSeenRef = useRef(false);
  const vendorWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const fishingDockNearRef = useRef(false);
  const fishingDockWalkUpSeenRef = useRef(false);
  const fishingDockWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const animalPenNearRef = useRef(false);
  const animalPenWalkUpSeenRef = useRef(false);
  const animalPenWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const treeStumpNearRef = useRef(false);
  const treeStumpWalkUpSeenRef = useRef(false);
  const treeStumpWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const oreNodeNearRef = useRef(false);
  const oreNodeWalkUpSeenRef = useRef(false);
  const oreNodeWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const cropPlotNearRef = useRef(false);
  const cropPlotWalkUpSeenRef = useRef(false);
  const cropPlotWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const huntTrailNearRef = useRef(false);
  const huntTrailWalkUpSeenRef = useRef(false);
  const huntTrailWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const kitchenNearRef = useRef(false);
  const kitchenWalkUpSeenRef = useRef(false);
  const kitchenWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const noticeBoardNearRef = useRef(false);
  const noticeBoardWalkUpSeenRef = useRef(false);
  const noticeBoardWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const expandPadNearRef = useRef(false);
  const expandPadWalkUpSeenRef = useRef(false);
  const expandPadWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const millNearRef = useRef(false);
  const millWalkUpSeenRef = useRef(false);
  const millWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const workshopNearRef = useRef(false);
  const workshopWalkUpSeenRef = useRef(false);
  const workshopWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const forgeNearRef = useRef(false);
  const forgeWalkUpSeenRef = useRef(false);
  const forgeWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const loomNearRef = useRef(false);
  const loomWalkUpSeenRef = useRef(false);
  const loomWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alchemyBenchNearRef = useRef(false);
  const alchemyBenchWalkUpSeenRef = useRef(false);
  const alchemyBenchWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const decorPadNearRef = useRef(false);
  const decorPadWalkUpSeenRef = useRef(false);
  const decorPadWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const tutorNearRef = useRef(false);
  const tutorWalkUpSeenRef = useRef(false);
  const tutorWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const claimNodeNearRef = useRef(false);
  const claimNodeWalkUpSeenRef = useRef(false);
  const claimNodeWalkUpClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const dayPhaseLabelRef = useRef<string | null>(null);
  const [hudDayPhaseLabel, setHudDayPhaseLabel] = useState("Day");
  /** PL60.1 — prior ready crop plot ids; null until first gameNow sample. */
  const cropReadyIdsRef = useRef<Set<string> | null>(null);
  /** PL65.1 — prior post-cooldown ready stump ids; null until first sample. */
  const woodStumpReadyIdsRef = useRef<Set<string> | null>(null);
  /** PL65.2 — prior post-cooldown ready dock ids; null until first sample. */
  const fishingDockReadyIdsRef = useRef<Set<string> | null>(null);
  /** PL69.1 — prior post-cooldown ready ore ids; null until first sample. */
  const oreNodeReadyIdsRef = useRef<Set<string> | null>(null);
  /** PL69.2 — prior post-cooldown ready pen ids; null until first sample. */
  const animalPenReadyIdsRef = useRef<Set<string> | null>(null);
  /** PL72.2 — prior claimable tutor profession ids; null until first tutorial refresh. */
  const tutorClaimableIdsRef = useRef<Set<string> | null>(null);
  /** PL60.1 / PL65 / PL69 — land identity for reseeding ready-sets across travel / visit. */
  const cropReadyLandKeyRef = useRef<string | null>(null);
  const clientSettingsRef = useRef(clientSettings);
  clientSettingsRef.current = clientSettings;
  const spawnRef = useRef({ x: 0.5, z: 3.2 });
  const playerPosRef = useRef({ x: 0.5, z: 3.2 });
  const receivedAtRef = useRef(Date.now());
  const serverNowRef = useRef(Date.now());
  const gameNowRef = useRef(Date.now());
  const gameSocketRef = useRef<ReturnType<typeof connectGameSocket> | null>(
    null,
  );

  const refreshChat = useCallback(async (authToken: string) => {
    const res = await apiListChat(authToken);
    if (res.ok && res.messages) setChatMessages(res.messages);
  }, []);

  const refreshGuildChat = useCallback(async (authToken: string) => {
    const res = await apiListGuildChat(authToken);
    if (res.ok && res.messages) setGuildChatMessages(res.messages);
    else setGuildChatMessages([]);
  }, []);

  const refreshGuilds = useCallback(async (authToken: string) => {
    const res = await apiListGuilds(authToken);
    if (res.ok && res.guilds) setGuilds(res.guilds);
    const mem = await apiListGuildMembers(authToken);
    if (mem.ok && mem.members) {
      setGuildMembers(
        mem.members.map((m) => ({
          username: m.username,
          rank: m.rank as GuildRank,
        })),
      );
    } else setGuildMembers([]);
    const bankRes = await apiListGuildBank(authToken);
    if (bankRes.ok && bankRes.bank) setGuildBank(bankRes.bank);
    else setGuildBank([]);
  }, []);

  const refreshQuests = useCallback(async (authToken: string) => {
    const res = await apiListQuests(authToken);
    if (res.ok && res.quests) {
      setQuests(
        res.quests.map((q) => ({
          ...q,
          status: q.status as import("@game/shared").QuestStatus,
        })),
      );
    }
  }, []);

  const refreshAchievements = useCallback(
    async (
      authToken: string,
      opts?: { flashUnlocks?: boolean },
    ) => {
      const res = await apiListAchievements(authToken);
      if (!res.ok || !res.achievements) return;
      const prev = achievementsRef.current;
      const flashUnlocks = opts?.flashUnlocks === true;
      // Reason: PL47.2 — ephemeral Unlocked · title when a stub flips; A list unchanged.
      // Reason: PL136.1 — soft world rim pairs with Unlocked · (same flashUnlocks gate).
      if (flashUnlocks) {
        const titles = newlyUnlockedAchievementTitles(prev, res.achievements);
        if (titles.length > 0) {
          flashSuccessCueRef.current?.(
            achievementUnlockSuccessCueText(titles[0]),
          );
        }
        if (shouldFlashAchievementUnlockWorldReinforce(titles)) {
          if (achievementUnlockWorldReinforceClearRef.current) {
            clearTimeout(achievementUnlockWorldReinforceClearRef.current);
          }
          setAchievementUnlockWorldReinforce(true);
          achievementUnlockWorldReinforceClearRef.current = setTimeout(() => {
            setAchievementUnlockWorldReinforce(false);
            achievementUnlockWorldReinforceClearRef.current = null;
          }, ACHIEVEMENT_UNLOCK_WORLD_REINFORCE.durationMs);
        }
        // Reason: PL195.2 — stage new unlocks for J · Unlock glance until panel opens.
        const glanceRows = newlyUnlockedAchievementGlanceRows(
          prev,
          res.achievements,
        );
        if (glanceRows.length > 0) {
          setPendingAchievementUnlocks((cur) =>
            mergePendingAchievementUnlocks(cur, glanceRows),
          );
        }
      }
      setAchievements(res.achievements);
      achievementsRef.current = res.achievements;
    },
    [],
  );

  const refreshTutorClaimable = useCallback(async (authToken: string) => {
    // Reason: PL30.3 — city walk-up claim accent without a HUD column.
    // Reason: PL72.2 — brief TopBar Claim when a tutor first edges into claimable.
    const res = await apiListTutorialNpcs(authToken);
    if (res.ok && res.npcs) {
      const nextIds = tutorClaimableProfessionIds(res.npcs);
      const nextSet = new Set(nextIds);
      const prev = tutorClaimableIdsRef.current;
      if (shouldFlashTutorClaimReadyEdgeCue(prev, nextSet)) {
        flashSuccessCueRef.current?.(tutorClaimReadyEdgeCueText());
      }
      tutorClaimableIdsRef.current = nextSet;
      setTutorClaimableIds(nextIds);
    }
  }, []);

  const refreshDeedMarket = useCallback(async (authToken: string) => {
    const res = await apiListDeedMarket(authToken);
    if (res.ok && res.listings) setDeedMarket(res.listings);
    const chain = await apiChainMarketplace();
    if (chain.ok && chain.listings) {
      setChainMarket({
        network: chain.network ?? "stub-testnet",
        listings: chain.listings,
      });
    }
  }, []);

  const refresh = useCallback(async (authToken: string) => {
    const res = await apiMe(authToken);
    if (res.ok && res.state) {
      receivedAtRef.current = Date.now();
      serverNowRef.current = res.state.serverNow;
      setState(res.state);
      stateRef.current = res.state;
      buildingsRef.current = res.state.buildings;
      // Reason: PL17.1 — keep pending inbox known for mail panel unread accent.
      void refreshMail(authToken);
      // Reason: PL30.3 — tutor claimable world accent on city silhouettes.
      void refreshTutorClaimable(authToken);
      void refreshQuests(authToken);
      // Reason: PL47.2 — hydrate achievement stubs without unlock flash on login.
      void refreshAchievements(authToken, { flashUnlocks: false });
    } else setError(res.error ?? "Failed to load state");
    await refreshTrades(authToken);
    await refreshPlayers(authToken);
    await refreshMarket(authToken);
  }, [refreshPlayers, refreshMarket, refreshMail, refreshTrades, refreshTutorClaimable, refreshAchievements, refreshQuests]);

  const {
    token,
    username,
    setUsername,
    password,
    setPassword,
    handleAuth,
    clearAuthSession,
  } = useGameAuth({
    refresh,
    setBusy: (next) => {
      busyRef.current = next;
      setBusy(next);
    },
    setError,
  });
  const tokenRef = useRef(token);
  tokenRef.current = token;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.setMuted(clientSettings.muteAudio);
    // Reason: looping map music — land / city / wilds (explore+arena) beds.
    const bgmKind = visitLand?.landKind ?? state?.landKind ?? "player_land";
    audio.setBgmLandKind(bgmKind);
    if (!clientSettings.muteAudio && token) audio.startBgm();
    if (!token) audio.stopBgm();
  }, [
    clientSettings.muteAudio,
    token,
    state?.landKind,
    visitLand?.landKind,
  ]);

  useEffect(() => {
    return () => {
      audioRef.current?.stopBgm();
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    const id = window.setInterval(() => {
      // Reason: RF4.2 — slower full-state poll; mutations already refresh; skip when tab hidden.
      if (typeof document !== "undefined" && document.hidden) return;
      if (visitLandRef.current) {
        const owner = visitLandRef.current.ownerUsername;
        void apiVisitLand(token, owner).then((res) => {
          if (res.ok && res.land) {
            visitReceivedAtRef.current = Date.now();
            setVisitLand(res.land);
          }
        });
        return;
      }
      void refresh(token);
    }, 12_000);
    return () => window.clearInterval(id);
  }, [token, refresh]);

  // Reason: HUD remaining-time ticks live in TickingInteractPrompt / LandScene,
  // not a GameApp setState loop — that loop delayed E interact by seconds.

  // RF4.1 — presence WS-primary; HTTP only when socket not ready.
  useEffect(() => {
    if (!token || !state) return;
    const tick = () => {
      const landId = visitLandRef.current?.landId ?? state.landId;
      const pos = playerPosRef.current;
      const sock = gameSocketRef.current;
      if (sock?.ready()) {
        sock.sendPresence(pos.x, pos.z);
        return;
      }
      void apiReportPresence(token, { landId, x: pos.x, z: pos.z }).then(
        (res) => {
          if (res.ok && res.others) {
            setPresenceOthers(
              mergeRemotePresence(
                res.others.map((o) => ({
                  username: o.username,
                  x: o.x,
                  z: o.z,
                })),
              ),
            );
          }
        },
      );
    };
    tick();
    const id = window.setInterval(tick, 3000);
    return () => window.clearInterval(id);
  }, [token, state?.landId, visitLand?.landId]);

  // CL1.3 — drop remote avatars when the active map/land changes.
  useEffect(() => {
    setPresenceOthers([]);
  }, [state?.landId, visitLand?.landId]);

  // F8.3 — subscribe land channel for live presence + chat push (keyed by active land).
  useEffect(() => {
    if (!token || !state) return;
    const landId = visitLand?.landId ?? state.landId;
    const me = state.username;
    const conn = connectGameSocket(token, landId, {
      onMessage(msg) {
        if (msg.type === "presence" || msg.type === "joined") {
          const raw = msg.others ?? [];
          setPresenceOthers(
            mergeRemotePresence(
              raw
                .filter((o) => o.username !== me)
                .map((o) => ({ username: o.username, x: o.x, z: o.z })),
            ),
          );
        }
        if (msg.type === "chat" && msg.message) {
          const incoming = msg.message;
          if (chatMessagesRef.current.some((m) => m.id === incoming.id)) {
            // duplicate push — keep list quiet
          } else {
            const next = [...chatMessagesRef.current, incoming].slice(-80);
            chatMessagesRef.current = next;
            setChatMessages(next);
            // Reason: PL197.1 — stage unread world line for C · Chat glance while panel closed.
            if (
              panelRef.current !== "chat" &&
              shouldStageChatPendingClosedGlance({
                messageId: incoming.id,
                fromUsername: incoming.username,
                selfUsername: me,
              })
            ) {
              setPendingChatGlanceLines((prev) =>
                mergePendingChatGlanceLine(prev, {
                  id: incoming.id,
                  channel: "world",
                }),
              );
            }
            // Reason: PL27.2 — quiet ping while chat panel closed; own/cooldown silent.
            if (
              shouldPlayChatReceivePing({
                chatPanelOpen: panelRef.current === "chat",
                fromUsername: incoming.username,
                selfUsername: me,
              }) &&
              shouldAllowChatReceivePingAt(
                Date.now(),
                chatReceivePingAtRef.current,
              )
            ) {
              chatReceivePingAtRef.current = Date.now();
              audioRef.current?.playSfx("chat");
              flashSuccessCueRef.current(chatReceiveSuccessCueText());
            }
          }
        }
        if (msg.type === "guild_chat" && msg.message) {
          const incoming = msg.message;
          if (guildChatMessagesRef.current.some((m) => m.id === incoming.id)) {
            // duplicate push — keep list quiet
          } else {
            const next = [...guildChatMessagesRef.current, incoming].slice(-80);
            guildChatMessagesRef.current = next;
            setGuildChatMessages(next);
            // Reason: PL197.1 — stage unread guild line for C · Chat glance while panel closed.
            if (
              panelRef.current !== "chat" &&
              shouldStageChatPendingClosedGlance({
                messageId: incoming.id,
                fromUsername: incoming.username,
                selfUsername: me,
              })
            ) {
              setPendingChatGlanceLines((prev) =>
                mergePendingChatGlanceLine(prev, {
                  id: incoming.id,
                  channel: "guild",
                }),
              );
            }
            // Reason: PL27.2 — same quiet ping for guild lines while panel closed.
            if (
              shouldPlayChatReceivePing({
                chatPanelOpen: panelRef.current === "chat",
                fromUsername: incoming.username,
                selfUsername: me,
              }) &&
              shouldAllowChatReceivePingAt(
                Date.now(),
                chatReceivePingAtRef.current,
              )
            ) {
              chatReceivePingAtRef.current = Date.now();
              audioRef.current?.playSfx("chat");
              flashSuccessCueRef.current(chatReceiveSuccessCueText());
            }
          }
        }
        if (msg.type === "authed" && msg.chat) {
          setChatMessages(msg.chat);
        }
        if (msg.type === "trade_invite") {
          // Reason: PL18.1 — soft SFX + ephemeral TopBar cue; no always-on trade column.
          audioRef.current?.playSfx("trade_invite");
          const cue = tradeInviteReceiveCueText(msg.fromUsername);
          if (cue) flashSuccessCueRef.current(cue);
          if (token) {
            void apiListTrades(token).then((res) => {
              if (res.ok && res.trades) setTrades(res.trades);
            });
          }
        }
        if (msg.type === "guild_invite") {
          // Reason: PL189.2 — stage unanswered soft offer for G · Invite glance; join-by-code SoT.
          setPendingGuildInvites((prev) =>
            mergePendingGuildInvite(prev, {
              code: msg.code,
              fromUsername: msg.fromUsername,
              guildName: msg.guildName,
            }),
          );
        }
      },
    });
    gameSocketRef.current = conn;
    return () => {
      gameSocketRef.current = null;
      conn.dispose();
    };
  }, [token, state?.landId, state?.username, visitLand?.landId]);

  // Reason: PL189.2 — membership clears unanswered soft offers (join-by-code SoT).
  useEffect(() => {
    if (state?.guildName) setPendingGuildInvites([]);
  }, [state?.guildName]);

  const gameNow = useMemo(() => {
    if (visitLand) {
      return syncedNow(visitLand.serverNow, visitReceivedAtRef.current);
    }
    if (!state) return Date.now();
    return syncedNow(serverNowRef.current, receivedAtRef.current);
  }, [state, visitLand]);

  // Reason: PL57.2 — brief TopBar when cosmetic phase edges into Dawn/Dusk/Night; Day stays quiet.
  // Reason: PL160.2 — brief soft twilight rim beside TopBar phase cue; clocks unchanged.
  useEffect(() => {
    if (!state) return;
    function sampleDayPhase() {
      const snap = stateRef.current;
      if (!snap) return;
      const landKind =
        visitLandRef.current?.landKind ?? snap.landKind ?? "player_land";
      const template = sceneTemplateForLandKind(landKind);
      const enabled = clientSettingsRef.current.dayNightCycle;
      const now = visitLandRef.current
        ? syncedNow(
            visitLandRef.current.serverNow,
            visitReceivedAtRef.current,
          )
        : syncedNow(serverNowRef.current, receivedAtRef.current);
      const nextLabel = dayNightPalette(now, template, enabled).label;
      const prevLabel = dayPhaseLabelRef.current;
      if (
        shouldFlashDayPhaseChangeCue(prevLabel, nextLabel, enabled)
      ) {
        const cue = dayPhaseChangeCueText(nextLabel);
        if (cue) flashSuccessCueRef.current?.(cue);
      }
      if (shouldFlashDayPhaseWorldReinforce(prevLabel, nextLabel, enabled)) {
        if (dayPhaseWorldReinforceClearRef.current) {
          clearTimeout(dayPhaseWorldReinforceClearRef.current);
        }
        setDayPhaseWorldReinforce(true);
        dayPhaseWorldReinforceClearRef.current = setTimeout(() => {
          setDayPhaseWorldReinforce(false);
          dayPhaseWorldReinforceClearRef.current = null;
        }, DAY_PHASE_WORLD_REINFORCE.durationMs);
      }
      dayPhaseLabelRef.current = nextLabel;
      setHudDayPhaseLabel((prev) => (prev === nextLabel ? prev : nextLabel));
    }
    sampleDayPhase();
    const id = window.setInterval(sampleDayPhase, 2000);
    return () => window.clearInterval(id);
  }, [state, visitLand, clientSettings.dayNightCycle]);

  // Reason: PL60.1 / PL65 / PL69 — brief TopBar when crop/stump/dock/ore/pen edges into ready; world labels stay.
  useEffect(() => {
    if (!state) return;
    function sampleReadyEdges() {
      const snap = stateRef.current;
      if (!snap) return;
      const buildings = visitLandRef.current?.buildings ?? snap.buildings;
      const landKey = visitLandRef.current
        ? `visit:${visitLandRef.current.landId}`
        : `own:${snap.landId}:${snap.landKind ?? "player_land"}`;
      if (cropReadyLandKeyRef.current !== landKey) {
        cropReadyLandKeyRef.current = landKey;
        cropReadyIdsRef.current = null;
        woodStumpReadyIdsRef.current = null;
        fishingDockReadyIdsRef.current = null;
        oreNodeReadyIdsRef.current = null;
        animalPenReadyIdsRef.current = null;
      }
      const now = visitLandRef.current
        ? syncedNow(
            visitLandRef.current.serverNow,
            visitReceivedAtRef.current,
          )
        : syncedNow(serverNowRef.current, receivedAtRef.current);
      gameNowRef.current = now;
      const nextCropIds = new Set(readyCropPlotIds(buildings, now));
      const prevCropIds = cropReadyIdsRef.current;
      if (shouldFlashCropReadyEdgeCue(prevCropIds, nextCropIds)) {
        flashSuccessCueRef.current?.(cropReadyEdgeCueText());
        // Reason: PL142.2 — brief harvest rim beside Ready soft + ready pad pulse.
        if (shouldFlashCropReadyWorldReinforce(true)) {
          if (cropReadyWorldReinforceClearRef.current) {
            clearTimeout(cropReadyWorldReinforceClearRef.current);
          }
          setCropReadyWorldReinforce(true);
          cropReadyWorldReinforceClearRef.current = setTimeout(() => {
            setCropReadyWorldReinforce(false);
            cropReadyWorldReinforceClearRef.current = null;
          }, CROP_READY_WORLD_REINFORCE.durationMs);
        }
      }
      cropReadyIdsRef.current = nextCropIds;

      const nextStumpIds = new Set(readyWoodStumpIds(buildings, now));
      const prevStumpIds = woodStumpReadyIdsRef.current;
      if (shouldFlashWoodStumpReadyEdgeCue(prevStumpIds, nextStumpIds)) {
        flashSuccessCueRef.current?.(woodStumpReadyEdgeCueText());
      }
      woodStumpReadyIdsRef.current = nextStumpIds;

      const nextDockIds = new Set(readyFishingDockIds(buildings, now));
      const prevDockIds = fishingDockReadyIdsRef.current;
      if (shouldFlashFishingDockReadyEdgeCue(prevDockIds, nextDockIds)) {
        flashSuccessCueRef.current?.(fishingDockReadyEdgeCueText());
      }
      fishingDockReadyIdsRef.current = nextDockIds;

      const nextOreIds = new Set(readyOreNodeIds(buildings, now));
      const prevOreIds = oreNodeReadyIdsRef.current;
      if (shouldFlashOreNodeReadyEdgeCue(prevOreIds, nextOreIds)) {
        flashSuccessCueRef.current?.(oreNodeReadyEdgeCueText());
      }
      oreNodeReadyIdsRef.current = nextOreIds;

      const nextPenIds = new Set(readyAnimalPenIds(buildings, now));
      const prevPenIds = animalPenReadyIdsRef.current;
      if (shouldFlashAnimalPenReadyEdgeCue(prevPenIds, nextPenIds)) {
        flashSuccessCueRef.current?.(animalPenReadyEdgeCueText());
      }
      animalPenReadyIdsRef.current = nextPenIds;
    }
    sampleReadyEdges();
    const id = window.setInterval(sampleReadyEdges, 500);
    return () => window.clearInterval(id);
  }, [state, visitLand]);

  useEffect(() => {
    targetKeyRef.current = null;
    portalNearRef.current = false;
    arenaNearRef.current = false;
    // Reason: PL60.1 / PL65 / PL69 — reseeds ready-sets on map swap so visit/home do not false-edge.
    cropReadyIdsRef.current = null;
    woodStumpReadyIdsRef.current = null;
    fishingDockReadyIdsRef.current = null;
    oreNodeReadyIdsRef.current = null;
    animalPenReadyIdsRef.current = null;
    cropReadyLandKeyRef.current = null;
    setTarget(null);
  }, [visitLand]);

  useEffect(() => {
    panelRef.current = panel;
  }, [panel]);

  useEffect(() => {
    if (!state) return;
    stateRef.current = state;
    buildingsRef.current = state.buildings;
    if (!visitLandRef.current) {
      setTarget((prev) => withFreshBuilding(prev, state.buildings));
    }
    setDismissedTips(loadDismissedTips(state.username));
    setSeenNoticeTips(loadSeenNoticeTips(state.username));
    portalWalkUpSeenRef.current = loadPortalWalkUpSeen(state.username);
    exploreWalkUpSeenRef.current = loadExploreWalkUpSeen(state.username);
    arenaWalkUpSeenRef.current = loadArenaWalkUpSeen(state.username);
    emptyLandBuildWalkUpSeenRef.current = loadEmptyLandBuildWalkUpSeen(
      state.username,
    );
    visitLandWalkUpSeenRef.current = loadVisitLandWalkUpSeen(state.username);
    warriorMapWalkUpSeenRef.current = loadWarriorMapWalkUpSeen(state.username);
    cityHubWalkUpSeenRef.current = loadCityHubWalkUpSeen(state.username);
    marketWalkUpSeenRef.current = loadMarketWalkUpSeen(state.username);
    vendorWalkUpSeenRef.current = loadVendorWalkUpSeen(state.username);
    fishingDockWalkUpSeenRef.current = loadFishingDockWalkUpSeen(
      state.username,
    );
    animalPenWalkUpSeenRef.current = loadAnimalPenWalkUpSeen(state.username);
    treeStumpWalkUpSeenRef.current = loadTreeStumpWalkUpSeen(state.username);
    oreNodeWalkUpSeenRef.current = loadOreNodeWalkUpSeen(state.username);
    cropPlotWalkUpSeenRef.current = loadCropPlotWalkUpSeen(state.username);
    huntTrailWalkUpSeenRef.current = loadHuntTrailWalkUpSeen(state.username);
    kitchenWalkUpSeenRef.current = loadKitchenWalkUpSeen(state.username);
    noticeBoardWalkUpSeenRef.current = loadNoticeBoardWalkUpSeen(
      state.username,
    );
    expandPadWalkUpSeenRef.current = loadExpandPadWalkUpSeen(state.username);
    millWalkUpSeenRef.current = loadMillWalkUpSeen(state.username);
    workshopWalkUpSeenRef.current = loadWorkshopWalkUpSeen(state.username);
    forgeWalkUpSeenRef.current = loadForgeWalkUpSeen(state.username);
    loomWalkUpSeenRef.current = loadLoomWalkUpSeen(state.username);
    alchemyBenchWalkUpSeenRef.current = loadAlchemyBenchWalkUpSeen(
      state.username,
    );
    decorPadWalkUpSeenRef.current = loadDecorPadWalkUpSeen(state.username);
    tutorWalkUpSeenRef.current = loadTutorWalkUpSeen(state.username);
    claimNodeWalkUpSeenRef.current = loadClaimNodeWalkUpSeen(state.username);
  }, [state]);

  // Reason: PL72.2 — reseed claimable set on account swap so login hydrate stays quiet.
  useEffect(() => {
    tutorClaimableIdsRef.current = null;
  }, [state?.username]);

  useEffect(() => {
    // Reason: PL47.1 / PL49.1 / PL49.2 — post-paint so progress cues win over same-tick action confirms.
    // Priority: title+decor combined (L5) > title change > decor unlock > Level N.
    const nextLevel = state?.characterLevel;
    const nextTitle = state?.characterTitle ?? null;
    const nextDecor =
      state?.characterXp != null
        ? hasExtraDecorPadUnlock(state.characterXp)
        : null;
    if (nextLevel == null) {
      characterLevelCueRef.current = null;
      characterTitleCueRef.current = null;
      extraDecorPadUnlockCueRef.current = null;
      return;
    }
    const prevLevel = characterLevelCueRef.current;
    const prevTitle = characterTitleCueRef.current;
    const prevDecor = extraDecorPadUnlockCueRef.current;
    characterLevelCueRef.current = nextLevel;
    characterTitleCueRef.current = nextTitle;
    if (nextDecor != null) extraDecorPadUnlockCueRef.current = nextDecor;

    const titleChanged = shouldFlashCharacterTitleChangeCue(
      prevTitle,
      nextTitle,
    );
    const decorUnlocked = shouldFlashExtraDecorPadUnlockCue(
      prevDecor,
      nextDecor === true,
    );

    // Reason: PL135.2 — soft world rim on any level rise (even when title/decor cue wins).
    if (shouldFlashLevelUpWorldReinforce(prevLevel, nextLevel)) {
      if (levelUpWorldReinforceClearRef.current) {
        clearTimeout(levelUpWorldReinforceClearRef.current);
      }
      setLevelUpWorldReinforce(true);
      levelUpWorldReinforceClearRef.current = setTimeout(() => {
        setLevelUpWorldReinforce(false);
        levelUpWorldReinforceClearRef.current = null;
      }, LEVEL_UP_WORLD_REINFORCE.durationMs);
    }

    // Reason: PL136.2 — soft ochre rim on title change (same gate as Title · PL49.1).
    if (shouldFlashTitleChangeWorldReinforce(prevTitle, nextTitle)) {
      if (titleChangeWorldReinforceClearRef.current) {
        clearTimeout(titleChangeWorldReinforceClearRef.current);
      }
      setTitleChangeWorldReinforce(true);
      titleChangeWorldReinforceClearRef.current = setTimeout(() => {
        setTitleChangeWorldReinforce(false);
        titleChangeWorldReinforceClearRef.current = null;
      }, TITLE_CHANGE_WORLD_REINFORCE.durationMs);
    }

    if (titleChanged && decorUnlocked) {
      const cue = titleWithDecorPadUnlockCueText(nextTitle);
      flashSuccessCueRef.current?.(cue);
      return;
    }
    if (titleChanged) {
      const cue = characterTitleChangeCueText(nextTitle);
      if (cue) flashSuccessCueRef.current?.(cue);
      return;
    }
    if (decorUnlocked) {
      flashSuccessCueRef.current?.(extraDecorPadUnlockCueText());
      return;
    }
    if (!shouldFlashCharacterLevelUpCue(prevLevel, nextLevel)) return;
    const cue = characterLevelUpCueText(nextLevel);
    if (cue) flashSuccessCueRef.current?.(cue);
  }, [state?.characterLevel, state?.characterTitle, state?.characterXp]);

  const stationRecipes = useMemo(() => {
    if (!craftStation) return [];
    return RECIPES.filter((r) => r.station === craftStation);
  }, [craftStation]);

  /**
   * Brief Guild header/border accent after G open (PL46.1).
   * PL140.2 — membership-tinted accent when already in a guild.
   */
  const flashGuildOpenAccent = useCallback(
    (hasMembership = false) => {
      if (hasMembership) {
        clearGuildOpenAccent();
        flashGuildMembershipOpenAccent();
        return;
      }
      clearGuildMembershipOpenAccent();
      flashGuildOpenAccentBase();
    },
    [
      clearGuildMembershipOpenAccent,
      clearGuildOpenAccent,
      flashGuildMembershipOpenAccent,
      flashGuildOpenAccentBase,
    ],
  );

  useEffect(() => {
    if (
      (panel !== "deeds" && panel !== "realm_market") ||
      creditcoinContracts
    )
      return;
    let cancelled = false;
    void apiCreditcoinConfig().then((cfg) => {
      if (cancelled || !cfg.ok) return;
      setCreditcoinContracts({
        realmToken: cfg.realmToken ?? null,
        landNft: cfg.landNft ?? null,
        marketplace: cfg.marketplace ?? null,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [panel, creditcoinContracts]);

  /**
   * Open Travel with brief accent (PL24.3); fare-free destinations unchanged.
   */
  const openTravelPanel = useCallback(() => {
    if (shouldPlayTravelOpenAccent(panelRef.current, "travel")) {
      flashTravelOpenAccent();
    }
    setPanel("travel");
  }, [flashTravelOpenAccent]);

  /**
   * Brief soft gold world rim when soft currency rose (PL126.2).
   * Complements Sold/Bought/quest ephemerals; prices unchanged.
   */
  const flashCoinsGainWorldReinforce = useCallback(
    (ok: boolean, prevSoftCurrency: number, nextSoftCurrency: number) => {
      if (
        !shouldFlashCoinsGainWorldReinforce(
          ok,
          prevSoftCurrency,
          nextSoftCurrency,
        )
      ) {
        return;
      }
      if (coinsGainWorldReinforceClearRef.current) {
        clearTimeout(coinsGainWorldReinforceClearRef.current);
      }
      setCoinsGainWorldReinforce(true);
      coinsGainWorldReinforceClearRef.current = setTimeout(() => {
        setCoinsGainWorldReinforce(false);
        coinsGainWorldReinforceClearRef.current = null;
      }, COINS_GAIN_WORLD_REINFORCE.durationMs);
    },
    [],
  );

  /**
   * Brief soft market-teal world rim when a listing posts (PL138.1).
   * Complements Listed ephemeral; escrow / fees unchanged.
   */
  const flashMarketListWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashMarketListWorldReinforce(ok)) return;
    if (marketListWorldReinforceClearRef.current) {
      clearTimeout(marketListWorldReinforceClearRef.current);
    }
    setMarketListWorldReinforce(true);
    marketListWorldReinforceClearRef.current = setTimeout(() => {
      setMarketListWorldReinforce(false);
      marketListWorldReinforceClearRef.current = null;
    }, MARKET_LIST_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft verdant world rim when a quest claim succeeds (PL138.2).
   * Complements Quest claimed + coins rim; rewards unchanged.
   */
  const flashQuestClaimWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashQuestClaimWorldReinforce(ok)) return;
    if (questClaimWorldReinforceClearRef.current) {
      clearTimeout(questClaimWorldReinforceClearRef.current);
    }
    setQuestClaimWorldReinforce(true);
    questClaimWorldReinforceClearRef.current = setTimeout(() => {
      setQuestClaimWorldReinforce(false);
      questClaimWorldReinforceClearRef.current = null;
    }, QUEST_CLAIM_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft meadow world rim when returning home from a visit (PL139.1).
   * Complements Your land tip + Home ephemeral; visit rules unchanged.
   */
  const flashVisitHomeReturnWorldReinforce = useCallback(
    (wasVisiting: boolean) => {
      if (!shouldFlashVisitHomeReturnWorldReinforce(wasVisiting)) return;
      if (visitHomeReturnWorldReinforceClearRef.current) {
        clearTimeout(visitHomeReturnWorldReinforceClearRef.current);
      }
      setVisitHomeReturnWorldReinforce(true);
      visitHomeReturnWorldReinforceClearRef.current = setTimeout(() => {
        setVisitHomeReturnWorldReinforce(false);
        visitHomeReturnWorldReinforceClearRef.current = null;
      }, VISIT_HOME_RETURN_WORLD_REINFORCE.durationMs);
    },
    [],
  );

  /**
   * Brief soft guest-teal rim after visit arrive ok (PL184.1).
   * Complements Visiting · ephemeral + host nameplate; visit rules unchanged.
   */
  const flashVisitArriveWorldReinforce = useCallback(
    (visitOk: boolean, ownerUsername: string | null | undefined) => {
      if (!shouldFlashVisitArriveWorldReinforce(visitOk, ownerUsername)) return;
      if (visitArriveWorldReinforceClearRef.current) {
        clearTimeout(visitArriveWorldReinforceClearRef.current);
      }
      setVisitArriveWorldReinforce(true);
      visitArriveWorldReinforceClearRef.current = setTimeout(() => {
        setVisitArriveWorldReinforce(false);
        visitArriveWorldReinforceClearRef.current = null;
      }, VISIT_ARRIVE_WORLD_REINFORCE.durationMs);
    },
    [],
  );

  /**
   * Brief soft sage rim when a peer first enters interact range (PL184.2).
   * Complements floor ping + silhouette; presence rules unchanged.
   */
  const flashNearbyPeerWorldReinforce = useCallback(() => {
    if (nearbyPeerWorldReinforceClearRef.current) {
      clearTimeout(nearbyPeerWorldReinforceClearRef.current);
    }
    setNearbyPeerWorldReinforce(true);
    nearbyPeerWorldReinforceClearRef.current = setTimeout(() => {
      setNearbyPeerWorldReinforce(false);
      nearbyPeerWorldReinforceClearRef.current = null;
    }, NEARBY_PEER_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief quiet social rim after chat send ok (PL139.2).
   * Complements Sent ephemeral + receive ping; chat rules unchanged.
   */
  const flashChatSendWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashChatSendWorldReinforce(ok)) return;
    if (chatSendWorldReinforceClearRef.current) {
      clearTimeout(chatSendWorldReinforceClearRef.current);
    }
    setChatSendWorldReinforce(true);
    chatSendWorldReinforceClearRef.current = setTimeout(() => {
      setChatSendWorldReinforce(false);
      chatSendWorldReinforceClearRef.current = null;
    }, CHAT_SEND_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft handshake rim when a trade accept succeeds (PL143.1).
   * Complements Trade accepted + Trade open accent; escrow unchanged.
   */
  const flashTradeAcceptWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashTradeAcceptWorldReinforce(ok)) return;
    if (tradeAcceptWorldReinforceClearRef.current) {
      clearTimeout(tradeAcceptWorldReinforceClearRef.current);
    }
    setTradeAcceptWorldReinforce(true);
    tradeAcceptWorldReinforceClearRef.current = setTimeout(() => {
      setTradeAcceptWorldReinforce(false);
      tradeAcceptWorldReinforceClearRef.current = null;
    }, TRADE_ACCEPT_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief quiet membership rim after guild bank deposit ok (PL143.2).
   * Complements Deposited ephemeral; bank caps unchanged.
   */
  const flashGuildBankDepositWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashGuildBankDepositWorldReinforce(ok)) return;
    if (guildBankDepositWorldReinforceClearRef.current) {
      clearTimeout(guildBankDepositWorldReinforceClearRef.current);
    }
    setGuildBankDepositWorldReinforce(true);
    guildBankDepositWorldReinforceClearRef.current = setTimeout(() => {
      setGuildBankDepositWorldReinforce(false);
      guildBankDepositWorldReinforceClearRef.current = null;
    }, GUILD_BANK_DEPOSIT_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief quiet steel-slate rim after guild bank withdraw ok (PL148.1).
   * Complements Withdrew ephemeral + deposit rim; bank caps unchanged.
   */
  const flashGuildBankWithdrawWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashGuildBankWithdrawWorldReinforce(ok)) return;
    if (guildBankWithdrawWorldReinforceClearRef.current) {
      clearTimeout(guildBankWithdrawWorldReinforceClearRef.current);
    }
    setGuildBankWithdrawWorldReinforce(true);
    guildBankWithdrawWorldReinforceClearRef.current = setTimeout(() => {
      setGuildBankWithdrawWorldReinforce(false);
      guildBankWithdrawWorldReinforceClearRef.current = null;
    }, GUILD_BANK_WITHDRAW_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft welcome rim after guild invite accept ok (PL148.2).
   * Complements Joined ephemeral; invite / rank rules unchanged.
   */
  const flashInviteAcceptWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashInviteAcceptWorldReinforce(ok)) return;
    if (inviteAcceptWorldReinforceClearRef.current) {
      clearTimeout(inviteAcceptWorldReinforceClearRef.current);
    }
    setInviteAcceptWorldReinforce(true);
    inviteAcceptWorldReinforceClearRef.current = setTimeout(() => {
      setInviteAcceptWorldReinforce(false);
      inviteAcceptWorldReinforceClearRef.current = null;
    }, INVITE_ACCEPT_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft parchment rim after mail send ok (PL149.1).
   * Complements Parcel sent ephemeral + mail pending glance; escrow unchanged.
   */
  const flashMailSendWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashMailSendWorldReinforce(ok)) return;
    if (mailSendWorldReinforceClearRef.current) {
      clearTimeout(mailSendWorldReinforceClearRef.current);
    }
    setMailSendWorldReinforce(true);
    mailSendWorldReinforceClearRef.current = setTimeout(() => {
      setMailSendWorldReinforce(false);
      mailSendWorldReinforceClearRef.current = null;
    }, MAIL_SEND_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft rosewood rim after decor place ok (PL149.2).
   * Complements decor SFX + Decor placed ephemeral; costs / slots unchanged.
   */
  const flashDecorPlaceWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashDecorPlaceWorldReinforce(ok)) return;
    if (decorPlaceWorldReinforceClearRef.current) {
      clearTimeout(decorPlaceWorldReinforceClearRef.current);
    }
    setDecorPlaceWorldReinforce(true);
    decorPlaceWorldReinforceClearRef.current = setTimeout(() => {
      setDecorPlaceWorldReinforce(false);
      decorPlaceWorldReinforceClearRef.current = null;
    }, DECOR_PLACE_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft forge-pewter rim after tool repair ok (PL150.1).
   * Complements Repaired ephemeral + tool-low vignette clear; mats unchanged.
   */
  const flashToolRepairWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashToolRepairWorldReinforce(ok)) return;
    if (toolRepairWorldReinforceClearRef.current) {
      clearTimeout(toolRepairWorldReinforceClearRef.current);
    }
    setToolRepairWorldReinforce(true);
    toolRepairWorldReinforceClearRef.current = setTimeout(() => {
      setToolRepairWorldReinforce(false);
      toolRepairWorldReinforceClearRef.current = null;
    }, TOOL_REPAIR_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft ready-grip steel rim after tool equip ok (PL152.1).
   * Complements Equipped ephemeral + repair rim; durability unchanged; unequip → PL154.2.
   */
  const flashToolEquipWorldReinforce = useCallback(
    (ok: boolean, inventoryId: string | null | undefined) => {
      if (!shouldFlashToolEquipWorldReinforce(ok, inventoryId)) return;
      if (toolEquipWorldReinforceClearRef.current) {
        clearTimeout(toolEquipWorldReinforceClearRef.current);
      }
      setToolEquipWorldReinforce(true);
      toolEquipWorldReinforceClearRef.current = setTimeout(() => {
        setToolEquipWorldReinforce(false);
        toolEquipWorldReinforceClearRef.current = null;
      }, TOOL_EQUIP_WORLD_REINFORCE.durationMs);
    },
    [],
  );

  /**
   * Brief soft release-grip mist rim after tool unequip ok (PL154.2).
   * Complements Unequipped ephemeral + equip rim; durability unchanged; mute ok.
   */
  const flashToolUnequipWorldReinforce = useCallback(
    (ok: boolean, inventoryId: string | null | undefined) => {
      if (!shouldFlashToolUnequipWorldReinforce(ok, inventoryId)) return;
      if (toolUnequipWorldReinforceClearRef.current) {
        clearTimeout(toolUnequipWorldReinforceClearRef.current);
      }
      setToolUnequipWorldReinforce(true);
      toolUnequipWorldReinforceClearRef.current = setTimeout(() => {
        setToolUnequipWorldReinforce(false);
        toolUnequipWorldReinforceClearRef.current = null;
      }, TOOL_UNEQUIP_WORLD_REINFORCE.durationMs);
    },
    [],
  );

  /**
   * Brief soft sage-parchment rim after mail claim ok (PL152.2).
   * Complements Parcel claimed ephemeral + send rim; escrow unchanged.
   */
  const flashMailClaimWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashMailClaimWorldReinforce(ok)) return;
    if (mailClaimWorldReinforceClearRef.current) {
      clearTimeout(mailClaimWorldReinforceClearRef.current);
    }
    setMailClaimWorldReinforce(true);
    mailClaimWorldReinforceClearRef.current = setTimeout(() => {
      setMailClaimWorldReinforce(false);
      mailClaimWorldReinforceClearRef.current = null;
    }, MAIL_CLAIM_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft stall honey-copper rim after vendor buy ok (PL153.1).
   * Complements Bought ephemeral + coins-gain sell rim; prices unchanged.
   */
  const flashVendorBuyWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashVendorBuyWorldReinforce(ok)) return;
    if (vendorBuyWorldReinforceClearRef.current) {
      clearTimeout(vendorBuyWorldReinforceClearRef.current);
    }
    setVendorBuyWorldReinforce(true);
    vendorBuyWorldReinforceClearRef.current = setTimeout(() => {
      setVendorBuyWorldReinforce(false);
      vendorBuyWorldReinforceClearRef.current = null;
    }, VENDOR_BUY_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft parchment-gold rim after market buy ok (PL155.2).
   * Complements Bought ephemeral + list rim; escrow / fees unchanged.
   */
  const flashMarketBuyWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashMarketBuyWorldReinforce(ok)) return;
    if (marketBuyWorldReinforceClearRef.current) {
      clearTimeout(marketBuyWorldReinforceClearRef.current);
    }
    setMarketBuyWorldReinforce(true);
    marketBuyWorldReinforceClearRef.current = setTimeout(() => {
      setMarketBuyWorldReinforce(false);
      marketBuyWorldReinforceClearRef.current = null;
    }, MARKET_BUY_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft stall amber-copper rim after vendor sell ok (PL156.1).
   * Complements Sold ephemeral + coins-gain rim; prices unchanged.
   */
  const flashVendorSellWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashVendorSellWorldReinforce(ok)) return;
    if (vendorSellWorldReinforceClearRef.current) {
      clearTimeout(vendorSellWorldReinforceClearRef.current);
    }
    setVendorSellWorldReinforce(true);
    vendorSellWorldReinforceClearRef.current = setTimeout(() => {
      setVendorSellWorldReinforce(false);
      vendorSellWorldReinforceClearRef.current = null;
    }, VENDOR_SELL_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft dusty board-ash rim after market cancel ok (PL156.2).
   * Complements Cancelled listing cue + list rim; escrow / fees unchanged.
   */
  const flashMarketCancelWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashMarketCancelWorldReinforce(ok)) return;
    if (marketCancelWorldReinforceClearRef.current) {
      clearTimeout(marketCancelWorldReinforceClearRef.current);
    }
    setMarketCancelWorldReinforce(true);
    marketCancelWorldReinforceClearRef.current = setTimeout(() => {
      setMarketCancelWorldReinforce(false);
      marketCancelWorldReinforceClearRef.current = null;
    }, MARKET_CANCEL_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft release mist rim after outgoing trade cancel ok (PL157.1).
   * Complements Cancelled cue + accept rim; escrow unchanged; incoming quiet.
   */
  const flashTradeCancelWorldReinforce = useCallback(
    (
      ok: boolean,
      direction: "incoming" | "outgoing" | null | undefined,
    ) => {
      if (!shouldFlashTradeCancelWorldReinforce(ok, direction)) return;
      if (tradeCancelWorldReinforceClearRef.current) {
        clearTimeout(tradeCancelWorldReinforceClearRef.current);
      }
      setTradeCancelWorldReinforce(true);
      tradeCancelWorldReinforceClearRef.current = setTimeout(() => {
        setTradeCancelWorldReinforce(false);
        tradeCancelWorldReinforceClearRef.current = null;
      }, TRADE_CANCEL_WORLD_REINFORCE.durationMs);
    },
    [],
  );

  /**
   * Brief soft dusty parchment-ash rim after mail cancel ok (PL157.2).
   * Complements Parcel cancelled + send/claim rims; escrow unchanged.
   */
  const flashMailCancelWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashMailCancelWorldReinforce(ok)) return;
    if (mailCancelWorldReinforceClearRef.current) {
      clearTimeout(mailCancelWorldReinforceClearRef.current);
    }
    setMailCancelWorldReinforce(true);
    mailCancelWorldReinforceClearRef.current = setTimeout(() => {
      setMailCancelWorldReinforce(false);
      mailCancelWorldReinforceClearRef.current = null;
    }, MAIL_CANCEL_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft warm founding crest rim after guild create ok (PL158.1).
   * Complements Created + membership open; guild rules unchanged.
   */
  const flashGuildCreateWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashGuildCreateWorldReinforce(ok)) return;
    if (guildCreateWorldReinforceClearRef.current) {
      clearTimeout(guildCreateWorldReinforceClearRef.current);
    }
    setGuildCreateWorldReinforce(true);
    guildCreateWorldReinforceClearRef.current = setTimeout(() => {
      setGuildCreateWorldReinforce(false);
      guildCreateWorldReinforceClearRef.current = null;
    }, GUILD_CREATE_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft cool membership-release rim after guild leave ok (PL158.2).
   * Complements Left + membership open; guild rules unchanged.
   */
  const flashGuildLeaveWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashGuildLeaveWorldReinforce(ok)) return;
    if (guildLeaveWorldReinforceClearRef.current) {
      clearTimeout(guildLeaveWorldReinforceClearRef.current);
    }
    setGuildLeaveWorldReinforce(true);
    guildLeaveWorldReinforceClearRef.current = setTimeout(() => {
      setGuildLeaveWorldReinforce(false);
      guildLeaveWorldReinforceClearRef.current = null;
    }, GUILD_LEAVE_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft warm trail-gold rim after hunt win ok (PL159.1).
   * Complements Won · foe + trail ready cues; rates / XP unchanged.
   */
  const flashHuntWinWorldReinforce = useCallback(
    (won: boolean | null | undefined) => {
      if (!shouldFlashHuntWinWorldReinforce(won)) return;
      if (huntWinWorldReinforceClearRef.current) {
        clearTimeout(huntWinWorldReinforceClearRef.current);
      }
      setHuntWinWorldReinforce(true);
      huntWinWorldReinforceClearRef.current = setTimeout(() => {
        setHuntWinWorldReinforce(false);
        huntWinWorldReinforceClearRef.current = null;
      }, HUNT_WIN_WORLD_REINFORCE.durationMs);
    },
    [],
  );

  /**
   * Brief soft cool trail-ash rim after hunt lose ok (PL179.1).
   * Complements Lost · foe + hunt-win rim; rates / XP unchanged; fail silent.
   */
  const flashHuntLoseWorldReinforce = useCallback(
    (won: boolean | null | undefined) => {
      if (!shouldFlashHuntLoseWorldReinforce(won)) return;
      if (huntLoseWorldReinforceClearRef.current) {
        clearTimeout(huntLoseWorldReinforceClearRef.current);
      }
      setHuntLoseWorldReinforce(true);
      huntLoseWorldReinforceClearRef.current = setTimeout(() => {
        setHuntLoseWorldReinforce(false);
        huntLoseWorldReinforceClearRef.current = null;
      }, HUNT_LOSE_WORLD_REINFORCE.durationMs);
    },
    [],
  );

  /**
   * Brief soft dusty rose rim when scarce busy interact soft-refuses (PL179.2).
   * Complements Busy ephemeral + peer pulse; contention unchanged.
   */
  const flashSoftRefuseBusyWorldReinforce = useCallback(
    (error: string | null | undefined) => {
      if (!shouldFlashSoftRefuseBusyWorldReinforce(error)) return;
      if (softRefuseBusyWorldReinforceClearRef.current) {
        clearTimeout(softRefuseBusyWorldReinforceClearRef.current);
      }
      setSoftRefuseBusyWorldReinforce(true);
      softRefuseBusyWorldReinforceClearRef.current = setTimeout(() => {
        setSoftRefuseBusyWorldReinforce(false);
        softRefuseBusyWorldReinforceClearRef.current = null;
      }, SOFT_REFUSE_BUSY_WORLD_REINFORCE.durationMs);
    },
    [],
  );

  /**
   * Brief soft hush graphite rim when mute toggles on/off from settings (PL180.1).
   * Complements Muted/Unmuted + mute enable confirm; audio rules unchanged.
   */
  const flashMuteWorldReinforce = useCallback(
    (previousMuted: boolean, nextMuted: boolean) => {
      if (!shouldFlashMuteWorldReinforce(previousMuted, nextMuted)) return;
      if (muteWorldReinforceClearRef.current) {
        clearTimeout(muteWorldReinforceClearRef.current);
      }
      setMuteWorldReinforce(true);
      muteWorldReinforceClearRef.current = setTimeout(() => {
        setMuteWorldReinforce(false);
        muteWorldReinforceClearRef.current = null;
      }, MUTE_WORLD_REINFORCE.durationMs);
    },
    [],
  );

  /**
   * Brief soft sprout-olive rim after craft ok (PL159.2).
   * Complements craft olive pad + inventory pickup; recipes unchanged.
   */
  const flashCraftCompleteWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashCraftCompleteWorldReinforce(ok)) return;
    if (craftCompleteWorldReinforceClearRef.current) {
      clearTimeout(craftCompleteWorldReinforceClearRef.current);
    }
    setCraftCompleteWorldReinforce(true);
    craftCompleteWorldReinforceClearRef.current = setTimeout(() => {
      setCraftCompleteWorldReinforce(false);
      craftCompleteWorldReinforceClearRef.current = null;
    }, CRAFT_COMPLETE_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft mint-lime rim after gather ok on stump/ore/pen (PL161.1).
   * Complements Chopped/Mined/Collected + mint pad; yields unchanged.
   */
  const flashGatherSuccessWorldReinforce = useCallback(
    (ok: boolean, buildingType: string) => {
      if (!shouldFlashGatherSuccessWorldReinforce(ok, buildingType)) return;
      if (gatherSuccessWorldReinforceClearRef.current) {
        clearTimeout(gatherSuccessWorldReinforceClearRef.current);
      }
      setGatherSuccessWorldReinforce(true);
      gatherSuccessWorldReinforceClearRef.current = setTimeout(() => {
        setGatherSuccessWorldReinforce(false);
        gatherSuccessWorldReinforceClearRef.current = null;
      }, GATHER_SUCCESS_WORLD_REINFORCE.durationMs);
    },
    [],
  );

  /**
   * Brief soft cool water rim after fish catch ok (PL161.2).
   * Complements Caught + cool splash + ready shimmer; catch rates unchanged.
   */
  const flashFishCatchWorldReinforce = useCallback(
    (ok: boolean, buildingType: string) => {
      if (!shouldFlashFishCatchWorldReinforce(ok, buildingType)) return;
      if (fishCatchWorldReinforceClearRef.current) {
        clearTimeout(fishCatchWorldReinforceClearRef.current);
      }
      setFishCatchWorldReinforce(true);
      fishCatchWorldReinforceClearRef.current = setTimeout(() => {
        setFishCatchWorldReinforce(false);
        fishCatchWorldReinforceClearRef.current = null;
      }, FISH_CATCH_WORLD_REINFORCE.durationMs);
    },
    [],
  );

  /**
   * Brief soft warm copper rim after station upgrade ok (PL162.1).
   * Complements Upgraded + copper pad; costs / tiers unchanged.
   */
  const flashStationUpgradeWorldReinforce = useCallback(
    (ok: boolean, buildingType: string) => {
      if (!shouldFlashStationUpgradeWorldReinforce(ok, buildingType)) return;
      if (stationUpgradeWorldReinforceClearRef.current) {
        clearTimeout(stationUpgradeWorldReinforceClearRef.current);
      }
      setStationUpgradeWorldReinforce(true);
      stationUpgradeWorldReinforceClearRef.current = setTimeout(() => {
        setStationUpgradeWorldReinforce(false);
        stationUpgradeWorldReinforceClearRef.current = null;
      }, STATION_UPGRADE_WORLD_REINFORCE.durationMs);
    },
    [],
  );

  /**
   * Brief soft field-gold rim after land expand ok (PL162.2).
   * Complements Expanded + field-gold pad; costs / slots unchanged.
   */
  const flashExpandFieldWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashExpandFieldWorldReinforce(ok)) return;
    if (expandFieldWorldReinforceClearRef.current) {
      clearTimeout(expandFieldWorldReinforceClearRef.current);
    }
    setExpandFieldWorldReinforce(true);
    expandFieldWorldReinforceClearRef.current = setTimeout(() => {
      setExpandFieldWorldReinforce(false);
      expandFieldWorldReinforceClearRef.current = null;
    }, EXPAND_FIELD_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft Free cyan rim after map travel Arrived (PL164.1).
   * Complements Arrived · dest + Free portal pulse; fares stay free.
   */
  const flashTravelArriveWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashTravelArriveWorldReinforce(ok)) return;
    if (travelArriveWorldReinforceClearRef.current) {
      clearTimeout(travelArriveWorldReinforceClearRef.current);
    }
    setTravelArriveWorldReinforce(true);
    travelArriveWorldReinforceClearRef.current = setTimeout(() => {
      setTravelArriveWorldReinforce(false);
      travelArriveWorldReinforceClearRef.current = null;
    }, TRAVEL_ARRIVE_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft dawn-slate rim when enabling day/night cycle (PL164.2).
   * Complements settings-row confirm + phase rim; clocks unchanged.
   */
  const flashDayNightEnableWorldReinforce = useCallback(
    (previousEnabled: boolean, nextEnabled: boolean) => {
      if (
        !shouldFlashDayNightEnableWorldReinforce(previousEnabled, nextEnabled)
      ) {
        return;
      }
      if (dayNightEnableWorldReinforceClearRef.current) {
        clearTimeout(dayNightEnableWorldReinforceClearRef.current);
      }
      setDayNightEnableWorldReinforce(true);
      dayNightEnableWorldReinforceClearRef.current = setTimeout(() => {
        setDayNightEnableWorldReinforce(false);
        dayNightEnableWorldReinforceClearRef.current = null;
      }, DAY_NIGHT_ENABLE_WORLD_REINFORCE.durationMs);
    },
    [],
  );

  /**
   * Brief soft Free cyan rim when a scarce City station settles busy→Free (PL165.2).
   * Complements pad settle flash + sticky Free; contention unchanged.
   */
  const flashScarceFreeSettleWorldReinforce = useCallback(() => {
    // Reason: CityEnvironment already gated busy→Free; reinforce always complements.
    if (!shouldFlashScarceFreeSettleWorldReinforce(true, false)) return;
    if (scarceFreeSettleWorldReinforceClearRef.current) {
      clearTimeout(scarceFreeSettleWorldReinforceClearRef.current);
    }
    setScarceFreeSettleWorldReinforce(true);
    scarceFreeSettleWorldReinforceClearRef.current = setTimeout(() => {
      setScarceFreeSettleWorldReinforce(false);
      scarceFreeSettleWorldReinforceClearRef.current = null;
    }, SCARCE_FREE_SETTLE_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft Busy coral rim when a scarce City station edges free→busy (PL166.1).
   * Complements pad peer pulse + sticky Busy; contention unchanged.
   */
  const flashScarceBusyWorldReinforce = useCallback(() => {
    // Reason: CityEnvironment already gated free→busy; reinforce always complements.
    if (!shouldFlashScarceBusyWorldReinforce(false, true)) return;
    if (scarceBusyWorldReinforceClearRef.current) {
      clearTimeout(scarceBusyWorldReinforceClearRef.current);
    }
    setScarceBusyWorldReinforce(true);
    scarceBusyWorldReinforceClearRef.current = setTimeout(() => {
      setScarceBusyWorldReinforce(false);
      scarceBusyWorldReinforceClearRef.current = null;
    }, SCARCE_BUSY_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft system-slate rim after cosmetic deed claim ok (PL166.2).
   * Complements Deed claimed ephemeral + desk landmark; no combat power.
   */
  const flashDeedClaimWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashDeedClaimWorldReinforce(ok)) return;
    if (deedClaimWorldReinforceClearRef.current) {
      clearTimeout(deedClaimWorldReinforceClearRef.current);
    }
    setDeedClaimWorldReinforce(true);
    deedClaimWorldReinforceClearRef.current = setTimeout(() => {
      setDeedClaimWorldReinforce(false);
      deedClaimWorldReinforceClearRef.current = null;
    }, DEED_CLAIM_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft mint-slate rim after mock deed mint ok (PL167.1).
   * Complements Deed minted ephemeral + desk landmark; stub only; no combat.
   */
  const flashDeedMintWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashDeedMintWorldReinforce(ok)) return;
    if (deedMintWorldReinforceClearRef.current) {
      clearTimeout(deedMintWorldReinforceClearRef.current);
    }
    setDeedMintWorldReinforce(true);
    deedMintWorldReinforceClearRef.current = setTimeout(() => {
      setDeedMintWorldReinforce(false);
      deedMintWorldReinforceClearRef.current = null;
    }, DEED_MINT_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft link-slate rim after wallet link ok (PL167.2).
   * Complements Wallet linked ephemeral; core loops stay wallet-free.
   */
  const flashWalletLinkWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashWalletLinkWorldReinforce(ok)) return;
    if (walletLinkWorldReinforceClearRef.current) {
      clearTimeout(walletLinkWorldReinforceClearRef.current);
    }
    setWalletLinkWorldReinforce(true);
    walletLinkWorldReinforceClearRef.current = setTimeout(() => {
      setWalletLinkWorldReinforce(false);
      walletLinkWorldReinforceClearRef.current = null;
    }, WALLET_LINK_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft disconnect ash-slate rim after wallet disconnect ok (PL168.1).
   * Complements Wallet disconnected ephemeral; core loops stay wallet-free.
   */
  const flashWalletDisconnectWorldReinforce = useCallback((ok: boolean) => {
    if (!shouldFlashWalletDisconnectWorldReinforce(ok)) return;
    if (walletDisconnectWorldReinforceClearRef.current) {
      clearTimeout(walletDisconnectWorldReinforceClearRef.current);
    }
    setWalletDisconnectWorldReinforce(true);
    walletDisconnectWorldReinforceClearRef.current = setTimeout(() => {
      setWalletDisconnectWorldReinforce(false);
      walletDisconnectWorldReinforceClearRef.current = null;
    }, WALLET_DISCONNECT_WORLD_REINFORCE.durationMs);
  }, []);

  /**
   * Brief soft warm arena rim when arriving on Warrior map (PL145.2).
   * Complements Arrived · Arena + first Warrior tip; stub / no balance invent.
   */
  const flashArenaEnterWorldReinforce = useCallback(
    (enteredWarrior: boolean) => {
      if (!shouldFlashArenaEnterWorldReinforce(enteredWarrior)) return;
      if (arenaEnterWorldReinforceClearRef.current) {
        clearTimeout(arenaEnterWorldReinforceClearRef.current);
      }
      setArenaEnterWorldReinforce(true);
      arenaEnterWorldReinforceClearRef.current = setTimeout(() => {
        setArenaEnterWorldReinforce(false);
        arenaEnterWorldReinforceClearRef.current = null;
      }, ARENA_ENTER_WORLD_REINFORCE.durationMs);
    },
    [],
  );

  /**
   * Brief soft dusty arena rim when leaving Warrior map (PL147.1).
   * Complements enter rim + Arrived · dest; stub / no balance invent.
   */
  const flashArenaLeaveWorldReinforce = useCallback(
    (leftWarrior: boolean) => {
      if (!shouldFlashArenaLeaveWorldReinforce(leftWarrior)) return;
      if (arenaLeaveWorldReinforceClearRef.current) {
        clearTimeout(arenaLeaveWorldReinforceClearRef.current);
      }
      setArenaLeaveWorldReinforce(true);
      arenaLeaveWorldReinforceClearRef.current = setTimeout(() => {
        setArenaLeaveWorldReinforce(false);
        arenaLeaveWorldReinforceClearRef.current = null;
      }, ARENA_LEAVE_WORLD_REINFORCE.durationMs);
    },
    [],
  );

  /**
   * Brief soft ember rim when soft-war wood deliver scores (PL146.2).
   * Complements Delivered · N + contest beacon pulse; scoring unchanged.
   */
  const flashSoftWarDeliverWorldReinforce = useCallback(
    (ok: boolean, delivered: number | null | undefined) => {
      if (!shouldFlashSoftWarDeliverWorldReinforce(ok, delivered)) return;
      if (softWarDeliverWorldReinforceClearRef.current) {
        clearTimeout(softWarDeliverWorldReinforceClearRef.current);
      }
      setSoftWarDeliverWorldReinforce(true);
      softWarDeliverWorldReinforceClearRef.current = setTimeout(() => {
        setSoftWarDeliverWorldReinforce(false);
        softWarDeliverWorldReinforceClearRef.current = null;
      }, SOFT_WAR_DELIVER_WORLD_REINFORCE.durationMs);
    },
    [],
  );

  /**
   * Brief inventory slot flash when stacks rose / appeared (PL128.2).
   * Complements gather/craft/buy SFX; capacity rules unchanged.
   * PL198.2 — also arms quiet I · Bag closed glance while Inventory closed.
   */
  const flashInventoryPickupSlots = useCallback((stackIds: string[]) => {
    if (!shouldFlashInventoryPickupSlots(true, stackIds)) return;
    if (inventoryPickupFlashClearRef.current) {
      clearTimeout(inventoryPickupFlashClearRef.current);
    }
    setInventoryPickupFlashIds(stackIds);
    inventoryPickupFlashClearRef.current = setTimeout(() => {
      setInventoryPickupFlashIds([]);
      inventoryPickupFlashClearRef.current = null;
    }, INVENTORY_PICKUP_SLOT_FLASH.durationMs);
    // Reason: PL198.2 — linger closed glance longer than slot flash; skip if bag already open.
    if (
      panelRef.current !== "inventory" &&
      shouldArmInventoryPickupIdleGlance(true, stackIds)
    ) {
      if (inventoryPickupIdleGlanceClearRef.current) {
        clearTimeout(inventoryPickupIdleGlanceClearRef.current);
      }
      setInventoryPickupIdleGlance(true);
      inventoryPickupIdleGlanceClearRef.current = setTimeout(() => {
        setInventoryPickupIdleGlance(false);
        inventoryPickupIdleGlanceClearRef.current = null;
      }, INVENTORY_PICKUP_IDLE_GLANCE.lingerMs);
    }
  }, []);

  const clearInventoryPickupIdleGlance = useCallback(() => {
    if (inventoryPickupIdleGlanceClearRef.current) {
      clearTimeout(inventoryPickupIdleGlanceClearRef.current);
      inventoryPickupIdleGlanceClearRef.current = null;
    }
    setInventoryPickupIdleGlance(false);
  }, []);

  useEffect(() => {
    return () => {
      if (successCueClearRef.current) clearTimeout(successCueClearRef.current);
      if (promptPulseClearRef.current) clearTimeout(promptPulseClearRef.current);
      if (portalWalkUpClearRef.current) {
        clearTimeout(portalWalkUpClearRef.current);
      }
      if (exploreWalkUpClearRef.current) {
        clearTimeout(exploreWalkUpClearRef.current);
      }
      if (arenaWalkUpClearRef.current) {
        clearTimeout(arenaWalkUpClearRef.current);
      }
      if (emptyLandBuildWalkUpClearRef.current) {
        clearTimeout(emptyLandBuildWalkUpClearRef.current);
      }
      if (visitLandWalkUpClearRef.current) {
        clearTimeout(visitLandWalkUpClearRef.current);
      }
      if (visitHomeReturnClearRef.current) {
        clearTimeout(visitHomeReturnClearRef.current);
      }
      if (visitHostNameplateReinforceClearRef.current) {
        clearTimeout(visitHostNameplateReinforceClearRef.current);
      }
      if (warriorMapWalkUpClearRef.current) {
        clearTimeout(warriorMapWalkUpClearRef.current);
      }
      if (cityHubWalkUpClearRef.current) {
        clearTimeout(cityHubWalkUpClearRef.current);
      }
      if (marketWalkUpClearRef.current) {
        clearTimeout(marketWalkUpClearRef.current);
      }
      if (vendorWalkUpClearRef.current) {
        clearTimeout(vendorWalkUpClearRef.current);
      }
      if (fishingDockWalkUpClearRef.current) {
        clearTimeout(fishingDockWalkUpClearRef.current);
      }
      if (animalPenWalkUpClearRef.current) {
        clearTimeout(animalPenWalkUpClearRef.current);
      }
      if (treeStumpWalkUpClearRef.current) {
        clearTimeout(treeStumpWalkUpClearRef.current);
      }
      if (oreNodeWalkUpClearRef.current) {
        clearTimeout(oreNodeWalkUpClearRef.current);
      }
      if (cropPlotWalkUpClearRef.current) {
        clearTimeout(cropPlotWalkUpClearRef.current);
      }
      if (huntTrailWalkUpClearRef.current) {
        clearTimeout(huntTrailWalkUpClearRef.current);
      }
      if (kitchenWalkUpClearRef.current) {
        clearTimeout(kitchenWalkUpClearRef.current);
      }
      if (noticeBoardWalkUpClearRef.current) {
        clearTimeout(noticeBoardWalkUpClearRef.current);
      }
      if (expandPadWalkUpClearRef.current) {
        clearTimeout(expandPadWalkUpClearRef.current);
      }
      if (millWalkUpClearRef.current) {
        clearTimeout(millWalkUpClearRef.current);
      }
      if (workshopWalkUpClearRef.current) {
        clearTimeout(workshopWalkUpClearRef.current);
      }
      if (forgeWalkUpClearRef.current) {
        clearTimeout(forgeWalkUpClearRef.current);
      }
      if (loomWalkUpClearRef.current) {
        clearTimeout(loomWalkUpClearRef.current);
      }
      if (alchemyBenchWalkUpClearRef.current) {
        clearTimeout(alchemyBenchWalkUpClearRef.current);
      }
      if (decorPadWalkUpClearRef.current) {
        clearTimeout(decorPadWalkUpClearRef.current);
      }
      if (tutorWalkUpClearRef.current) {
        clearTimeout(tutorWalkUpClearRef.current);
      }
      if (claimNodeWalkUpClearRef.current) {
        clearTimeout(claimNodeWalkUpClearRef.current);
      }
      if (eatSuccessWorldReinforceClearRef.current) {
        clearTimeout(eatSuccessWorldReinforceClearRef.current);
      }
      if (coinsGainWorldReinforceClearRef.current) {
        clearTimeout(coinsGainWorldReinforceClearRef.current);
      }
      if (cropPlantSuccessWorldReinforceClearRef.current) {
        clearTimeout(cropPlantSuccessWorldReinforceClearRef.current);
      }
      if (cropReadyWorldReinforceClearRef.current) {
        clearTimeout(cropReadyWorldReinforceClearRef.current);
      }
      if (cropHarvestWorldReinforceClearRef.current) {
        clearTimeout(cropHarvestWorldReinforceClearRef.current);
      }
      if (levelUpWorldReinforceClearRef.current) {
        clearTimeout(levelUpWorldReinforceClearRef.current);
      }
      if (achievementUnlockWorldReinforceClearRef.current) {
        clearTimeout(achievementUnlockWorldReinforceClearRef.current);
      }
      if (titleChangeWorldReinforceClearRef.current) {
        clearTimeout(titleChangeWorldReinforceClearRef.current);
      }
      if (marketListWorldReinforceClearRef.current) {
        clearTimeout(marketListWorldReinforceClearRef.current);
      }
      if (questClaimWorldReinforceClearRef.current) {
        clearTimeout(questClaimWorldReinforceClearRef.current);
      }
      if (visitHomeReturnWorldReinforceClearRef.current) {
        clearTimeout(visitHomeReturnWorldReinforceClearRef.current);
      }
      if (visitArriveWorldReinforceClearRef.current) {
        clearTimeout(visitArriveWorldReinforceClearRef.current);
      }
      if (nearbyPeerWorldReinforceClearRef.current) {
        clearTimeout(nearbyPeerWorldReinforceClearRef.current);
      }
      if (chatSendWorldReinforceClearRef.current) {
        clearTimeout(chatSendWorldReinforceClearRef.current);
      }
      if (tradeAcceptWorldReinforceClearRef.current) {
        clearTimeout(tradeAcceptWorldReinforceClearRef.current);
      }
      if (guildBankDepositWorldReinforceClearRef.current) {
        clearTimeout(guildBankDepositWorldReinforceClearRef.current);
      }
      if (guildBankWithdrawWorldReinforceClearRef.current) {
        clearTimeout(guildBankWithdrawWorldReinforceClearRef.current);
      }
      if (inviteAcceptWorldReinforceClearRef.current) {
        clearTimeout(inviteAcceptWorldReinforceClearRef.current);
      }
      if (mailSendWorldReinforceClearRef.current) {
        clearTimeout(mailSendWorldReinforceClearRef.current);
      }
      if (decorPlaceWorldReinforceClearRef.current) {
        clearTimeout(decorPlaceWorldReinforceClearRef.current);
      }
      if (toolRepairWorldReinforceClearRef.current) {
        clearTimeout(toolRepairWorldReinforceClearRef.current);
      }
      if (toolEquipWorldReinforceClearRef.current) {
        clearTimeout(toolEquipWorldReinforceClearRef.current);
      }
      if (toolUnequipWorldReinforceClearRef.current) {
        clearTimeout(toolUnequipWorldReinforceClearRef.current);
      }
      if (mailClaimWorldReinforceClearRef.current) {
        clearTimeout(mailClaimWorldReinforceClearRef.current);
      }
      if (vendorBuyWorldReinforceClearRef.current) {
        clearTimeout(vendorBuyWorldReinforceClearRef.current);
      }
      if (marketBuyWorldReinforceClearRef.current) {
        clearTimeout(marketBuyWorldReinforceClearRef.current);
      }
      if (vendorSellWorldReinforceClearRef.current) {
        clearTimeout(vendorSellWorldReinforceClearRef.current);
      }
      if (marketCancelWorldReinforceClearRef.current) {
        clearTimeout(marketCancelWorldReinforceClearRef.current);
      }
      if (tradeCancelWorldReinforceClearRef.current) {
        clearTimeout(tradeCancelWorldReinforceClearRef.current);
      }
      if (mailCancelWorldReinforceClearRef.current) {
        clearTimeout(mailCancelWorldReinforceClearRef.current);
      }
      if (guildCreateWorldReinforceClearRef.current) {
        clearTimeout(guildCreateWorldReinforceClearRef.current);
      }
      if (guildLeaveWorldReinforceClearRef.current) {
        clearTimeout(guildLeaveWorldReinforceClearRef.current);
      }
      if (huntWinWorldReinforceClearRef.current) {
        clearTimeout(huntWinWorldReinforceClearRef.current);
      }
      if (huntLoseWorldReinforceClearRef.current) {
        clearTimeout(huntLoseWorldReinforceClearRef.current);
      }
      if (craftCompleteWorldReinforceClearRef.current) {
        clearTimeout(craftCompleteWorldReinforceClearRef.current);
      }
      if (softRefuseBusyWorldReinforceClearRef.current) {
        clearTimeout(softRefuseBusyWorldReinforceClearRef.current);
      }
      if (muteWorldReinforceClearRef.current) {
        clearTimeout(muteWorldReinforceClearRef.current);
      }
      if (gatherSuccessWorldReinforceClearRef.current) {
        clearTimeout(gatherSuccessWorldReinforceClearRef.current);
      }
      if (fishCatchWorldReinforceClearRef.current) {
        clearTimeout(fishCatchWorldReinforceClearRef.current);
      }
      if (stationUpgradeWorldReinforceClearRef.current) {
        clearTimeout(stationUpgradeWorldReinforceClearRef.current);
      }
      if (expandFieldWorldReinforceClearRef.current) {
        clearTimeout(expandFieldWorldReinforceClearRef.current);
      }
      if (dayPhaseWorldReinforceClearRef.current) {
        clearTimeout(dayPhaseWorldReinforceClearRef.current);
      }
      if (travelArriveWorldReinforceClearRef.current) {
        clearTimeout(travelArriveWorldReinforceClearRef.current);
      }
      if (dayNightEnableWorldReinforceClearRef.current) {
        clearTimeout(dayNightEnableWorldReinforceClearRef.current);
      }
      if (scarceFreeSettleWorldReinforceClearRef.current) {
        clearTimeout(scarceFreeSettleWorldReinforceClearRef.current);
      }
      if (scarceBusyWorldReinforceClearRef.current) {
        clearTimeout(scarceBusyWorldReinforceClearRef.current);
      }
      if (deedClaimWorldReinforceClearRef.current) {
        clearTimeout(deedClaimWorldReinforceClearRef.current);
      }
      if (deedMintWorldReinforceClearRef.current) {
        clearTimeout(deedMintWorldReinforceClearRef.current);
      }
      if (walletLinkWorldReinforceClearRef.current) {
        clearTimeout(walletLinkWorldReinforceClearRef.current);
      }
      if (walletDisconnectWorldReinforceClearRef.current) {
        clearTimeout(walletDisconnectWorldReinforceClearRef.current);
      }
      if (arenaEnterWorldReinforceClearRef.current) {
        clearTimeout(arenaEnterWorldReinforceClearRef.current);
      }
      if (arenaLeaveWorldReinforceClearRef.current) {
        clearTimeout(arenaLeaveWorldReinforceClearRef.current);
      }
      if (softWarDeliverWorldReinforceClearRef.current) {
        clearTimeout(softWarDeliverWorldReinforceClearRef.current);
      }
      if (inventoryPickupFlashClearRef.current) {
        clearTimeout(inventoryPickupFlashClearRef.current);
      }
      if (inventoryPickupIdleGlanceClearRef.current) {
        clearTimeout(inventoryPickupIdleGlanceClearRef.current);
      }
      if (craftCompleteFlashClearRef.current) {
        clearTimeout(craftCompleteFlashClearRef.current);
      }
      if (stationUpgradeFlashClearRef.current) {
        clearTimeout(stationUpgradeFlashClearRef.current);
      }
      if (gatherSuccessFlashClearRef.current) {
        clearTimeout(gatherSuccessFlashClearRef.current);
      }
      if (fishCatchSplashClearRef.current) {
        clearTimeout(fishCatchSplashClearRef.current);
      }
      if (buildPlaceSpawnFlashClearRef.current) {
        clearTimeout(buildPlaceSpawnFlashClearRef.current);
      }
      if (expandFieldFlashClearRef.current) {
        clearTimeout(expandFieldFlashClearRef.current);
      }
    };
  }, []);

  async function applyState(
    res: {
      ok: boolean;
      state?: PlayerStateDto;
      error?: string;
      encounter?: {
        won: boolean;
        foeName: string;
        rounds: number;
        leather: number;
        meat: number;
        tusks?: number;
        toolBonus?: number;
        downed?: boolean;
        energyLost?: number;
      };
    },
    opts?: { prevEquippedToolId?: string | null },
  ) {
    if (!res.ok) {
      const softRefuse = resolveSoftRefuseFlash(res.error);
      if (softRefuse) {
        setError(null);
        audioRef.current?.playSfx("refuse");
        flashSuccessCueRef.current?.(softRefuse.text);
        if (softRefuse.kind === "busy") {
          flashSoftRefuseBusyWorldReinforce(res.error);
        }
        return;
      }
      setError(res.error ?? "Action failed");
      // Reason: PL16.1 — quiet refuse only on busy / energy / already-here (+ PL54 / PL58 / PL63 / PL64 / PL71 / PL73 / PL75 / PL76 / PL78 / PL79 / PL80 / PL81 / PL82 / PL83 / PL84 / PL85 / PL86 / PL87 / PL88 / PL89 / PL90 / PL91 / PL92 / PL93 / PL94 / PL95 / PL96 / PL97 / PL98 / PL99 / PL100 / PL101 / PL102 / PL103 / PL104 / PL105 / PL106 / PL107 / PL108 / PL109 / PL110 / PL112 / PL113 leftovers).
      if (isSoftRefuseError(res.error)) {
        audioRef.current?.playSfx("refuse");
      }
      return;
    }
    setError(null);
    if (res.state) {
      const prevSnap = stateRef.current;
      const crossedEnergyLow = shouldFlashEnergyLowCue(
        prevSnap?.energy,
        prevSnap?.maxEnergy,
        res.state.energy,
        res.state.maxEnergy,
      );
      const crossedHealthLow = shouldFlashHealthLowCue(
        prevSnap?.health,
        prevSnap?.maxHealth,
        res.state.health,
        res.state.maxHealth,
      );
      const crossedToolDurabilityLow = shouldFlashToolDurabilityLowBetweenStates(
        prevSnap,
        res.state,
      );
      const leveledUp = shouldFlashCharacterLevelUpCue(
        prevSnap?.characterLevel,
        res.state.characterLevel,
      );
      if (res.encounter) {
        // Reason: PL33.2 — ephemeral win/lose TopBar + soft SFX; sticky encounter prose removed.
        const cue = huntEncounterSuccessCueText(res.encounter);
        if (cue) {
          audioRef.current?.playSfx(res.encounter.won ? "hunt" : "hunt_lose");
          flashSuccessCueRef.current?.(cue);
        }
        // Reason: PL159.1 — soft trail-gold rim on win only; rates / XP unchanged.
        flashHuntWinWorldReinforce(res.encounter.won);
        // Reason: PL179.1 — soft trail-ash rim on lose only; rates / XP unchanged; fail silent.
        flashHuntLoseWorldReinforce(res.encounter.won);
      } else if (
        shouldFlashToolBrokeCue(
          opts?.prevEquippedToolId,
          res.state.equippedToolInventoryId,
        )
      ) {
        // Reason: PL33.1 — ephemeral Tool broke + soft SFX; sticky equip prose removed.
        audioRef.current?.playSfx("tool_break");
        flashSuccessCueRef.current?.(toolBrokeSuccessCueText());
      } else if (crossedToolDurabilityLow) {
        // Reason: PL61.1 — ephemeral Tool low on band-edge; TopBar · low accent (PL21.1) stays while low.
        flashSuccessCueRef.current?.(toolDurabilityLowThresholdCueText());
      } else if (crossedHealthLow) {
        // Reason: PL64.1 — ephemeral Health low on band-edge; HP accent (PL67.1) will stay while low.
        flashSuccessCueRef.current?.(healthLowThresholdCueText());
      } else if (crossedEnergyLow) {
        // Reason: PL41.1 — ephemeral Energy low on band-edge; meter warn (PL9.1) stays while low.
        flashSuccessCueRef.current?.(energyLowThresholdCueText());
      } else {
        setInfo(null);
      }
      receivedAtRef.current = Date.now();
      serverNowRef.current = res.state.serverNow;
      setState(res.state);
      stateRef.current = res.state;
      buildingsRef.current = res.state.buildings;
      // Reason: PL128.2 — brief slot flash when bag qty rose / new stack (skip first hydrate).
      if (prevSnap) {
        const pickupIds = inventoryPickupFlashStackIds(
          prevSnap.inventory,
          res.state.inventory,
        );
        if (shouldFlashInventoryPickupSlots(true, pickupIds)) {
          flashInventoryPickupSlots(pickupIds);
        }
      }
      // Reason: PL30.3 — re-check tutor claimable after inventory/XP actions.
      if (tokenRef.current && res.state.landKind === "city" && !visitLandRef.current) {
        void refreshTutorClaimable(tokenRef.current);
      }
      // Reason: PL47.2 — poll stubs after actions; skip unlock flash when Level N will own the cue.
      if (tokenRef.current) {
        void refreshAchievements(tokenRef.current, { flashUnlocks: !leveledUp });
      }
      // Reason: PL45.1 — first hydrate onto Explore (login/refresh); travel path flashes after Arrived choice.
      if (
        prevSnap == null &&
        shouldFlashFirstExploreWalkUpCue(
          isEnteringExploreMap(null, res.state.landKind),
          exploreWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        exploreWalkUpSeenRef.current = true;
        const user = res.state.username;
        if (user) saveExploreWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstExploreWalkUpCueText());
        if (exploreWalkUpClearRef.current) {
          clearTimeout(exploreWalkUpClearRef.current);
          exploreWalkUpClearRef.current = null;
        }
        setExploreWalkUpWorldTip(true);
        exploreWalkUpClearRef.current = setTimeout(() => {
          setExploreWalkUpWorldTip(false);
          exploreWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      // Reason: PL53.2 — first hydrate onto Warrior (login/refresh); travel path flashes after Arrived choice.
      if (
        prevSnap == null &&
        shouldFlashFirstWarriorMapCue(
          isEnteringWarriorMap(null, res.state.landKind),
          warriorMapWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        warriorMapWalkUpSeenRef.current = true;
        const user = res.state.username;
        if (user) saveWarriorMapWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstWarriorMapCueText());
        if (warriorMapWalkUpClearRef.current) {
          clearTimeout(warriorMapWalkUpClearRef.current);
          warriorMapWalkUpClearRef.current = null;
        }
        setWarriorMapWalkUpWorldTip(true);
        warriorMapWalkUpClearRef.current = setTimeout(() => {
          setWarriorMapWalkUpWorldTip(false);
          warriorMapWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      // Reason: PL57.1 — first hydrate onto City (login/refresh); travel path flashes after Arrived choice.
      if (
        prevSnap == null &&
        shouldFlashFirstCityHubCue(
          isEnteringCityMap(null, res.state.landKind),
          cityHubWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        cityHubWalkUpSeenRef.current = true;
        const user = res.state.username;
        if (user) saveCityHubWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstCityHubCueText());
        if (cityHubWalkUpClearRef.current) {
          clearTimeout(cityHubWalkUpClearRef.current);
          cityHubWalkUpClearRef.current = null;
        }
        setCityHubWalkUpWorldTip(true);
        cityHubWalkUpClearRef.current = setTimeout(() => {
          setCityHubWalkUpWorldTip(false);
          cityHubWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
    }
  }

  const handlePlayerPos = useCallback((x: number, z: number) => {
    playerPosRef.current = { x, z };
    tryAutoEngageCombatRef.current();
    if (
      Math.hypot(x - spawnRef.current.x, z - spawnRef.current.z) > 0.6
    ) {
      setHasMoved(true);
    }
    const sceneBuildings =
      visitLandRef.current?.buildings ?? buildingsRef.current;
    const includeLandGate =
      !visitLandRef.current &&
      isPlayerLandKind(String(stateRef.current?.landKind ?? ""));
    const t = findInteractTarget(sceneBuildings, x, z, {
      includeLandGate,
      gateWorldZ: homesteadGateWorldZ(stateRef.current?.nftLandSize),
    });
    const key = targetKey(t);
    if (key !== targetKeyRef.current) {
      targetKeyRef.current = key;
      setTarget(t);
      const isPortal =
        t?.kind === "building" && t.building.type === "portal";
      const enteringPortal = Boolean(isPortal) && !portalNearRef.current;
      portalNearRef.current = Boolean(isPortal);
      // Reason: PL42.2 — one-shot ephemeral + soft world tip on first portal proximity.
      if (
        shouldFlashFirstPortalWalkUpCue(
          enteringPortal,
          portalWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        portalWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) savePortalWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstPortalWalkUpCueText());
        if (portalWalkUpClearRef.current) {
          clearTimeout(portalWalkUpClearRef.current);
          portalWalkUpClearRef.current = null;
        }
        setPortalWalkUpWorldTip(true);
        portalWalkUpClearRef.current = setTimeout(() => {
          setPortalWalkUpWorldTip(false);
          portalWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isArenaBoard =
        t?.kind === "building" && t.building.type === "arena_board";
      const enteringArena = Boolean(isArenaBoard) && !arenaNearRef.current;
      arenaNearRef.current = Boolean(isArenaBoard);
      // Reason: PL45.2 — one-shot ephemeral + soft world tip on first arena plaque proximity.
      if (
        shouldFlashFirstArenaWalkUpCue(
          enteringArena,
          arenaWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        arenaWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveArenaWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstArenaWalkUpCueText());
        if (arenaWalkUpClearRef.current) {
          clearTimeout(arenaWalkUpClearRef.current);
          arenaWalkUpClearRef.current = null;
        }
        setArenaWalkUpWorldTip(true);
        arenaWalkUpClearRef.current = setTimeout(() => {
          setArenaWalkUpWorldTip(false);
          arenaWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isBuildBoard =
        t?.kind === "building" && t.building.type === "build_board";
      const enteringBuildBoard =
        Boolean(isBuildBoard) && !buildBoardNearRef.current;
      buildBoardNearRef.current = Boolean(isBuildBoard);
      // Reason: PL52.1 — one-shot ephemeral + soft tip on first empty-yard build board; complements PL3.1 beacon.
      const yardEmpty =
        emptyLandBuildBeaconMode(
          visitLandRef.current?.buildings ?? buildingsRef.current,
        ) === "beacon";
      if (
        !visitLandRef.current &&
        shouldFlashFirstEmptyLandBuildBoardCue(
          enteringBuildBoard,
          yardEmpty,
          emptyLandBuildWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        emptyLandBuildWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveEmptyLandBuildWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstEmptyLandBuildBoardCueText());
        if (emptyLandBuildWalkUpClearRef.current) {
          clearTimeout(emptyLandBuildWalkUpClearRef.current);
          emptyLandBuildWalkUpClearRef.current = null;
        }
        setEmptyLandBuildWalkUpWorldTip(true);
        emptyLandBuildWalkUpClearRef.current = setTimeout(() => {
          setEmptyLandBuildWalkUpWorldTip(false);
          emptyLandBuildWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isMarketBoard =
        t?.kind === "building" && t.building.type === "market_board";
      const enteringMarket =
        Boolean(isMarketBoard) && !marketNearRef.current;
      marketNearRef.current = Boolean(isMarketBoard);
      // Reason: PL59.1 — one-shot ephemeral + soft world tip on first market board; complements post_craft_market.
      if (
        shouldFlashFirstMarketWalkUpCue(
          enteringMarket,
          marketWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        marketWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveMarketWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstMarketWalkUpCueText());
        if (marketWalkUpClearRef.current) {
          clearTimeout(marketWalkUpClearRef.current);
          marketWalkUpClearRef.current = null;
        }
        setMarketWalkUpWorldTip(true);
        marketWalkUpClearRef.current = setTimeout(() => {
          setMarketWalkUpWorldTip(false);
          marketWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isVendorStall =
        t?.kind === "building" && t.building.type === "vendor_stall";
      const enteringVendor =
        Boolean(isVendorStall) && !vendorNearRef.current;
      vendorNearRef.current = Boolean(isVendorStall);
      // Reason: PL59.2 — one-shot ephemeral + soft world tip on first vendor stall; tools/seeds.
      if (
        shouldFlashFirstVendorWalkUpCue(
          enteringVendor,
          vendorWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        vendorWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveVendorWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstVendorWalkUpCueText());
        if (vendorWalkUpClearRef.current) {
          clearTimeout(vendorWalkUpClearRef.current);
          vendorWalkUpClearRef.current = null;
        }
        setVendorWalkUpWorldTip(true);
        vendorWalkUpClearRef.current = setTimeout(() => {
          setVendorWalkUpWorldTip(false);
          vendorWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isFishingDock =
        t?.kind === "building" && t.building.type === "fishing_dock";
      const enteringFishingDock =
        Boolean(isFishingDock) && !fishingDockNearRef.current;
      fishingDockNearRef.current = Boolean(isFishingDock);
      // Reason: PL66.1 — one-shot ephemeral + soft world tip on first fishing dock; catch rules unchanged.
      if (
        shouldFlashFirstFishingDockWalkUpCue(
          enteringFishingDock,
          fishingDockWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        fishingDockWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveFishingDockWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstFishingDockWalkUpCueText());
        if (fishingDockWalkUpClearRef.current) {
          clearTimeout(fishingDockWalkUpClearRef.current);
          fishingDockWalkUpClearRef.current = null;
        }
        setFishingDockWalkUpWorldTip(true);
        fishingDockWalkUpClearRef.current = setTimeout(() => {
          setFishingDockWalkUpWorldTip(false);
          fishingDockWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isAnimalPen =
        t?.kind === "building" && t.building.type === "animal_pen";
      const enteringAnimalPen =
        Boolean(isAnimalPen) && !animalPenNearRef.current;
      animalPenNearRef.current = Boolean(isAnimalPen);
      // Reason: PL66.2 — one-shot ephemeral + soft world tip on first animal pen; care rules unchanged.
      if (
        shouldFlashFirstAnimalPenWalkUpCue(
          enteringAnimalPen,
          animalPenWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        animalPenWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveAnimalPenWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstAnimalPenWalkUpCueText());
        if (animalPenWalkUpClearRef.current) {
          clearTimeout(animalPenWalkUpClearRef.current);
          animalPenWalkUpClearRef.current = null;
        }
        setAnimalPenWalkUpWorldTip(true);
        animalPenWalkUpClearRef.current = setTimeout(() => {
          setAnimalPenWalkUpWorldTip(false);
          animalPenWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isTreeStump =
        t?.kind === "building" && t.building.type === "tree_stump";
      const enteringTreeStump =
        Boolean(isTreeStump) && !treeStumpNearRef.current;
      treeStumpNearRef.current = Boolean(isTreeStump);
      // Reason: PL68.1 — one-shot ephemeral + soft world tip on first tree stump; chop rules unchanged.
      if (
        shouldFlashFirstTreeStumpWalkUpCue(
          enteringTreeStump,
          treeStumpWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        treeStumpWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveTreeStumpWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstTreeStumpWalkUpCueText());
        if (treeStumpWalkUpClearRef.current) {
          clearTimeout(treeStumpWalkUpClearRef.current);
          treeStumpWalkUpClearRef.current = null;
        }
        setTreeStumpWalkUpWorldTip(true);
        treeStumpWalkUpClearRef.current = setTimeout(() => {
          setTreeStumpWalkUpWorldTip(false);
          treeStumpWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isOreNode =
        t?.kind === "building" && t.building.type === "ore_node";
      const enteringOreNode = Boolean(isOreNode) && !oreNodeNearRef.current;
      oreNodeNearRef.current = Boolean(isOreNode);
      // Reason: PL68.2 — one-shot ephemeral + soft world tip on first ore node; chip/hammer unchanged.
      if (
        shouldFlashFirstOreNodeWalkUpCue(
          enteringOreNode,
          oreNodeWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        oreNodeWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveOreNodeWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstOreNodeWalkUpCueText());
        if (oreNodeWalkUpClearRef.current) {
          clearTimeout(oreNodeWalkUpClearRef.current);
          oreNodeWalkUpClearRef.current = null;
        }
        setOreNodeWalkUpWorldTip(true);
        oreNodeWalkUpClearRef.current = setTimeout(() => {
          setOreNodeWalkUpWorldTip(false);
          oreNodeWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isCropPlot =
        t?.kind === "building" && t.building.type === "crop_plot";
      const enteringCropPlot =
        Boolean(isCropPlot) && !cropPlotNearRef.current;
      cropPlotNearRef.current = Boolean(isCropPlot);
      // Reason: PL68.3 — one-shot ephemeral + soft world tip on first crop plot; plant/harvest unchanged.
      if (
        shouldFlashFirstCropPlotWalkUpCue(
          enteringCropPlot,
          cropPlotWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        cropPlotWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveCropPlotWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstCropPlotWalkUpCueText());
        if (cropPlotWalkUpClearRef.current) {
          clearTimeout(cropPlotWalkUpClearRef.current);
          cropPlotWalkUpClearRef.current = null;
        }
        setCropPlotWalkUpWorldTip(true);
        cropPlotWalkUpClearRef.current = setTimeout(() => {
          setCropPlotWalkUpWorldTip(false);
          cropPlotWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isHuntTrail =
        t?.kind === "building" &&
        (t.building.type === "game_trail" ||
          t.building.type === "edge_thicket");
      const enteringHuntTrail =
        Boolean(isHuntTrail) && !huntTrailNearRef.current;
      huntTrailNearRef.current = Boolean(isHuntTrail);
      // Reason: PL68.4 — one-shot ephemeral + soft world tip on first trail/thicket; hunt rates unchanged.
      if (
        shouldFlashFirstHuntTrailWalkUpCue(
          enteringHuntTrail,
          huntTrailWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        huntTrailWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveHuntTrailWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstHuntTrailWalkUpCueText());
        if (huntTrailWalkUpClearRef.current) {
          clearTimeout(huntTrailWalkUpClearRef.current);
          huntTrailWalkUpClearRef.current = null;
        }
        setHuntTrailWalkUpWorldTip(true);
        huntTrailWalkUpClearRef.current = setTimeout(() => {
          setHuntTrailWalkUpWorldTip(false);
          huntTrailWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isKitchen =
        t?.kind === "building" && t.building.type === "kitchen";
      const enteringKitchen = Boolean(isKitchen) && !kitchenNearRef.current;
      kitchenNearRef.current = Boolean(isKitchen);
      // Reason: PL70.1 — one-shot ephemeral + soft world tip on first kitchen; craft recipes unchanged.
      if (
        shouldFlashFirstKitchenWalkUpCue(
          enteringKitchen,
          kitchenWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        kitchenWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveKitchenWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstKitchenWalkUpCueText());
        if (kitchenWalkUpClearRef.current) {
          clearTimeout(kitchenWalkUpClearRef.current);
          kitchenWalkUpClearRef.current = null;
        }
        setKitchenWalkUpWorldTip(true);
        kitchenWalkUpClearRef.current = setTimeout(() => {
          setKitchenWalkUpWorldTip(false);
          kitchenWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isNoticeBoard =
        t?.kind === "building" && t.building.type === "notice_board";
      const enteringNoticeBoard =
        Boolean(isNoticeBoard) && !noticeBoardNearRef.current;
      noticeBoardNearRef.current = Boolean(isNoticeBoard);
      // Reason: PL70.2 — one-shot ephemeral + soft world tip on first notice board; tip/mail rules unchanged.
      if (
        shouldFlashFirstNoticeBoardWalkUpCue(
          enteringNoticeBoard,
          noticeBoardWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        noticeBoardWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveNoticeBoardWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstNoticeBoardWalkUpCueText());
        if (noticeBoardWalkUpClearRef.current) {
          clearTimeout(noticeBoardWalkUpClearRef.current);
          noticeBoardWalkUpClearRef.current = null;
        }
        setNoticeBoardWalkUpWorldTip(true);
        noticeBoardWalkUpClearRef.current = setTimeout(() => {
          setNoticeBoardWalkUpWorldTip(false);
          noticeBoardWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isExpandPad = t?.kind === "expand";
      const enteringExpandPad =
        Boolean(isExpandPad) && !expandPadNearRef.current;
      expandPadNearRef.current = Boolean(isExpandPad);
      // Reason: PL72.1 — one-shot ephemeral + soft world tip on first expand pad; costs unchanged.
      if (
        shouldFlashFirstExpandPadWalkUpCue(
          enteringExpandPad,
          expandPadWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        expandPadWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveExpandPadWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstExpandPadWalkUpCueText());
        if (expandPadWalkUpClearRef.current) {
          clearTimeout(expandPadWalkUpClearRef.current);
          expandPadWalkUpClearRef.current = null;
        }
        setExpandPadWalkUpWorldTip(true);
        expandPadWalkUpClearRef.current = setTimeout(() => {
          setExpandPadWalkUpWorldTip(false);
          expandPadWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isMill = t?.kind === "building" && t.building.type === "mill";
      const enteringMill = Boolean(isMill) && !millNearRef.current;
      millNearRef.current = Boolean(isMill);
      // Reason: PL74.1 — one-shot ephemeral + soft world tip on first mill; craft recipes unchanged.
      if (
        shouldFlashFirstMillWalkUpCue(
          enteringMill,
          millWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        millWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveMillWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstMillWalkUpCueText());
        if (millWalkUpClearRef.current) {
          clearTimeout(millWalkUpClearRef.current);
          millWalkUpClearRef.current = null;
        }
        setMillWalkUpWorldTip(true);
        millWalkUpClearRef.current = setTimeout(() => {
          setMillWalkUpWorldTip(false);
          millWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isWorkshop =
        t?.kind === "building" && t.building.type === "workshop";
      const enteringWorkshop =
        Boolean(isWorkshop) && !workshopNearRef.current;
      workshopNearRef.current = Boolean(isWorkshop);
      // Reason: PL74.2 — one-shot ephemeral + soft world tip on first workshop; craft recipes unchanged.
      if (
        shouldFlashFirstWorkshopWalkUpCue(
          enteringWorkshop,
          workshopWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        workshopWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveWorkshopWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstWorkshopWalkUpCueText());
        if (workshopWalkUpClearRef.current) {
          clearTimeout(workshopWalkUpClearRef.current);
          workshopWalkUpClearRef.current = null;
        }
        setWorkshopWalkUpWorldTip(true);
        workshopWalkUpClearRef.current = setTimeout(() => {
          setWorkshopWalkUpWorldTip(false);
          workshopWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isForge = t?.kind === "building" && t.building.type === "forge";
      const enteringForge = Boolean(isForge) && !forgeNearRef.current;
      forgeNearRef.current = Boolean(isForge);
      // Reason: PL74.3 — one-shot ephemeral + soft world tip on first forge; craft recipes unchanged.
      if (
        shouldFlashFirstForgeWalkUpCue(
          enteringForge,
          forgeWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        forgeWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveForgeWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstForgeWalkUpCueText());
        if (forgeWalkUpClearRef.current) {
          clearTimeout(forgeWalkUpClearRef.current);
          forgeWalkUpClearRef.current = null;
        }
        setForgeWalkUpWorldTip(true);
        forgeWalkUpClearRef.current = setTimeout(() => {
          setForgeWalkUpWorldTip(false);
          forgeWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isLoom = t?.kind === "building" && t.building.type === "loom";
      const enteringLoom = Boolean(isLoom) && !loomNearRef.current;
      loomNearRef.current = Boolean(isLoom);
      // Reason: PL77.1 — one-shot ephemeral + soft world tip on first loom; craft recipes unchanged.
      if (
        shouldFlashFirstLoomWalkUpCue(
          enteringLoom,
          loomWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        loomWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveLoomWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstLoomWalkUpCueText());
        if (loomWalkUpClearRef.current) {
          clearTimeout(loomWalkUpClearRef.current);
          loomWalkUpClearRef.current = null;
        }
        setLoomWalkUpWorldTip(true);
        loomWalkUpClearRef.current = setTimeout(() => {
          setLoomWalkUpWorldTip(false);
          loomWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isAlchemyBench =
        t?.kind === "building" && t.building.type === "alchemy_bench";
      const enteringAlchemyBench =
        Boolean(isAlchemyBench) && !alchemyBenchNearRef.current;
      alchemyBenchNearRef.current = Boolean(isAlchemyBench);
      // Reason: PL77.2 — one-shot ephemeral + soft world tip on first alchemy bench; craft recipes unchanged.
      if (
        shouldFlashFirstAlchemyBenchWalkUpCue(
          enteringAlchemyBench,
          alchemyBenchWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        alchemyBenchWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveAlchemyBenchWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstAlchemyBenchWalkUpCueText());
        if (alchemyBenchWalkUpClearRef.current) {
          clearTimeout(alchemyBenchWalkUpClearRef.current);
          alchemyBenchWalkUpClearRef.current = null;
        }
        setAlchemyBenchWalkUpWorldTip(true);
        alchemyBenchWalkUpClearRef.current = setTimeout(() => {
          setAlchemyBenchWalkUpWorldTip(false);
          alchemyBenchWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isDecorPad =
        t?.kind === "building" && t.building.type === "decor_pad";
      const enteringDecorPad =
        Boolean(isDecorPad) && !decorPadNearRef.current;
      decorPadNearRef.current = Boolean(isDecorPad);
      // Reason: PL75.1 — one-shot ephemeral + soft world tip on first decor pad; costs unchanged.
      if (
        shouldFlashFirstDecorPadWalkUpCue(
          enteringDecorPad,
          decorPadWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        decorPadWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveDecorPadWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstDecorPadWalkUpCueText());
        if (decorPadWalkUpClearRef.current) {
          clearTimeout(decorPadWalkUpClearRef.current);
          decorPadWalkUpClearRef.current = null;
        }
        setDecorPadWalkUpWorldTip(true);
        decorPadWalkUpClearRef.current = setTimeout(() => {
          setDecorPadWalkUpWorldTip(false);
          decorPadWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isTutorNpc =
        t?.kind === "building" && t.building.type === "tutorial_npc";
      const enteringTutor = Boolean(isTutorNpc) && !tutorNearRef.current;
      tutorNearRef.current = Boolean(isTutorNpc);
      // Reason: PL76.2 — one-shot ephemeral + soft world tip on first any-profession tutor; XP / claim unchanged.
      if (
        shouldFlashFirstTutorWalkUpCue(
          enteringTutor,
          tutorWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        tutorWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveTutorWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstTutorWalkUpCueText());
        if (tutorWalkUpClearRef.current) {
          clearTimeout(tutorWalkUpClearRef.current);
          tutorWalkUpClearRef.current = null;
        }
        setTutorWalkUpWorldTip(true);
        tutorWalkUpClearRef.current = setTimeout(() => {
          setTutorWalkUpWorldTip(false);
          tutorWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
      const isClaimNode =
        t?.kind === "building" && t.building.type === "claim_node";
      const enteringClaimNode =
        Boolean(isClaimNode) && !claimNodeNearRef.current;
      claimNodeNearRef.current = Boolean(isClaimNode);
      // Reason: PL80.1 — one-shot ephemeral + soft world tip on first claim beacon; claim / war rules unchanged.
      if (
        shouldFlashFirstClaimNodeWalkUpCue(
          enteringClaimNode,
          claimNodeWalkUpSeenRef.current,
          clientSettingsRef.current.showTips,
        )
      ) {
        claimNodeWalkUpSeenRef.current = true;
        const user = stateRef.current?.username;
        if (user) saveClaimNodeWalkUpSeen(user);
        flashSuccessCueRef.current?.(firstClaimNodeWalkUpCueText());
        if (claimNodeWalkUpClearRef.current) {
          clearTimeout(claimNodeWalkUpClearRef.current);
          claimNodeWalkUpClearRef.current = null;
        }
        setClaimNodeWalkUpWorldTip(true);
        claimNodeWalkUpClearRef.current = setTimeout(() => {
          setClaimNodeWalkUpWorldTip(false);
          claimNodeWalkUpClearRef.current = null;
        }, SUCCESS_CUE_MS);
      }
    }
  }, []);

  gameNowRef.current = gameNow;

  /**
   * Picks up a homestead station. When `thenPlace` is true, immediately
   * starts the place ghost so the player can move it.
   */
  async function pickupHomesteadBuilding(
    buildingId: string,
    thenPlace: boolean,
  ) {
    const authToken = tokenRef.current;
    if (!authToken || busyRef.current || visitLandRef.current) return;
    const snap = stateRef.current;
    if (!snap) return;
    const building = snap.buildings.find((b) => b.id === buildingId);
    if (!building || !canPickupHomesteadBuilding(building.type, building.slotIndex))
      return;
    const kitItemId = kitItemIdForHomesteadBuilding(building.type);
    const prevIds = new Set(snap.inventory.map((row) => row.id));
    busyRef.current = true;
    setBusy(true);
    try {
      const res = await apiPickupStation(
        authToken,
        buildingId,
        playerPosRef.current,
      );
      await applyState(res);
      if (res.ok) {
        audioRef.current?.playSfx("build");
        flashSuccessCue(thenPlace ? "Moving" : "Picked up");
        setLandEditorSelectedId(null);
        if (thenPlace && kitItemId && res.state) {
          const kitId = kitInventoryIdAfterPickup(
            prevIds,
            res.state.inventory,
            kitItemId,
          );
          if (kitId) {
            setPlaceFacing(0);
            setPlacingKitInventoryId(kitId);
          }
        }
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  const expandField = useCallback(async () => {
    const authToken = tokenRef.current;
    if (!authToken || busyRef.current || visitLandRef.current) return;
    const pos = playerPosRef.current;
    busyRef.current = true;
    setBusy(true);
    try {
      const occupied = (stateRef.current?.buildings ?? []).map(
        (b) => b.slotIndex,
      );
      const footprint = nextSlotExpansion(occupied);
      const res = await apiExpandLand(authToken, pos);
      if (res.ok) {
        audioRef.current?.playSfx("expand");
        flashSuccessCue(expandFieldSuccessCueText());
        flashExpandFieldWorldReinforce(true);
        if (
          shouldFlashExpandFieldPad(true) &&
          footprint &&
          Number.isFinite(footprint.x) &&
          Number.isFinite(footprint.z)
        ) {
          if (expandFieldFlashClearRef.current) {
            clearTimeout(expandFieldFlashClearRef.current);
            expandFieldFlashClearRef.current = null;
          }
          setExpandFieldFlashX(footprint.x);
          setExpandFieldFlashZ(footprint.z);
          setExpandFieldFlashStartedAt(performance.now());
          expandFieldFlashClearRef.current = setTimeout(() => {
            setExpandFieldFlashX(null);
            setExpandFieldFlashZ(null);
            setExpandFieldFlashStartedAt(null);
            expandFieldFlashClearRef.current = null;
          }, EXPAND_FIELD_PAD_FLASH.durationMs);
        }
      }
      await applyState(res);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [flashSuccessCue, flashExpandFieldWorldReinforce]);

  const actLiveCombatClick = useCallback(
    async (action: "attack" | "block") => {
      const token = tokenRef.current;
      if (!token || combatBusyRef.current) return;
      const combat = stateRef.current?.combat;
      if (!combat?.active) return;
      if (action === "attack") {
        const now = performance.now();
        if (now < lastCombatAttackAtRef.current + LIVE_COMBAT.attackCooldownMs) {
          return;
        }
        lastCombatAttackAtRef.current = now;
        setCombatSwingAt(now);
      }
      combatBusyRef.current = true;
      try {
        const prevTool = stateRef.current?.equippedToolInventoryId ?? null;
        const res = await apiCombatAct(token, action, playerPosRef.current);
        if (!res.ok && res.error === ACTION_ERROR.combatAttackWait) return;
        await applyState(res, { prevEquippedToolId: prevTool });
      } finally {
        combatBusyRef.current = false;
      }
    },
    [],
  );

  useEffect(() => {
    const combat = state?.combat;
    if (!combat?.active) {
      prevFoeHealthRef.current = null;
      return;
    }
    if (
      prevFoeHealthRef.current != null &&
      combat.foeHealth < prevFoeHealthRef.current
    ) {
      setCombatHitAt(performance.now());
    }
    prevFoeHealthRef.current = combat.foeHealth;
  }, [state?.combat]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!stateRef.current?.combat?.active) return;
      const el = event.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (el?.closest?.(".panel, button, a, input")) return;
      if (event.button === 0) {
        event.preventDefault();
        void actLiveCombatClick("attack");
      }
      if (event.button === 2) {
        event.preventDefault();
        void actLiveCombatClick("block");
      }
    }
    function onContextMenu(event: MouseEvent) {
      if (stateRef.current?.combat?.active) event.preventDefault();
    }
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("contextmenu", onContextMenu, true);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("contextmenu", onContextMenu, true);
    };
  }, [actLiveCombatClick]);

  useEffect(() => {
    tryAutoEngageCombatRef.current = () => {
      if (combatStartBusyRef.current) return;
      if (visitLandRef.current) return;
      const st = stateRef.current;
      if (!st || st.combat?.active) return;
      if (
        !isExploreLandKind(String(st.landKind ?? "")) &&
        !isWarriorLandKind(String(st.landKind ?? ""))
      ) {
        return;
      }
      const token = tokenRef.current;
      if (!token) return;
      const pos = playerPosRef.current;
      const now = syncedNow(serverNowRef.current, receivedAtRef.current);
      gameNowRef.current = now;
      const prey = findAutoEngagePrey(buildingsRef.current, pos, now);
      if (!prey) return;
      combatStartBusyRef.current = true;
      const prevTool = st.equippedToolInventoryId ?? null;
      void apiCombatStart(token, prey.id, pos)
        .then((res) => {
          if (!res.ok) return;
          return applyState(res, { prevEquippedToolId: prevTool });
        })
        .finally(() => {
          combatStartBusyRef.current = false;
        });
    };
  });

  useEffect(() => {
    if (!state?.combat?.active) return;
    let stopped = false;
    const id = window.setInterval(() => {
      if (stopped || combatTickInFlightRef.current) return;
      const token = tokenRef.current;
      if (!token || !stateRef.current?.combat?.active) return;
      combatTickInFlightRef.current = true;
      const prevTool = stateRef.current?.equippedToolInventoryId ?? null;
      void apiCombatTick(token, playerPosRef.current)
        .then((res) => applyState(res, { prevEquippedToolId: prevTool }))
        .finally(() => {
          combatTickInFlightRef.current = false;
        });
    }, LIVE_COMBAT.tickMs);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [state?.combat?.active]);

  useEffect(() => {
    if (state?.combat?.active) return;
    if (
      !isExploreLandKind(String(state?.landKind ?? "")) &&
      !isWarriorLandKind(String(state?.landKind ?? ""))
    ) {
      return;
    }
    let stopped = false;
    const id = window.setInterval(() => {
      if (stopped) return;
      tryAutoEngageCombatRef.current();
    }, 180);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [state?.landKind, state?.combat?.active]);

  const interact = useCallback(async () => {
    const token = tokenRef.current;
    if (!token || busyRef.current) return;
    if (visitLandRef.current) {
      // Reason: PL31.1 — no sticky leave/trade prose; banner + Esc/Go home; T unchanged.
      const sticky = visitInteractStickyInfo();
      if (sticky) setInfo(sticky);
      return;
    }

    if (stateRef.current?.combat?.active) {
      void actLiveCombatClick("attack");
      return;
    }

    const pos = playerPosRef.current;
    const includeLandGate = isPlayerLandKind(
      String(stateRef.current?.landKind ?? ""),
    );
    const live = findInteractTarget(buildingsRef.current, pos.x, pos.z, {
      includeLandGate,
      gateWorldZ: homesteadGateWorldZ(stateRef.current?.nftLandSize),
    });
    const target = live ?? targetRef.current;
    if (!target) return;
    const now = syncedNow(serverNowRef.current, receivedAtRef.current);
    gameNowRef.current = now;

    if (target.kind === "expand") {
      await expandField();
      return;
    }

    if (target.kind === "gate") {
      openTravelPanel();
      return;
    }

    const building = target.building;
    if (building.type === "crop_plot") {
      const crop = clientCropState(building, gameNowRef.current);
      if (crop === "planted") return;
      if (crop === "empty") {
        const seeds = plantableSeedsFromInventory(stateRef.current?.inventory);
        if (seeds.length > 1) {
          setPlantBuildingId(building.id);
          setPanel("plant");
          return;
        }
      }
      busyRef.current = true;
      setBusy(true);
      const prevTool = stateRef.current?.equippedToolInventoryId ?? null;
      const prevForWear = stateRef.current;
      try {
      if (crop === "empty") {
        const seeds = plantableSeedsFromInventory(stateRef.current?.inventory);
        const seedItemId: ItemId = seeds[0]?.seedItemId ?? "wheat_seed";
        const res = await apiPlant(token, building.id, pos, seedItemId);
        if (res.ok) {
          audioRef.current?.playSfx("plant");
          const toolBroke =
            Boolean(prevTool) && Boolean(res.state) && !res.state?.equippedToolInventoryId;
          const toolLowEdge =
            Boolean(res.state) &&
            shouldFlashToolDurabilityLowBetweenStates(prevForWear, res.state!);
          // Reason: PL61.1 — keep Tool low visible; do not clobber with Planted.
          if (!toolBroke && !toolLowEdge) {
            flashSuccessCue(plantSuccessCueText(seedItemId), { pulsePrompt: true });
          }
          // Reason: PL127.2 — brief soft sprout world rim; grow timers / seeds unchanged.
          if (shouldFlashCropPlantSuccessWorldReinforce(true)) {
            if (cropPlantSuccessWorldReinforceClearRef.current) {
              clearTimeout(cropPlantSuccessWorldReinforceClearRef.current);
            }
            setCropPlantSuccessWorldReinforce(true);
            cropPlantSuccessWorldReinforceClearRef.current = setTimeout(() => {
              setCropPlantSuccessWorldReinforce(false);
              cropPlantSuccessWorldReinforceClearRef.current = null;
            }, CROP_PLANT_SUCCESS_WORLD_REINFORCE.durationMs);
          }
        }
        await applyState(res, { prevEquippedToolId: prevTool });
      } else if (crop === "ready") {
        const res = await apiHarvest(token, building.id, pos);
        if (res.ok) {
          audioRef.current?.playSfx("harvest");
          flashSuccessCue(
            harvestSuccessCueText(
              resolveHarvestLootCue(
                building.cropId,
                prevForWear?.inventory,
                res.state?.inventory,
              ),
            ),
            { pulsePrompt: true },
          );
          // Reason: PL151.2 — one-shot wheat-gold rim beside Harvested + ready rim.
          if (shouldFlashCropHarvestWorldReinforce(true)) {
            if (cropHarvestWorldReinforceClearRef.current) {
              clearTimeout(cropHarvestWorldReinforceClearRef.current);
            }
            setCropHarvestWorldReinforce(true);
            cropHarvestWorldReinforceClearRef.current = setTimeout(() => {
              setCropHarvestWorldReinforce(false);
              cropHarvestWorldReinforceClearRef.current = null;
            }, CROP_HARVEST_WORLD_REINFORCE.durationMs);
          }
        }
        await applyState(res);
      }
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
      return;
    }

    const panelIntent = buildingPanelIntent(building);
    if (panelIntent) {
      if (panelIntent.type === "craft") {
        // Reason: kinship harvest — E collects when your job is ready.
        if (
          building.craft?.isYours &&
          building.craft.state === "ready"
        ) {
          busyRef.current = true;
          setBusy(true);
          try {
          const recipeId = building.craft?.recipeId ?? null;
          const prevInv = stateRef.current?.inventory;
          const res = await apiCollectCraft(token, building.id, pos);
          if (res.ok) {
            audioRef.current?.playSfx("craft");
            flashSuccessCue(
              craftCollectCueText(
                resolveCraftOutputLoot(
                  recipeId,
                  prevInv,
                  res.state?.inventory,
                ),
              ),
              { pulsePrompt: true },
            );
            flashCraftCompleteWorldReinforce(true);
            if (
              shouldFlashCraftCompleteBench(true) &&
              panelIntent.station
            ) {
              if (craftCompleteFlashClearRef.current) {
                clearTimeout(craftCompleteFlashClearRef.current);
                craftCompleteFlashClearRef.current = null;
              }
              setCraftCompleteFlashStation(panelIntent.station);
              setCraftCompleteFlashStartedAt(performance.now());
              craftCompleteFlashClearRef.current = setTimeout(() => {
                setCraftCompleteFlashStation(null);
                setCraftCompleteFlashStartedAt(null);
                craftCompleteFlashClearRef.current = null;
              }, CRAFT_COMPLETE_BENCH_FLASH.durationMs);
            }
          }
          await applyState(res);
          } finally {
            busyRef.current = false;
            setBusy(false);
          }
          return;
        }
        setCraftStation(panelIntent.station);
        setCraftBuildingId(panelIntent.buildingId);
        // Reason: PL24.2 — brief open accent on walk-up craft; recipes unchanged.
        if (shouldPlayCraftOpenAccent(panelRef.current, "craft")) {
          flashCraftOpenAccent();
        }
        setPanel("craft");
        return;
      }
      if (panelIntent.type === "travel") {
        openTravelPanel();
        return;
      }
      if (panelIntent.type === "decor") {
        setDecorBuildingId(panelIntent.buildingId);
        // Reason: PL34.2 — brief open accent on Housing decor walk-up; coin costs unchanged.
        if (shouldPlayDecorOpenAccent(panelRef.current, "decor")) {
          flashDecorOpenAccent();
        }
        setPanel("decor");
        return;
      }
      if (panelIntent.type === "vendor") {
        setHasVendorVisit(true);
        // Reason: PL19.1 — brief open accent on walk-up; prices unchanged.
        if (shouldPlayVendorOpenAccent(panelRef.current, "vendor")) {
          flashVendorOpenAccent();
        }
        setPanel("vendor");
        return;
      }
      if (panelIntent.type === "tutorial_npc") {
        if (
          shouldSkipTutorialNpcReopen(
            panelRef.current,
            tutorialProfessionIdRef.current,
            panelIntent.professionId,
          )
        ) {
          return;
        }
        setTutorialProfessionId(panelIntent.professionId);
        setTutorialNpc(null);
        if (panelIntent.professionId === "mayor" && state) {
          const next = [...new Set([...dismissedTips, "welcome" as const])];
          setDismissedTips(next);
          saveDismissedTips(state.username, next);
        }
        // Reason: PL55.1 — brief open accent on tutor walk-up; XP / claim rules unchanged.
        if (shouldPlayTutorialNpcOpenAccent(panelRef.current, "tutorial_npc")) {
          flashTutorialNpcOpenAccent();
        }
        setPanel("tutorial_npc");
        return;
      }
      if (panelIntent.type === "market") {
        setRealmMarketId(null);
        setMarketBoardId(panelIntent.buildingId);
        // Reason: PL19.2 — brief open accent on board open; listings unchanged.
        if (shouldPlayMarketOpenAccent(panelRef.current, "market")) {
          flashMarketOpenAccent();
        }
        setPanel("market");
        if (token) {
          void apiListMarket(token).then((res) => {
            if (res.ok && res.listings) setListings(res.listings);
          });
        }
        return;
      }
      if (panelIntent.type === "realm_market") {
        setMarketBoardId(null);
        setRealmMarketId(panelIntent.buildingId);
        // Reason: stall E opens its own desk — not the B Creditcoin tabs.
        if (shouldPlayRealmMarketOpenAccent(panelRef.current, "realm_market")) {
          flashMarketOpenAccent();
        }
        setPanel("realm_market");
        if (token) {
          void apiCreditcoinSnapshot(token).then((res) => {
            if (res.ok) void applyState(res);
          });
        }
        return;
      }
      if (panelIntent.type === "build") {
        // Reason: PL24.1 — brief open accent on Build Board walk-up; place costs unchanged.
        if (shouldPlayBuildOpenAccent(panelRef.current, "build")) {
          flashBuildOpenAccent();
        }
        setPanel("build");
        return;
      }
      if (panelIntent.type === "arena") {
        // Reason: PL52.2 — brief warm open accent on Arena stub; optional path copy unchanged.
        if (shouldPlayArenaOpenAccent(panelRef.current, "arena")) {
          flashArenaOpenAccent();
        }
        setPanel("arena");
        return;
      }
      if (panelIntent.type === "notice") {
        // Reason: PL34.3 — brief open accent on Notice walk-up; tips + PL17.1 unread still work.
        if (shouldPlayNoticeOpenAccent(panelRef.current, "notice")) {
          flashNoticeOpenAccent();
        }
        setPanel("notice");
      }
      return;
    }

    if (
      building.type === "ore_node" ||
      building.type === "tree_stump" ||
      building.type === "fishing_dock" ||
      building.type === "animal_pen"
    ) {
      busyRef.current = true;
      setBusy(true);
      const prevTool = stateRef.current?.equippedToolInventoryId ?? null;
      const prevForWear = stateRef.current;
      try {
      const res = await apiGatherOre(token, building.id, pos);
      if (res.ok) {
        audioRef.current?.playSfx("gather");
        // Reason: PL43.1 — ephemeral gather confirm; yields/cooldowns unchanged; mute ok.
        const toolBroke =
          Boolean(prevTool) &&
          Boolean(res.state) &&
          !res.state?.equippedToolInventoryId;
        const toolLowEdge =
          Boolean(res.state) &&
          shouldFlashToolDurabilityLowBetweenStates(prevForWear, res.state!);
        // Reason: PL61.1 — keep Tool low visible; do not clobber with Mined/Chopped/etc.
        if (!toolBroke && !toolLowEdge) {
          flashSuccessCue(
            gatherSuccessCueText(
              building.type,
              resolveGatherLootCue(
                building.type,
                building.cropId,
                prevForWear?.inventory,
                res.state?.inventory,
              ),
            ),
            {
              pulsePrompt: true,
            },
          );
        }
        // Reason: PL131.2 — brief mint-lime pad on stump / ore / pen (dock splash is PL132.1).
        if (shouldFlashGatherSuccessPad(true, building.type)) {
          if (gatherSuccessFlashClearRef.current) {
            clearTimeout(gatherSuccessFlashClearRef.current);
            gatherSuccessFlashClearRef.current = null;
          }
          setGatherSuccessFlashBuildingId(building.id);
          setGatherSuccessFlashStartedAt(performance.now());
          gatherSuccessFlashClearRef.current = setTimeout(() => {
            setGatherSuccessFlashBuildingId(null);
            setGatherSuccessFlashStartedAt(null);
            gatherSuccessFlashClearRef.current = null;
          }, GATHER_SUCCESS_PAD_FLASH.durationMs);
        }
        // Reason: PL161.1 — brief mint-lime world rim after gather ok (complements pad).
        flashGatherSuccessWorldReinforce(true, building.type);
        // Reason: PL132.1 — brief cool water splash on dock catch (≠ gather mint pad).
        if (shouldFlashFishCatchSplash(true, building.type)) {
          if (fishCatchSplashClearRef.current) {
            clearTimeout(fishCatchSplashClearRef.current);
            fishCatchSplashClearRef.current = null;
          }
          setFishCatchSplashBuildingId(building.id);
          setFishCatchSplashStartedAt(performance.now());
          fishCatchSplashClearRef.current = setTimeout(() => {
            setFishCatchSplashBuildingId(null);
            setFishCatchSplashStartedAt(null);
            fishCatchSplashClearRef.current = null;
          }, FISH_CATCH_SPLASH_FLASH.durationMs);
        }
        // Reason: PL161.2 — brief cool water world rim after fish catch ok (complements splash).
        flashFishCatchWorldReinforce(true, building.type);
      }
      await applyState(res, {
        prevEquippedToolId: prevTool,
      });
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
      return;
    }

    if (building.type === "claim_node") {
      busyRef.current = true;
      setBusy(true);
      try {
      const res = await apiClaimNode(token, building.id, pos);
      if (res.ok) {
        // Reason: PL31.2 — ephemeral claim / soft-war / collect cues; rules unchanged.
        if (res.claimed) {
          audioRef.current?.playSfx("guild_claim");
          flashSuccessCue(guildClaimSuccessCueText());
        } else if (res.contestStarted) {
          audioRef.current?.playSfx("soft_war");
          flashSuccessCue(softWarStartSuccessCueText());
        } else if (res.delivered) {
          // Deliver scoring stays brief sticky-free; same interact path as collect.
          audioRef.current?.playSfx("guild_claim");
          const cue = guildDeliverSuccessCueText(res.delivered);
          if (cue) flashSuccessCue(cue);
          // Reason: PL146.2 — brief soft ember rim when deliver scores; scoring unchanged.
          flashSoftWarDeliverWorldReinforce(true, res.delivered);
        } else if (res.collected) {
          audioRef.current?.playSfx("guild_claim");
          const cue = guildCollectSuccessCueText(res.collected);
          if (cue) flashSuccessCue(cue);
        }
      }
      await applyState(res);
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
      return;
    }

    if (isCombatBuildingType(building.type)) {
      busyRef.current = true;
      setBusy(true);
      try {
        const prevTool = stateRef.current?.equippedToolInventoryId ?? null;
        const res = await apiCombatStart(token, building.id, pos);
        await applyState(res, { prevEquippedToolId: prevTool });
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
      return;
    }

  }, [expandField, flashSuccessCue, flashVendorOpenAccent, flashMarketOpenAccent, flashBuildOpenAccent, flashCraftOpenAccent, flashDecorOpenAccent, flashNoticeOpenAccent, flashArenaOpenAccent, flashTutorialNpcOpenAccent, openTravelPanel, actLiveCombatClick]);

  const leaveVisit = useCallback(() => {
    // Reason: PL27.1 — only cue when actually leaving a visit; own-land idle stays silent.
    // Reason: PL114.2 — soft Your land tip + Land map-chip pulse reinforce Home ephemeral.
    // Reason: PL139.1 — soft meadow world rim reinforces home return beside tip/chip.
    if (!visitLandRef.current) return;
    setVisitLand(null);
    setPanel(null);
    setVisitLandWalkUpWorldTip(false);
    setVisitHostNameplateReinforce(false);
    if (visitHostNameplateReinforceClearRef.current) {
      clearTimeout(visitHostNameplateReinforceClearRef.current);
      visitHostNameplateReinforceClearRef.current = null;
    }
    audioRef.current?.playSfx("visit_leave");
    flashSuccessCue(visitLeaveSuccessCueText());
    if (shouldShowVisitHomeReturnWorldTip(true)) {
      if (visitHomeReturnClearRef.current) {
        clearTimeout(visitHomeReturnClearRef.current);
        visitHomeReturnClearRef.current = null;
      }
      setVisitHomeReturnWorldTip(true);
      visitHomeReturnClearRef.current = setTimeout(() => {
        setVisitHomeReturnWorldTip(false);
        visitHomeReturnClearRef.current = null;
      }, SUCCESS_CUE_MS);
    }
    if (shouldPulseMapChipOnVisitHomeReturn(true)) {
      flashMapChipArrivePulse();
    }
    flashVisitHomeReturnWorldReinforce(true);
  }, [
    flashSuccessCue,
    flashMapChipArrivePulse,
    flashVisitHomeReturnWorldReinforce,
  ]);

  const closePanelHotkey = useCallback(() => {
    setPanel(null);
    clearInventoryOpenAccent();
    clearVendorOpenAccent();
    clearMarketOpenAccent();
    clearBuildOpenAccent();
    clearCraftOpenAccent();
    clearTravelOpenAccent();
    clearTradeOpenAccent();
    clearQuestOpenAccent();
    clearMailOpenAccent();
    clearDecorOpenAccent();
    clearNoticeOpenAccent();
    clearChatOpenAccent();
    clearSettingsOpenAccent();
    clearGuildOpenAccent();
    clearGuildMembershipOpenAccent();
    clearAchievementsOpenAccent();
    clearArenaOpenAccent();
    setCraftStation(null);
    setCraftBuildingId(null);
    setPlantBuildingId(null);
    setMarketBoardId(null);
    setRealmMarketId(null);
  }, []);

  const playerLandHotkeyRef = useRef(false);
  playerLandHotkeyRef.current = Boolean(
    !visitLand && state && isPlayerLandKind(state.landKind),
  );

  usePanelHotkeys({
    visitingRef: visitLandRef,
    playerLandRef: playerLandHotkeyRef,
    panelRef,
    setPanel,
    setMarketBoardId,
    setRealmMarketId,
    onLeaveVisit: leaveVisit,
    onClosePanel: closePanelHotkey,
    onInteract: interact,
    onPanelOpened: (opened) => {
      if (opened === "inventory") {
        flashInventoryOpenAccent();
        // Reason: PL198.2 — opening I acknowledges pickup idle glance (slot flash wins).
        clearInventoryPickupIdleGlance();
      }
      // Reason: PL19.2 — M hotkey also opens the same market panel.
      if (opened === "market") flashMarketOpenAccent();
      // Reason: PL24.3 — N hotkey opens Travel with the same brief accent.
      if (opened === "travel") flashTravelOpenAccent();
      // Reason: PL29.1 — T hotkey / invite review opens Trade with brief accent.
      if (opened === "trade") flashTradeOpenAccent();
      // Reason: PL29.2 — Q hotkey opens Quest log with brief accent.
      if (opened === "quests") flashQuestOpenAccent();
      // Reason: PL34.1 — L hotkey opens Mail with brief accent.
      if (opened === "mail") flashMailOpenAccent();
      // Reason: PL38.1 — C hotkey opens Chat with brief accent.
      // Reason: PL197.1 — opening C acknowledges staged unread chat glance.
      if (opened === "chat") {
        flashChatOpenAccent();
        setPendingChatGlanceLines(clearPendingChatGlanceLines());
      }
      // Reason: PL38.2 — H hotkey opens Settings with brief accent.
      if (opened === "settings") flashSettingsOpenAccent();
      // Reason: PL46.1 / PL140.2 — G opens Guild; membership gets cooler accent.
      if (opened === "guild") {
        flashGuildOpenAccent(
          shouldPlayGuildMembershipOpenAccent(
            null,
            "guild",
            Boolean(state?.guildName),
          ),
        );
      }
      // Reason: PL46.2 — J hotkey opens Achievements with brief accent (A is WASD).
      // Reason: PL195.2 — opening J acknowledges staged unlock glance.
      if (opened === "achievements") {
        flashAchievementsOpenAccent();
        setPendingAchievementUnlocks(clearPendingAchievementUnlocks());
      }
      // Reason: PL55.2 — B hotkey opens Deed desk with brief accent (wallet path).
      if (opened === "deeds") flashDeedOpenAccent();
      if (opened === "build") flashBuildOpenAccent();
    },
  });

  useEffect(() => {
    const building =
      target?.kind === "building" ? target.building : null;
    const walkAway = resolveContextualWalkAway({
      panel,
      craftStation,
      tutorialProfessionId,
      marketBoardId,
      realmMarketId,
      targetBuilding: building,
    });
    if (!walkAway.close) return;
    setPanel(null);
    clearVendorOpenAccent();
    clearMarketOpenAccent();
    clearBuildOpenAccent();
    clearCraftOpenAccent();
    clearTravelOpenAccent();
    clearTradeOpenAccent();
    clearQuestOpenAccent();
    clearMailOpenAccent();
    clearDecorOpenAccent();
    clearNoticeOpenAccent();
    clearChatOpenAccent();
    clearSettingsOpenAccent();
    clearGuildOpenAccent();
    clearGuildMembershipOpenAccent();
    clearAchievementsOpenAccent();
    clearTutorialNpcOpenAccent();
    clearDeedOpenAccent();
    if (walkAway.clearCraft) {
      setCraftStation(null);
      setCraftBuildingId(null);
    }
    if (walkAway.clearTutorial) {
      setTutorialProfessionId(null);
      setTutorialNpc(null);
    }
    if (walkAway.clearMarketBoard) setMarketBoardId(null);
    if (walkAway.clearRealmMarket) setRealmMarketId(null);
  }, [
    target,
    panel,
    craftStation,
    tutorialProfessionId,
    marketBoardId,
    realmMarketId,
  ]);

  const noticeUnread = useMemo(
    () => hasUnreadNoticeTips(seenNoticeTips),
    [seenNoticeTips],
  );

  const markNoticeTipsSeen = useCallback(
    (tipIds: string[]) => {
      if (!state) return;
      setSeenNoticeTips((prev) => {
        if (tipIds.every((id) => prev.includes(id))) return prev;
        const next = [...new Set([...prev, ...tipIds])];
        saveSeenNoticeTips(state.username, next);
        return next;
      });
    },
    [state],
  );

  const prompt = useMemo(
    () => {
      const snap = stateRef.current;
      const equippedId = snap?.equippedToolInventoryId ?? null;
      const equippedStack = snap?.inventory.find((i) => i.id === equippedId);
      const hasHammer = Boolean(
        snap?.inventory.some((i) => i.itemId === ORE_NODE.requiredTool),
      );
      const inv = snap?.inventory ?? [];
      return resolveInteractPrompt({
        target,
        visiting: Boolean(visitLand),
        gameNow,
        occupiedSlotIndexes: (snap?.buildings ?? []).map((b) => b.slotIndex),
        landKind: visitLand?.landKind ?? state?.landKind ?? null,
        presenceOthers,
        hasUnreadNotice: noticeUnread,
        equippedToolItemId: equippedStack?.itemId ?? null,
        hasRequiredOreTool: hasHammer,
        // Reason: PL26.1 / PL26.2 — expand afford tint + shortfall prompt clarity.
        softCurrency: snap?.softCurrency,
        energy: snap?.energy,
        inventoryQty: (itemId) => inventoryQty(inv, itemId),
        combat: snap?.combat ?? null,
      });
    },
    [
      target,
      gameNow,
      visitLand,
      state?.landKind,
      state?.equippedToolInventoryId,
      state?.inventory,
      state?.softCurrency,
      state?.energy,
      presenceOthers,
      noticeUnread,
      state?.combat,
    ],
  );

  const expandAffordMode = useMemo(() => {
    if (visitLand || !state) return null;
    if (!sceneAllowsExpandPad(state.landKind ?? "player_land")) return null;
    return expandPadAffordMode({
      occupiedSlotIndexes: state.buildings.map((b) => b.slotIndex),
      softCurrency: state.softCurrency,
      energy: state.energy,
      inventoryQty: (itemId) => inventoryQty(state.inventory, itemId),
    });
  }, [
    visitLand,
    state?.landKind,
    state?.buildings,
    state?.softCurrency,
    state?.energy,
    state?.inventory,
  ]);

  const nearestBuildingId =
    target?.kind === "building" ? target.building.id : null;
  const expandHighlighted = target?.kind === "expand";
  const gateHighlighted = target?.kind === "gate";

  const onboardingTip = useMemo(() => {
    if (!state || !clientSettings.showTips) return null;
    const flags = onboardingFlagsFromState(state);
    return nextOnboardingTip({
      hasMoved,
      hasPlanted: flags.hasPlanted,
      hasHarvestedWheat: flags.hasHarvestedWheat,
      hasCrafted: flags.hasCrafted,
      hasVendorVisit,
      isOnCity: flags.isOnCity,
      hasPlacedStation: flags.hasPlacedStation,
      hasMetMayor: quests.some(
        (q) => q.id === "tutorial_mayor" && q.status === "claimed",
      ),
      characterLevel: state.characterLevel,
      dismissed: dismissedTips,
    });
  }, [state, hasMoved, hasVendorVisit, dismissedTips, clientSettings.showTips, quests]);

  if (!token || !state) {
    return (
      <TitleCover
        username={username}
        password={password}
        busy={busy}
        error={error}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onLogin={() => void handleAuth("login")}
        onRegister={() => void handleAuth("register")}
      />
    );
  }

  const sceneBuildings = visitLand?.buildings ?? state.buildings;
  const sceneLandKind = visitLand?.landKind ?? state.landKind ?? "player_land";
  const sceneLandId = visitLand?.landId ?? state.landId;
  const sceneTemplate = sceneTemplateForLandKind(sceneLandKind);
  const sceneNow = visitLand
    ? syncedNow(visitLand.serverNow, visitReceivedAtRef.current)
    : syncedNow(serverNowRef.current, receivedAtRef.current);

  return (
    <main
      style={{
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CombatVisualProvider
        value={{
          buildingId: state.combat?.buildingId ?? null,
          active: Boolean(state.combat?.active),
          foeHealthRatio: state.combat
            ? state.combat.foeHealth / Math.max(1, state.combat.foeMaxHealth)
            : 1,
          pose: state.combat?.foeLunging
            ? "lunge"
            : state.combat?.blocking
              ? "block"
              : combatHitAt
                ? "hit"
                : state.combat?.active
                  ? "chase"
                  : "idle",
          hitAt: combatHitAt,
          foeName: state.combat?.foeName ?? "",
          offsetX: (state.combat?.foeX ?? 0) - (state.combat?.homeX ?? 0),
          offsetZ: (state.combat?.foeZ ?? 0) - (state.combat?.homeZ ?? 0),
          yaw: state.combat?.foeYaw ?? 0,
        }}
      >
      <LandScene
        key={sceneLandId}
        buildings={sceneBuildings}
        landKind={sceneLandKind}
        nftLandSize={visitLand ? null : state.nftLandSize}
        nowMs={visitLand?.serverNow ?? state.serverNow}
        clockReceivedAt={
          visitLand ? visitReceivedAtRef.current : receivedAtRef.current
        }
        nearestBuildingId={nearestBuildingId}
        showExpandPad={false}
        expandHighlighted={expandHighlighted && !visitLand}
        gateHighlighted={gateHighlighted && !visitLand}
        expandAffordMode={visitLand ? null : expandAffordMode}
        onPlayerPos={handlePlayerPos}
        others={presenceOthers}
        dayNightEnabled={clientSettings.dayNightCycle}
        noticeUnread={noticeUnread && !visitLand}
        placingKit={Boolean(placingKitInventoryId) && !visitLand}
        placePreviewBuildingType={placePreviewBuildingType}
        placeFacing={placeFacing}
        landEditorActive={panel === "build" && !visitLand}
        landEditorSelectedId={landEditorSelectedId}
        landEditorBusy={busy}
        onLandEditorSelect={(buildingId) => {
          setLandEditorSelectedId(buildingId);
        }}
        onLandEditorMove={(buildingId) => {
          void pickupHomesteadBuilding(buildingId, true);
        }}
        onLandEditorPickup={(buildingId) => {
          void pickupHomesteadBuilding(buildingId, false);
        }}
        onPlaceKitCell={
          placingKitInventoryId && token
            ? async (gridX, gridZ) => {
                const invId = placingKitInventoryId;
                const buildingsBefore = stateRef.current?.buildings ?? [];
                const firstHomestead =
                  isFirstHomesteadStationPlace(buildingsBefore);
                const prevBuildingIds = new Set(
                  buildingsBefore.map((b) => b.id),
                );
                setBusy(true);
                const res = await apiPlaceStationKit(
                  token,
                  invId,
                  gridX,
                  gridZ,
                );
                await applyState(res);
                if (res.ok) {
                  setPlacingKitInventoryId(null);
                  setPlaceFacing(0);
                  audioRef.current?.playSfx("build");
                  const placedType = placePreviewBuildingType;
                  if (
                    placedType &&
                    isPlayerLandStationType(placedType)
                  ) {
                    if (firstHomestead) {
                      flashSuccessCue(homesteadFirstPlaceSuccessCueText());
                    } else {
                      flashSuccessCue(stationBuiltSuccessCueText());
                    }
                  } else {
                    flashSuccessCue("Placed");
                  }
                  const nextBuildings =
                    res.state?.buildings ?? stateRef.current?.buildings ?? [];
                  const placed = nextBuildings.find(
                    (b) => !prevBuildingIds.has(b.id),
                  );
                  if (
                    placed &&
                    isPlayerLandStationType(placed.type) &&
                    shouldFlashBuildPlaceSpawn(true, placed.type)
                  ) {
                    if (buildPlaceSpawnFlashClearRef.current) {
                      clearTimeout(buildPlaceSpawnFlashClearRef.current);
                      buildPlaceSpawnFlashClearRef.current = null;
                    }
                    setBuildPlaceSpawnFlashBuildingId(placed.id);
                    setBuildPlaceSpawnFlashStartedAt(performance.now());
                    buildPlaceSpawnFlashClearRef.current = setTimeout(() => {
                      setBuildPlaceSpawnFlashBuildingId(null);
                      setBuildPlaceSpawnFlashStartedAt(null);
                      buildPlaceSpawnFlashClearRef.current = null;
                    }, BUILD_PLACE_SPAWN_FLASH.durationMs);
                  }
                }
                setBusy(false);
              }
            : undefined
        }
        tutorClaimableIds={
          !visitLand && sceneLandKind === "city" ? tutorClaimableIds : []
        }
        portalFirstWalkUpTip={portalWalkUpWorldTip && !visitLand}
        exploreFirstWalkUpTip={exploreWalkUpWorldTip && !visitLand}
        warriorFirstMapTip={warriorMapWalkUpWorldTip && !visitLand}
        cityFirstHubTip={cityHubWalkUpWorldTip && !visitLand}
        onScarceFreeSettle={
          !visitLand && sceneLandKind === "city"
            ? flashScarceFreeSettleWorldReinforce
            : undefined
        }
        onScarceBusyEdge={
          !visitLand && sceneLandKind === "city"
            ? flashScarceBusyWorldReinforce
            : undefined
        }
        onNearbyPeerEnter={flashNearbyPeerWorldReinforce}
        arenaFirstWalkUpTip={arenaWalkUpWorldTip && !visitLand}
        emptyLandBuildFirstWalkUpTip={
          emptyLandBuildWalkUpWorldTip && !visitLand
        }
        marketFirstWalkUpTip={marketWalkUpWorldTip && !visitLand}
        vendorFirstWalkUpTip={vendorWalkUpWorldTip && !visitLand}
        fishingDockFirstWalkUpTip={fishingDockWalkUpWorldTip && !visitLand}
        animalPenFirstWalkUpTip={animalPenWalkUpWorldTip && !visitLand}
        treeStumpFirstWalkUpTip={treeStumpWalkUpWorldTip && !visitLand}
        oreNodeFirstWalkUpTip={oreNodeWalkUpWorldTip && !visitLand}
        cropPlotFirstWalkUpTip={cropPlotWalkUpWorldTip && !visitLand}
        huntTrailFirstWalkUpTip={huntTrailWalkUpWorldTip && !visitLand}
        combatFoeWorld={
          state.combat?.active
            ? { x: state.combat.foeX, z: state.combat.foeZ }
            : null
        }
        combatGuarding={Boolean(state.combat?.blocking)}
        combatSwingAt={combatSwingAt}
        combatWeaponItemId={
          state.inventory.find(
            (row) => row.id === state.equippedWeaponInventoryId,
          )?.itemId ?? null
        }
        kitchenFirstWalkUpTip={kitchenWalkUpWorldTip && !visitLand}
        noticeBoardFirstWalkUpTip={noticeBoardWalkUpWorldTip && !visitLand}
        millFirstWalkUpTip={millWalkUpWorldTip && !visitLand}
        workshopFirstWalkUpTip={workshopWalkUpWorldTip && !visitLand}
        forgeFirstWalkUpTip={forgeWalkUpWorldTip && !visitLand}
        loomFirstWalkUpTip={loomWalkUpWorldTip && !visitLand}
        alchemyBenchFirstWalkUpTip={alchemyBenchWalkUpWorldTip && !visitLand}
        claimNodeFirstWalkUpTip={claimNodeWalkUpWorldTip && !visitLand}
        decorPadFirstWalkUpTip={decorPadWalkUpWorldTip && !visitLand}
        tutorFirstWalkUpTip={tutorWalkUpWorldTip && !visitLand}
        expandPadFirstWalkUpTip={expandPadWalkUpWorldTip && !visitLand}
        visiting={Boolean(visitLand)}
        visitHostUsername={visitLand?.ownerUsername ?? null}
        visitHostNameplateReinforce={
          visitHostNameplateReinforce && Boolean(visitLand)
        }
        craftPanelStation={
          !visitLand && panel === "craft" ? craftStation : null
        }
        craftCompleteFlashStation={
          !visitLand ? craftCompleteFlashStation : null
        }
        craftCompleteFlashStartedAt={
          !visitLand ? craftCompleteFlashStartedAt : null
        }
        stationUpgradeFlashBuildingId={
          !visitLand ? stationUpgradeFlashBuildingId : null
        }
        stationUpgradeFlashStartedAt={
          !visitLand ? stationUpgradeFlashStartedAt : null
        }
        gatherSuccessFlashBuildingId={
          !visitLand ? gatherSuccessFlashBuildingId : null
        }
        gatherSuccessFlashStartedAt={
          !visitLand ? gatherSuccessFlashStartedAt : null
        }
        fishCatchSplashBuildingId={
          !visitLand ? fishCatchSplashBuildingId : null
        }
        fishCatchSplashStartedAt={!visitLand ? fishCatchSplashStartedAt : null}
        buildPlaceSpawnFlashBuildingId={
          !visitLand ? buildPlaceSpawnFlashBuildingId : null
        }
        buildPlaceSpawnFlashStartedAt={
          !visitLand ? buildPlaceSpawnFlashStartedAt : null
        }
        expandFieldFlashX={!visitLand ? expandFieldFlashX : null}
        expandFieldFlashZ={!visitLand ? expandFieldFlashZ : null}
        expandFieldFlashStartedAt={
          !visitLand ? expandFieldFlashStartedAt : null
        }
      />
      </CombatVisualProvider>
      <CombatHud combat={state.combat} />
      <GameHudShell
        state={state}
        error={error}
        info={info}
        visitingUsername={visitLand?.ownerUsername ?? null}
        visitFirstWalkUpTip={visitLandWalkUpWorldTip && Boolean(visitLand)}
        visitHomeReturnTip={visitHomeReturnWorldTip && !visitLand}
        nearbyCount={presenceOthers.length}
        dayPhaseLabel={hudDayPhaseLabel}
        onGoHome={leaveVisit}
        onLogout={() => {
          clearAuthSession();
          setState(null);
          clearVisitSilent();
          achievementsRef.current = null;
          characterLevelCueRef.current = null;
          characterTitleCueRef.current = null;
          extraDecorPadUnlockCueRef.current = null;
          cropReadyIdsRef.current = null;
          woodStumpReadyIdsRef.current = null;
          fishingDockReadyIdsRef.current = null;
          oreNodeReadyIdsRef.current = null;
          animalPenReadyIdsRef.current = null;
          cropReadyLandKeyRef.current = null;
          dayPhaseLabelRef.current = null;
          setPendingAchievementUnlocks([]);
          setPendingGuildInvites([]);
          setPendingChatGlanceLines([]);
          clearInventoryPickupIdleGlance();
        }}
        promptLabel={prompt?.label ?? null}
        promptShowKey={prompt?.showKey ?? true}
        livePrompt={{
          input: {
            target,
            visiting: Boolean(visitLand),
            occupiedSlotIndexes: (stateRef.current?.buildings ?? []).map(
              (b) => b.slotIndex,
            ),
            landKind: visitLand?.landKind ?? state?.landKind ?? null,
            presenceOthers,
            hasUnreadNotice: noticeUnread,
            equippedToolItemId:
              stateRef.current?.inventory.find(
                (i) => i.id === stateRef.current?.equippedToolInventoryId,
              )?.itemId ?? null,
            hasRequiredOreTool: Boolean(
              stateRef.current?.inventory.some(
                (i) => i.itemId === ORE_NODE.requiredTool,
              ),
            ),
            softCurrency: stateRef.current?.softCurrency,
            energy: stateRef.current?.energy,
            inventoryQty: (itemId) =>
              inventoryQty(stateRef.current?.inventory ?? [], itemId),
            combat: state.combat ?? null,
          },
          serverNow: visitLand?.serverNow ?? serverNowRef.current,
          receivedAt: visitLand
            ? visitReceivedAtRef.current
            : receivedAtRef.current,
        }}
        promptSuccessPulse={promptPulse}
        mapChipArrivePulse={mapChipArrivePulse}
        mailPendingGlanceLabel={
          shouldShowMailPendingClosedGlance(mail, panel === "mail")
            ? mailPendingClosedGlanceLabel(mail)
            : null
        }
        questPendingGlanceLabel={
          shouldShowQuestPendingClosedGlance(quests, panel === "quests")
            ? questPendingClosedGlanceLabel(quests)
            : null
        }
        guildInviteGlanceLabel={
          shouldShowGuildInviteClosedGlance(
            pendingGuildInvites,
            panel === "guild",
            Boolean(state.guildName),
          )
            ? guildInviteClosedGlanceLabel(pendingGuildInvites)
            : null
        }
        tradePendingGlanceLabel={
          shouldShowTradePendingClosedGlance(trades, panel === "trade")
            ? tradePendingClosedGlanceLabel(trades)
            : null
        }
        achievementsPendingGlanceLabel={
          shouldShowAchievementsPendingClosedGlance(
            pendingAchievementUnlocks,
            panel === "achievements",
          )
            ? achievementsPendingClosedGlanceLabel(pendingAchievementUnlocks)
            : null
        }
        chatPendingGlanceLabel={
          shouldShowChatPendingClosedGlance(
            pendingChatGlanceLines,
            panel === "chat",
          )
            ? chatPendingClosedGlanceLabel(pendingChatGlanceLines)
            : null
        }
        noticeUnreadGlanceLabel={
          shouldShowNoticeUnreadClosedGlance(
            seenNoticeTips,
            panel === "notice",
          )
            ? noticeUnreadClosedGlanceLabel(seenNoticeTips)
            : null
        }
        inventoryPickupGlanceLabel={
          shouldShowInventoryPickupIdleGlance(
            inventoryPickupIdleGlance,
            panel === "inventory",
          )
            ? inventoryPickupIdleGlanceLabel()
            : null
        }
        softWarDeliverGlanceLabel={
          state &&
          shouldShowSoftWarDeliverClosedGlance(
            state.buildings,
            state.inventory,
            Boolean(state.guildName),
            target?.kind === "building" &&
              target.building.type === "claim_node",
            Date.now(),
          )
            ? softWarDeliverClosedGlanceLabel(true)
            : null
        }
        eatSuccessWorldReinforce={eatSuccessWorldReinforce}
        coinsGainWorldReinforce={coinsGainWorldReinforce}
        cropPlantSuccessWorldReinforce={cropPlantSuccessWorldReinforce}
        cropReadyWorldReinforce={cropReadyWorldReinforce}
        cropHarvestWorldReinforce={cropHarvestWorldReinforce}
        levelUpWorldReinforce={levelUpWorldReinforce}
        achievementUnlockWorldReinforce={achievementUnlockWorldReinforce}
        titleChangeWorldReinforce={titleChangeWorldReinforce}
        marketListWorldReinforce={marketListWorldReinforce}
        questClaimWorldReinforce={questClaimWorldReinforce}
        visitHomeReturnWorldReinforce={visitHomeReturnWorldReinforce}
        visitArriveWorldReinforce={visitArriveWorldReinforce}
        nearbyPeerWorldReinforce={nearbyPeerWorldReinforce}
        chatSendWorldReinforce={chatSendWorldReinforce}
        tradeAcceptWorldReinforce={tradeAcceptWorldReinforce}
        guildBankDepositWorldReinforce={guildBankDepositWorldReinforce}
        guildBankWithdrawWorldReinforce={guildBankWithdrawWorldReinforce}
        inviteAcceptWorldReinforce={inviteAcceptWorldReinforce}
        mailSendWorldReinforce={mailSendWorldReinforce}
        decorPlaceWorldReinforce={decorPlaceWorldReinforce}
        toolRepairWorldReinforce={toolRepairWorldReinforce}
        toolEquipWorldReinforce={toolEquipWorldReinforce}
        toolUnequipWorldReinforce={toolUnequipWorldReinforce}
        mailClaimWorldReinforce={mailClaimWorldReinforce}
        vendorBuyWorldReinforce={vendorBuyWorldReinforce}
        marketBuyWorldReinforce={marketBuyWorldReinforce}
        vendorSellWorldReinforce={vendorSellWorldReinforce}
        marketCancelWorldReinforce={marketCancelWorldReinforce}
        tradeCancelWorldReinforce={tradeCancelWorldReinforce}
        mailCancelWorldReinforce={mailCancelWorldReinforce}
        guildCreateWorldReinforce={guildCreateWorldReinforce}
        guildLeaveWorldReinforce={guildLeaveWorldReinforce}
        huntWinWorldReinforce={huntWinWorldReinforce}
        huntLoseWorldReinforce={huntLoseWorldReinforce}
        craftCompleteWorldReinforce={craftCompleteWorldReinforce}
        softRefuseBusyWorldReinforce={softRefuseBusyWorldReinforce}
        muteWorldReinforce={muteWorldReinforce}
        gatherSuccessWorldReinforce={gatherSuccessWorldReinforce}
        fishCatchWorldReinforce={fishCatchWorldReinforce}
        stationUpgradeWorldReinforce={stationUpgradeWorldReinforce}
        expandFieldWorldReinforce={expandFieldWorldReinforce}
        dayPhaseWorldReinforce={dayPhaseWorldReinforce}
        travelArriveWorldReinforce={travelArriveWorldReinforce}
        dayNightEnableWorldReinforce={dayNightEnableWorldReinforce}
        scarceFreeSettleWorldReinforce={scarceFreeSettleWorldReinforce}
        scarceBusyWorldReinforce={scarceBusyWorldReinforce}
        deedClaimWorldReinforce={deedClaimWorldReinforce}
        deedMintWorldReinforce={deedMintWorldReinforce}
        walletLinkWorldReinforce={walletLinkWorldReinforce}
        walletDisconnectWorldReinforce={walletDisconnectWorldReinforce}
        arenaEnterWorldReinforce={arenaEnterWorldReinforce}
        arenaLeaveWorldReinforce={arenaLeaveWorldReinforce}
        softWarDeliverWorldReinforce={softWarDeliverWorldReinforce}
        panelOpen={panel != null}
        onboardingTip={visitLand ? null : onboardingTip}
        onDismissTip={(id) => {
          if (!state) return;
          const next = [...new Set([...dismissedTips, id])];
          setDismissedTips(next);
          saveDismissedTips(state.username, next);
        }}
      >

      {panel === "visit" && !visitLand ? (
        <VisitPanel
          players={players}
          busy={busy}
          onClose={() => setPanel(null)}
          onRefreshPlayers={() => {
            if (token) void refreshPlayers(token);
          }}
          onVisit={async (uname) => {
            setBusy(true);
            const res = await apiVisitLand(token, uname);
            setBusy(false);
            if (!res.ok || !res.land) {
              setError(res.error ?? "Could not visit that land");
              return;
            }
            receivedAtRef.current = Date.now();
            applyVisitLand(res.land);
            setPanel(null);
            setVisitHomeReturnWorldTip(false);
            if (visitHomeReturnClearRef.current) {
              clearTimeout(visitHomeReturnClearRef.current);
              visitHomeReturnClearRef.current = null;
            }
            // Reason: PL15.1 — soft arrive confirm; TopBar visiting banner covers stay-state.
            // Reason: PL53.1 — first visit once replaces Visiting · name with trade tip.
            // Reason: PL119.2 — soft host nameplate reinforce on shed (complements Visiting ·).
            // Reason: PL184.1 — soft guest-teal world rim (complements Visiting · + nameplate).
            audioRef.current?.playSfx("visit");
            flashVisitArriveWorldReinforce(true, res.land.ownerUsername);
            if (
              shouldReinforceVisitHostNameplateOnArrive(
                true,
                res.land.ownerUsername,
              )
            ) {
              if (visitHostNameplateReinforceClearRef.current) {
                clearTimeout(visitHostNameplateReinforceClearRef.current);
                visitHostNameplateReinforceClearRef.current = null;
              }
              setVisitHostNameplateReinforce(true);
              visitHostNameplateReinforceClearRef.current = setTimeout(() => {
                setVisitHostNameplateReinforce(false);
                visitHostNameplateReinforceClearRef.current = null;
              }, VISIT_HOST_NAMEPLATE.reinforceDurationMs);
            }
            if (
              shouldFlashFirstVisitLandCue(
                true,
                visitLandWalkUpSeenRef.current,
                clientSettingsRef.current.showTips,
              )
            ) {
              visitLandWalkUpSeenRef.current = true;
              const user = stateRef.current?.username;
              if (user) saveVisitLandWalkUpSeen(user);
              flashSuccessCue(firstVisitLandCueText());
              if (visitLandWalkUpClearRef.current) {
                clearTimeout(visitLandWalkUpClearRef.current);
                visitLandWalkUpClearRef.current = null;
              }
              setVisitLandWalkUpWorldTip(true);
              visitLandWalkUpClearRef.current = setTimeout(() => {
                setVisitLandWalkUpWorldTip(false);
                visitLandWalkUpClearRef.current = null;
              }, SUCCESS_CUE_MS);
            } else {
              const cue = visitSuccessCueText(res.land.ownerUsername);
              if (cue) flashSuccessCue(cue);
            }
          }}
        />
      ) : null}

      {panel === "travel" && !visitLand ? (
        <TravelPanel
          state={state}
          currentKind={state.landKind ?? "player_land"}
          nowMs={sceneNow}
          busy={busy}
          openAccent={travelOpenAccent}
          onClose={() => {
            clearTravelOpenAccent();
            setPanel(null);
          }}
          onTravel={async (kind, landId, nft) => {
            const prevKind = stateRef.current?.landKind ?? null;
            setBusy(true);
            const res = nft
              ? await apiCreditcoinEnterLand(token, nft)
              : await apiTravel(token, kind, landId);
            await applyState(res);
            setBusy(false);
            if (!res.ok) return;
            // Reason: PL115.2 — Arrived · dest whisper uses TravelPanel LAND_DESTINATIONS names (one-shot).
            // Reason: PL11.2 — travel confirm SFX; PL120.1 — brief bed-identity stinger on map change.
            audioRef.current?.playSfx(travelSfxFor(kind));
            const destKind = res.state?.landKind ?? kind;
            if (
              shouldPlayBgmArriveIdentityStinger(
                true,
                prevKind,
                destKind,
                audioRef.current?.isMuted() ?? false,
              )
            ) {
              audioRef.current?.playBgmArriveIdentityStinger(destKind);
            }
            // Reason: PL45.1 — first Explore presence gets walk-up tip instead of Arrived.
            const enteredExplore = isEnteringExploreMap(
              prevKind,
              destKind,
            );
            const enteredWarrior = isEnteringWarriorMap(
              prevKind,
              destKind,
            );
            const leftWarrior = isLeavingWarriorMap(prevKind, destKind);
            const enteredCity = isEnteringCityMap(
              prevKind,
              destKind,
            );
            if (
              shouldFlashFirstExploreWalkUpCue(
                enteredExplore,
                exploreWalkUpSeenRef.current,
                clientSettingsRef.current.showTips,
              )
            ) {
              exploreWalkUpSeenRef.current = true;
              const user =
                res.state?.username || stateRef.current?.username;
              if (user) saveExploreWalkUpSeen(user);
              flashSuccessCue(firstExploreWalkUpCueText());
              if (exploreWalkUpClearRef.current) {
                clearTimeout(exploreWalkUpClearRef.current);
                exploreWalkUpClearRef.current = null;
              }
              setExploreWalkUpWorldTip(true);
              exploreWalkUpClearRef.current = setTimeout(() => {
                setExploreWalkUpWorldTip(false);
                exploreWalkUpClearRef.current = null;
              }, SUCCESS_CUE_MS);
            } else if (
              shouldFlashFirstWarriorMapCue(
                enteredWarrior,
                warriorMapWalkUpSeenRef.current,
                clientSettingsRef.current.showTips,
              )
            ) {
              // Reason: PL53.2 — first Warrior presence gets optional tip instead of Arrived.
              warriorMapWalkUpSeenRef.current = true;
              const user =
                res.state?.username || stateRef.current?.username;
              if (user) saveWarriorMapWalkUpSeen(user);
              flashSuccessCue(firstWarriorMapCueText());
              if (warriorMapWalkUpClearRef.current) {
                clearTimeout(warriorMapWalkUpClearRef.current);
                warriorMapWalkUpClearRef.current = null;
              }
              setWarriorMapWalkUpWorldTip(true);
              warriorMapWalkUpClearRef.current = setTimeout(() => {
                setWarriorMapWalkUpWorldTip(false);
                warriorMapWalkUpClearRef.current = null;
              }, SUCCESS_CUE_MS);
            } else if (
              shouldFlashFirstCityHubCue(
                enteredCity,
                cityHubWalkUpSeenRef.current,
                clientSettingsRef.current.showTips,
              )
            ) {
              // Reason: PL57.1 — first City presence gets hub tip instead of Arrived.
              cityHubWalkUpSeenRef.current = true;
              const user =
                res.state?.username || stateRef.current?.username;
              if (user) saveCityHubWalkUpSeen(user);
              flashSuccessCue(firstCityHubCueText());
              if (cityHubWalkUpClearRef.current) {
                clearTimeout(cityHubWalkUpClearRef.current);
                cityHubWalkUpClearRef.current = null;
              }
              setCityHubWalkUpWorldTip(true);
              cityHubWalkUpClearRef.current = setTimeout(() => {
                setCityHubWalkUpWorldTip(false);
                cityHubWalkUpClearRef.current = null;
              }, SUCCESS_CUE_MS);
            } else if (shouldFlashTravelArriveSuccessCue(true)) {
              flashSuccessCue(travelArriveSuccessCueText(kind));
            }
            // Reason: PL164.1 — brief cool Free cyan rim after Arrived (complements dest whisper + portal Free).
            if (shouldFlashTravelArriveWorldReinforce(true)) {
              flashTravelArriveWorldReinforce(true);
            }
            // Reason: PL145.2 — brief warm arena rim when entering Warrior (complements Arrived / tip).
            if (shouldFlashArenaEnterWorldReinforce(enteredWarrior)) {
              flashArenaEnterWorldReinforce(enteredWarrior);
            }
            // Reason: PL147.1 — brief dusty arena rim when leaving Warrior (complements Arrived dest).
            if (shouldFlashArenaLeaveWorldReinforce(leftWarrior)) {
              flashArenaLeaveWorldReinforce(leftWarrior);
            }
            // Reason: PL40.2 — brief map-identity chip pulse on free travel arrive.
            if (shouldPulseMapChipOnTravelArrive(true)) {
              flashMapChipArrivePulse();
            }
            clearTravelOpenAccent();
            setPanel(null);
          }}
        />
      ) : null}

      {panel === "decor" && decorBuildingId && !visitLand ? (
        <DecorPanel
          busy={busy}
          softCurrency={state.softCurrency}
          openAccent={decorOpenAccent}
          onClose={() => {
            setPanel(null);
            setDecorBuildingId(null);
            clearDecorOpenAccent();
          }}
          onPlace={async (decorId) => {
            setBusy(true);
            const res = await apiPlaceDecor(
              token,
              decorBuildingId,
              decorId,
              playerPosRef.current,
            );
            await applyState(res);
            setBusy(false);
            if (!res.ok) return;
            // Reason: PL16.2 — soft confirm; costs unchanged; fail stays silent/refuse.
            audioRef.current?.playSfx("decor");
            flashSuccessCue(decorPlaceSuccessCueText());
            // Reason: PL149.2 — soft rosewood rim; costs / slots unchanged.
            flashDecorPlaceWorldReinforce(true);
            setPanel(null);
            setDecorBuildingId(null);
            clearDecorOpenAccent();
          }}
        />
      ) : null}

      {panel === "inventory" ? (
        <InventoryPanel
          state={state}
          items={ITEMS}
          busy={busy}
          canPlaceKits={!visitLand && isPlayerLandKind(state.landKind)}
          openAccent={inventoryOpenAccent}
          pickupFlashStackIds={inventoryPickupFlashIds}
          onClose={() => {
            clearInventoryOpenAccent();
            setPanel(null);
          }}
          onPlaceKit={(inventoryId) => {
            setPanel(null);
            clearInventoryOpenAccent();
            setPlaceFacing(0);
            setPlacingKitInventoryId(inventoryId);
          }}
          onEatFood={async (itemId) => {
            setBusy(true);
            const res = await apiEatFood(token, itemId);
            await applyState(res);
            if (res.ok) {
              // Reason: PL20.1 — ephemeral eat cue (+ soft SFX); energy numbers unchanged.
              audioRef.current?.playSfx("eat");
              flashSuccessCue(eatFoodSuccessCueText());
              // Reason: PL124.2 — brief soft world recovery rim; food rules unchanged.
              if (shouldFlashEatSuccessWorldReinforce(true)) {
                if (eatSuccessWorldReinforceClearRef.current) {
                  clearTimeout(eatSuccessWorldReinforceClearRef.current);
                }
                setEatSuccessWorldReinforce(true);
                eatSuccessWorldReinforceClearRef.current = setTimeout(() => {
                  setEatSuccessWorldReinforce(false);
                  eatSuccessWorldReinforceClearRef.current = null;
                }, EAT_SUCCESS_WORLD_REINFORCE.durationMs);
              }
            }
            setBusy(false);
          }}
          onEquipTool={async (id) => {
            setBusy(true);
            const res = await apiEquipTool(token, id);
            await applyState(res);
            if (res.ok) {
              audioRef.current?.playSfx("equip");
              flashSuccessCue(equipToolSuccessCueText(id));
              flashToolEquipWorldReinforce(true, id);
              flashToolUnequipWorldReinforce(true, id);
            }
            setBusy(false);
          }}
          onEquipGear={async (id, slot) => {
            setBusy(true);
            const res = await apiEquipGear(token, id, slot);
            await applyState(res);
            if (res.ok) {
              audioRef.current?.playSfx("equip");
              flashSuccessCue(equipToolSuccessCueText(id));
              flashToolEquipWorldReinforce(true, id);
              flashToolUnequipWorldReinforce(true, id);
            }
            setBusy(false);
          }}
          onRepairTool={async (id) => {
            setBusy(true);
            const res = await apiRepairTool(token, id);
            await applyState(res);
            if (res.ok) {
              // Reason: PL25.1 — soft repair confirm; mat costs / max durability unchanged.
              audioRef.current?.playSfx("repair");
              flashSuccessCue(repairToolSuccessCueText());
              // Reason: PL150.1 — one-shot forge-pewter rim beside Repaired + tool-low clear.
              flashToolRepairWorldReinforce(true);
            }
            setBusy(false);
          }}
        />
      ) : null}

      {panel === "craft" && craftStation && !visitLand ? (
        <CraftPanel
          state={state}
          station={craftStation}
          stationBuildingId={craftBuildingId}
          recipes={stationRecipes}
          items={ITEMS}
          busy={busy}
          openAccent={craftOpenAccent}
          serverNow={state.serverNow}
          onClose={() => {
            clearCraftOpenAccent();
            setPanel(null);
            setCraftStation(null);
            setCraftBuildingId(null);
          }}
          onCollect={
            craftBuildingId
              ? async () => {
                  setBusy(true);
                  const building = stateRef.current?.buildings.find(
                    (row) => row.id === craftBuildingId,
                  );
                  const recipeId = building?.craft?.recipeId ?? null;
                  const prevInv = stateRef.current?.inventory;
                  const res = await apiCollectCraft(
                    token,
                    craftBuildingId,
                    playerPosRef.current,
                  );
                  await applyState(res);
                  if (res.ok) {
                    audioRef.current?.playSfx("craft");
                    flashSuccessCue(
                      craftCollectCueText(
                        resolveCraftOutputLoot(
                          recipeId,
                          prevInv,
                          res.state?.inventory,
                        ),
                      ),
                    );
                    flashCraftCompleteWorldReinforce(true);
                    if (
                      shouldFlashCraftCompleteBench(true) &&
                      craftStation
                    ) {
                      if (craftCompleteFlashClearRef.current) {
                        clearTimeout(craftCompleteFlashClearRef.current);
                        craftCompleteFlashClearRef.current = null;
                      }
                      setCraftCompleteFlashStation(craftStation);
                      setCraftCompleteFlashStartedAt(performance.now());
                      craftCompleteFlashClearRef.current = setTimeout(() => {
                        setCraftCompleteFlashStation(null);
                        setCraftCompleteFlashStartedAt(null);
                        craftCompleteFlashClearRef.current = null;
                      }, CRAFT_COMPLETE_BENCH_FLASH.durationMs);
                    }
                  }
                  setBusy(false);
                }
              : undefined
          }
          onUpgrade={
            craftBuildingId
              ? async () => {
                  setBusy(true);
                  const res = await apiUpgradeBuilding(
                    token,
                    craftBuildingId,
                    playerPosRef.current,
                  );
                  await applyState(res);
                  if (res.ok) {
                    // Reason: PL48.1 — ephemeral Upgraded; BUILDING_UPGRADES costs unchanged.
                    audioRef.current?.playSfx("craft");
                    flashSuccessCue(stationUpgradeSuccessCueText());
                    // Reason: PL137.1 — copper pad settle on the upgraded mill/forge (id-scoped).
                    if (
                      craftBuildingId &&
                      craftStation &&
                      shouldFlashStationUpgradePad(true, craftStation)
                    ) {
                      if (stationUpgradeFlashClearRef.current) {
                        clearTimeout(stationUpgradeFlashClearRef.current);
                        stationUpgradeFlashClearRef.current = null;
                      }
                      setStationUpgradeFlashBuildingId(craftBuildingId);
                      setStationUpgradeFlashStartedAt(performance.now());
                      stationUpgradeFlashClearRef.current = setTimeout(() => {
                        setStationUpgradeFlashBuildingId(null);
                        setStationUpgradeFlashStartedAt(null);
                        stationUpgradeFlashClearRef.current = null;
                      }, STATION_UPGRADE_PAD_FLASH.durationMs);
                    }
                    // Reason: PL162.1 — brief copper world rim after upgrade ok (complements pad).
                    if (craftStation) {
                      flashStationUpgradeWorldReinforce(true, craftStation);
                    }
                  }
                  setBusy(false);
                }
              : undefined
          }
          onCraft={async (recipeId) => {
            setBusy(true);
            const res = await apiCraft(token, recipeId, playerPosRef.current);
            await applyState(res);
            if (res.ok) {
              // Reason: start only — Collect flash fires on collectCraft.
              audioRef.current?.playSfx("craft");
              flashSuccessCue(craftStartCueText(recipeId), {
                pulsePrompt: true,
              });
            }
            setBusy(false);
          }}
        />
      ) : null}

      {panel === "plant" && plantBuildingId && !visitLand && state ? (
        <PlantPanel
          seeds={plantableSeedsFromInventory(state.inventory)}
          items={ITEMS}
          busy={busy}
          onClose={() => {
            setPanel(null);
            setPlantBuildingId(null);
          }}
          onPlant={async (seedItemId) => {
            const buildingId = plantBuildingId;
            if (!buildingId) return;
            setBusy(true);
            const prevTool = stateRef.current?.equippedToolInventoryId ?? null;
            const prevForWear = stateRef.current;
            const res = await apiPlant(
              token,
              buildingId,
              playerPosRef.current,
              seedItemId,
            );
            if (res.ok) {
              audioRef.current?.playSfx("plant");
              const toolBroke =
                Boolean(prevTool) &&
                Boolean(res.state) &&
                !res.state?.equippedToolInventoryId;
              const toolLowEdge =
                Boolean(res.state) &&
                shouldFlashToolDurabilityLowBetweenStates(prevForWear, res.state!);
              if (!toolBroke && !toolLowEdge) {
                flashSuccessCue(plantSuccessCueText(seedItemId), { pulsePrompt: true });
              }
              if (shouldFlashCropPlantSuccessWorldReinforce(true)) {
                if (cropPlantSuccessWorldReinforceClearRef.current) {
                  clearTimeout(cropPlantSuccessWorldReinforceClearRef.current);
                }
                setCropPlantSuccessWorldReinforce(true);
                cropPlantSuccessWorldReinforceClearRef.current = setTimeout(() => {
                  setCropPlantSuccessWorldReinforce(false);
                  cropPlantSuccessWorldReinforceClearRef.current = null;
                }, CROP_PLANT_SUCCESS_WORLD_REINFORCE.durationMs);
              }
              setPanel(null);
              setPlantBuildingId(null);
            }
            await applyState(res, { prevEquippedToolId: prevTool });
            setBusy(false);
          }}
        />
      ) : null}

      {panel === "vendor" && !visitLand ? (
        <VendorPanel
          items={ITEMS}
          landKind={state.landKind ?? "player_land"}
          vendor={getVendorPrices(state.landKind ?? "player_land")}
          softCurrency={state.softCurrency}
          busy={busy}
          openAccent={vendorOpenAccent}
          onClose={() => {
            clearVendorOpenAccent();
            setPanel(null);
          }}
          onBuy={async (itemId, qty) => {
            setBusy(true);
            const res = await apiVendorBuy(
              token,
              itemId,
              qty,
              playerPosRef.current,
            );
            await applyState(res);
            if (res.ok) {
              audioRef.current?.playSfx("vendor_buy");
              // Reason: PL43.3 — ephemeral Bought complements buy SFX; prices unchanged.
              flashSuccessCue(vendorBuySuccessCueText());
              // Reason: PL153.1 — soft stall honey-copper rim; prices unchanged.
              flashVendorBuyWorldReinforce(true);
            }
            setBusy(false);
          }}
          onSell={async (itemId, qty) => {
            setBusy(true);
            const prevCoins = stateRef.current?.softCurrency ?? 0;
            const res = await apiVendorSell(
              token,
              itemId,
              qty,
              playerPosRef.current,
            );
            await applyState(res);
            if (res.ok) {
              audioRef.current?.playSfx("vendor_sell");
              // Reason: PL43.2 — ephemeral Sold complements sell SFX; prices unchanged.
              flashSuccessCue(vendorSellSuccessCueText());
              // Reason: PL156.1 — soft stall amber-copper rim on sell ok; prices unchanged.
              flashVendorSellWorldReinforce(true);
              // Reason: PL126.2 — soft gold rim when coins rose; sinks unchanged.
              flashCoinsGainWorldReinforce(
                true,
                prevCoins,
                res.state?.softCurrency ??
                  stateRef.current?.softCurrency ??
                  prevCoins,
              );
            }
            setBusy(false);
          }}
        />
      ) : null}

      {panel === "build" && !visitLand && state ? (
        <BuildPanel
          state={state}
          busy={busy}
          openAccent={buildOpenAccent}
          selectedBuildingId={landEditorSelectedId}
          placingKitInventoryId={placingKitInventoryId}
          onClose={() => {
            clearBuildOpenAccent();
            setLandEditorSelectedId(null);
            setPanel(null);
          }}
          onSelectBuilding={(buildingId) => {
            setLandEditorSelectedId(buildingId);
          }}
          onPlaceKit={(inventoryId) => {
            setLandEditorSelectedId(null);
            setPlaceFacing(0);
            setPlacingKitInventoryId(inventoryId);
          }}
          onMove={(buildingId) => {
            void pickupHomesteadBuilding(buildingId, true);
          }}
          onPickup={(buildingId) => {
            void pickupHomesteadBuilding(buildingId, false);
          }}
        />
      ) : null}

      {panel === "trade" ? (
        <TradePanel
          items={ITEMS}
          trades={trades}
          players={players}
          preferredPartner={visitLand?.ownerUsername ?? null}
          busy={busy}
          openAccent={tradeOpenAccent}
          onClose={() => {
            clearTradeOpenAccent();
            setPanel(null);
          }}
          onRefreshPlayers={() => {
            if (token) void refreshPlayers(token);
          }}
          onCreateTrade={async (input) => {
            setBusy(true);
            const res = await apiCreateTrade(token, {
              toUsername: input.toUsername,
              give:
                input.giveQty > 0
                  ? [{ itemId: input.giveItemId, qty: input.giveQty }]
                  : [],
              want:
                input.wantQty > 0
                  ? [{ itemId: input.wantItemId, qty: input.wantQty }]
                  : [],
              giveCoins: input.giveCoins,
              wantCoins: input.wantCoins,
            });
            setBusy(false);
            if (!res.ok) setError(res.error ?? "Trade failed");
            else {
              if (res.state) await applyState({ ok: true, state: res.state });
              if (res.trades) setTrades(res.trades);
              setError(null);
              // Reason: PL28.1 — soft SFX + ephemeral Offer · to; escrow sticky prose removed.
              audioRef.current?.playSfx("trade_offer");
              const cue = tradeOfferSentCueText(input.toUsername);
              if (cue) flashSuccessCue(cue);
            }
          }}
          onAcceptTrade={async (tradeId) => {
            setBusy(true);
            const res = await apiAcceptTrade(token, tradeId);
            await applyState(res);
            if (res.ok) {
              // Reason: PL18.2 — ephemeral accept cue; cancel/refuse stay silent.
              audioRef.current?.playSfx("trade_accept");
              flashSuccessCue(tradeAcceptSuccessCueText());
              // Reason: PL143.1 — soft handshake rim; escrow / accept rules unchanged.
              flashTradeAcceptWorldReinforce(true);
            }
            await refresh(token);
            setBusy(false);
          }}
          onRejectTrade={async (tradeId) => {
            setBusy(true);
            const pending = trades.find((t) => t.id === tradeId);
            const res = await apiRejectTrade(token, tradeId);
            if (res.ok && res.state) await applyState({ ok: true, state: res.state });
            else await refresh(token);
            if (res.trades) setTrades(res.trades);
            if (res.ok && shouldFlashTradeCancelCue(pending?.direction)) {
              // Reason: PL62.1 — ephemeral Cancelled on outgoing cancel; incoming reject silent.
              flashSuccessCue(tradeCancelSuccessCueText());
              // Reason: PL157.1 — soft release mist rim; escrow unchanged; incoming quiet.
              flashTradeCancelWorldReinforce(true, pending?.direction);
            }
            setBusy(false);
          }}
        />
      ) : null}

      {panel === "market" ? (
        <MarketPanel
          items={ITEMS}
          inventory={state.inventory}
          listings={listings}
          nowMs={sceneNow}
          softCurrency={state.softCurrency}
          busy={busy}
          authToken={token ?? ""}
          openAccent={marketOpenAccent}
          onClose={() => {
            clearMarketOpenAccent();
            setMarketBoardId(null);
            setPanel(null);
          }}
          onRefresh={() => {
            if (token) void refreshMarket(token);
          }}
          onCreate={async (input) => {
            setBusy(true);
            const prevCoins = stateRef.current?.softCurrency ?? 0;
            const res = await apiCreateMarketListing(
              token,
              input.itemId,
              input.qty,
              input.priceCoins,
            );
            setBusy(false);
            if (!res.ok) {
              setError(res.error ?? "Could not list item");
              return;
            }
            if (res.listings) setListings(res.listings);
            if (res.state) {
              receivedAtRef.current = Date.now();
              serverNowRef.current = res.state.serverNow;
              setState(res.state);
              stateRef.current = res.state;
            }
            flashSuccessCue(marketSuccessCueText("list"));
            // Reason: PL138.1 — soft market-teal rim on list ok; fees unchanged.
            flashMarketListWorldReinforce(true);
            // Reason: PL126.2 — delta-gated; list fee spends so usually quiet.
            flashCoinsGainWorldReinforce(
              true,
              prevCoins,
              res.state?.softCurrency ??
                stateRef.current?.softCurrency ??
                prevCoins,
            );
            setError(null);
          }}
          onBuy={async (listingId) => {
            setBusy(true);
            const prevCoins = stateRef.current?.softCurrency ?? 0;
            const res = await apiBuyMarketListing(token, listingId);
            setBusy(false);
            if (!res.ok) {
              setError(res.error ?? "Purchase failed");
              return;
            }
            await applyState(res);
            await refreshMarket(token);
            flashSuccessCue(marketSuccessCueText("buy"));
            // Reason: PL155.2 — soft parchment-gold rim on buy ok; escrow unchanged.
            flashMarketBuyWorldReinforce(true);
            // Reason: PL126.2 — buyer spends; flash only if soft currency rose.
            flashCoinsGainWorldReinforce(
              true,
              prevCoins,
              res.state?.softCurrency ??
                stateRef.current?.softCurrency ??
                prevCoins,
            );
          }}
          onCancel={async (listingId) => {
            setBusy(true);
            const prevCoins = stateRef.current?.softCurrency ?? 0;
            const res = await apiCancelMarketListing(token, listingId);
            setBusy(false);
            if (!res.ok) {
              setError(res.error ?? "Cancel failed");
              return;
            }
            if (res.listings) setListings(res.listings);
            if (res.state) {
              receivedAtRef.current = Date.now();
              serverNowRef.current = res.state.serverNow;
              setState(res.state);
              stateRef.current = res.state;
            }
            flashSuccessCue(marketSuccessCueText("cancel"));
            // Reason: PL156.2 — soft dusty board-ash rim on cancel ok; escrow unchanged.
            flashMarketCancelWorldReinforce(true);
            // Reason: PL126.2 — delta-gated; cancel returns goods not fee.
            flashCoinsGainWorldReinforce(
              true,
              prevCoins,
              res.state?.softCurrency ??
                stateRef.current?.softCurrency ??
                prevCoins,
            );
            setError(null);
          }}
        />
      ) : null}

      {panel === "chat" ? (
        <ChatPanel
          channel={chatChannel}
          onChannelChange={setChatChannel}
          messages={
            chatChannel === "guild" ? guildChatMessages : chatMessages
          }
          inGuild={Boolean(state.guildName)}
          busy={busy}
          openAccent={chatOpenAccent}
          onClose={() => {
            // Reason: PL197.1 — closing C also clears staged unread glance.
            setPendingChatGlanceLines(clearPendingChatGlanceLines());
            setPanel(null);
          }}
          onRefresh={() => {
            if (!token) return;
            if (chatChannel === "guild") void refreshGuildChat(token);
            else void refreshChat(token);
          }}
          onSend={async (text) => {
            setBusy(true);
            const sock = gameSocketRef.current;
            if (chatChannel === "guild") {
              if (
                preferWsChat(Boolean(sock?.ready())) === "websocket" &&
                sock
              ) {
                sock.sendGuildChat(text);
                setBusy(false);
                setError(null);
                // Reason: PL62.2 — soft Sent confirm; complements receive Chat (PL27.2); mute ok.
                // Reason: PL139.2 — quiet soft rim leftover beside Sent ephemeral.
                audioRef.current?.playSfx("chat");
                flashSuccessCue(chatSendSuccessCueText());
                flashChatSendWorldReinforce(true);
                return;
              }
              const res = await apiPostGuildChat(token, text);
              setBusy(false);
              if (!res.ok) {
                setError(res.error ?? "Could not send guild chat");
                return;
              }
              if (res.messages) setGuildChatMessages(res.messages);
              setError(null);
              // Reason: PL62.2 — soft Sent confirm after HTTP guild send.
              // Reason: PL139.2 — quiet soft rim leftover beside Sent ephemeral.
              audioRef.current?.playSfx("chat");
              flashSuccessCue(chatSendSuccessCueText());
              flashChatSendWorldReinforce(true);
              return;
            }
            if (preferWsChat(Boolean(sock?.ready())) === "websocket" && sock) {
              sock.sendChat(text);
              setBusy(false);
              setError(null);
              // Reason: PL62.2 — soft Sent confirm; complements receive Chat (PL27.2); mute ok.
              // Reason: PL139.2 — quiet soft rim leftover beside Sent ephemeral.
              audioRef.current?.playSfx("chat");
              flashSuccessCue(chatSendSuccessCueText());
              flashChatSendWorldReinforce(true);
              return;
            }
            const res = await apiPostChat(token, text);
            setBusy(false);
            if (!res.ok) {
              setError(res.error ?? "Could not send chat");
              return;
            }
            if (res.messages) setChatMessages(res.messages);
            setError(null);
            // Reason: PL62.2 — soft Sent confirm after HTTP land chat send.
            // Reason: PL139.2 — quiet soft rim leftover beside Sent ephemeral.
            audioRef.current?.playSfx("chat");
            flashSuccessCue(chatSendSuccessCueText());
            flashChatSendWorldReinforce(true);
          }}
        />
      ) : null}

      {panel === "deeds" ? (
        <CreditcoinPanel
          openAccent={deedOpenAccent}
          state={state}
          busy={busy}
          contractAddresses={creditcoinContracts ?? undefined}
          onClose={() => {
            clearDeedOpenAccent();
            setPanel(null);
          }}
          onConnectWallet={async () => {
            setBusy(true);
            try {
              const challenge = await apiWalletChallenge(token);
              if (!challenge.ok || !challenge.message) {
                throw new Error(challenge.error ?? "Wallet challenge failed");
              }
              const signed = await connectAndSignCreditcoin(challenge.message);
              const res = await apiLinkWallet(token, {
                address: signed.address,
                signature: signed.signature,
                message: challenge.message,
              });
              await applyState(res);
              if (res.ok) {
                flashSuccessCue(walletLinkSuccessCueText());
                flashWalletLinkWorldReinforce(true);
              }
            } catch (err) {
              const msg =
                err instanceof Error ? err.message : "Wallet connect failed";
              flashSuccessCue(msg);
            }
            setBusy(false);
          }}
          onDisconnectWallet={async () => {
            setBusy(true);
            const res = await apiDisconnectWallet(token);
            await applyState(res);
            if (res.ok) {
              flashSuccessCue(walletDisconnectSuccessCueText());
              flashWalletDisconnectWorldReinforce(true);
            }
            setBusy(false);
          }}
          onSwapCoins={async (coins) => {
            setBusy(true);
            try {
              const res = await apiCreditcoinSwap(token, coins);
              if (!res.ok) {
                flashSuccessCue(
                  typeof res.error === "string"
                    ? res.error
                    : "REALM swap failed",
                );
                setBusy(false);
                return;
              }
              // Reason: on-chain mint may lag the response; re-fetch snapshot for REALM HUD.
              const snap = await apiCreditcoinSnapshot(token);
              await applyState(snap.ok ? snap : res);
              flashSuccessCue(creditcoinSwapSuccessCueText(res.swap?.status));
            } catch (err) {
              flashSuccessCue(
                err instanceof Error ? err.message : "REALM swap failed",
              );
            }
            setBusy(false);
          }}
          onTravelLand={async (land) => {
            const prevKind = stateRef.current?.landKind ?? null;
            setBusy(true);
            const res = await apiCreditcoinEnterLand(token, land);
            await applyState(res);
            setBusy(false);
            if (!res.ok) {
              flashSuccessCue(
                typeof res.error === "string" ? res.error : "Travel failed",
              );
              return;
            }
            audioRef.current?.playSfx(travelSfxFor("player_land"));
            const destKind = res.state?.landKind ?? "player_land";
            if (
              shouldPlayBgmArriveIdentityStinger(
                true,
                prevKind,
                destKind,
                audioRef.current?.isMuted() ?? false,
              )
            ) {
              audioRef.current?.playBgmArriveIdentityStinger(destKind);
            }
            flashSuccessCue("Arrived · NFT land");
            clearDeedOpenAccent();
            setPanel(null);
          }}
          onMintLand={async (biome, size) => {
            setBusy(true);
            try {
              const cfg = asPublicConfig(await apiCreditcoinConfig());
              if (cfg.contractsConfigured) {
                const minted = await mintLandOnchain(cfg, biome, size);
                const confirmed = await apiCreditcoinConfirmLand(token, {
                  biome,
                  size,
                  tokenId: minted.tokenId,
                  txHash: minted.hash,
                });
                if (confirmed.ok) {
                  await applyState(confirmed);
                } else {
                  const res = await apiCreditcoinSnapshot(token);
                  await applyState(res);
                }
                flashSuccessCue("Land minted");
              } else {
                const res = await apiCreditcoinMintLand(token, biome, size);
                await applyState(res);
                if (res.ok) flashSuccessCue("Land minted");
              }
            } catch (err) {
              flashSuccessCue(
                err instanceof Error ? err.message : "Land mint failed",
              );
            }
            setBusy(false);
          }}
          onSendRealm={async (to, amount) => {
            setBusy(true);
            try {
              if (!isEvmAddress(to)) throw new Error("Invalid address");
              const cfg = asPublicConfig(await apiCreditcoinConfig());
              await transferRealmOnchain(cfg, to, realmToWei(amount));
              const res = await apiCreditcoinSnapshot(token);
              await applyState(res);
              flashSuccessCue("REALM sent");
            } catch (err) {
              flashSuccessCue(
                err instanceof Error ? err.message : "Send failed",
              );
            }
            setBusy(false);
          }}
          onSwitchNetwork={async () => {
            setBusy(true);
            try {
              const cfg = asPublicConfig(await apiCreditcoinConfig());
              await switchToCreditcoin(cfg);
              flashSuccessCue("Creditcoin Testnet ready");
            } catch (err) {
              flashSuccessCue(
                err instanceof Error ? err.message : "Network switch failed",
              );
            }
            setBusy(false);
          }}
          onAddRealmToken={async () => {
            setBusy(true);
            try {
              const cfg = asPublicConfig(await apiCreditcoinConfig());
              const ok = await watchRealmToken(cfg);
              flashSuccessCue(
                ok
                  ? "REALM added to MetaMask"
                  : "MetaMask did not add REALM — try Import token with the address below",
              );
            } catch (err) {
              flashSuccessCue(
                err instanceof Error ? err.message : "Add token failed",
              );
            }
            setBusy(false);
          }}
        />
      ) : null}

      {panel === "realm_market" ? (
        <RealmMarketPanel
          openAccent={marketOpenAccent}
          state={state}
          busy={busy}
          onClose={() => {
            clearMarketOpenAccent();
            setRealmMarketId(null);
            setPanel(null);
          }}
          onListItem={async (itemId, qty, priceRealm) => {
            setBusy(true);
            try {
              const res = await apiCreditcoinListItem(
                token,
                itemId,
                qty,
                priceRealm,
              );
              if (!res.ok) {
                await applyState(res);
                return;
              }
              const cfg = asPublicConfig(await apiCreditcoinConfig());
              if (cfg.contractsConfigured && res.listing) {
                const onchainListingId = await listItemOnchain(
                  cfg,
                  itemId,
                  qty,
                  res.listing.priceRealm,
                  res.listing.id,
                );
                const attached = await apiCreditcoinAttachOnchain(
                  token,
                  res.listing.id,
                  onchainListingId,
                );
                await applyState(attached);
                if (!attached.ok) {
                  flashSuccessCue(
                    typeof attached.error === "string"
                      ? attached.error
                      : "Could not confirm on-chain listing",
                  );
                  return;
                }
              } else {
                await applyState(res);
              }
              flashSuccessCue("Listed for REALM");
            } catch (err) {
              const snap = await apiCreditcoinSnapshot(token);
              await applyState(snap.ok ? snap : { ok: false });
              flashSuccessCue(
                err instanceof Error ? err.message : "List failed",
              );
            } finally {
              setBusy(false);
            }
          }}
          onBuyItem={async (listingId) => {
            setBusy(true);
            try {
              const cfg = asPublicConfig(await apiCreditcoinConfig());
              const listing = state.chain?.tokenListings.find(
                (row) => row.id === listingId,
              );
              if (cfg.contractsConfigured && listing?.onchainListingId) {
                await buyItemOnchain(
                  cfg,
                  listing.onchainListingId,
                  listing.priceRealm,
                );
              }
              const res = await apiCreditcoinBuyItem(token, listingId);
              await applyState(res);
              if (res.ok) flashSuccessCue("Bought with REALM");
            } catch (err) {
              flashSuccessCue(
                err instanceof Error ? err.message : "Buy failed",
              );
            }
            setBusy(false);
          }}
          onCancelItem={async (listingId) => {
            setBusy(true);
            try {
              const cfg = asPublicConfig(await apiCreditcoinConfig());
              const listing = state.chain?.tokenListings.find(
                (row) => row.id === listingId,
              );
              if (cfg.contractsConfigured && listing?.onchainListingId) {
                await cancelListingOnchain(cfg, listing.onchainListingId);
              }
              const res = await apiCreditcoinCancelItem(token, listingId);
              await applyState(res);
              if (res.ok) flashSuccessCue("Listing cancelled");
            } catch (err) {
              flashSuccessCue(
                err instanceof Error ? err.message : "Cancel failed",
              );
            }
            setBusy(false);
          }}
        />
      ) : null}

      {panel === "settings" ? (
        <SettingsPanel
          settings={clientSettings}
          walletAddress={state.walletAddress}
          deeds={state.deeds ?? []}
          softCurrency={state.softCurrency}
          busy={busy}
          openAccent={settingsOpenAccent}
          muteEnableConfirm={muteEnableConfirm}
          dayNightEnableConfirm={dayNightEnableConfirm}
          tipsEnableConfirm={tipsEnableConfirm}
          onChange={(next) => {
            const prevMute = clientSettings.muteAudio;
            const prevDayNight = clientSettings.dayNightCycle;
            const prevTips = clientSettings.showTips;
            setClientSettings(next);
            saveClientSettings(next);
            // Reason: PL37.2 — mute applies immediately; ephemeral Muted/Unmuted confirm.
            audioRef.current?.setMuted(next.muteAudio);
            if (next.muteAudio !== prevMute) {
              flashSuccessCue(muteToggleSuccessCueText(next.muteAudio));
            }
            // Reason: PL180.1 — soft hush graphite world rim on mute toggle either edge.
            if (shouldFlashMuteWorldReinforce(prevMute, next.muteAudio)) {
              flashMuteWorldReinforce(prevMute, next.muteAudio);
            }
            // Reason: PL125.2 — soft settings-row flash when enabling mute (SFX-free).
            if (shouldFlashMuteEnableConfirm(prevMute, next.muteAudio)) {
              flashMuteEnableConfirm();
            }
            // Reason: PL130.1 — soft settings-row flash when enabling day/night (cosmetic).
            if (
              shouldFlashDayNightEnableConfirm(prevDayNight, next.dayNightCycle)
            ) {
              flashDayNightEnableConfirm();
            }
            // Reason: PL164.2 — brief dawn-slate world rim when enabling day/night (complements confirm + phase).
            if (
              shouldFlashDayNightEnableWorldReinforce(
                prevDayNight,
                next.dayNightCycle,
              )
            ) {
              flashDayNightEnableWorldReinforce(
                prevDayNight,
                next.dayNightCycle,
              );
            }
            // Reason: PL130.2 — soft settings-row flash when enabling onboarding tips.
            if (shouldFlashTipsEnableConfirm(prevTips, next.showTips)) {
              flashTipsEnableConfirm();
            }
          }}
          onClose={() => setPanel(null)}
          onConnectWallet={async () => {
            setBusy(true);
            try {
              const challenge = await apiWalletChallenge(token);
              if (!challenge.ok || !challenge.message) {
                throw new Error(challenge.error ?? "Wallet challenge failed");
              }
              const signed = await connectAndSignCreditcoin(challenge.message);
              const res = await apiLinkWallet(token, {
                address: signed.address,
                signature: signed.signature,
                message: challenge.message,
              });
              await applyState(res);
              if (res.ok) {
                flashSuccessCue(walletLinkSuccessCueText());
                flashWalletLinkWorldReinforce(true);
              }
            } catch (err) {
              const msg =
                err instanceof Error ? err.message : "Wallet connect failed";
              flashSuccessCue(msg);
            }
            setBusy(false);
          }}
          onDisconnectWallet={async () => {
            setBusy(true);
            const res = await apiDisconnectWallet(token);
            await applyState(res);
            if (res.ok) {
              flashSuccessCue(walletDisconnectSuccessCueText());
              // Reason: PL168.1 — soft world rim complements Wallet disconnected ephemeral.
              flashWalletDisconnectWorldReinforce(true);
            }
            setBusy(false);
          }}
          onClaimDeed={async () => {
            setBusy(true);
            const res = await apiClaimLandDeed(token);
            await applyState(res);
            if (res.ok) {
              flashSuccessCue(deedClaimSuccessCueText());
              // Reason: PL166.2 — soft world rim complements Deed claimed + desk landmark.
              flashDeedClaimWorldReinforce(true);
            }
            setBusy(false);
          }}
        />
      ) : null}

      {panel === "mail" ? (
        <MailPanel
          mail={mail}
          players={players}
          depositOptions={state.inventory
            .filter((s) => ITEMS[s.itemId as keyof typeof ITEMS]?.stackable)
            .map((s) => ({ itemId: s.itemId, qty: s.qty }))}
          busy={busy}
          openAccent={mailOpenAccent}
          onClose={() => {
            clearMailOpenAccent();
            setPanel(null);
          }}
          onRefresh={() => {
            if (token) void refreshMail(token);
          }}
          onSend={async (input) => {
            setBusy(true);
            const items =
              input.qty > 0 && input.itemId
                ? [{ itemId: input.itemId, qty: input.qty }]
                : [];
            const res = await apiSendMail(token, {
              toUsername: input.toUsername,
              items,
              coins: input.coins,
              subject: input.subject,
            });
            await applyState(res);
            if (res.ok) {
              await refreshMail(token);
              // Reason: PL28.2 — ephemeral send cue; escrow sticky prose removed.
              flashSuccessCue(mailSendSuccessCueText());
              // Reason: PL149.1 — soft parchment rim; escrow unchanged.
              flashMailSendWorldReinforce(true);
            }
            setBusy(false);
          }}
          onClaim={async (mailId) => {
            setBusy(true);
            const res = await apiClaimMail(token, mailId);
            await applyState(res);
            if (res.ok) {
              await refreshMail(token);
              // Reason: PL17.2 — ephemeral TopBar cue; escrow rules unchanged.
              flashSuccessCue(mailClaimSuccessCueText());
              // Reason: PL152.2 — soft sage-parchment rim; escrow unchanged.
              flashMailClaimWorldReinforce(true);
            }
            setBusy(false);
          }}
          onCancel={async (mailId) => {
            setBusy(true);
            const res = await apiCancelMail(token, mailId);
            await applyState(res);
            if (res.ok) {
              await refreshMail(token);
              // Reason: PL28.2 — ephemeral cancel cue; escrow restore sticky prose removed.
              flashSuccessCue(mailCancelSuccessCueText());
              // Reason: PL157.2 — soft dusty parchment-ash rim; escrow unchanged.
              flashMailCancelWorldReinforce(true);
            }
            setBusy(false);
          }}
        />
      ) : null}

      {panel === "achievements" ? (
        <AchievementsPanel
          achievements={achievements}
          busy={busy}
          openAccent={achievementsOpenAccent}
          onClose={() => {
            clearAchievementsOpenAccent();
            setPendingAchievementUnlocks(clearPendingAchievementUnlocks());
            setPanel(null);
          }}
          onRefresh={() => {
            if (token) void refreshAchievements(token);
          }}
        />
      ) : null}

      {panel === "quests" ? (
        <QuestPanel
          quests={quests}
          busy={busy}
          openAccent={questOpenAccent}
          onClose={() => {
            clearQuestOpenAccent();
            setPanel(null);
          }}
          onRefresh={() => {
            if (token) void refreshQuests(token);
          }}
        />
      ) : null}

      {panel === "tutorial_npc" && tutorialProfessionId ? (
        <TutorialNpcPanel
          npc={tutorialNpc}
          busy={busy}
          openAccent={tutorialNpcOpenAccent}
          onClose={() => {
            clearTutorialNpcOpenAccent();
            setPanel(null);
            setTutorialProfessionId(null);
            setTutorialNpc(null);
          }}
          onRefresh={() => {
            if (!token || !tutorialProfessionId) return;
            void apiGetTutorialNpc(token, tutorialProfessionId).then((res) => {
              if (res.ok && res.npc) setTutorialNpc(res.npc);
            });
          }}
          onClaim={async () => {
            if (!token || !tutorialProfessionId) return;
            setBusy(true);
            const prevCoins = stateRef.current?.softCurrency ?? 0;
            const res = await apiClaimTutorialNpc(token, tutorialProfessionId);
            await applyState(res);
            if (res.ok) {
              if (res.npc) setTutorialNpc(res.npc);
              // Reason: PL13.2 — ephemeral TopBar cue (not sticky tutorial prose); XP/coins unchanged server-side.
              flashSuccessCue(tutorClaimSuccessCueText());
              flashQuestClaimWorldReinforce(true);
              // Reason: PL126.2 — soft gold rim when tutor reward coins land.
              flashCoinsGainWorldReinforce(
                true,
                prevCoins,
                res.state?.softCurrency ??
                  stateRef.current?.softCurrency ??
                  prevCoins,
              );
              void refreshTutorClaimable(token);
              void refreshQuests(token);
            }
            setBusy(false);
          }}
        />
      ) : null}

      {panel === "arena" && !visitLand ? (
        <ArenaStubPanel
          openAccent={arenaOpenAccent}
          onClose={() => {
            clearArenaOpenAccent();
            setPanel(null);
          }}
          onOpenTravel={openTravelPanel}
        />
      ) : null}

      {panel === "notice" && !visitLand ? (
        <NoticeBoardPanel
          openAccent={noticeOpenAccent}
          onClose={() => {
            clearNoticeOpenAccent();
            setPanel(null);
          }}
          onOpenTravel={openTravelPanel}
          onMarkTipsSeen={markNoticeTipsSeen}
        />
      ) : null}

      {panel === "guild" ? (
        <GuildPanel
          guildName={state.guildName}
          guildRank={state.guildRank}
          guildInviteCode={state.guildInviteCode}
          guilds={guilds}
          members={guildMembers}
          bank={guildBank}
          depositOptions={state.inventory
            .filter((s) => ITEMS[s.itemId as keyof typeof ITEMS]?.stackable)
            .map((s) => ({ itemId: s.itemId, qty: s.qty }))}
          busy={busy}
          openAccent={guildOpenAccent}
          membershipOpenAccent={guildMembershipOpenAccent}
          pendingInvites={pendingGuildInvites}
          onClose={() => {
            clearGuildOpenAccent();
            clearGuildMembershipOpenAccent();
            setPanel(null);
          }}
          onRefresh={() => {
            if (token) void refreshGuilds(token);
          }}
          onCreate={async (name) => {
            setBusy(true);
            const res = await apiCreateGuild(token, name);
            await applyState(res);
            if (res.ok) {
              await refreshGuilds(token);
              setPendingGuildInvites([]);
              // Reason: PL50.1 — ephemeral Created; invite/rank rules unchanged.
              audioRef.current?.playSfx("guild_claim");
              flashSuccessCue(guildCreateSuccessCueText());
              // Reason: PL158.1 — soft founding crest rim; guild rules unchanged.
              flashGuildCreateWorldReinforce(true);
            }
            setBusy(false);
          }}
          onJoinByCode={async (code) => {
            setBusy(true);
            const res = await apiJoinGuild(token, code);
            await applyState(res);
            if (res.ok) {
              await refreshGuilds(token);
              setPendingGuildInvites((prev) =>
                dismissPendingGuildInvite(prev, code),
              );
              // Reason: PL50.1 — ephemeral Joined; invite/rank rules unchanged.
              audioRef.current?.playSfx("guild_claim");
              flashSuccessCue(guildJoinSuccessCueText());
              // Reason: PL148.2 — soft welcome rim; invite rules unchanged.
              flashInviteAcceptWorldReinforce(true);
            }
            setBusy(false);
          }}
          onLeave={async () => {
            setBusy(true);
            const res = await apiLeaveGuild(token);
            await applyState(res);
            if (res.ok) {
              await refreshGuilds(token);
              // Reason: PL50.2 — ephemeral Left; leave rules unchanged.
              audioRef.current?.playSfx("guild_claim");
              flashSuccessCue(guildLeaveSuccessCueText());
              // Reason: PL158.2 — soft membership-release rim; guild rules unchanged.
              flashGuildLeaveWorldReinforce(true);
            }
            setBusy(false);
          }}
          onRegenerateInvite={async () => {
            setBusy(true);
            const res = await apiRegenerateGuildInvite(token);
            await applyState(res);
            if (res.ok) {
              await refreshGuilds(token);
              // Reason: PL56.3 — ephemeral Refreshed; rank / invite rules unchanged.
              audioRef.current?.playSfx("guild_claim");
              flashSuccessCue(guildInviteRefreshSuccessCueText());
            }
            setBusy(false);
          }}
          onOfferInvite={async (toUsername) => {
            // Reason: PL189.2 — soft nearby offer of existing code; join-by-code SoT.
            setBusy(true);
            const res = await apiOfferGuildInvite(token, toUsername);
            await applyState(res);
            setBusy(false);
          }}
          onDismissPendingInvite={(code) => {
            setPendingGuildInvites((prev) =>
              dismissPendingGuildInvite(prev, code),
            );
          }}
          onSetRank={async (username, rank) => {
            setBusy(true);
            const res = await apiSetGuildRank(token, username, rank);
            await applyState(res);
            if (res.ok) {
              await refreshGuilds(token);
              // Reason: PL111.1 — ephemeral Ranked + soft SFX; rank enum / permissions unchanged.
              audioRef.current?.playSfx("guild_claim");
              flashSuccessCue(guildRankChangeSuccessCueText());
            }
            setBusy(false);
          }}
          onDeposit={async (itemId, qty) => {
            setBusy(true);
            const res = await apiDepositGuildBank(token, itemId, qty);
            await applyState(res);
            if (res.ok) {
              await refreshGuilds(token);
              // Reason: PL48.2 — ephemeral Deposited; bank slot/stack rules unchanged.
              audioRef.current?.playSfx("guild_claim");
              flashSuccessCue(guildBankDepositSuccessCueText());
              // Reason: PL143.2 — quiet membership rim; bank caps unchanged.
              flashGuildBankDepositWorldReinforce(true);
            }
            setBusy(false);
          }}
          onWithdraw={async (itemId, qty) => {
            setBusy(true);
            const res = await apiWithdrawGuildBank(token, itemId, qty);
            await applyState(res);
            if (res.ok) {
              await refreshGuilds(token);
              // Reason: PL48.3 — ephemeral Withdrew; bank rules unchanged.
              audioRef.current?.playSfx("guild_claim");
              flashSuccessCue(guildBankWithdrawSuccessCueText());
              // Reason: PL148.1 — quiet steel-slate rim; bank caps unchanged.
              flashGuildBankWithdrawWorldReinforce(true);
            }
            setBusy(false);
          }}
        />
      ) : null}
      </GameHudShell>
    </main>
  );
}

