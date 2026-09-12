/**
 * Soft-refuse ephemeral cue resolver (RF7.5) — extracted from GameApp applyState.
 */

import {
  alreadyUpgradedRefuseCueText,
  animalPenCooldownRefuseCueText,
  buildBoardMissingRefuseCueText,
  buildCellOccupiedRefuseCueText,
  buildPlayerLandOnlyRefuseCueText,
  busyStationRefuseCueText,
  cannotUpgradeBuildingRefuseCueText,
  claimHeldByOtherRefuseCueText,
  claimNeedGuildRefuseCueText,
  claimNothingStoredRefuseCueText,
  claimWarAlreadyOpenRefuseCueText,
  claimWarNeedGuildRefuseCueText,
  claimWarNeedMatsRefuseCueText,
  claimWarNotOpenRefuseCueText,
  coinsRefuseCueText,
  cropMissingRefuseCueText,
  cropNotReadyRefuseCueText,
  decorAlreadyPlacedRefuseCueText,
  decorNeedCoinsRefuseCueText,
  decorPadMissingRefuseCueText,
  decorStarterOnlyRefuseCueText,
  deedAlreadyListedRefuseCueText,
  deedAlreadyMintedRefuseCueText,
  deedAlreadyOwnedRefuseCueText,
  deedBadPriceRefuseCueText,
  deedMissingRefuseCueText,
  deedNeedForestRefuseCueText,
  deedNeedMintRefuseCueText,
  deedNotListedRefuseCueText,
  deedNotYoursRefuseCueText,
  energyRefuseCueText,
  fishingDockCooldownRefuseCueText,
  gatherNodeMissingRefuseCueText,
  guildAlreadyInRefuseCueText,
  guildBankBadQtyRefuseCueText,
  guildBankEmptyRefuseCueText,
  guildBankFullRefuseCueText,
  guildBankNotStackableRefuseCueText,
  guildBankUnknownItemRefuseCueText,
  guildExistsRefuseCueText,
  guildInviteInvalidRefuseCueText,
  guildNameInvalidRefuseCueText,
  guildNotFoundRefuseCueText,
  guildNotInRefuseCueText,
  guildRankForbiddenRefuseCueText,
  guildRankInvalidRefuseCueText,
  guildTargetMissingRefuseCueText,
  hammerRefuseCueText,
  huntCooldownRefuseCueText,
  huntExploreOnlyRefuseCueText,
  huntOrClaimMissingRefuseCueText,
  invalidQtyRefuseCueText,
  itemMissingRefuseCueText,
  mailAlreadyClaimedRefuseCueText,
  mailEmptyRefuseCueText,
  mailInboxFullRefuseCueText,
  mailNotFoundRefuseCueText,
  mailNotStackableRefuseCueText,
  mailOnlyRecipientRefuseCueText,
  mailOnlySenderRefuseCueText,
  mailPlayerMissingRefuseCueText,
  mailSelfRefuseCueText,
  marketExpiredRefuseCueText,
  marketInvalidRefuseCueText,
  marketNeedFeeRefuseCueText,
  marketNotFoundRefuseCueText,
  marketNotStackableRefuseCueText,
  marketNotYoursRefuseCueText,
  marketOwnListingRefuseCueText,
  materialsRefuseCueText,
  missingItemRefuseCueText,
  missingSeedRefuseCueText,
  needMatsRepairRefuseCueText,
  needsStationRefuseCueText,
  needsXpRefuseCueText,
  noBreadRefuseCueText,
  noExpandSlotsRefuseCueText,
  noFoodRefuseCueText,
  notAToolRefuseCueText,
  oreCooldownRefuseCueText,
  plotMissingRefuseCueText,
  plotOccupiedRefuseCueText,
  questAlreadyClaimedRefuseCueText,
  questLockedRefuseCueText,
  questNotReadyRefuseCueText,
  questUnknownRefuseCueText,
  shouldFlashAlreadyUpgradedRefuseCue,
  shouldFlashAnimalPenCooldownRefuseCue,
  shouldFlashBuildBoardMissingRefuseCue,
  shouldFlashBuildCellOccupiedRefuseCue,
  shouldFlashBuildPlayerLandOnlyRefuseCue,
  shouldFlashBusyStationCue,
  shouldFlashCannotUpgradeBuildingRefuseCue,
  shouldFlashClaimHeldByOtherRefuseCue,
  shouldFlashClaimNeedGuildRefuseCue,
  shouldFlashClaimNothingStoredRefuseCue,
  shouldFlashClaimWarAlreadyOpenRefuseCue,
  shouldFlashClaimWarNeedGuildRefuseCue,
  shouldFlashClaimWarNeedMatsRefuseCue,
  shouldFlashClaimWarNotOpenRefuseCue,
  shouldFlashCoinsRefuseCue,
  shouldFlashCropMissingRefuseCue,
  shouldFlashCropNotReadyRefuseCue,
  shouldFlashDecorAlreadyPlacedRefuseCue,
  shouldFlashDecorNeedCoinsRefuseCue,
  shouldFlashDecorPadMissingRefuseCue,
  shouldFlashDecorStarterOnlyRefuseCue,
  shouldFlashDeedAlreadyListedRefuseCue,
  shouldFlashDeedAlreadyMintedRefuseCue,
  shouldFlashDeedAlreadyOwnedRefuseCue,
  shouldFlashDeedBadPriceRefuseCue,
  shouldFlashDeedMissingRefuseCue,
  shouldFlashDeedNeedForestRefuseCue,
  shouldFlashDeedNeedMintRefuseCue,
  shouldFlashDeedNotListedRefuseCue,
  shouldFlashDeedNotYoursRefuseCue,
  shouldFlashEnergyRefuseCue,
  shouldFlashFishingDockCooldownRefuseCue,
  shouldFlashGatherNodeMissingRefuseCue,
  shouldFlashGuildAlreadyInRefuseCue,
  shouldFlashGuildBankBadQtyRefuseCue,
  shouldFlashGuildBankEmptyRefuseCue,
  shouldFlashGuildBankFullRefuseCue,
  shouldFlashGuildBankNotStackableRefuseCue,
  shouldFlashGuildBankUnknownItemRefuseCue,
  shouldFlashGuildExistsRefuseCue,
  shouldFlashGuildInviteInvalidRefuseCue,
  shouldFlashGuildNameInvalidRefuseCue,
  shouldFlashGuildNotFoundRefuseCue,
  shouldFlashGuildNotInRefuseCue,
  shouldFlashGuildRankForbiddenRefuseCue,
  shouldFlashGuildRankInvalidRefuseCue,
  shouldFlashGuildTargetMissingRefuseCue,
  shouldFlashHammerRefuseCue,
  shouldFlashHuntCooldownRefuseCue,
  shouldFlashHuntExploreOnlyRefuseCue,
  shouldFlashHuntOrClaimMissingRefuseCue,
  shouldFlashInvalidQtyRefuseCue,
  shouldFlashItemMissingRefuseCue,
  shouldFlashMailAlreadyClaimedRefuseCue,
  shouldFlashMailEmptyRefuseCue,
  shouldFlashMailInboxFullRefuseCue,
  shouldFlashMailNotFoundRefuseCue,
  shouldFlashMailNotStackableRefuseCue,
  shouldFlashMailOnlyRecipientRefuseCue,
  shouldFlashMailOnlySenderRefuseCue,
  shouldFlashMailPlayerMissingRefuseCue,
  shouldFlashMailSelfRefuseCue,
  shouldFlashMarketExpiredRefuseCue,
  shouldFlashMarketInvalidRefuseCue,
  shouldFlashMarketNeedFeeRefuseCue,
  shouldFlashMarketNotFoundRefuseCue,
  shouldFlashMarketNotStackableRefuseCue,
  shouldFlashMarketNotYoursRefuseCue,
  shouldFlashMarketOwnListingRefuseCue,
  shouldFlashMaterialsRefuseCue,
  shouldFlashMissingItemRefuseCue,
  shouldFlashMissingSeedRefuseCue,
  shouldFlashNeedMatsRepairRefuseCue,
  shouldFlashNeedsStationRefuseCue,
  shouldFlashNeedsXpRefuseCue,
  shouldFlashNoBreadRefuseCue,
  shouldFlashNoExpandSlotsRefuseCue,
  shouldFlashNoFoodRefuseCue,
  shouldFlashNotAToolRefuseCue,
  shouldFlashOreCooldownRefuseCue,
  shouldFlashPlotMissingRefuseCue,
  shouldFlashPlotOccupiedRefuseCue,
  shouldFlashQuestAlreadyClaimedRefuseCue,
  shouldFlashQuestLockedRefuseCue,
  shouldFlashQuestNotReadyRefuseCue,
  shouldFlashQuestUnknownRefuseCue,
  shouldFlashTooFarRefuseCue,
  shouldFlashToolAlreadyRepairedRefuseCue,
  shouldFlashTradeBrokeRefuseCue,
  shouldFlashTradeEmptyRefuseCue,
  shouldFlashTradeMissingItemsRefuseCue,
  shouldFlashTradeNotFoundRefuseCue,
  shouldFlashTradeNotYoursRefuseCue,
  shouldFlashTradeOnlyRecipientRefuseCue,
  shouldFlashTradePlayerMissingRefuseCue,
  shouldFlashTradeSelfRefuseCue,
  shouldFlashTravelAlreadyHereCue,
  shouldFlashTravelInProgressRefuseCue,
  shouldFlashTravelNeedCoinsRefuseCue,
  shouldFlashUnknownDecorRefuseCue,
  shouldFlashUnknownRecipeRefuseCue,
  shouldFlashUnknownSeedRefuseCue,
  shouldFlashUnknownStationRefuseCue,
  shouldFlashVendorWontBuyRefuseCue,
  shouldFlashVendorWontSellRefuseCue,
  shouldFlashWalletAlreadyLinkedRefuseCue,
  shouldFlashWalletNotLinkedRefuseCue,
  shouldFlashWarriorHomesteadForbiddenRefuseCue,
  shouldFlashWoodStumpCooldownRefuseCue,
  tooFarRefuseCueText,
  toolAlreadyRepairedRefuseCueText,
  tradeBrokeRefuseCueText,
  tradeEmptyRefuseCueText,
  tradeMissingItemsRefuseCueText,
  tradeNotFoundRefuseCueText,
  tradeNotYoursRefuseCueText,
  tradeOnlyRecipientRefuseCueText,
  tradePlayerMissingRefuseCueText,
  tradeSelfRefuseCueText,
  travelAlreadyHereRefuseCueText,
  travelInProgressRefuseCueText,
  travelNeedCoinsRefuseCueText,
  unknownDecorRefuseCueText,
  unknownRecipeRefuseCueText,
  unknownSeedRefuseCueText,
  unknownStationRefuseCueText,
  vendorWontBuyRefuseCueText,
  vendorWontSellRefuseCueText,
  walletAlreadyLinkedRefuseCueText,
  walletNotLinkedRefuseCueText,
  warriorHomesteadForbiddenRefuseCueText,
  woodStumpCooldownRefuseCueText,
} from "./success-cue";

export type SoftRefuseFlashResult =
  | { kind: "busy"; text: string }
  | { kind: "ephemeral"; text: string };

/**
 * Maps an action error to a short TopBar refuse cue, if any.
 *
 * @param error - Server/client error string.
 * @returns Cue payload, or null when the error is not a soft refuse.
 */
export function resolveSoftRefuseFlash(
  error: string | undefined | null,
): SoftRefuseFlashResult | null {
  if (shouldFlashBusyStationCue(error)) return { kind: "busy" as const, text: busyStationRefuseCueText() };
  if (shouldFlashEnergyRefuseCue(error)) return { kind: "ephemeral" as const, text: energyRefuseCueText() };
  if (shouldFlashTravelAlreadyHereCue(error)) return { kind: "ephemeral" as const, text: travelAlreadyHereRefuseCueText() };
  if (shouldFlashTooFarRefuseCue(error)) return { kind: "ephemeral" as const, text: tooFarRefuseCueText() };
  if (shouldFlashMarketNeedFeeRefuseCue(error)) return { kind: "ephemeral" as const, text: marketNeedFeeRefuseCueText() };
  if (shouldFlashCoinsRefuseCue(error)) return { kind: "ephemeral" as const, text: coinsRefuseCueText() };
  if (shouldFlashNeedMatsRepairRefuseCue(error)) return { kind: "ephemeral" as const, text: needMatsRepairRefuseCueText() };
  if (shouldFlashMaterialsRefuseCue(error)) return { kind: "ephemeral" as const, text: materialsRefuseCueText() };
  if (shouldFlashHammerRefuseCue(error)) return { kind: "ephemeral" as const, text: hammerRefuseCueText() };
  if (shouldFlashCropNotReadyRefuseCue(error)) return { kind: "ephemeral" as const, text: cropNotReadyRefuseCueText() };
  if (shouldFlashPlotOccupiedRefuseCue(error)) return { kind: "ephemeral" as const, text: plotOccupiedRefuseCueText() };
  if (shouldFlashOreCooldownRefuseCue(error)) return { kind: "ephemeral" as const, text: oreCooldownRefuseCueText() };
  if (shouldFlashWoodStumpCooldownRefuseCue(error)) return { kind: "ephemeral" as const, text: woodStumpCooldownRefuseCueText() };
  if (shouldFlashFishingDockCooldownRefuseCue(error)) return { kind: "ephemeral" as const, text: fishingDockCooldownRefuseCueText() };
  if (shouldFlashAnimalPenCooldownRefuseCue(error)) return { kind: "ephemeral" as const, text: animalPenCooldownRefuseCueText() };
  if (shouldFlashHuntCooldownRefuseCue(error)) return { kind: "ephemeral" as const, text: huntCooldownRefuseCueText() };
  if (shouldFlashMissingSeedRefuseCue(error)) return { kind: "ephemeral" as const, text: missingSeedRefuseCueText() };
  if (shouldFlashNoBreadRefuseCue(error)) return { kind: "ephemeral" as const, text: noBreadRefuseCueText() };
  if (shouldFlashNoFoodRefuseCue(error)) return { kind: "ephemeral" as const, text: noFoodRefuseCueText() };
  if (shouldFlashBuildBoardMissingRefuseCue(error)) return { kind: "ephemeral" as const, text: buildBoardMissingRefuseCueText() };
  if (shouldFlashBuildCellOccupiedRefuseCue(error)) return { kind: "ephemeral" as const, text: buildCellOccupiedRefuseCueText() };
  if (shouldFlashToolAlreadyRepairedRefuseCue(error)) return { kind: "ephemeral" as const, text: toolAlreadyRepairedRefuseCueText() };
  if (shouldFlashDecorAlreadyPlacedRefuseCue(error)) return { kind: "ephemeral" as const, text: decorAlreadyPlacedRefuseCueText() };
  if (shouldFlashQuestNotReadyRefuseCue(error)) return { kind: "ephemeral" as const, text: questNotReadyRefuseCueText() };
  if (shouldFlashQuestLockedRefuseCue(error)) return { kind: "ephemeral" as const, text: questLockedRefuseCueText() };
  if (shouldFlashQuestAlreadyClaimedRefuseCue(error)) return { kind: "ephemeral" as const, text: questAlreadyClaimedRefuseCueText() };
  if (shouldFlashVendorWontBuyRefuseCue(error)) return { kind: "ephemeral" as const, text: vendorWontBuyRefuseCueText() };
  if (shouldFlashVendorWontSellRefuseCue(error)) return { kind: "ephemeral" as const, text: vendorWontSellRefuseCueText() };
  if (shouldFlashClaimNeedGuildRefuseCue(error)) return { kind: "ephemeral" as const, text: claimNeedGuildRefuseCueText() };
  if (shouldFlashClaimHeldByOtherRefuseCue(error)) return { kind: "ephemeral" as const, text: claimHeldByOtherRefuseCueText() };
  if (shouldFlashClaimNothingStoredRefuseCue(error)) return { kind: "ephemeral" as const, text: claimNothingStoredRefuseCueText() };
  if (shouldFlashClaimWarAlreadyOpenRefuseCue(error)) return { kind: "ephemeral" as const, text: claimWarAlreadyOpenRefuseCueText() };
  if (shouldFlashClaimWarNeedMatsRefuseCue(error)) return { kind: "ephemeral" as const, text: claimWarNeedMatsRefuseCueText() };
  if (shouldFlashClaimWarNotOpenRefuseCue(error)) return { kind: "ephemeral" as const, text: claimWarNotOpenRefuseCueText() };
  if (shouldFlashMarketOwnListingRefuseCue(error)) return { kind: "ephemeral" as const, text: marketOwnListingRefuseCueText() };
  if (shouldFlashMarketExpiredRefuseCue(error)) return { kind: "ephemeral" as const, text: marketExpiredRefuseCueText() };
  if (shouldFlashMailSelfRefuseCue(error)) return { kind: "ephemeral" as const, text: mailSelfRefuseCueText() };
  if (shouldFlashMailInboxFullRefuseCue(error)) return { kind: "ephemeral" as const, text: mailInboxFullRefuseCueText() };
  if (shouldFlashTravelInProgressRefuseCue(error)) return { kind: "ephemeral" as const, text: travelInProgressRefuseCueText() };
  if (shouldFlashTradeSelfRefuseCue(error)) return { kind: "ephemeral" as const, text: tradeSelfRefuseCueText() };
  if (shouldFlashTradeEmptyRefuseCue(error)) return { kind: "ephemeral" as const, text: tradeEmptyRefuseCueText() };
  if (shouldFlashTradePlayerMissingRefuseCue(error)) return { kind: "ephemeral" as const, text: tradePlayerMissingRefuseCueText() };
  if (shouldFlashGuildAlreadyInRefuseCue(error)) return { kind: "ephemeral" as const, text: guildAlreadyInRefuseCueText() };
  if (shouldFlashGuildNotInRefuseCue(error)) return { kind: "ephemeral" as const, text: guildNotInRefuseCueText() };
  if (shouldFlashGuildExistsRefuseCue(error)) return { kind: "ephemeral" as const, text: guildExistsRefuseCueText() };
  if (shouldFlashClaimWarNeedGuildRefuseCue(error)) return { kind: "ephemeral" as const, text: claimWarNeedGuildRefuseCueText() };
  if (shouldFlashBuildPlayerLandOnlyRefuseCue(error)) return { kind: "ephemeral" as const, text: buildPlayerLandOnlyRefuseCueText() };
  if (shouldFlashAlreadyUpgradedRefuseCue(error)) return { kind: "ephemeral" as const, text: alreadyUpgradedRefuseCueText() };
  if (shouldFlashCannotUpgradeBuildingRefuseCue(error)) return { kind: "ephemeral" as const, text: cannotUpgradeBuildingRefuseCueText() };
  if (shouldFlashTravelNeedCoinsRefuseCue(error)) return { kind: "ephemeral" as const, text: travelNeedCoinsRefuseCueText() };
  if (shouldFlashTradeNotFoundRefuseCue(error)) return { kind: "ephemeral" as const, text: tradeNotFoundRefuseCueText() };
  if (shouldFlashTradeNotYoursRefuseCue(error)) return { kind: "ephemeral" as const, text: tradeNotYoursRefuseCueText() };
  if (shouldFlashTradeOnlyRecipientRefuseCue(error)) return { kind: "ephemeral" as const, text: tradeOnlyRecipientRefuseCueText() };
  if (shouldFlashTradeBrokeRefuseCue(error)) return { kind: "ephemeral" as const, text: tradeBrokeRefuseCueText() };
  if (shouldFlashTradeMissingItemsRefuseCue(error)) return { kind: "ephemeral" as const, text: tradeMissingItemsRefuseCueText() };
  if (shouldFlashMailEmptyRefuseCue(error)) return { kind: "ephemeral" as const, text: mailEmptyRefuseCueText() };
  if (shouldFlashMailPlayerMissingRefuseCue(error)) return { kind: "ephemeral" as const, text: mailPlayerMissingRefuseCueText() };
  if (shouldFlashMailAlreadyClaimedRefuseCue(error)) return { kind: "ephemeral" as const, text: mailAlreadyClaimedRefuseCueText() };
  if (shouldFlashMarketNotFoundRefuseCue(error)) return { kind: "ephemeral" as const, text: marketNotFoundRefuseCueText() };
  if (shouldFlashMarketNotYoursRefuseCue(error)) return { kind: "ephemeral" as const, text: marketNotYoursRefuseCueText() };
  if (shouldFlashGuildInviteInvalidRefuseCue(error)) return { kind: "ephemeral" as const, text: guildInviteInvalidRefuseCueText() };
  if (shouldFlashGuildNameInvalidRefuseCue(error)) return { kind: "ephemeral" as const, text: guildNameInvalidRefuseCueText() };
  if (shouldFlashMailNotFoundRefuseCue(error)) return { kind: "ephemeral" as const, text: mailNotFoundRefuseCueText() };
  if (shouldFlashMailOnlyRecipientRefuseCue(error)) return { kind: "ephemeral" as const, text: mailOnlyRecipientRefuseCueText() };
  if (shouldFlashMailOnlySenderRefuseCue(error)) return { kind: "ephemeral" as const, text: mailOnlySenderRefuseCueText() };
  if (shouldFlashMarketNotStackableRefuseCue(error)) return { kind: "ephemeral" as const, text: marketNotStackableRefuseCueText() };
  if (shouldFlashGuildBankFullRefuseCue(error)) return { kind: "ephemeral" as const, text: guildBankFullRefuseCueText() };
  if (shouldFlashGuildBankEmptyRefuseCue(error)) return { kind: "ephemeral" as const, text: guildBankEmptyRefuseCueText() };
  if (shouldFlashGuildRankForbiddenRefuseCue(error)) return { kind: "ephemeral" as const, text: guildRankForbiddenRefuseCueText() };
  if (shouldFlashHuntExploreOnlyRefuseCue(error)) return { kind: "ephemeral" as const, text: huntExploreOnlyRefuseCueText() };
  if (shouldFlashWarriorHomesteadForbiddenRefuseCue(error)) return { kind: "ephemeral" as const, text: warriorHomesteadForbiddenRefuseCueText() };
  if (shouldFlashNotAToolRefuseCue(error)) return { kind: "ephemeral" as const, text: notAToolRefuseCueText() };
  if (shouldFlashGatherNodeMissingRefuseCue(error)) return { kind: "ephemeral" as const, text: gatherNodeMissingRefuseCueText() };
  if (shouldFlashPlotMissingRefuseCue(error)) return { kind: "ephemeral" as const, text: plotMissingRefuseCueText() };
  if (shouldFlashHuntOrClaimMissingRefuseCue(error)) return { kind: "ephemeral" as const, text: huntOrClaimMissingRefuseCueText() };
  if (shouldFlashGuildBankNotStackableRefuseCue(error)) return { kind: "ephemeral" as const, text: guildBankNotStackableRefuseCueText() };
  if (shouldFlashGuildBankUnknownItemRefuseCue(error)) return { kind: "ephemeral" as const, text: guildBankUnknownItemRefuseCueText() };
  if (shouldFlashGuildBankBadQtyRefuseCue(error)) return { kind: "ephemeral" as const, text: guildBankBadQtyRefuseCueText() };
  if (shouldFlashMailNotStackableRefuseCue(error)) return { kind: "ephemeral" as const, text: mailNotStackableRefuseCueText() };
  if (shouldFlashMarketInvalidRefuseCue(error)) return { kind: "ephemeral" as const, text: marketInvalidRefuseCueText() };
  if (shouldFlashInvalidQtyRefuseCue(error)) return { kind: "ephemeral" as const, text: invalidQtyRefuseCueText() };
  if (shouldFlashUnknownRecipeRefuseCue(error)) return { kind: "ephemeral" as const, text: unknownRecipeRefuseCueText() };
  if (shouldFlashNeedsStationRefuseCue(error)) return { kind: "ephemeral" as const, text: needsStationRefuseCueText() };
  if (shouldFlashNeedsXpRefuseCue(error)) return { kind: "ephemeral" as const, text: needsXpRefuseCueText() };
  if (shouldFlashDecorPadMissingRefuseCue(error)) return { kind: "ephemeral" as const, text: decorPadMissingRefuseCueText() };
  if (shouldFlashDecorStarterOnlyRefuseCue(error)) return { kind: "ephemeral" as const, text: decorStarterOnlyRefuseCueText() };
  if (shouldFlashNoExpandSlotsRefuseCue(error)) return { kind: "ephemeral" as const, text: noExpandSlotsRefuseCueText() };
  if (shouldFlashUnknownDecorRefuseCue(error)) return { kind: "ephemeral" as const, text: unknownDecorRefuseCueText() };
  if (shouldFlashDecorNeedCoinsRefuseCue(error)) return { kind: "ephemeral" as const, text: decorNeedCoinsRefuseCueText() };
  if (shouldFlashUnknownSeedRefuseCue(error)) return { kind: "ephemeral" as const, text: unknownSeedRefuseCueText() };
  if (shouldFlashCropMissingRefuseCue(error)) return { kind: "ephemeral" as const, text: cropMissingRefuseCueText() };
  if (shouldFlashItemMissingRefuseCue(error)) return { kind: "ephemeral" as const, text: itemMissingRefuseCueText() };
  if (shouldFlashUnknownStationRefuseCue(error)) return { kind: "ephemeral" as const, text: unknownStationRefuseCueText() };
  if (shouldFlashGuildNotFoundRefuseCue(error)) return { kind: "ephemeral" as const, text: guildNotFoundRefuseCueText() };
  if (shouldFlashGuildTargetMissingRefuseCue(error)) return { kind: "ephemeral" as const, text: guildTargetMissingRefuseCueText() };
  if (shouldFlashGuildRankInvalidRefuseCue(error)) return { kind: "ephemeral" as const, text: guildRankInvalidRefuseCueText() };
  if (shouldFlashQuestUnknownRefuseCue(error)) return { kind: "ephemeral" as const, text: questUnknownRefuseCueText() };
  if (shouldFlashMissingItemRefuseCue(error)) return { kind: "ephemeral" as const, text: missingItemRefuseCueText() };
  if (shouldFlashDeedMissingRefuseCue(error)) return { kind: "ephemeral" as const, text: deedMissingRefuseCueText() };
  if (shouldFlashDeedNotYoursRefuseCue(error)) return { kind: "ephemeral" as const, text: deedNotYoursRefuseCueText() };
  if (shouldFlashDeedNeedMintRefuseCue(error)) return { kind: "ephemeral" as const, text: deedNeedMintRefuseCueText() };
  if (shouldFlashDeedAlreadyMintedRefuseCue(error)) return { kind: "ephemeral" as const, text: deedAlreadyMintedRefuseCueText() };
  if (shouldFlashDeedAlreadyListedRefuseCue(error)) return { kind: "ephemeral" as const, text: deedAlreadyListedRefuseCueText() };
  if (shouldFlashDeedNotListedRefuseCue(error)) return { kind: "ephemeral" as const, text: deedNotListedRefuseCueText() };
  if (shouldFlashDeedBadPriceRefuseCue(error)) return { kind: "ephemeral" as const, text: deedBadPriceRefuseCueText() };
  if (shouldFlashDeedAlreadyOwnedRefuseCue(error)) return { kind: "ephemeral" as const, text: deedAlreadyOwnedRefuseCueText() };
  if (shouldFlashDeedNeedForestRefuseCue(error)) return { kind: "ephemeral" as const, text: deedNeedForestRefuseCueText() };
  if (shouldFlashWalletAlreadyLinkedRefuseCue(error)) return { kind: "ephemeral" as const, text: walletAlreadyLinkedRefuseCueText() };
  if (shouldFlashWalletNotLinkedRefuseCue(error)) return { kind: "ephemeral" as const, text: walletNotLinkedRefuseCueText() };
  return null;
}
