import { ENERGY, ITEMS, ORE_NODE, getOreNode, TOOL } from "./catalog.js";
import { COMBAT } from "./combat.js";

/**
 * Plain-language player-facing action failures (P1.3).
 * Prefer these over internal codes in API responses.
 */

export const ACTION_ERROR = {
  unauthorized: "You need to log in again.",
  playerMissing: "Could not find your character.",
  notEnoughEnergy: "Not enough energy. Eat bread or wait for it to recover.",
  plotMissing: "That field is not on your land.",
  plotNotEmpty: "This field already has a crop.",
  unknownSeed: "You cannot plant that here.",
  missingSeed: "You need a seed in your inventory.",
  cropNotReady: "This crop is still growing.",
  cropMissing: "Something went wrong with this crop.",
  unknownRecipe: "That recipe is not available.",
  needsStation: (station: string) =>
    `You need a ${station} on your land to craft that.`,
  needsXp: (profession: string, need: number) =>
    `You need ${need} ${profession} XP first. Keep practicing or specialize.`,
  missingMaterials: "You are missing the materials for that recipe.",
  missingItem: (name: string) => `You need ${name}.`,
  noBread: "You have no bread left.",
  vendorWontBuy: "The vendor will not buy that.",
  vendorWontSell: "The vendor does not sell that.",
  notEnoughItems: "You do not have enough of that item.",
  notEnoughCoins: "You do not have enough coins.",
  invalidQty: "Choose a valid amount.",
  noExpandSlots: "Your starter land has no empty slots left to unlock.",
  needCoinsExpand: (n: number) => `You need ${n} coins to unlock this field.`,
  needMatsExpand: (qty: number, name: string) =>
    `You need ${qty}× ${name} to unlock this field.`,
  unknownStation: "You cannot build that station here.",
  /** CL11.2 — arena / warrior training never on homestead. */
  warriorTrainingHomesteadForbidden:
    "Warrior training buildings belong in the Arena — not on your land.",
  buildBoardMissing: "Walk up to your build board to pick up stations.",
  buildBoardPickupOnly: "Use the build board to pick up stations into your bag.",
  buildCellOccupied: "That spot already has a building.",
  buildCellOutOfBounds: "That spot is outside your land.",
  needStationKit: "You need that station kit in your inventory.",
  needCoinsBuild: (n: number) => `You need ${n} coins to build that.`,
  placeKitPlayerLandOnly: "Place station kits on your own land.",
  pickupNotStation: "You can only pick up stations you placed.",
  pickupLandStock: "That came with the land — it stays planted.",
  unknownKit: "That is not a station kit.",
  needMatsBuild: (qty: number, name: string) =>
    `You need ${qty}× ${name} to build that.`,
  buildPlayerLandOnly: "You can only place stations on your own land.",
  cannotUpgradeBuilding: "That structure cannot be upgraded.",
  alreadyUpgraded: "That structure is already upgraded.",
  needCoinsUpgrade: (n: number) => `You need ${n} coins to upgrade this.`,
  needMatsUpgrade: (qty: number, name: string) =>
    `You need ${qty}× ${name} to upgrade this.`,
  travelAlreadyHere: "You are already there.",
  landNotOwned: "That land is not yours.",
  travelInProgress: (sec: number) =>
    `Your caravan is still on the road (${sec}s left).`,
  needCoinsTravel: (n: number) =>
    `You need ${n} coins for the caravan (or pack a Travel Ration).`,
  tradeEmpty: "Add items or coins to the trade.",
  tradeSelf: "You cannot trade with yourself.",
  tradePlayerMissing: "Could not find that player.",
  tradeNotFound: "That trade is no longer available.",
  tradeNotYours: "That trade is not yours.",
  tradeOnlyRecipient: "Only the other player can accept this trade.",
  tradeSenderBroke: "They no longer have enough coins for this trade.",
  tradeYouBroke: "You do not have enough coins for this trade.",
  tradeSenderMissingItems: "They no longer have the offered items.",
  tradeYouMissingItems: "You are missing the items they asked for.",
  notATool: "That item cannot be equipped as a tool.",
  itemMissing: "That item is not in your inventory.",
  /** PL25.1 — tool already at max durability (fail silent). */
  toolAlreadyRepaired: "That tool does not need repair.",
  /** PL25.1 — missing craft-chain mat for inventory repair. */
  needMatsRepair: (qty: number, name: string) =>
    `You need ${qty}× ${name} to repair that tool.`,
  marketInvalid: "Choose a valid item, amount, and coin price.",
  marketNotStackable: "Only stackable goods can be listed on the market.",
  marketNotFound: "That listing is no longer available.",
  marketNotYours: "That listing is not yours.",
  marketOwnListing: "You cannot buy your own listing.",
  marketNeedFee: (n: number) =>
    `You need ${n} coins to pay the market listing fee.`,
  marketExpired: "That listing expired and goods were returned to the seller.",
  decorPadMissing: "That decor spot is not on your homestead.",
  decorAlreadyPlaced: "That spot already has decor.",
  needCoinsDecor: (n: number) => `You need ${n} coins for that decor.`,
  decorStarterOnly: "Housing decor is only on your homestead.",
  unknownDecor: "That decor is not available.",
  oreNodeMissing: "That ore rock is not on your land.",
  oreNodeCooldown: "The ore rock needs time to settle before you chip again.",
  needHammer: "Equip an Iron Hammer to chip ore from the rock.",
  /**
   * PL21.2 — hammer missing from inventory (broken / consumed / never owned).
   * Names the tool; soft refuse may play (mute ok).
   */
  needHammerBroken:
    "Iron Hammer broke — forge one at a Forge or buy from a vendor.",
  tooFar: "Walk closer before you can do that.",
  /** CL52.3 / PL42.1 — scarce city station contended by another player in range. */
  stationBusy: "Someone else is using this station — wait or try another.",
  craftAlreadyStarted:
    "You already have a craft running at this station — collect it first.",
  craftNone: "Nothing to collect here.",
  craftNotYours: "Only the crafter who started this can collect it.",
  craftNotReady: "This craft is still working — come back when it is ready.",
  huntMissing: "That hunting trail is not on your land.",
  huntExploreOnly: "Hunt on the Exploration map — not here.",
  huntCooldown: "Wildlife has scattered — wait before hunting again.",
  combatZoneOnly: "Fight in Exploration or the Arena — not here.",
  combatNotActive: "Walk up and press E to start the fight.",
  combatAlreadyActive: "Finish this fight first.",
  combatAttackWait: "Wait a moment before the next strike.",
  combatTargetMissing: "There is nothing to fight here.",
  notCombatGear: "That item cannot be equipped as combat gear.",
  woodStumpMissing: "That tree stump is not on your land.",
  woodStumpCooldown: "The stump needs time before you can chop again.",
  fishingDockMissing: "That fishing dock is not on your land.",
  fishingDockCooldown: "The water needs a moment before you can cast again.",
  animalPenMissing: "That animal pen is not on your land.",
  animalPenCooldown: "The animals need a moment before you can care for them again.",
  noFood: "You have nothing edible selected.",
  guildNameInvalid: "Choose a guild name between 3 and 24 letters.",
  guildExists: "That guild name is already taken.",
  guildAlreadyIn: "You are already in a guild.",
  guildNotFound: "Could not find that guild.",
  guildNotIn: "You are not in a guild.",
  guildInviteInvalid: "That invite code is not valid.",
  guildRankForbidden: "Only the guild owner can change ranks.",
  guildBankWithdrawForbidden:
    "Only owners and officers can take items from the guild vault.",
  guildInviteForbidden: "Only owners and officers can refresh the invite code.",
  guildTargetMissing: "That player is not in your guild.",
  guildRankInvalid: "Rank must be officer or member.",
  guildBankNotStackable: "Only stackable goods can go in the guild bank.",
  guildBankUnknownItem: "That item cannot go in the guild bank.",
  guildBankFull: "The guild bank has no free slots.",
  guildBankEmpty: "The guild bank does not have enough of that item.",
  guildBankBadQty: "Choose a valid quantity.",
  claimNeedGuild: "Join a guild before claiming territory.",
  claimHeldByOther: "Another guild already holds this claim.",
  claimNothingStored: "The claim has not produced anything yet.",
  claimNodeMissing: "That claim beacon is not on your land.",
  claimWarNeedGuild: "Join a guild to contest this claim.",
  claimWarAlreadyOpen: "A soft war is already underway — deliver wood to score.",
  claimWarNeedMats: "Deliver wood at the beacon to score in the soft war.",
  claimWarNotOpen: "No soft war is active on this claim.",
  questUnknown: "That quest is not available.",
  questNotReady: "Finish the objective before claiming the reward.",
  questLocked: "Complete the previous quest first.",
  questAlreadyClaimed: "You already claimed that quest reward.",
  questClaimAtNpc: "Talk to the NPC to claim this reward.",
  mailEmpty: "Add stackable goods or coins to the parcel.",
  mailSelf: "You cannot mail yourself.",
  mailPlayerMissing: "Could not find that player.",
  mailNotFound: "That mail is no longer available.",
  mailAlreadyClaimed: "That parcel was already claimed.",
  mailNotStackable: "Only stackable goods can be mailed.",
  mailOnlyRecipient: "Only the recipient can claim this parcel.",
  mailOnlySender: "Only the sender can cancel this parcel.",
  mailInboxFull: "Their mailbox is full — try again later.",
  walletAlreadyLinked: "A wallet is already linked to this account.",
  walletNotLinked: "No wallet is linked.",
  walletBadAddress: "That does not look like a Creditcoin wallet address.",
  walletBadSignature: "Wallet signature did not match. Try connecting again.",
  walletInUse: "That wallet is already linked to another account.",
  walletNeedLink: "Link a Creditcoin wallet first (B or Settings).",
  walletStubLocalOnly: "Stub wallets are only for local_dev.",
  chainListingMismatch: "That on-chain listing does not match this sale.",
  coinSwapBadAmount: "Swap coins in multiples of 10 (10 coins = 1 REALM).",
  coinSwapPending: "You already have a REALM swap in progress.",
  realmMintFailed:
    "Could not mint REALM on Creditcoin. Need tCTC gas on the minter and a linked wallet — coins were returned.",
  tokenListBadPrice: "Pick a REALM price between 1 and 500.",
  tokenListNeedWallet: "Link a wallet before listing for REALM.",
  tokenListNotFound: "That REALM listing is no longer available.",
  tokenListNotYours: "That REALM listing is not yours.",
  tokenListOwn: "You cannot buy your own REALM listing.",
  notEnoughRealm: "You do not have enough REALM.",
  chainPayFirst: "Confirm the REALM payment in MetaMask first.",
  landMintOnchain: "Buy land with your wallet on Creditcoin Testnet.",
  deedAlreadyOwned: "You already hold a premium deed for that land.",
  deedNeedForest: "Travel to unlock your forest glade before claiming a deed.",
  deedMissing: "That deed was not found.",
  deedNotYours: "That deed is not yours.",
  deedAlreadyMinted: "This deed is already minted on the stub chain.",
  deedNeedMint: "Mint the deed stub before listing it.",
  deedAlreadyListed: "This deed is already listed.",
  deedNotListed: "This deed is not listed.",
  deedBadPrice: "Pick a list price between 10 and 500 coins.",
} as const;

/**
 * Formats remaining grow time for field UX (P1.2).
 */
export function formatGrowRemaining(remainMs: number): string {
  const totalSec = Math.max(0, Math.ceil(remainMs / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Human-readable time until energy is full at passive regen rate.
 */
export function formatEnergyFullEta(
  energy: number,
  maxEnergy: number,
  regenAmount: number,
  regenIntervalMs: number,
): string | null {
  if (energy >= maxEnergy) return null;
  if (regenAmount <= 0 || regenIntervalMs <= 0) return null;
  const missing = maxEnergy - energy;
  const ticks = Math.ceil(missing / regenAmount);
  const ms = ticks * regenIntervalMs;
  return formatGrowRemaining(ms);
}

/**
 * PL9.1 — whether TopBar should show the soft low-energy warning.
 * Uses ENERGY.lowWarnPct SoT; not a toast — style clears when recovered.
 *
 * @param energy - Current energy.
 * @param maxEnergy - Max energy for this character.
 * @returns True when energy is at or below the low-warn percentage of max.
 */
export function isEnergyLow(energy: number, maxEnergy: number): boolean {
  if (!Number.isFinite(energy) || !Number.isFinite(maxEnergy)) return false;
  if (maxEnergy <= 0) return false;
  if (energy < 0) return true;
  return (energy / maxEnergy) * 100 <= ENERGY.lowWarnPct;
}

/**
 * PL64.1 / PL67.1 — whether TopBar should treat health as in the low band.
 * Uses COMBAT.lowWarnPct SoT; not a toast — style clears when recovered.
 * Combat damage / heal numbers unchanged.
 *
 * @param health - Current health.
 * @param maxHealth - Max health for this character.
 * @returns True when health is at or below the low-warn percentage of max.
 */
export function isHealthLow(health: number, maxHealth: number): boolean {
  if (!Number.isFinite(health) || !Number.isFinite(maxHealth)) return false;
  if (maxHealth <= 0) return false;
  if (health < 0) return true;
  return (health / maxHealth) * 100 <= COMBAT.lowWarnPct;
}

/**
 * PL21.1 — whether inventory / equipped TopBar should show the soft low-durability accent.
 * Uses TOOL.lowWarnPct SoT; clears when repaired or a healthier tool is equipped (no toast).
 *
 * @param durability - Remaining durability on the stack (null for non-tools).
 * @param maxDurability - Item max durability from catalog.
 * @returns True when remaining durability is at or below the low-warn percentage of max.
 */
export function isToolDurabilityLow(
  durability: number | null | undefined,
  maxDurability: number | null | undefined,
): boolean {
  if (durability == null || maxDurability == null) return false;
  if (!Number.isFinite(durability) || !Number.isFinite(maxDurability)) return false;
  if (maxDurability <= 0) return false;
  if (durability < 0) return true;
  return (durability / maxDurability) * 100 <= TOOL.lowWarnPct;
}

/**
 * PL21.2 — walk-up ore chip prompt: name Iron Hammer; clarify equip vs broken/missing.
 * When tool state is omitted, keeps the classic ready label (tests / visitors).
 *
 * @param equippedItemId - Currently equipped tool item id, or null.
 * @param hasRequiredTool - True when an Iron Hammer exists in inventory.
 * @param oreKind - Stored ore node kind (`iron` / `copper` / `gold`); defaults to iron.
 * @returns Prompt action label (section prefix applied later).
 */
export function oreChipInteractLabel(
  equippedItemId?: string | null,
  hasRequiredTool?: boolean,
  oreKind?: string | null,
): string {
  const toolName = ITEMS[ORE_NODE.requiredTool]?.name ?? "Iron Hammer";
  const yieldId = getOreNode(oreKind).yieldItemId;
  const oreName = (ITEMS[yieldId]?.name ?? "Iron Ore").toLowerCase();
  if (equippedItemId === undefined && hasRequiredTool === undefined) {
    return `Chip ${oreName} (${toolName})`;
  }
  if (equippedItemId === ORE_NODE.requiredTool) {
    return `Chip ${oreName} (${toolName})`;
  }
  if (hasRequiredTool) {
    return `Chip ${oreName} · equip ${toolName}`;
  }
  return `Need ${toolName} · forge or buy`;
}

/**
 * Estimates server time from last snapshot (avoids waiting on the next poll).
 */
export function syncedNow(
  serverNow: number,
  receivedAtLocal: number,
  localNow = Date.now(),
): number {
  return serverNow + (localNow - receivedAtLocal);
}
