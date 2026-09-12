import {
  ACTION_ERROR,
  ITEMS,
  isCityLandKind,
  isEnergyLow,
  isExploreLandKind,
  isHealthLow,
  isToolDurabilityLow,
  isWarriorLandKind,
  shouldFlashTravelArriveCue,
  travelArriveDestinationLabel,
} from "@game/shared";
import {
  formatActionLootCue,
  formatPenCareCue,
  isActionLootCueLine,
  type ActionLootCue,
} from "./action-loot-cue";

/**
 * Brief success feedback for core actions (PL6.2), market (PL10.2),
 * tutor claim (PL13.2), visit arrive (PL15.1) / leave (PL27.1), housing decor (PL16.2),
 * mail parcel claim (PL17.2) / send+cancel (PL28.2), trade invite/accept (PL18.1–PL18.2),
 * trade offer sent (PL28.1), eat / equip / expand (PL20.1–PL20.3), tool repair (PL25.1),
 * first homestead station place (PL25.2), subsequent Built (PL28.3),
 * chat receive (PL27.2), quest claim (PL29.3), guild claim / soft-war /
 * collect (PL31.2), tool broke (PL33.1), hunt encounter win/lose (PL33.2),
 * and deed / wallet surface confirms (PL33.3), mute toggle (PL37.2),
 * energy low threshold crossing (PL41.1), busy station refuse (PL42.1),
 * and first portal walk-up tip (PL42.2), gather success (PL43.1),
 * vendor sell/buy (PL43.2–PL43.3), energy / already-here refuse (PL44.1–PL44.2),
 * first Explore / Arena walk-up tips (PL45.1–PL45.2),
 * character level-up (PL47.1), achievement unlock (PL47.2),
 * craft station upgrade (PL48.1), guild bank deposit / withdraw (PL48.2–PL48.3),
 * character title change (PL49.1), extra decor pad unlock (PL49.2),
 * guild create / join / leave (PL50.1–PL50.2),
 * first City hub tip (PL57.1), day-phase change soft cue (PL57.2).
 * Short copy only — not a toast stack; auto-clears via SUCCESS_CUE_MS.
 */

/** How long the success info line stays before clearing (min HUD). */
export const SUCCESS_CUE_MS = 2200;

export type CoreSuccessAction = "plant" | "harvest" | "craft" | "travel";

export type MarketSuccessAction = "list" | "buy" | "cancel";

/** Ephemeral TopBar copy when a tutorial objective claim succeeds (PL13.2). */
export const TUTOR_CLAIM_SUCCESS_CUE = "Claimed";

/** Ephemeral TopBar copy when a starter quest claim succeeds (PL29.3) — distinct from tutor Claimed. */
export const QUEST_CLAIM_SUCCESS_CUE = "Quest claimed";

/** Prefix for visit-arrive ephemeral cues (PL15.1) — not sticky visiting prose. */
export const VISIT_SUCCESS_CUE_PREFIX = "Visiting · ";

/** Ephemeral TopBar copy when leaving a visit back home (PL27.1). */
export const VISIT_LEAVE_SUCCESS_CUE = "Home";

/** Ephemeral TopBar copy when housing decor places (PL16.2). */
export const DECOR_PLACE_SUCCESS_CUE = "Decor placed";

/** Ephemeral TopBar copy when a chat line arrives while the panel is closed (PL27.2). */
export const CHAT_RECEIVE_SUCCESS_CUE = "Chat";

/** Ephemeral TopBar copy when an offline mail parcel is claimed (PL17.2). */
export const MAIL_CLAIM_SUCCESS_CUE = "Parcel claimed";

/** Ephemeral TopBar copy when an offline mail parcel is sent (PL28.2). */
export const MAIL_SEND_SUCCESS_CUE = "Parcel sent";

/** Ephemeral TopBar copy when a pending mail parcel is cancelled (PL28.2). */
export const MAIL_CANCEL_SUCCESS_CUE = "Parcel cancelled";

/** Prefix for incoming trade-invite ephemeral cues (PL18.1) — not sticky T prose. */
export const TRADE_INVITE_RECEIVE_CUE_PREFIX = "Trade · ";

/** Prefix for trade-offer-sent ephemeral cues (PL28.1) — not sticky escrow prose. */
export const TRADE_OFFER_SENT_CUE_PREFIX = "Offer · ";

/** Ephemeral TopBar copy when a trade accept succeeds (PL18.2). */
export const TRADE_ACCEPT_SUCCESS_CUE = "Trade accepted";

/** Ephemeral TopBar copy when you cancel your outgoing trade offer (PL62.1). */
export const TRADE_CANCEL_SUCCESS_CUE = "Cancelled";

/** Ephemeral TopBar copy when a chat line sends successfully (PL62.2). */
export const CHAT_SEND_SUCCESS_CUE = "Sent";

/** Ephemeral TopBar copy when eating food succeeds (PL20.1). */
export const EAT_FOOD_SUCCESS_CUE = "Ate";

/** Ephemeral TopBar copy when a tool equips (PL20.2). */
export const EQUIP_TOOL_SUCCESS_CUE = "Equipped";

/** Ephemeral TopBar copy when a tool unequips (PL20.2). */
export const UNEQUIP_TOOL_SUCCESS_CUE = "Unequipped";

/** Ephemeral TopBar copy when land expand succeeds (PL20.3). */
export const EXPAND_FIELD_SUCCESS_CUE = "Expanded";

/** Ephemeral TopBar copy when a tool repair succeeds (PL25.1). */
export const REPAIR_TOOL_SUCCESS_CUE = "Repaired";

/** Ephemeral TopBar copy on the first homestead station place (PL25.2). */
export const HOMESTEAD_FIRST_PLACE_SUCCESS_CUE = "Homestead";

/** Ephemeral TopBar copy on subsequent station places (PL28.3). */
export const STATION_BUILT_SUCCESS_CUE = "Built";

/** Ephemeral TopBar copy when a guild claims Wild Grove (PL31.2). */
export const GUILD_CLAIM_SUCCESS_CUE = "Grove claimed";

/** Ephemeral TopBar copy when a soft war starts on a claim (PL31.2). */
export const SOFT_WAR_START_SUCCESS_CUE = "Soft war";

/** Ephemeral TopBar copy when an equipped tool breaks from use (PL33.1). */
export const TOOL_BROKE_SUCCESS_CUE = "Tool broke";

/** Prefix for hunt-win ephemeral cues (PL33.2) — not sticky encounter prose. */
export const HUNT_WIN_SUCCESS_CUE_PREFIX = "Won · ";

/** Fallback hunt-win cue when foe name is missing (PL33.2). */
export const HUNT_WIN_SUCCESS_CUE = "Won";

/** Prefix for hunt-lose ephemeral cues (PL33.2) — not sticky encounter prose. */
export const HUNT_LOSE_SUCCESS_CUE_PREFIX = "Lost · ";

/** Fallback hunt-lose cue when foe name is missing (PL33.2). */
export const HUNT_LOSE_SUCCESS_CUE = "Lost";

/** Ephemeral TopBar copy when a land deed is claimed (PL33.3). */
export const DEED_CLAIM_SUCCESS_CUE = "Deed claimed";

/** Ephemeral TopBar copy when a stub deed mint is recorded (PL33.3). */
export const DEED_MINT_SUCCESS_CUE = "Deed minted";

/** Ephemeral TopBar copy when a deed is listed on the mock board (PL33.3). */
export const DEED_LIST_SUCCESS_CUE = "Deed listed";

/** Ephemeral TopBar copy when a deed is unlisted from the mock board (PL33.3). */
export const DEED_UNLIST_SUCCESS_CUE = "Deed unlisted";

/** Ephemeral TopBar copy when a stub wallet links (PL33.3). */
export const WALLET_LINK_SUCCESS_CUE = "Wallet linked";

/** Ephemeral TopBar copy when a stub wallet disconnects (PL33.3). */
export const WALLET_DISCONNECT_SUCCESS_CUE = "Wallet disconnected";

/** Ephemeral TopBar when settings mute flips on (PL37.2). */
export const MUTE_ON_SUCCESS_CUE = "Muted";

/** Ephemeral TopBar when settings mute flips off (PL37.2). */
export const MUTE_OFF_SUCCESS_CUE = "Unmuted";

/** Ephemeral TopBar when energy first crosses into the low band (PL41.1). */
export const ENERGY_LOW_SUCCESS_CUE = "Energy low";

/** Ephemeral TopBar when health first crosses into the low band (PL64.1). */
export const HEALTH_LOW_SUCCESS_CUE = "Health low";

/** Ephemeral TopBar when equipped tool first crosses into the low-durability band (PL61.1). */
export const TOOL_DURABILITY_LOW_SUCCESS_CUE = "Tool low";

/** Ephemeral TopBar when a scarce city station is busy (PL42.1). */
export const BUSY_STATION_REFUSE_CUE = "Busy";

/** Ephemeral TopBar on first portal proximity (PL42.2) — fare-free circuit cue. */
export const FIRST_PORTAL_WALKUP_CUE = "Portal · fare-free";

/** Ephemeral TopBar on first Explore map presence (PL45.1) — wilds hunt+gather. */
export const FIRST_EXPLORE_WALKUP_CUE = "Explore · hunt + gather";

/** Ephemeral TopBar on first arena plaque proximity (PL45.2) — optional path. */
export const FIRST_ARENA_WALKUP_CUE = "Arena · optional";

/** Ephemeral TopBar on first empty-land build-board proximity (PL52.1). */
export const FIRST_EMPTY_LAND_BUILD_BOARD_CUE = "Land · build board";

/** Ephemeral TopBar on first visit to another player's land (PL53.1). */
export const FIRST_VISIT_LAND_CUE = "Visit · trade · T";

/** Ephemeral TopBar on first Warrior map presence (PL53.2) — optional path. */
export const FIRST_WARRIOR_MAP_CUE = "Warrior · optional";

/** Ephemeral TopBar on first City hub presence (PL57.1) — complements sticky city_hub. */
export const FIRST_CITY_HUB_CUE = "City · shared hub";

/** Ephemeral TopBar on first market board proximity (PL59.1) — complements post_craft_market. */
export const FIRST_MARKET_WALKUP_CUE = "Market · list + buy";

/** Ephemeral TopBar on first vendor stall proximity (PL59.2) — tools / seeds. */
export const FIRST_VENDOR_WALKUP_CUE = "Vendor · tools + seeds";

/** Ephemeral TopBar on first fishing dock proximity (PL66.1) — catch once. */
export const FIRST_FISHING_DOCK_WALKUP_CUE = "Dock · catch fish";

/** Ephemeral TopBar on first animal pen proximity (PL66.2) — feed / clean. */
export const FIRST_ANIMAL_PEN_WALKUP_CUE = "Pen · feed + clean";

/** Ephemeral TopBar on first tree stump proximity (PL68.1) — chop once. */
export const FIRST_TREE_STUMP_WALKUP_CUE = "Stump · chop wood";

/** Ephemeral TopBar on first ore node proximity (PL68.2) — chip / hammer. */
export const FIRST_ORE_NODE_WALKUP_CUE = "Ore · chip ore";

/** Ephemeral TopBar on first crop plot proximity (PL68.3) — plant / harvest. */
export const FIRST_CROP_PLOT_WALKUP_CUE = "Plot · plant + harvest";

/** Ephemeral TopBar on first game trail / edge thicket proximity (PL68.4) — hunt. */
export const FIRST_HUNT_TRAIL_WALKUP_CUE = "Trail · hunt";

/** Ephemeral TopBar on first kitchen proximity (PL70.1) — cook food. */
export const FIRST_KITCHEN_WALKUP_CUE = "Kitchen · cook food";

/** Ephemeral TopBar on first notice board proximity (PL70.2) — city tips. */
export const FIRST_NOTICE_BOARD_WALKUP_CUE = "Notices · city tips";

/** Ephemeral TopBar on first expand-pad proximity (PL72.1) — unlock field. */
export const FIRST_EXPAND_PAD_WALKUP_CUE = "Expand · unlock field";

/** Ephemeral TopBar on first mill proximity (PL74.1) — grind flour. */
export const FIRST_MILL_WALKUP_CUE = "Mill · grind flour";

/** Ephemeral TopBar on first workshop proximity (PL74.2) — saw planks. */
export const FIRST_WORKSHOP_WALKUP_CUE = "Workshop · saw planks";

/** Ephemeral TopBar on first forge proximity (PL74.3) — smelt iron. */
export const FIRST_FORGE_WALKUP_CUE = "Forge · smelt iron";

/** Ephemeral TopBar on first loom proximity (PL77.1) — weave cloth. */
export const FIRST_LOOM_WALKUP_CUE = "Loom · weave cloth";

/** Ephemeral TopBar on first alchemy bench proximity (PL77.2) — brew tonic. */
export const FIRST_ALCHEMY_BENCH_WALKUP_CUE = "Alchemy · brew tonic";

/** Ephemeral TopBar on first housing decor-pad proximity (PL75.1) — place yard. */
export const FIRST_DECOR_PAD_WALKUP_CUE = "Decor · place yard";

/** Ephemeral TopBar on first tutorial NPC proximity (PL76.2) — learn + claim. */
export const FIRST_TUTOR_WALKUP_CUE = "Tutor · learn + claim";

/** Ephemeral TopBar on first claim-node proximity (PL80.1) — claim grove. */
export const FIRST_CLAIM_NODE_WALKUP_CUE = "Grove · claim territory";

/** Ephemeral TopBar when cosmetic day phase edges into Dawn (PL57.2). */
export const DAY_PHASE_DAWN_CUE = "Dawn";

/** Ephemeral TopBar when cosmetic day phase edges into Dusk (PL57.2). */
export const DAY_PHASE_DUSK_CUE = "Dusk";

/** Ephemeral TopBar when cosmetic day phase edges into Night (PL57.2). */
export const DAY_PHASE_NIGHT_CUE = "Night";

/** Ephemeral TopBar when soft-refuse too-far (PL54.1). */
export const TOO_FAR_REFUSE_CUE = "Closer";

/** Ephemeral TopBar when soft-refuse not-enough-coins (PL54.2). */
export const COINS_REFUSE_CUE = "Coins";

/** Ephemeral TopBar when soft-refuse missing materials / items (PL54.3). */
export const MATERIALS_REFUSE_CUE = "Materials";

/** Ephemeral TopBar when soft-refuse need-hammer / broken hammer (PL58.1). */
export const HAMMER_REFUSE_CUE = "Hammer";

/** Ephemeral TopBar when soft-refuse crop-not-ready (PL58.2). */
export const CROP_NOT_READY_REFUSE_CUE = "Growing";

/** Ephemeral TopBar when soft-refuse plot-occupied (PL58.3). */
export const PLOT_OCCUPIED_REFUSE_CUE = "Occupied";

/** Ephemeral TopBar when a crop plot first becomes harvest-ready (PL60.1). */
export const CROP_READY_EDGE_CUE = "Ready";

/** Ephemeral TopBar when a wood stump first becomes chop-ready after cooldown (PL65.1). */
export const WOOD_STUMP_READY_EDGE_CUE = "Ready";

/** Ephemeral TopBar when a fishing dock first becomes cast-ready after cooldown (PL65.2). */
export const FISHING_DOCK_READY_EDGE_CUE = "Ready";

/** Ephemeral TopBar when an ore node first becomes chip-ready after cooldown (PL69.1). */
export const ORE_NODE_READY_EDGE_CUE = "Ready";

/** Ephemeral TopBar when an animal pen first becomes care-ready after cooldown (PL69.2). */
export const ANIMAL_PEN_READY_EDGE_CUE = "Ready";

/** Ephemeral TopBar when soft-refuse ore-node cooldown (PL60.2). */
export const ORE_COOLDOWN_REFUSE_CUE = "Settling";

/** Ephemeral TopBar when soft-refuse wood-stump cooldown (PL63.1). */
export const WOOD_STUMP_COOLDOWN_REFUSE_CUE = "Resting";

/** Ephemeral TopBar when soft-refuse fishing-dock cooldown (PL63.2). */
export const FISHING_DOCK_COOLDOWN_REFUSE_CUE = "Waiting";

/** Ephemeral TopBar when soft-refuse animal-pen cooldown (PL63.3). */
export const ANIMAL_PEN_COOLDOWN_REFUSE_CUE = "Resting";

/** Ephemeral TopBar when soft-refuse hunt cooldown (PL63.4). */
export const HUNT_COOLDOWN_REFUSE_CUE = "Scattered";

/** Ephemeral TopBar when soft-refuse missing wheat seed (PL64.2). */
export const MISSING_SEED_REFUSE_CUE = "Seed";

/** Ephemeral TopBar when soft-refuse no bread left (PL71.1). */
export const NO_BREAD_REFUSE_CUE = "Bread";

/** Ephemeral TopBar when soft-refuse nothing edible selected (PL73.1). */
export const NO_FOOD_REFUSE_CUE = "Food";

/** Ephemeral TopBar when soft-refuse build board missing (PL71.2). */
export const BUILD_BOARD_MISSING_REFUSE_CUE = "Board";

/** Ephemeral TopBar when soft-refuse build cell already occupied (PL73.2). */
export const BUILD_CELL_OCCUPIED_REFUSE_CUE = "Spot";

/** Ephemeral TopBar when soft-refuse tool already repaired (PL73.3). */
export const TOOL_ALREADY_REPAIRED_REFUSE_CUE = "Intact";

/** Ephemeral TopBar when soft-refuse decor already placed (PL75.2). */
export const DECOR_ALREADY_PLACED_REFUSE_CUE = "Taken";

/** Ephemeral TopBar when soft-refuse quest objective not ready (PL76.1). */
export const QUEST_NOT_READY_REFUSE_CUE = "Objective";

/** Ephemeral TopBar when soft-refuse quest locked (PL78.1). */
export const QUEST_LOCKED_REFUSE_CUE = "Locked";

/** Ephemeral TopBar when soft-refuse quest already claimed (PL78.2). */
export const QUEST_ALREADY_CLAIMED_REFUSE_CUE = "Claimed";

/** Ephemeral TopBar when soft-refuse vendor won't buy (PL79.1). */
export const VENDOR_WONT_BUY_REFUSE_CUE = "Unwanted";

/** Ephemeral TopBar when soft-refuse vendor won't sell (PL79.2). */
export const VENDOR_WONT_SELL_REFUSE_CUE = "Stock";

/** Ephemeral TopBar when soft-refuse claim needs guild (PL80.2). */
export const CLAIM_NEED_GUILD_REFUSE_CUE = "Guild";

/** Ephemeral TopBar when soft-refuse claim held by other (PL81.1). */
export const CLAIM_HELD_BY_OTHER_REFUSE_CUE = "Held";

/** Ephemeral TopBar when soft-refuse claim nothing stored (PL81.2). */
export const CLAIM_NOTHING_STORED_REFUSE_CUE = "Empty";

/** Ephemeral TopBar when soft-refuse claim war already open (PL82.1). */
export const CLAIM_WAR_ALREADY_OPEN_REFUSE_CUE = "Contest";

/** Ephemeral TopBar when soft-refuse claim war need mats (PL82.2). */
export const CLAIM_WAR_NEED_MATS_REFUSE_CUE = "Wood";

/** Ephemeral TopBar when soft-refuse claim war not open (PL82.3). */
export const CLAIM_WAR_NOT_OPEN_REFUSE_CUE = "Peace";

/** Ephemeral TopBar when soft-refuse market own listing (PL83.1). */
export const MARKET_OWN_LISTING_REFUSE_CUE = "Yours";

/** Ephemeral TopBar when soft-refuse market expired (PL83.2). */
export const MARKET_EXPIRED_REFUSE_CUE = "Expired";

/** Ephemeral TopBar when soft-refuse mail self (PL84.1). */
export const MAIL_SELF_REFUSE_CUE = "Self";

/** Ephemeral TopBar when soft-refuse mail inbox full (PL84.2). */
export const MAIL_INBOX_FULL_REFUSE_CUE = "Full";

/** Ephemeral TopBar when soft-refuse travel in progress (PL85.1). */
export const TRAVEL_IN_PROGRESS_REFUSE_CUE = "Road";

/** Ephemeral TopBar when soft-refuse trade self (PL86.1). */
export const TRADE_SELF_REFUSE_CUE = "Self";

/** Ephemeral TopBar when soft-refuse trade empty (PL86.2). */
export const TRADE_EMPTY_REFUSE_CUE = "Empty";

/** Ephemeral TopBar when soft-refuse trade player missing (PL86.3). */
export const TRADE_PLAYER_MISSING_REFUSE_CUE = "Gone";

/** Ephemeral TopBar when soft-refuse guild already in (PL87.1). */
export const GUILD_ALREADY_IN_REFUSE_CUE = "Member";

/** Ephemeral TopBar when soft-refuse guild not in (PL87.2). */
export const GUILD_NOT_IN_REFUSE_CUE = "No guild";

/** Ephemeral TopBar when soft-refuse guild exists (PL87.3). */
export const GUILD_EXISTS_REFUSE_CUE = "Taken";

/** Ephemeral TopBar when soft-refuse claim war need guild (PL88.1). */
export const CLAIM_WAR_NEED_GUILD_REFUSE_CUE = "Guild";

/** Ephemeral TopBar when soft-refuse build player land only (PL88.2). */
export const BUILD_PLAYER_LAND_ONLY_REFUSE_CUE = "Land";

/** Ephemeral TopBar when soft-refuse already upgraded (PL89.1). */
export const ALREADY_UPGRADED_REFUSE_CUE = "Max";

/** Ephemeral TopBar when soft-refuse cannot upgrade building (PL89.2). */
export const CANNOT_UPGRADE_BUILDING_REFUSE_CUE = "Fixed";

/** Ephemeral TopBar when soft-refuse travel need coins (PL90.1). */
export const TRAVEL_NEED_COINS_REFUSE_CUE = "Coins";

/** Ephemeral TopBar when soft-refuse trade not found (PL91.1). */
export const TRADE_NOT_FOUND_REFUSE_CUE = "Gone";

/** Ephemeral TopBar when soft-refuse trade not yours (PL91.2). */
export const TRADE_NOT_YOURS_REFUSE_CUE = "Yours";

/** Ephemeral TopBar when soft-refuse trade only recipient (PL91.3). */
export const TRADE_ONLY_RECIPIENT_REFUSE_CUE = "Wait";

/** Ephemeral TopBar when soft-refuse trade broke (PL92.1). */
export const TRADE_BROKE_REFUSE_CUE = "Broke";

/** Ephemeral TopBar when soft-refuse trade missing items (PL92.2). */
export const TRADE_MISSING_ITEMS_REFUSE_CUE = "Items";

/** Ephemeral TopBar when soft-refuse mail empty (PL93.1). */
export const MAIL_EMPTY_REFUSE_CUE = "Empty";

/** Ephemeral TopBar when soft-refuse mail player missing (PL93.2). */
export const MAIL_PLAYER_MISSING_REFUSE_CUE = "Gone";

/** Ephemeral TopBar when soft-refuse mail already claimed (PL93.3). */
export const MAIL_ALREADY_CLAIMED_REFUSE_CUE = "Claimed";

/** Ephemeral TopBar when soft-refuse market not found (PL94.1). */
export const MARKET_NOT_FOUND_REFUSE_CUE = "Gone";

/** Ephemeral TopBar when soft-refuse market not yours (PL94.2). */
export const MARKET_NOT_YOURS_REFUSE_CUE = "Yours";

/** Ephemeral TopBar when soft-refuse guild invite invalid (PL95.1). */
export const GUILD_INVITE_INVALID_REFUSE_CUE = "Code";

/** Ephemeral TopBar when soft-refuse guild name invalid (PL95.2). */
export const GUILD_NAME_INVALID_REFUSE_CUE = "Name";

/** Ephemeral TopBar when soft-refuse mail not found (PL96.1). */
export const MAIL_NOT_FOUND_REFUSE_CUE = "Gone";

/** Ephemeral TopBar when soft-refuse mail only recipient (PL96.2). */
export const MAIL_ONLY_RECIPIENT_REFUSE_CUE = "Wait";

/** Ephemeral TopBar when soft-refuse mail only sender (PL96.3). */
export const MAIL_ONLY_SENDER_REFUSE_CUE = "Sender";

/** Ephemeral TopBar when soft-refuse market need fee (PL97.1). */
export const MARKET_NEED_FEE_REFUSE_CUE = "Fee";

/** Ephemeral TopBar when soft-refuse market not stackable (PL97.2). */
export const MARKET_NOT_STACKABLE_REFUSE_CUE = "Stack";

/** Ephemeral TopBar when soft-refuse guild bank full (PL98.1). */
export const GUILD_BANK_FULL_REFUSE_CUE = "Full";

/** Ephemeral TopBar when soft-refuse guild bank empty (PL98.2). */
export const GUILD_BANK_EMPTY_REFUSE_CUE = "Empty";

/** Ephemeral TopBar when soft-refuse guild rank / invite forbidden (PL98.3). */
export const GUILD_RANK_FORBIDDEN_REFUSE_CUE = "Rank";

/** Ephemeral TopBar when soft-refuse hunt explore-only (PL99.1). */
export const HUNT_EXPLORE_ONLY_REFUSE_CUE = "Explore";

/** Ephemeral TopBar when soft-refuse warrior training on homestead (PL99.2). */
export const WARRIOR_HOMESTEAD_FORBIDDEN_REFUSE_CUE = "Arena";

/** Ephemeral TopBar when soft-refuse repair need mats (PL100.1). */
export const NEED_MATS_REPAIR_REFUSE_CUE = "Mats";

/** Ephemeral TopBar when soft-refuse not-a-tool equip (PL100.2). */
export const NOT_A_TOOL_REFUSE_CUE = "Tool";

/** Ephemeral TopBar when soft-refuse gather node missing (PL101.1). */
export const GATHER_NODE_MISSING_REFUSE_CUE = "Gone";

/** Ephemeral TopBar when soft-refuse plot missing (PL101.2). */
export const PLOT_MISSING_REFUSE_CUE = "Gone";

/** Ephemeral TopBar when soft-refuse hunt / claim node missing (PL101.3). */
export const HUNT_OR_CLAIM_MISSING_REFUSE_CUE = "Gone";

/** Ephemeral TopBar when soft-refuse guild bank not stackable (PL102.1). */
export const GUILD_BANK_NOT_STACKABLE_REFUSE_CUE = "Stack";

/** Ephemeral TopBar when soft-refuse guild bank unknown item (PL102.2). */
export const GUILD_BANK_UNKNOWN_ITEM_REFUSE_CUE = "Item";

/** Ephemeral TopBar when soft-refuse guild bank bad qty (PL102.3). */
export const GUILD_BANK_BAD_QTY_REFUSE_CUE = "Qty";

/** Ephemeral TopBar when soft-refuse mail not stackable (PL103.1). */
export const MAIL_NOT_STACKABLE_REFUSE_CUE = "Stack";

/** Ephemeral TopBar when soft-refuse market invalid list (PL103.2). */
export const MARKET_INVALID_REFUSE_CUE = "List";

/** Ephemeral TopBar when soft-refuse invalid qty (PL103.3). */
export const INVALID_QTY_REFUSE_CUE = "Qty";

/** Ephemeral TopBar when soft-refuse unknown recipe (PL104.1). */
export const UNKNOWN_RECIPE_REFUSE_CUE = "Recipe";

/** Ephemeral TopBar when soft-refuse needs station (PL104.2). */
export const NEEDS_STATION_REFUSE_CUE = "Station";

/** Ephemeral TopBar when soft-refuse needs profession XP (PL104.3). */
export const NEEDS_XP_REFUSE_CUE = "XP";

/** Ephemeral TopBar when soft-refuse decor pad missing (PL105.1). */
export const DECOR_PAD_MISSING_REFUSE_CUE = "Pad";

/** Ephemeral TopBar when soft-refuse decor starter-only (PL105.2). */
export const DECOR_STARTER_ONLY_REFUSE_CUE = "Home";

/** Ephemeral TopBar when soft-refuse no expand slots (PL105.3). */
export const NO_EXPAND_SLOTS_REFUSE_CUE = "Slots";

/** Ephemeral TopBar when soft-refuse unknown decor (PL106.1). */
export const UNKNOWN_DECOR_REFUSE_CUE = "Decor";

/** Ephemeral TopBar when soft-refuse decor need coins (PL106.2). */
export const DECOR_NEED_COINS_REFUSE_CUE = "Coins";

/** Ephemeral TopBar when soft-refuse unknown seed (PL107.1). */
export const UNKNOWN_SEED_REFUSE_CUE = "Plant";

/** Ephemeral TopBar when soft-refuse crop missing (PL107.2). */
export const CROP_MISSING_REFUSE_CUE = "Gone";

/** Ephemeral TopBar when soft-refuse item missing from inventory (PL108.1). */
export const ITEM_MISSING_REFUSE_CUE = "Item";

/** Ephemeral TopBar when soft-refuse unknown station build (PL108.2). */
export const UNKNOWN_STATION_REFUSE_CUE = "Build";

/** Ephemeral TopBar when soft-refuse guild not found (PL109.1). */
export const GUILD_NOT_FOUND_REFUSE_CUE = "Gone";

/** Ephemeral TopBar when soft-refuse guild target missing (PL109.2). */
export const GUILD_TARGET_MISSING_REFUSE_CUE = "Member";

/** Ephemeral TopBar when soft-refuse guild rank invalid (PL109.3). */
export const GUILD_RANK_INVALID_REFUSE_CUE = "Rank";

/** Ephemeral TopBar when soft-refuse quest unknown (PL110.1). */
export const QUEST_UNKNOWN_REFUSE_CUE = "Quest";

/** Ephemeral TopBar when soft-refuse dynamic missingItem(name) (PL110.2). */
export const MISSING_ITEM_REFUSE_CUE = "Need";

/** Ephemeral TopBar when soft-refuse deed missing (PL112.1). */
export const DEED_MISSING_REFUSE_CUE = "Gone";

/** Ephemeral TopBar when soft-refuse deed not yours (PL112.1). */
export const DEED_NOT_YOURS_REFUSE_CUE = "Yours";

/** Ephemeral TopBar when soft-refuse deed need mint (PL112.2). */
export const DEED_NEED_MINT_REFUSE_CUE = "Mint";

/** Ephemeral TopBar when soft-refuse deed already minted (PL112.2). */
export const DEED_ALREADY_MINTED_REFUSE_CUE = "Mint";

/** Ephemeral TopBar when soft-refuse deed already listed (PL112.2). */
export const DEED_ALREADY_LISTED_REFUSE_CUE = "Listed";

/** Ephemeral TopBar when soft-refuse deed not listed (PL112.2). */
export const DEED_NOT_LISTED_REFUSE_CUE = "Unlisted";

/** Ephemeral TopBar when soft-refuse deed bad price (PL112.3). */
export const DEED_BAD_PRICE_REFUSE_CUE = "Price";

/** Ephemeral TopBar when soft-refuse deed already owned (PL112.3). */
export const DEED_ALREADY_OWNED_REFUSE_CUE = "Owned";

/** Ephemeral TopBar when soft-refuse deed need forest (PL112.3). */
export const DEED_NEED_FOREST_REFUSE_CUE = "Forest";

/** Ephemeral TopBar when soft-refuse wallet already linked (PL113.1). */
export const WALLET_ALREADY_LINKED_REFUSE_CUE = "Linked";

/** Ephemeral TopBar when soft-refuse wallet not linked (PL113.2). */
export const WALLET_NOT_LINKED_REFUSE_CUE = "Wallet";

/** Ephemeral TopBar when a tutor objective first becomes claimable (PL72.2). */
export const TUTOR_CLAIM_READY_EDGE_CUE = "Claim";

/** Ephemeral TopBar after a successful tree chop (PL43.1). */
export const GATHER_CHOP_SUCCESS_CUE = "Chopped";

/** Ephemeral TopBar after a successful ore chip (PL43.1). */
export const GATHER_MINE_SUCCESS_CUE = "Mined";

/** Ephemeral TopBar after a successful dock catch (PL43.1). */
export const GATHER_FISH_SUCCESS_CUE = "Caught";

/** Ephemeral TopBar after a successful animal-pen collect (PL43.1). */
export const GATHER_PEN_SUCCESS_CUE = "Collected";

/** Fallback gather ephemeral when building type is unknown (PL43.1). */
export const GATHER_SUCCESS_CUE = "Gathered";

/** Ephemeral TopBar after a successful Vendor Stall sell (PL43.2). */
export const VENDOR_SELL_SUCCESS_CUE = "Sold";

/** Ephemeral TopBar after a successful Vendor Stall buy (PL43.3). */
export const VENDOR_BUY_SUCCESS_CUE = "Bought";

/** Ephemeral TopBar when soft-refuse not-enough-energy (PL44.1). */
export const ENERGY_REFUSE_CUE = "Energy";

/** Ephemeral TopBar when soft-refuse already-here travel (PL44.2). */
export const TRAVEL_ALREADY_HERE_CUE = "Already here";

/** Prefix for character level-up ephemeral cues (PL47.1) — not an always-on column. */
export const LEVEL_UP_SUCCESS_CUE_PREFIX = "Level ";

/** Fallback level-up cue when level number is missing (PL47.1). */
export const LEVEL_UP_SUCCESS_CUE = "Level up";

/** Prefix for achievement unlock ephemeral cues (PL47.2). */
export const ACHIEVEMENT_UNLOCK_SUCCESS_CUE_PREFIX = "Unlocked · ";

/** Fallback achievement unlock cue when title is missing (PL47.2). */
export const ACHIEVEMENT_UNLOCK_SUCCESS_CUE = "Unlocked";

/** Ephemeral TopBar after a successful station upgrade to T2 (PL48.1). */
export const STATION_UPGRADE_SUCCESS_CUE = "Upgraded";

/** Ephemeral TopBar after a successful guild bank deposit (PL48.2). */
export const GUILD_BANK_DEPOSIT_SUCCESS_CUE = "Deposited";

/** Ephemeral TopBar after a successful guild bank withdraw (PL48.3). */
export const GUILD_BANK_WITHDRAW_SUCCESS_CUE = "Withdrew";

/** Ephemeral TopBar after creating a guild (PL50.1). */
export const GUILD_CREATE_SUCCESS_CUE = "Created";

/** Ephemeral TopBar after joining a guild (PL50.1). */
export const GUILD_JOIN_SUCCESS_CUE = "Joined";

/** Ephemeral TopBar after leaving a guild (PL50.2). */
export const GUILD_LEAVE_SUCCESS_CUE = "Left";

/** Ephemeral TopBar after regenerating a guild invite code (PL56.3). */
export const GUILD_INVITE_REFRESH_SUCCESS_CUE = "Refreshed";

/** Ephemeral TopBar after owner successfully changes a member rank (PL111.1). */
export const GUILD_RANK_CHANGE_SUCCESS_CUE = "Ranked";

/** Prefix for cosmetic title-change ephemeral cues (PL49.1) — not combat power. */
export const TITLE_CHANGE_SUCCESS_CUE_PREFIX = "Title · ";

/** Fallback title-change cue when name is missing (PL49.1). */
export const TITLE_CHANGE_SUCCESS_CUE = "Title";

/** Suffix when title change coincides with extra decor pad unlock (PL49.1+PL49.2). */
export const TITLE_DECOR_PAD_UNLOCK_CUE_SUFFIX = " · decor pad";

/** Ephemeral TopBar when the soft extra decor pad unlocks (PL49.2). */
export const EXTRA_DECOR_PAD_UNLOCK_CUE = "Decor · extra pad";

/** Prefix for claim collect ephemeral cues (PL31.2). */
export const GUILD_COLLECT_SUCCESS_CUE_PREFIX = "Collected · ";

/** Prefix for soft-war wood deliver ephemeral cues (PL31.2 same interact path). */
export const GUILD_DELIVER_SUCCESS_CUE_PREFIX = "Delivered · ";

/**
 * One-line success copy for plant / harvest / craft / travel.
 *
 * @param action - Core action that just succeeded.
 * @param detail - Optional destination name for travel.
 * @returns Short player-facing cue text.
 */
export function coreSuccessCueText(
  action: CoreSuccessAction,
  detail?: string,
): string {
  switch (action) {
    case "plant":
      return "Planted";
    case "harvest":
      return "Harvested";
    case "craft":
      return "Crafted";
    case "travel":
      return detail ? `Arrived · ${detail}` : "Arrived";
  }
}

/**
 * One-shot Arrived · destination whisper for free travel (PL115.2).
 * Destination label matches TravelPanel `LAND_DESTINATIONS.name`; no caravan invent.
 *
 * @param kind - Destination land kind after successful travel.
 * @returns `Arrived · City` / `Your Land` / `Exploration` / `Warrior Arena`, or bare Arrived.
 */
export function travelArriveSuccessCueText(
  kind: string | null | undefined,
): string {
  const label = travelArriveDestinationLabel(kind);
  return coreSuccessCueText("travel", label ?? undefined);
}

/**
 * Whether free travel should flash the Arrived · dest cue (PL115.2).
 * One-shot gate — true only on ok arrive; refuse paths stay quiet.
 *
 * @param ok - Whether the travel API / apply succeeded.
 * @returns True when the ephemeral Arrived whisper should flash.
 */
export function shouldFlashTravelArriveSuccessCue(ok: boolean): boolean {
  return shouldFlashTravelArriveCue(ok);
}

/**
 * One-line success copy for market list / buy / cancel (PL10.2).
 *
 * @param action - Market action that just succeeded.
 * @returns Short player-facing cue text.
 */
export function marketSuccessCueText(action: MarketSuccessAction): string {
  switch (action) {
    case "list":
      return "Listed";
    case "buy":
      return "Bought";
    case "cancel":
      return "Cancelled";
  }
}

/**
 * One-line success copy for tutorial NPC objective claim (PL13.2).
 * Reward XP/coins stay server-side unchanged — cue is confirm only.
 *
 * @returns Short player-facing cue text.
 */
export function tutorClaimSuccessCueText(): string {
  return TUTOR_CLAIM_SUCCESS_CUE;
}

/**
 * One-line success copy when a starter quest claim succeeds (PL29.3).
 * Reward XP/coins stay server-side unchanged — cue is confirm only.
 * Distinct from tutor Claimed (PL13.2); fail paths must not call this.
 *
 * @returns Short player-facing cue text.
 */
export function questClaimSuccessCueText(): string {
  return QUEST_CLAIM_SUCCESS_CUE;
}

/**
 * One-line success copy when a visit to another player's land lands (PL15.1).
 * Own-land / refuse paths must not call this; TopBar visiting banner stays separate.
 *
 * @param ownerUsername - Host username from a successful visit response.
 * @returns Short cue, or null when the username is empty (caller stays silent).
 */
export function visitSuccessCueText(
  ownerUsername: string | null | undefined,
): string | null {
  const cleaned = (ownerUsername ?? "").trim();
  if (!cleaned) return null;
  return `${VISIT_SUCCESS_CUE_PREFIX}${cleaned}`;
}

/**
 * One-line success copy when leaving a visit back to own land (PL27.1).
 * Own-land idle / non-visit paths must not call this — complements PL15.1 arrive.
 *
 * @returns Short player-facing cue text.
 */
export function visitLeaveSuccessCueText(): string {
  return VISIT_LEAVE_SUCCESS_CUE;
}

/**
 * One-line success copy when housing decor places on a pad (PL16.2).
 * Costs stay server-side unchanged — cue is confirm only.
 *
 * @returns Short player-facing cue text.
 */
export function decorPlaceSuccessCueText(): string {
  return DECOR_PLACE_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy when a chat line arrives while the panel is closed (PL27.2).
 * No always-on chat column — replace-not-stack via SUCCESS_CUE_MS; optional confirm only.
 *
 * @returns Short player-facing cue text.
 */
export function chatReceiveSuccessCueText(): string {
  return CHAT_RECEIVE_SUCCESS_CUE;
}

/**
 * One-line success copy when an offline mail parcel claim succeeds (PL17.2).
 * Escrow / inventory rules stay server-side — cue is confirm only.
 *
 * @returns Short player-facing cue text.
 */
export function mailClaimSuccessCueText(): string {
  return MAIL_CLAIM_SUCCESS_CUE;
}

/**
 * One-line success copy when an offline mail parcel send succeeds (PL28.2).
 * Escrow / inventory rules stay server-side — cue is confirm only.
 * Fail / refuse paths must not call this.
 *
 * @returns Short player-facing cue text.
 */
export function mailSendSuccessCueText(): string {
  return MAIL_SEND_SUCCESS_CUE;
}

/**
 * One-line success copy when a pending mail parcel cancel succeeds (PL28.2).
 * Escrow restore stays server-side — cue is confirm only.
 * Fail / refuse paths must not call this.
 *
 * @returns Short player-facing cue text.
 */
export function mailCancelSuccessCueText(): string {
  return MAIL_CANCEL_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy when an incoming trade invite arrives (PL18.1).
 * No always-on trade column — press T still opens the panel; cue auto-clears.
 *
 * @param fromUsername - Offerer username from the trade_invite push.
 * @returns Short cue, or null when the username is empty (caller stays silent).
 */
export function tradeInviteReceiveCueText(
  fromUsername: string | null | undefined,
): string | null {
  const cleaned = (fromUsername ?? "").trim();
  if (!cleaned) return null;
  return `${TRADE_INVITE_RECEIVE_CUE_PREFIX}${cleaned}`;
}

/**
 * One-line ephemeral copy when a trade offer is sent (PL28.1).
 * Replaces sticky escrow prose; escrow rules stay server-side.
 * Fail / refuse paths must not call this.
 *
 * @param toUsername - Recipient username from the create-trade form.
 * @returns Short cue, or null when the username is empty (caller stays silent).
 */
export function tradeOfferSentCueText(
  toUsername: string | null | undefined,
): string | null {
  const cleaned = (toUsername ?? "").trim();
  if (!cleaned) return null;
  return `${TRADE_OFFER_SENT_CUE_PREFIX}${cleaned}`;
}

/**
 * One-line success copy when a trade accept succeeds (PL18.2).
 * Cancel / refuse paths must not call this; escrow rules stay server-side.
 *
 * @returns Short player-facing cue text.
 */
export function tradeAcceptSuccessCueText(): string {
  return TRADE_ACCEPT_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy when you cancel your outgoing trade offer (PL62.1).
 * Incoming reject stays silent; escrow / nearby rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function tradeCancelSuccessCueText(): string {
  return TRADE_CANCEL_SUCCESS_CUE;
}

/**
 * Whether a successful reject/cancel should flash the trade-cancel cue (PL62.1).
 * Only outgoing Cancel — incoming Reject stays quiet.
 *
 * @param direction - Pending trade direction from the panel list.
 * @returns True when the Cancelled cue should play.
 */
export function shouldFlashTradeCancelCue(
  direction: "incoming" | "outgoing" | null | undefined,
): boolean {
  return direction === "outgoing";
}

/**
 * One-line ephemeral copy when a chat line sends successfully (PL62.2).
 * Complements receive ping `Chat` (PL27.2); chat rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function chatSendSuccessCueText(): string {
  return CHAT_SEND_SUCCESS_CUE;
}

/**
 * One-line success copy when eating food succeeds (PL20.1).
 * Energy restore amounts stay server-side — cue is confirm only.
 * Empty / refuse paths must not call this.
 *
 * @returns Short player-facing cue text.
 */
export function eatFoodSuccessCueText(): string {
  return EAT_FOOD_SUCCESS_CUE;
}

/**
 * One-line success copy when a tool equips or unequips (PL20.2).
 * Durability rules stay server-side — cue is confirm only.
 *
 * @param inventoryId - Equipped stack id, or null when unequipping.
 * @returns Short player-facing cue text.
 */
export function equipToolSuccessCueText(
  inventoryId: string | null | undefined,
): string {
  return inventoryId == null ? UNEQUIP_TOOL_SUCCESS_CUE : EQUIP_TOOL_SUCCESS_CUE;
}

/**
 * One-line success copy when land expand succeeds (PL20.3).
 * Expand costs stay server-side — cue is confirm only.
 * Fail / refuse paths must not call this.
 *
 * @returns Short player-facing cue text.
 */
export function expandFieldSuccessCueText(): string {
  return EXPAND_FIELD_SUCCESS_CUE;
}

/**
 * One-line success copy when a tool repair succeeds (PL25.1).
 * Durability restore + mat costs stay server-side — cue is confirm only.
 * Fail / refuse paths must not call this.
 *
 * @returns Short player-facing cue text.
 */
export function repairToolSuccessCueText(): string {
  return REPAIR_TOOL_SUCCESS_CUE;
}

/**
 * One-line success copy on the first placeable station place (PL25.2).
 * Complements PL3.1 beacon + PL22.1 lived yard; later places use Built (PL28.3).
 *
 * @returns Short player-facing cue text.
 */
export function homesteadFirstPlaceSuccessCueText(): string {
  return HOMESTEAD_FIRST_PLACE_SUCCESS_CUE;
}

/**
 * One-line success copy on subsequent station places after the first Homestead (PL28.3).
 * Soft build SFX stays; sticky “Built ….” prose is replaced by this ephemeral cue.
 * Fail / refuse paths must not call this.
 *
 * @returns Short player-facing cue text.
 */
export function stationBuiltSuccessCueText(): string {
  return STATION_BUILT_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy after a successful craft-station upgrade (PL48.1).
 * BUILDING_UPGRADES costs stay server-side — cue is confirm only.
 *
 * @returns Short player-facing cue text.
 */
export function stationUpgradeSuccessCueText(): string {
  return STATION_UPGRADE_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy after a successful guild bank deposit (PL48.2).
 * Bank slot / stack rules stay server-side — cue is confirm only.
 * Fail / refuse paths must not call this.
 *
 * @returns Short player-facing cue text.
 */
export function guildBankDepositSuccessCueText(): string {
  return GUILD_BANK_DEPOSIT_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy after a successful guild bank withdraw (PL48.3).
 * Bank rules stay server-side — cue is confirm only.
 * Fail / refuse paths must not call this.
 *
 * @returns Short player-facing cue text.
 */
export function guildBankWithdrawSuccessCueText(): string {
  return GUILD_BANK_WITHDRAW_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy after successfully creating a guild (PL50.1).
 * Invite / rank rules stay server-side — cue is confirm only.
 *
 * @returns Short player-facing cue text.
 */
export function guildCreateSuccessCueText(): string {
  return GUILD_CREATE_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy after successfully joining a guild (PL50.1).
 * Invite / rank rules stay server-side — cue is confirm only.
 *
 * @returns Short player-facing cue text.
 */
export function guildJoinSuccessCueText(): string {
  return GUILD_JOIN_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy after successfully leaving a guild (PL50.2).
 * Leave rules stay server-side — cue is confirm only.
 *
 * @returns Short player-facing cue text.
 */
export function guildLeaveSuccessCueText(): string {
  return GUILD_LEAVE_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy after regenerating a guild invite code (PL56.3).
 * Rank / invite rules stay server-side — cue is confirm only.
 * Fail paths must not call this.
 *
 * @returns Short player-facing cue text.
 */
export function guildInviteRefreshSuccessCueText(): string {
  return GUILD_INVITE_REFRESH_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy after owner successfully changes a member rank (PL111.1).
 * Rank enum / permissions stay server-side — cue is confirm only.
 * Fail / refuse paths must not call this.
 *
 * @returns Short player-facing cue text.
 */
export function guildRankChangeSuccessCueText(): string {
  return GUILD_RANK_CHANGE_SUCCESS_CUE;
}

/**
 * One-line success copy when a guild claims Wild Grove (PL31.2).
 * Claim rules stay server-side — cue is confirm only.
 * Fail / refuse paths must not call this.
 *
 * @returns Short player-facing cue text.
 */
export function guildClaimSuccessCueText(): string {
  return GUILD_CLAIM_SUCCESS_CUE;
}

/**
 * One-line success copy when a soft war starts on a claim (PL31.2).
 * Contest rules stay server-side — cue is confirm only.
 * Fail / refuse paths must not call this.
 *
 * @returns Short player-facing cue text.
 */
export function softWarStartSuccessCueText(): string {
  return SOFT_WAR_START_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy when an equipped tool breaks from use (PL33.1).
 * Durability rules stay server-side — cue replaces sticky “Craft or equip” prose.
 *
 * @returns Short player-facing cue text.
 */
export function toolBrokeSuccessCueText(): string {
  return TOOL_BROKE_SUCCESS_CUE;
}

/**
 * Whether applyState should flash the tool-broke cue (PL33.1).
 * True when a previously equipped tool id is gone after the action.
 *
 * @param prevEquippedToolId - Equipped inventory id before the action.
 * @param nextEquippedToolInventoryId - Equipped inventory id after the action.
 * @returns True when the tool break cue should play.
 */
export function shouldFlashToolBrokeCue(
  prevEquippedToolId: string | null | undefined,
  nextEquippedToolInventoryId: string | null | undefined,
): boolean {
  return Boolean(prevEquippedToolId) && !nextEquippedToolInventoryId;
}

/**
 * One-line ephemeral copy after an Explore hunt win (PL33.2).
 * Loot / XP stay server-side — cue replaces long sticky encounter prose.
 *
 * @param foeName - Encounter foe display name from the hunt response.
 * @returns Short player-facing cue text.
 */
export function huntWinSuccessCueText(
  foeName?: string | null,
): string {
  const name = foeName?.trim();
  if (!name) return HUNT_WIN_SUCCESS_CUE;
  return `${HUNT_WIN_SUCCESS_CUE_PREFIX}${name}`;
}

/**
 * One-line ephemeral copy after an Explore hunt loss (PL33.2).
 * Energy drain stays server-side — cue replaces long sticky encounter prose.
 *
 * @param foeName - Encounter foe display name from the hunt response.
 * @returns Short player-facing cue text.
 */
export function huntLoseSuccessCueText(
  foeName?: string | null,
): string {
  const name = foeName?.trim();
  if (!name) return HUNT_LOSE_SUCCESS_CUE;
  return `${HUNT_LOSE_SUCCESS_CUE_PREFIX}${name}`;
}

/**
 * Resolve hunt encounter ephemeral cue from the API encounter payload (PL33.2).
 *
 * @param encounter - Hunt encounter result (won + foe name).
 * @returns Short win/lose cue, or null when encounter is missing.
 */
export function huntEncounterSuccessCueText(
  encounter:
    | { won: boolean; foeName?: string | null }
    | null
    | undefined,
): string | null {
  if (!encounter) return null;
  return encounter.won
    ? huntWinSuccessCueText(encounter.foeName)
    : huntLoseSuccessCueText(encounter.foeName);
}

/**
 * One-line ephemeral copy when a land deed claim succeeds (PL33.3).
 * Cosmetic / production-only rules stay server-side — cue replaces sticky prose.
 *
 * @returns Short player-facing cue text.
 */
export function deedClaimSuccessCueText(): string {
  return DEED_CLAIM_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy when a stub deed mint succeeds (PL33.3).
 *
 * @returns Short player-facing cue text.
 */
export function deedMintSuccessCueText(): string {
  return DEED_MINT_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy when a deed lists on the mock board (PL33.3).
 *
 * @returns Short player-facing cue text.
 */
export function deedListSuccessCueText(): string {
  return DEED_LIST_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy when a deed unlists from the mock board (PL33.3).
 *
 * @returns Short player-facing cue text.
 */
export function deedUnlistSuccessCueText(): string {
  return DEED_UNLIST_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy when a stub wallet links (PL33.3).
 * Core loops stay wallet-free — cue is settings/deed surface only.
 *
 * @returns Short player-facing cue text.
 */
export function walletLinkSuccessCueText(): string {
  return WALLET_LINK_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy when a stub wallet disconnects (PL33.3).
 *
 * @returns Short player-facing cue text.
 */
export function walletDisconnectSuccessCueText(): string {
  return WALLET_DISCONNECT_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy when settings mute toggles (PL37.2).
 * Audio respects mute immediately; cue is confirm only (no always-on column).
 *
 * @param muted - Next mute state after the flip.
 * @returns `Muted` or `Unmuted`.
 */
export function muteToggleSuccessCueText(muted: boolean): string {
  return muted ? MUTE_ON_SUCCESS_CUE : MUTE_OFF_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy when energy crosses into the low band (PL41.1).
 * Complements the persistent meter warn (PL9.1); not an always-on column.
 *
 * @returns Short player-facing cue text.
 */
export function energyLowThresholdCueText(): string {
  return ENERGY_LOW_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy when health crosses into the low band (PL64.1).
 * Mirrors Energy low (PL41.1); combat numbers unchanged; not an always-on column.
 *
 * @returns Short player-facing cue text.
 */
export function healthLowThresholdCueText(): string {
  return HEALTH_LOW_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy when equipped tool crosses into the low-durability band (PL61.1).
 * Complements persistent TopBar · low accent (PL21.1); durability / break rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function toolDurabilityLowThresholdCueText(): string {
  return TOOL_DURABILITY_LOW_SUCCESS_CUE;
}

/**
 * Resolve equipped tool durability + catalog max for threshold edge detection (PL61.1).
 *
 * @param inventory - Player inventory stacks.
 * @param equippedToolInventoryId - Equipped stack id, or null.
 * @returns Inventory id plus durability / max (nulls when unequipped or unknown).
 */
export function equippedToolDurabilitySnapshot(
  inventory:
    | ReadonlyArray<{
        id: string;
        itemId: string;
        durability: number | null;
      }>
    | null
    | undefined,
  equippedToolInventoryId: string | null | undefined,
): {
  inventoryId: string | null;
  durability: number | null;
  maxDurability: number | null;
} {
  if (!equippedToolInventoryId || !inventory) {
    return { inventoryId: null, durability: null, maxDurability: null };
  }
  const tool = inventory.find((row) => row.id === equippedToolInventoryId);
  if (!tool) {
    return {
      inventoryId: equippedToolInventoryId,
      durability: null,
      maxDurability: null,
    };
  }
  const max =
    ITEMS[tool.itemId as keyof typeof ITEMS]?.maxDurability ?? null;
  return {
    inventoryId: equippedToolInventoryId,
    durability: tool.durability,
    maxDurability: max ?? null,
  };
}

/**
 * One-line ephemeral copy when a scarce city station is busy (PL42.1).
 * Complements soft refuse SFX (PL16.1); replaces sticky long busy prose.
 *
 * @returns Short player-facing cue text.
 */
export function busyStationRefuseCueText(): string {
  return BUSY_STATION_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the busy-station ephemeral cue (PL42.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Busy cue should play.
 */
export function shouldFlashBusyStationCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.stationBusy;
}

/**
 * One-line ephemeral copy on first portal walk-up (PL42.2).
 * Complements free_travel onboarding (PL13.1) and portal world soft (PL37.1).
 *
 * @returns Short player-facing cue text.
 */
export function firstPortalWalkUpCueText(): string {
  return FIRST_PORTAL_WALKUP_CUE;
}

/**
 * One-line ephemeral copy after a successful gather action (PL43.1 / HUD-ACTION-CUE-1).
 * Complements gather SFX (PL6.1); cooldowns stay server-side.
 * Optional loot names the catalog / inventory item on the same line.
 *
 * @param buildingType - Gather station type that just succeeded.
 * @param loot - Optional named qty (chop/mine/fish gain, or pen-care spend).
 * @returns Short player-facing cue text.
 */
export function gatherSuccessCueText(
  buildingType: string | null | undefined,
  loot?: ActionLootCue | null,
): string {
  if (buildingType === "animal_pen") {
    return formatPenCareCue(GATHER_PEN_SUCCESS_CUE, loot);
  }
  let verb = GATHER_SUCCESS_CUE;
  switch (buildingType) {
    case "tree_stump":
      verb = GATHER_CHOP_SUCCESS_CUE;
      break;
    case "ore_node":
      verb = GATHER_MINE_SUCCESS_CUE;
      break;
    case "fishing_dock":
      verb = GATHER_FISH_SUCCESS_CUE;
      break;
    default:
      break;
  }
  return formatActionLootCue(verb, loot);
}

/**
 * One-line ephemeral copy after a successful Vendor Stall sell (PL43.2).
 * Complements vendor_sell SFX (PL10.1); prices stay server-side.
 *
 * @returns Short player-facing cue text.
 */
export function vendorSellSuccessCueText(): string {
  return VENDOR_SELL_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy after a successful Vendor Stall buy (PL43.3).
 * Complements vendor_buy SFX (PL10.1); prices stay server-side.
 * Same short verb as market buy (PL10.2) — confirm only, not a second HUD.
 *
 * @returns Short player-facing cue text.
 */
export function vendorBuySuccessCueText(): string {
  return VENDOR_BUY_SUCCESS_CUE;
}

/**
 * One-line ephemeral copy when soft-refuse not-enough-energy (PL44.1).
 * Complements refuse SFX (PL16.1); energy numbers stay server-side.
 *
 * @returns Short player-facing cue text.
 */
export function energyRefuseCueText(): string {
  return ENERGY_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the energy refuse ephemeral (PL44.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Energy cue should play.
 */
export function shouldFlashEnergyRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.notEnoughEnergy;
}

/**
 * One-line ephemeral copy when soft-refuse already-here travel (PL44.2).
 * Complements refuse SFX (PL16.1); fare-free destinations stay unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function travelAlreadyHereRefuseCueText(): string {
  return TRAVEL_ALREADY_HERE_CUE;
}

/**
 * Whether a failed action should flash the already-here ephemeral (PL44.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Already here cue should play.
 */
export function shouldFlashTravelAlreadyHereCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.travelAlreadyHere;
}

/**
 * Whether to flash the one-shot first-portal walk-up tip (PL42.2).
 * Edge into portal interact range only; never sticky; respects tips preference.
 *
 * @param enteringPortal - True when interact target just became a portal.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstPortalWalkUpCue(
  enteringPortal: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringPortal) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first Explore map presence (PL45.1).
 * Complements section floors / hunt+gather wilds; spawn rates unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstExploreWalkUpCueText(): string {
  return FIRST_EXPLORE_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-Explore walk-up tip (PL45.1).
 * Edge into Explore map only; never sticky; respects tips preference.
 *
 * @param enteringExplore - True when land kind just became explore.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstExploreWalkUpCue(
  enteringExplore: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringExplore) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first arena plaque walk-up (PL45.2).
 * Stresses optional path; no gear ladder invent; free enter/exit.
 *
 * @returns Short player-facing cue text.
 */
export function firstArenaWalkUpCueText(): string {
  return FIRST_ARENA_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-arena walk-up tip (PL45.2).
 * Edge into arena_board interact range only; never sticky; respects tips preference.
 *
 * @param enteringArenaBoard - True when interact target just became an arena plaque.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstArenaWalkUpCue(
  enteringArenaBoard: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringArenaBoard) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first empty-land build-board walk-up (PL52.1).
 * Complements PL3.1 beacon + CL16.1 sticky tip; place costs unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstEmptyLandBuildBoardCueText(): string {
  return FIRST_EMPTY_LAND_BUILD_BOARD_CUE;
}

/**
 * Whether to flash the one-shot first empty-land build-board tip (PL52.1).
 * Edge into build_board interact range on an empty yard only; never sticky;
 * respects tips preference.
 *
 * @param enteringBuildBoard - True when interact target just became a build board.
 * @param yardEmpty - True when the yard still has no placeable stations (beacon).
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstEmptyLandBuildBoardCue(
  enteringBuildBoard: boolean,
  yardEmpty: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return (
    Boolean(enteringBuildBoard) &&
    Boolean(yardEmpty) &&
    !alreadySeen &&
    Boolean(tipsEnabled)
  );
}

/**
 * One-line ephemeral copy on first market board walk-up (PL59.1).
 * Complements sticky post_craft_market; list / buy / fee rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstMarketWalkUpCueText(): string {
  return FIRST_MARKET_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-market walk-up tip (PL59.1).
 * Edge into market_board interact range only; never sticky; respects tips preference.
 *
 * @param enteringMarketBoard - True when interact target just became a market board.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstMarketWalkUpCue(
  enteringMarketBoard: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringMarketBoard) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first vendor stall walk-up (PL59.2).
 * Tools / seeds sink cue; vendor prices unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstVendorWalkUpCueText(): string {
  return FIRST_VENDOR_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-vendor walk-up tip (PL59.2).
 * Edge into vendor_stall interact range only; never sticky; respects tips preference.
 *
 * @param enteringVendorStall - True when interact target just became a vendor stall.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstVendorWalkUpCue(
  enteringVendorStall: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringVendorStall) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first fishing dock walk-up (PL66.1).
 * Catch cue; cooldown / yields unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstFishingDockWalkUpCueText(): string {
  return FIRST_FISHING_DOCK_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-fishing-dock walk-up tip (PL66.1).
 * Edge into fishing_dock interact range only; never sticky; respects tips preference.
 *
 * @param enteringFishingDock - True when interact target just became a fishing dock.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstFishingDockWalkUpCue(
  enteringFishingDock: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringFishingDock) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first animal pen walk-up (PL66.2).
 * Feed / clean cue; care cooldown / yields unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstAnimalPenWalkUpCueText(): string {
  return FIRST_ANIMAL_PEN_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-animal-pen walk-up tip (PL66.2).
 * Edge into animal_pen interact range only; never sticky; respects tips preference.
 *
 * @param enteringAnimalPen - True when interact target just became an animal pen.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstAnimalPenWalkUpCue(
  enteringAnimalPen: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringAnimalPen) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first tree stump walk-up (PL68.1).
 * Chop cue; cooldown / yields unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstTreeStumpWalkUpCueText(): string {
  return FIRST_TREE_STUMP_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-tree-stump walk-up tip (PL68.1).
 * Edge into tree_stump interact range only; never sticky; respects tips preference.
 *
 * @param enteringTreeStump - True when interact target just became a tree stump.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstTreeStumpWalkUpCue(
  enteringTreeStump: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringTreeStump) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first ore node walk-up (PL68.2).
 * Chip / hammer cue; cooldown / yields unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstOreNodeWalkUpCueText(): string {
  return FIRST_ORE_NODE_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-ore-node walk-up tip (PL68.2).
 * Edge into ore_node interact range only; never sticky; respects tips preference.
 *
 * @param enteringOreNode - True when interact target just became an ore node.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstOreNodeWalkUpCue(
  enteringOreNode: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringOreNode) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first crop plot walk-up (PL68.3).
 * Plant / harvest cue; grow timers / yields unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstCropPlotWalkUpCueText(): string {
  return FIRST_CROP_PLOT_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-crop-plot walk-up tip (PL68.3).
 * Edge into crop_plot interact range only; never sticky; respects tips preference.
 *
 * @param enteringCropPlot - True when interact target just became a crop plot.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstCropPlotWalkUpCue(
  enteringCropPlot: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringCropPlot) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first hunt trail walk-up (PL68.4).
 * Game trail / edge thicket cue; hunt / spawn rates unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstHuntTrailWalkUpCueText(): string {
  return FIRST_HUNT_TRAIL_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-hunt-trail walk-up tip (PL68.4).
 * Edge into game_trail or edge_thicket interact range only; never sticky; tips gate.
 *
 * @param enteringHuntTrail - True when interact target just became a hunt trail/thicket.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstHuntTrailWalkUpCue(
  enteringHuntTrail: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringHuntTrail) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first kitchen walk-up (PL70.1).
 * Cook cue; craft recipes unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstKitchenWalkUpCueText(): string {
  return FIRST_KITCHEN_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-kitchen walk-up tip (PL70.1).
 * Edge into kitchen interact range only; never sticky; respects tips preference.
 *
 * @param enteringKitchen - True when interact target just became a kitchen.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstKitchenWalkUpCue(
  enteringKitchen: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringKitchen) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first notice board walk-up (PL70.2).
 * City tips cue; tip / mail rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstNoticeBoardWalkUpCueText(): string {
  return FIRST_NOTICE_BOARD_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-notice-board walk-up tip (PL70.2).
 * Edge into notice_board interact range only; never sticky; respects tips preference.
 *
 * @param enteringNoticeBoard - True when interact target just became a notice board.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstNoticeBoardWalkUpCue(
  enteringNoticeBoard: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringNoticeBoard) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first expand-pad walk-up (PL72.1).
 * Unlock-field cue; expand costs unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstExpandPadWalkUpCueText(): string {
  return FIRST_EXPAND_PAD_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-expand-pad walk-up tip (PL72.1).
 * Edge into expand-pad interact range only; never sticky; respects tips preference.
 *
 * @param enteringExpandPad - True when interact target just became the expand pad.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstExpandPadWalkUpCue(
  enteringExpandPad: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringExpandPad) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first mill walk-up (PL74.1).
 * Grind cue; craft recipes unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstMillWalkUpCueText(): string {
  return FIRST_MILL_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-mill walk-up tip (PL74.1).
 * Edge into mill interact range only; never sticky; respects tips preference.
 *
 * @param enteringMill - True when interact target just became a mill.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstMillWalkUpCue(
  enteringMill: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringMill) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first workshop walk-up (PL74.2).
 * Saw cue; craft recipes unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstWorkshopWalkUpCueText(): string {
  return FIRST_WORKSHOP_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-workshop walk-up tip (PL74.2).
 * Edge into workshop interact range only; never sticky; respects tips preference.
 *
 * @param enteringWorkshop - True when interact target just became a workshop.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstWorkshopWalkUpCue(
  enteringWorkshop: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringWorkshop) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first forge walk-up (PL74.3).
 * Smelt cue; craft recipes unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstForgeWalkUpCueText(): string {
  return FIRST_FORGE_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-forge walk-up tip (PL74.3).
 * Edge into forge interact range only; never sticky; respects tips preference.
 *
 * @param enteringForge - True when interact target just became a forge.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstForgeWalkUpCue(
  enteringForge: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringForge) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first loom walk-up (PL77.1).
 * Weave cue; craft recipes unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstLoomWalkUpCueText(): string {
  return FIRST_LOOM_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-loom walk-up tip (PL77.1).
 * Edge into loom interact range only; never sticky; respects tips preference.
 *
 * @param enteringLoom - True when interact target just became a loom.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstLoomWalkUpCue(
  enteringLoom: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringLoom) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first alchemy-bench walk-up (PL77.2).
 * Brew cue; craft recipes unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstAlchemyBenchWalkUpCueText(): string {
  return FIRST_ALCHEMY_BENCH_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-alchemy-bench walk-up tip (PL77.2).
 * Edge into alchemy_bench interact range only; never sticky; respects tips preference.
 *
 * @param enteringAlchemyBench - True when interact target just became an alchemy bench.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstAlchemyBenchWalkUpCue(
  enteringAlchemyBench: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringAlchemyBench) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first decor-pad walk-up (PL75.1).
 * Place-yard cue; decor costs unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstDecorPadWalkUpCueText(): string {
  return FIRST_DECOR_PAD_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-decor-pad walk-up tip (PL75.1).
 * Edge into decor_pad interact range only; never sticky; respects tips preference.
 *
 * @param enteringDecorPad - True when interact target just became a decor pad.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstDecorPadWalkUpCue(
  enteringDecorPad: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringDecorPad) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first tutor NPC walk-up (PL76.2).
 * Learn + claim cue; tutor XP / claim rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstTutorWalkUpCueText(): string {
  return FIRST_TUTOR_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-tutor walk-up tip (PL76.2).
 * Edge into any tutorial_npc interact range only; never sticky; respects tips preference.
 *
 * @param enteringTutor - True when interact target just became a tutorial NPC.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstTutorWalkUpCue(
  enteringTutor: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringTutor) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first claim-node walk-up (PL80.1).
 * Grove claim cue; claim / war rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstClaimNodeWalkUpCueText(): string {
  return FIRST_CLAIM_NODE_WALKUP_CUE;
}

/**
 * Whether to flash the one-shot first-claim-node walk-up tip (PL80.1).
 * Edge into claim_node interact range only; never sticky; respects tips preference.
 *
 * @param enteringClaimNode - True when interact target just became a claim beacon.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstClaimNodeWalkUpCue(
  enteringClaimNode: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringClaimNode) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy when a tutor objective edges into claimable (PL72.2).
 * Complements world Claim accent (PL30.3); XP / claim rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function tutorClaimReadyEdgeCueText(): string {
  return TUTOR_CLAIM_READY_EDGE_CUE;
}

/**
 * Whether any tutor objective newly became claimable (PL72.2).
 * First snapshot seeds quietly (login / hydrate with already-ready tutors stays silent).
 *
 * @param prevClaimableIds - Claimable profession ids from the previous sample (null before first).
 * @param nextClaimableIds - Claimable profession ids at the current refresh.
 * @returns True when at least one tutor edged into claimable.
 */
export function shouldFlashTutorClaimReadyEdgeCue(
  prevClaimableIds: ReadonlySet<string> | null | undefined,
  nextClaimableIds: ReadonlySet<string>,
): boolean {
  if (prevClaimableIds == null) return false;
  for (const id of nextClaimableIds) {
    if (!prevClaimableIds.has(id)) return true;
  }
  return false;
}

/**
 * One-line ephemeral copy on first visit to another player's land (PL53.1).
 * Complements cool visit tint (PL51.2) + visiting banner; trade hotkey unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstVisitLandCueText(): string {
  return FIRST_VISIT_LAND_CUE;
}

/**
 * Whether to flash the one-shot first-visit land tip (PL53.1).
 * First successful visit only; never sticky; respects tips preference.
 *
 * @param enteringVisit - True when visit land just became active.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral tip should play (replaces Visiting · name once).
 */
export function shouldFlashFirstVisitLandCue(
  enteringVisit: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringVisit) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * One-line ephemeral copy on first Warrior map presence (PL53.2).
 * Complements PL45.2 plaque tip; no balance invent; free enter/exit.
 *
 * @returns Short player-facing cue text.
 */
export function firstWarriorMapCueText(): string {
  return FIRST_WARRIOR_MAP_CUE;
}

/**
 * Whether to flash the one-shot first-Warrior map tip (PL53.2).
 * Edge into Warrior map only; never sticky; respects tips preference.
 *
 * @param enteringWarrior - True when land kind just became warrior.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstWarriorMapCue(
  enteringWarrior: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringWarrior) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * Whether land-kind transition is first presence on Explore (PL45.1).
 * True when next is explore and previous was not (including first load).
 *
 * @param prevKind - Land kind before the state update (null on first snapshot).
 * @param nextKind - Land kind after the state update.
 * @returns True when the player just entered Explore.
 */
export function isEnteringExploreMap(
  prevKind: string | null | undefined,
  nextKind: string | null | undefined,
): boolean {
  if (nextKind == null || nextKind === "") return false;
  if (!isExploreLandKind(String(nextKind))) return false;
  if (prevKind == null || prevKind === "") return true;
  return !isExploreLandKind(String(prevKind));
}

/**
 * Whether land-kind transition is first presence on Warrior (PL53.2).
 * True when next is warrior and previous was not (including first load).
 *
 * @param prevKind - Land kind before the state update (null on first snapshot).
 * @param nextKind - Land kind after the state update.
 * @returns True when the player just entered Warrior.
 */
export function isEnteringWarriorMap(
  prevKind: string | null | undefined,
  nextKind: string | null | undefined,
): boolean {
  if (nextKind == null || nextKind === "") return false;
  if (!isWarriorLandKind(String(nextKind))) return false;
  if (prevKind == null || prevKind === "") return true;
  return !isWarriorLandKind(String(prevKind));
}

/**
 * Whether land-kind transition is leaving Warrior Arena (PL147.1).
 * True when previous was warrior and next is a different map.
 *
 * @param prevKind - Land kind before the state update.
 * @param nextKind - Land kind after the state update.
 * @returns True when the player just left Warrior.
 */
export function isLeavingWarriorMap(
  prevKind: string | null | undefined,
  nextKind: string | null | undefined,
): boolean {
  if (prevKind == null || prevKind === "") return false;
  if (!isWarriorLandKind(String(prevKind))) return false;
  if (nextKind == null || nextKind === "") return false;
  return !isWarriorLandKind(String(nextKind));
}

/**
 * One-line ephemeral copy on first City hub presence (PL57.1).
 * Complements sticky `city_hub` onboarding; scarce stations unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function firstCityHubCueText(): string {
  return FIRST_CITY_HUB_CUE;
}

/**
 * Whether to flash the one-shot first-City hub tip (PL57.1).
 * Edge into City map only; never sticky; respects tips preference.
 *
 * @param enteringCity - True when land kind just became city.
 * @param alreadySeen - True after this account already saw the tip (localStorage).
 * @param tipsEnabled - Client showTips preference (same gate as onboarding).
 * @returns True when the ephemeral + soft world tip should play.
 */
export function shouldFlashFirstCityHubCue(
  enteringCity: boolean,
  alreadySeen: boolean,
  tipsEnabled: boolean,
): boolean {
  return Boolean(enteringCity) && !alreadySeen && Boolean(tipsEnabled);
}

/**
 * Whether land-kind transition is first presence on City (PL57.1).
 * True when next is city and previous was not (including first load).
 *
 * @param prevKind - Land kind before the state update (null on first snapshot).
 * @param nextKind - Land kind after the state update.
 * @returns True when the player just entered City.
 */
export function isEnteringCityMap(
  prevKind: string | null | undefined,
  nextKind: string | null | undefined,
): boolean {
  if (nextKind == null || nextKind === "") return false;
  if (!isCityLandKind(String(nextKind))) return false;
  if (prevKind == null || prevKind === "") return true;
  return !isCityLandKind(String(prevKind));
}

/**
 * One-line ephemeral copy when cosmetic day phase edges into Dawn/Dusk/Night (PL57.2).
 * Midday Day stays quiet; quiet secondary chrome still shows while non-Day.
 *
 * @param label - Cosmetic phase label from dayNightPalette.
 * @returns Short cue text, or null when the label is not a soft-cue phase.
 */
export function dayPhaseChangeCueText(
  label: string | null | undefined,
): string | null {
  if (!label) return null;
  const trimmed = String(label).trim();
  if (trimmed === DAY_PHASE_DAWN_CUE) return DAY_PHASE_DAWN_CUE;
  if (trimmed === DAY_PHASE_DUSK_CUE) return DAY_PHASE_DUSK_CUE;
  if (trimmed === DAY_PHASE_NIGHT_CUE) return DAY_PHASE_NIGHT_CUE;
  return null;
}

/**
 * Whether to flash a brief TopBar cue on day-phase edge (PL57.2).
 * Only Dawn / Dusk / Night entries; Day stays quiet; cycle-off never flashes;
 * first known sample seeds without toasting.
 *
 * @param prevLabel - Previous cosmetic phase label (null before first sample).
 * @param nextLabel - Current cosmetic phase label.
 * @param cycleEnabled - Client dayNightCycle preference.
 * @returns True when the ephemeral phase cue should play.
 */
export function shouldFlashDayPhaseChangeCue(
  prevLabel: string | null | undefined,
  nextLabel: string | null | undefined,
  cycleEnabled: boolean,
): boolean {
  if (!cycleEnabled) return false;
  if (prevLabel == null || prevLabel === "") return false;
  const cue = dayPhaseChangeCueText(nextLabel);
  if (!cue) return false;
  return String(prevLabel).trim() !== cue;
}

/**
 * One-line ephemeral copy when soft-refuse too-far (PL54.1).
 * Complements refuse SFX; interact ranges unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function tooFarRefuseCueText(): string {
  return TOO_FAR_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the too-far refuse ephemeral (PL54.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Closer cue should play.
 */
export function shouldFlashTooFarRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.tooFar;
}

/**
 * One-line ephemeral copy when soft-refuse not-enough-coins (PL54.2).
 * Buy / place / list coin shortfalls; prices / costs unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function coinsRefuseCueText(): string {
  return COINS_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the coins refuse ephemeral (PL54.2).
 * Matches static notEnoughCoins and dynamic need-N-coins place/expand/upgrade.
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Coins cue should play.
 */
export function shouldFlashCoinsRefuseCue(
  error: string | null | undefined,
): boolean {
  if (!error) return false;
  if (error === ACTION_ERROR.notEnoughCoins) return true;
  // Reason: PL97.1 — market listing fee gets its own Fee cue (not generic Coins).
  if (/market listing fee/.test(error)) return false;
  // Reason: place / expand / upgrade use needCoins*(n) templates with a qty.
  return /^You need \d+ coins to /.test(error);
}

/**
 * One-line ephemeral copy when soft-refuse missing materials / items (PL54.3).
 * Recipe / listing rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function materialsRefuseCueText(): string {
  return MATERIALS_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the materials refuse ephemeral (PL54.3).
 * Matches missingMaterials / notEnoughItems and dynamic need-mats templates.
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Materials cue should play.
 */
export function shouldFlashMaterialsRefuseCue(
  error: string | null | undefined,
): boolean {
  if (!error) return false;
  if (
    error === ACTION_ERROR.missingMaterials ||
    error === ACTION_ERROR.notEnoughItems
  ) {
    return true;
  }
  // Reason: PL100.1 — repair mats get their own Mats cue (not generic Materials).
  if (/to repair that tool/.test(error)) return false;
  // Reason: place / expand / upgrade use needMats*(qty, name) templates.
  return /^You need \d+× .+ to /.test(error);
}

/**
 * One-line ephemeral copy when soft-refuse need-hammer / broken hammer (PL58.1).
 * Complements refuse SFX; tool / ore chip rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function hammerRefuseCueText(): string {
  return HAMMER_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the hammer refuse ephemeral (PL58.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Hammer cue should play.
 */
export function shouldFlashHammerRefuseCue(
  error: string | null | undefined,
): boolean {
  return (
    error === ACTION_ERROR.needHammer ||
    error === ACTION_ERROR.needHammerBroken
  );
}

/**
 * One-line ephemeral copy when soft-refuse crop-not-ready (PL58.2).
 * Complements refuse SFX; grow timers unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function cropNotReadyRefuseCueText(): string {
  return CROP_NOT_READY_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the crop-not-ready refuse ephemeral (PL58.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Growing cue should play.
 */
export function shouldFlashCropNotReadyRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.cropNotReady;
}

/**
 * One-line ephemeral copy when soft-refuse plot-occupied (PL58.3).
 * Complements refuse SFX; plant rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function plotOccupiedRefuseCueText(): string {
  return PLOT_OCCUPIED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the plot-occupied refuse ephemeral (PL58.3).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Occupied cue should play.
 */
export function shouldFlashPlotOccupiedRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.plotNotEmpty;
}

/**
 * One-line ephemeral copy when a crop plot edges into harvest-ready (PL60.1).
 * Complements world pulse / name label (PL12.1 / PL40.1); grow timers / yields unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function cropReadyEdgeCueText(): string {
  return CROP_READY_EDGE_CUE;
}

/**
 * Whether any crop plot newly entered harvest-ready (PL60.1).
 * First snapshot seeds quietly (login / hydrate with already-ripe plots stays silent).
 *
 * @param prevReadyIds - Ready plot ids from the previous sample (null before first).
 * @param nextReadyIds - Ready plot ids at the current game clock.
 * @returns True when at least one plot edged into ready.
 */
export function shouldFlashCropReadyEdgeCue(
  prevReadyIds: ReadonlySet<string> | null | undefined,
  nextReadyIds: ReadonlySet<string>,
): boolean {
  if (prevReadyIds == null) return false;
  for (const id of nextReadyIds) {
    if (!prevReadyIds.has(id)) return true;
  }
  return false;
}

/**
 * One-line ephemeral copy when a wood stump edges into chop-ready (PL65.1).
 * Complements world Ready label (PL23.2); cooldown / yields unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function woodStumpReadyEdgeCueText(): string {
  return WOOD_STUMP_READY_EDGE_CUE;
}

/**
 * Whether any wood stump newly entered chop-ready after cooldown (PL65.1).
 * First snapshot seeds quietly (login / hydrate with already-ready stumps stays silent).
 *
 * @param prevReadyIds - Ready stump ids from the previous sample (null before first).
 * @param nextReadyIds - Ready stump ids at the current game clock.
 * @returns True when at least one stump edged into ready.
 */
export function shouldFlashWoodStumpReadyEdgeCue(
  prevReadyIds: ReadonlySet<string> | null | undefined,
  nextReadyIds: ReadonlySet<string>,
): boolean {
  return shouldFlashCropReadyEdgeCue(prevReadyIds, nextReadyIds);
}

/**
 * One-line ephemeral copy when a fishing dock edges into cast-ready (PL65.2).
 * Complements world Ready label (PL30.1); cooldown / yields unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function fishingDockReadyEdgeCueText(): string {
  return FISHING_DOCK_READY_EDGE_CUE;
}

/**
 * Whether any fishing dock newly entered cast-ready after cooldown (PL65.2).
 * First snapshot seeds quietly (login / hydrate with already-ready docks stays silent).
 *
 * @param prevReadyIds - Ready dock ids from the previous sample (null before first).
 * @param nextReadyIds - Ready dock ids at the current game clock.
 * @returns True when at least one dock edged into ready.
 */
export function shouldFlashFishingDockReadyEdgeCue(
  prevReadyIds: ReadonlySet<string> | null | undefined,
  nextReadyIds: ReadonlySet<string>,
): boolean {
  return shouldFlashCropReadyEdgeCue(prevReadyIds, nextReadyIds);
}

/**
 * One-line ephemeral copy when an ore node edges into chip-ready (PL69.1).
 * Complements world Ready label; cooldown / yields unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function oreNodeReadyEdgeCueText(): string {
  return ORE_NODE_READY_EDGE_CUE;
}

/**
 * Whether any ore node newly entered chip-ready after cooldown (PL69.1).
 * First snapshot seeds quietly (login / hydrate with already-ready nodes stays silent).
 *
 * @param prevReadyIds - Ready ore ids from the previous sample (null before first).
 * @param nextReadyIds - Ready ore ids at the current game clock.
 * @returns True when at least one ore node edged into ready.
 */
export function shouldFlashOreNodeReadyEdgeCue(
  prevReadyIds: ReadonlySet<string> | null | undefined,
  nextReadyIds: ReadonlySet<string>,
): boolean {
  return shouldFlashCropReadyEdgeCue(prevReadyIds, nextReadyIds);
}

/**
 * One-line ephemeral copy when an animal pen edges into care-ready (PL69.2).
 * Complements world Ready label; cooldown / yields unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function animalPenReadyEdgeCueText(): string {
  return ANIMAL_PEN_READY_EDGE_CUE;
}

/**
 * Whether any animal pen newly entered care-ready after cooldown (PL69.2).
 * First snapshot seeds quietly (login / hydrate with already-ready pens stays silent).
 *
 * @param prevReadyIds - Ready pen ids from the previous sample (null before first).
 * @param nextReadyIds - Ready pen ids at the current game clock.
 * @returns True when at least one pen edged into ready.
 */
export function shouldFlashAnimalPenReadyEdgeCue(
  prevReadyIds: ReadonlySet<string> | null | undefined,
  nextReadyIds: ReadonlySet<string>,
): boolean {
  return shouldFlashCropReadyEdgeCue(prevReadyIds, nextReadyIds);
}

/**
 * One-line ephemeral copy when soft-refuse ore-node cooldown (PL60.2).
 * Complements refuse SFX; cooldown numbers unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function oreCooldownRefuseCueText(): string {
  return ORE_COOLDOWN_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the ore-cooldown refuse ephemeral (PL60.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Settling cue should play.
 */
export function shouldFlashOreCooldownRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.oreNodeCooldown;
}

/**
 * One-line ephemeral copy when soft-refuse wood-stump cooldown (PL63.1).
 * Complements refuse SFX; cooldown numbers unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function woodStumpCooldownRefuseCueText(): string {
  return WOOD_STUMP_COOLDOWN_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the wood-stump-cooldown refuse ephemeral (PL63.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Resting cue should play.
 */
export function shouldFlashWoodStumpCooldownRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.woodStumpCooldown;
}

/**
 * One-line ephemeral copy when soft-refuse fishing-dock cooldown (PL63.2).
 * Complements refuse SFX; cooldown numbers unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function fishingDockCooldownRefuseCueText(): string {
  return FISHING_DOCK_COOLDOWN_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the fishing-dock-cooldown refuse ephemeral (PL63.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Waiting cue should play.
 */
export function shouldFlashFishingDockCooldownRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.fishingDockCooldown;
}

/**
 * One-line ephemeral copy when soft-refuse animal-pen cooldown (PL63.3).
 * Complements refuse SFX; cooldown numbers unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function animalPenCooldownRefuseCueText(): string {
  return ANIMAL_PEN_COOLDOWN_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the animal-pen-cooldown refuse ephemeral (PL63.3).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Resting cue should play.
 */
export function shouldFlashAnimalPenCooldownRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.animalPenCooldown;
}

/**
 * One-line ephemeral copy when soft-refuse hunt cooldown (PL63.4).
 * Complements refuse SFX; cooldown / spawn rates unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function huntCooldownRefuseCueText(): string {
  return HUNT_COOLDOWN_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the hunt-cooldown refuse ephemeral (PL63.4).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Scattered cue should play.
 */
export function shouldFlashHuntCooldownRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.huntCooldown;
}

/**
 * One-line ephemeral copy when soft-refuse missing wheat seed (PL64.2).
 * Complements refuse SFX; plant rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function missingSeedRefuseCueText(): string {
  return MISSING_SEED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the missing-seed refuse ephemeral (PL64.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Seed cue should play.
 */
export function shouldFlashMissingSeedRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.missingSeed;
}

/**
 * One-line ephemeral copy when soft-refuse no bread left (PL71.1).
 * Complements refuse SFX; eat / energy numbers unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function noBreadRefuseCueText(): string {
  return NO_BREAD_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the no-bread refuse ephemeral (PL71.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Bread cue should play.
 */
export function shouldFlashNoBreadRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.noBread;
}

/**
 * One-line ephemeral copy when soft-refuse build board missing (PL71.2).
 * Complements refuse SFX; place rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function buildBoardMissingRefuseCueText(): string {
  return BUILD_BOARD_MISSING_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the build-board-missing refuse ephemeral (PL71.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Board cue should play.
 */
export function shouldFlashBuildBoardMissingRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.buildBoardMissing;
}

/**
 * One-line ephemeral copy when soft-refuse nothing edible selected (PL73.1).
 * Complements refuse SFX; eat / energy numbers unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function noFoodRefuseCueText(): string {
  return NO_FOOD_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the no-food refuse ephemeral (PL73.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Food cue should play.
 */
export function shouldFlashNoFoodRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.noFood;
}

/**
 * One-line ephemeral copy when soft-refuse build cell occupied (PL73.2).
 * Complements refuse SFX; place rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function buildCellOccupiedRefuseCueText(): string {
  return BUILD_CELL_OCCUPIED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the build-cell-occupied refuse ephemeral (PL73.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Spot cue should play.
 */
export function shouldFlashBuildCellOccupiedRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.buildCellOccupied;
}

/**
 * One-line ephemeral copy when soft-refuse decor already placed (PL75.2).
 * Complements refuse SFX; decor place rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function decorAlreadyPlacedRefuseCueText(): string {
  return DECOR_ALREADY_PLACED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the decor-already-placed refuse ephemeral (PL75.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Taken cue should play.
 */
export function shouldFlashDecorAlreadyPlacedRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.decorAlreadyPlaced;
}

/**
 * One-line ephemeral copy when soft-refuse quest not ready (PL76.1).
 * Complements refuse SFX; quest / XP rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function questNotReadyRefuseCueText(): string {
  return QUEST_NOT_READY_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the quest-not-ready refuse ephemeral (PL76.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Objective cue should play.
 */
export function shouldFlashQuestNotReadyRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.questNotReady;
}

/**
 * One-line ephemeral copy when soft-refuse quest locked (PL78.1).
 * Complements refuse SFX; quest / XP rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function questLockedRefuseCueText(): string {
  return QUEST_LOCKED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the quest-locked refuse ephemeral (PL78.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Locked cue should play.
 */
export function shouldFlashQuestLockedRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.questLocked;
}

/**
 * One-line ephemeral copy when soft-refuse quest already claimed (PL78.2).
 * Complements refuse SFX; quest / XP rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function questAlreadyClaimedRefuseCueText(): string {
  return QUEST_ALREADY_CLAIMED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the quest-already-claimed refuse ephemeral (PL78.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Claimed cue should play.
 */
export function shouldFlashQuestAlreadyClaimedRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.questAlreadyClaimed;
}

/**
 * One-line ephemeral copy when soft-refuse vendor won't buy (PL79.1).
 * Complements refuse SFX; vendor prices unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function vendorWontBuyRefuseCueText(): string {
  return VENDOR_WONT_BUY_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the vendor-won't-buy refuse ephemeral (PL79.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Unwanted cue should play.
 */
export function shouldFlashVendorWontBuyRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.vendorWontBuy;
}

/**
 * One-line ephemeral copy when soft-refuse vendor won't sell (PL79.2).
 * Complements refuse SFX; vendor prices unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function vendorWontSellRefuseCueText(): string {
  return VENDOR_WONT_SELL_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the vendor-won't-sell refuse ephemeral (PL79.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Stock cue should play.
 */
export function shouldFlashVendorWontSellRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.vendorWontSell;
}

/**
 * One-line ephemeral copy when soft-refuse claim needs guild (PL80.2).
 * Complements refuse SFX; claim rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function claimNeedGuildRefuseCueText(): string {
  return CLAIM_NEED_GUILD_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the claim-need-guild refuse ephemeral (PL80.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Guild cue should play.
 */
export function shouldFlashClaimNeedGuildRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.claimNeedGuild;
}

/**
 * One-line ephemeral copy when soft-refuse claim held by other (PL81.1).
 * Complements refuse SFX; claim / war rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function claimHeldByOtherRefuseCueText(): string {
  return CLAIM_HELD_BY_OTHER_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the claim-held-by-other refuse ephemeral (PL81.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Held cue should play.
 */
export function shouldFlashClaimHeldByOtherRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.claimHeldByOther;
}

/**
 * One-line ephemeral copy when soft-refuse claim nothing stored (PL81.2).
 * Complements refuse SFX; claim produce rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function claimNothingStoredRefuseCueText(): string {
  return CLAIM_NOTHING_STORED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the claim-nothing-stored refuse ephemeral (PL81.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Empty cue should play.
 */
export function shouldFlashClaimNothingStoredRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.claimNothingStored;
}

/**
 * One-line ephemeral copy when soft-refuse claim war already open (PL82.1).
 * Complements refuse SFX; soft-war rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function claimWarAlreadyOpenRefuseCueText(): string {
  return CLAIM_WAR_ALREADY_OPEN_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the claim-war-already-open refuse ephemeral (PL82.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Contest cue should play.
 */
export function shouldFlashClaimWarAlreadyOpenRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.claimWarAlreadyOpen;
}

/**
 * One-line ephemeral copy when soft-refuse claim war need mats (PL82.2).
 * Complements refuse SFX; deliver scoring unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function claimWarNeedMatsRefuseCueText(): string {
  return CLAIM_WAR_NEED_MATS_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the claim-war-need-mats refuse ephemeral (PL82.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Wood cue should play.
 */
export function shouldFlashClaimWarNeedMatsRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.claimWarNeedMats;
}

/**
 * One-line ephemeral copy when soft-refuse claim war not open (PL82.3).
 * Complements refuse SFX; soft-war rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function claimWarNotOpenRefuseCueText(): string {
  return CLAIM_WAR_NOT_OPEN_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the claim-war-not-open refuse ephemeral (PL82.3).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Peace cue should play.
 */
export function shouldFlashClaimWarNotOpenRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.claimWarNotOpen;
}

/**
 * One-line ephemeral copy when soft-refuse market own listing (PL83.1).
 * Complements refuse SFX; market fee / escrow unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function marketOwnListingRefuseCueText(): string {
  return MARKET_OWN_LISTING_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the market-own-listing refuse ephemeral (PL83.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Yours cue should play.
 */
export function shouldFlashMarketOwnListingRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.marketOwnListing;
}

/**
 * One-line ephemeral copy when soft-refuse market expired (PL83.2).
 * Complements refuse SFX; TTL / return rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function marketExpiredRefuseCueText(): string {
  return MARKET_EXPIRED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the market-expired refuse ephemeral (PL83.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Expired cue should play.
 */
export function shouldFlashMarketExpiredRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.marketExpired;
}

/**
 * One-line ephemeral copy when soft-refuse mail self (PL84.1).
 * Complements refuse SFX; mail escrow unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function mailSelfRefuseCueText(): string {
  return MAIL_SELF_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the mail-self refuse ephemeral (PL84.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Self cue should play.
 */
export function shouldFlashMailSelfRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.mailSelf;
}

/**
 * One-line ephemeral copy when soft-refuse mail inbox full (PL84.2).
 * Complements refuse SFX; mailbox caps unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function mailInboxFullRefuseCueText(): string {
  return MAIL_INBOX_FULL_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the mail-inbox-full refuse ephemeral (PL84.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Full cue should play.
 */
export function shouldFlashMailInboxFullRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.mailInboxFull;
}

/**
 * One-line ephemeral copy when soft-refuse travel in progress (PL85.1).
 * Complements refuse SFX; caravan timing / costs unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function travelInProgressRefuseCueText(): string {
  return TRAVEL_IN_PROGRESS_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the travel-in-progress refuse ephemeral (PL85.1).
 * Matches the dynamic `travelInProgress(sec)` template.
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Road cue should play.
 */
export function shouldFlashTravelInProgressRefuseCue(
  error: string | null | undefined,
): boolean {
  if (!error) return false;
  // Reason: PL85.1 — travelInProgress embeds remaining seconds.
  return /^Your caravan is still on the road \(\d+s left\)\.$/.test(error);
}

/**
 * One-line ephemeral copy when soft-refuse trade self (PL86.1).
 * Complements refuse SFX; trade rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function tradeSelfRefuseCueText(): string {
  return TRADE_SELF_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the trade-self refuse ephemeral (PL86.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Self cue should play.
 */
export function shouldFlashTradeSelfRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.tradeSelf;
}

/**
 * One-line ephemeral copy when soft-refuse trade empty (PL86.2).
 * Complements refuse SFX; trade rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function tradeEmptyRefuseCueText(): string {
  return TRADE_EMPTY_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the trade-empty refuse ephemeral (PL86.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Empty cue should play.
 */
export function shouldFlashTradeEmptyRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.tradeEmpty;
}

/**
 * One-line ephemeral copy when soft-refuse trade player missing (PL86.3).
 * Complements refuse SFX; trade rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function tradePlayerMissingRefuseCueText(): string {
  return TRADE_PLAYER_MISSING_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the trade-player-missing refuse ephemeral (PL86.3).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Gone cue should play.
 */
export function shouldFlashTradePlayerMissingRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.tradePlayerMissing;
}

/**
 * One-line ephemeral copy when soft-refuse guild already in (PL87.1).
 * Complements refuse SFX; guild rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function guildAlreadyInRefuseCueText(): string {
  return GUILD_ALREADY_IN_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the guild-already-in refuse ephemeral (PL87.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Member cue should play.
 */
export function shouldFlashGuildAlreadyInRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.guildAlreadyIn;
}

/**
 * One-line ephemeral copy when soft-refuse guild not in (PL87.2).
 * Complements refuse SFX; guild rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function guildNotInRefuseCueText(): string {
  return GUILD_NOT_IN_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the guild-not-in refuse ephemeral (PL87.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the No guild cue should play.
 */
export function shouldFlashGuildNotInRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.guildNotIn;
}

/**
 * One-line ephemeral copy when soft-refuse guild exists (PL87.3).
 * Complements refuse SFX; guild naming unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function guildExistsRefuseCueText(): string {
  return GUILD_EXISTS_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the guild-exists refuse ephemeral (PL87.3).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Taken cue should play.
 */
export function shouldFlashGuildExistsRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.guildExists;
}

/**
 * One-line ephemeral copy when soft-refuse claim war need guild (PL88.1).
 * Complements refuse SFX; soft-war rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function claimWarNeedGuildRefuseCueText(): string {
  return CLAIM_WAR_NEED_GUILD_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the claim-war-need-guild refuse ephemeral (PL88.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Guild cue should play.
 */
export function shouldFlashClaimWarNeedGuildRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.claimWarNeedGuild;
}

/**
 * One-line ephemeral copy when soft-refuse build player land only (PL88.2).
 * Complements refuse SFX; place rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function buildPlayerLandOnlyRefuseCueText(): string {
  return BUILD_PLAYER_LAND_ONLY_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the build-player-land-only refuse ephemeral (PL88.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Land cue should play.
 */
export function shouldFlashBuildPlayerLandOnlyRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.buildPlayerLandOnly;
}

/**
 * One-line ephemeral copy when soft-refuse already upgraded (PL89.1).
 * Complements refuse SFX; upgrade rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function alreadyUpgradedRefuseCueText(): string {
  return ALREADY_UPGRADED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the already-upgraded refuse ephemeral (PL89.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Max cue should play.
 */
export function shouldFlashAlreadyUpgradedRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.alreadyUpgraded;
}

/**
 * One-line ephemeral copy when soft-refuse cannot upgrade building (PL89.2).
 * Complements refuse SFX; upgrade rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function cannotUpgradeBuildingRefuseCueText(): string {
  return CANNOT_UPGRADE_BUILDING_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the cannot-upgrade refuse ephemeral (PL89.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Fixed cue should play.
 */
export function shouldFlashCannotUpgradeBuildingRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.cannotUpgradeBuilding;
}

/**
 * One-line ephemeral copy when soft-refuse travel need coins (PL90.1).
 * Complements refuse SFX; caravan costs unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function travelNeedCoinsRefuseCueText(): string {
  return TRAVEL_NEED_COINS_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the travel-need-coins refuse ephemeral (PL90.1).
 * Matches the dynamic `needCoinsTravel(n)` template (distinct from place/upgrade `to` forms).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Coins cue should play.
 */
export function shouldFlashTravelNeedCoinsRefuseCue(
  error: string | null | undefined,
): boolean {
  if (!error) return false;
  // Reason: PL90.1 — needCoinsTravel embeds fare; uses "for the caravan" not "to …".
  return /^You need \d+ coins for the caravan/.test(error);
}

/**
 * One-line ephemeral copy when soft-refuse trade not found (PL91.1).
 * Complements refuse SFX; trade escrow unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function tradeNotFoundRefuseCueText(): string {
  return TRADE_NOT_FOUND_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the trade-not-found refuse ephemeral (PL91.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Gone cue should play.
 */
export function shouldFlashTradeNotFoundRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.tradeNotFound;
}

/**
 * One-line ephemeral copy when soft-refuse trade not yours (PL91.2).
 * Complements refuse SFX; trade escrow unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function tradeNotYoursRefuseCueText(): string {
  return TRADE_NOT_YOURS_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the trade-not-yours refuse ephemeral (PL91.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Yours cue should play.
 */
export function shouldFlashTradeNotYoursRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.tradeNotYours;
}

/**
 * One-line ephemeral copy when soft-refuse trade only recipient (PL91.3).
 * Complements refuse SFX; trade accept rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function tradeOnlyRecipientRefuseCueText(): string {
  return TRADE_ONLY_RECIPIENT_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the trade-only-recipient refuse ephemeral (PL91.3).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Wait cue should play.
 */
export function shouldFlashTradeOnlyRecipientRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.tradeOnlyRecipient;
}

/**
 * One-line ephemeral copy when soft-refuse trade broke (PL92.1).
 * Complements refuse SFX; trade coin escrow unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function tradeBrokeRefuseCueText(): string {
  return TRADE_BROKE_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the trade-broke refuse ephemeral (PL92.1).
 * Matches you-broke or sender-broke coin escrow fails.
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Broke cue should play.
 */
export function shouldFlashTradeBrokeRefuseCue(
  error: string | null | undefined,
): boolean {
  return (
    error === ACTION_ERROR.tradeYouBroke ||
    error === ACTION_ERROR.tradeSenderBroke
  );
}

/**
 * One-line ephemeral copy when soft-refuse trade missing items (PL92.2).
 * Complements refuse SFX; trade item escrow unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function tradeMissingItemsRefuseCueText(): string {
  return TRADE_MISSING_ITEMS_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the trade-missing-items refuse ephemeral (PL92.2).
 * Matches you-missing or sender-missing item escrow fails.
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Items cue should play.
 */
export function shouldFlashTradeMissingItemsRefuseCue(
  error: string | null | undefined,
): boolean {
  return (
    error === ACTION_ERROR.tradeYouMissingItems ||
    error === ACTION_ERROR.tradeSenderMissingItems
  );
}

/**
 * One-line ephemeral copy when soft-refuse mail empty (PL93.1).
 * Complements refuse SFX; mail escrow unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function mailEmptyRefuseCueText(): string {
  return MAIL_EMPTY_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the mail-empty refuse ephemeral (PL93.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Empty cue should play.
 */
export function shouldFlashMailEmptyRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.mailEmpty;
}

/**
 * One-line ephemeral copy when soft-refuse mail player missing (PL93.2).
 * Complements refuse SFX; mail rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function mailPlayerMissingRefuseCueText(): string {
  return MAIL_PLAYER_MISSING_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the mail-player-missing refuse ephemeral (PL93.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Gone cue should play.
 */
export function shouldFlashMailPlayerMissingRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.mailPlayerMissing;
}

/**
 * One-line ephemeral copy when soft-refuse mail already claimed (PL93.3).
 * Complements refuse SFX; mail claim rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function mailAlreadyClaimedRefuseCueText(): string {
  return MAIL_ALREADY_CLAIMED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the mail-already-claimed refuse ephemeral (PL93.3).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Claimed cue should play.
 */
export function shouldFlashMailAlreadyClaimedRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.mailAlreadyClaimed;
}

/**
 * One-line ephemeral copy when soft-refuse market not found (PL94.1).
 * Complements refuse SFX; market listings unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function marketNotFoundRefuseCueText(): string {
  return MARKET_NOT_FOUND_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the market-not-found refuse ephemeral (PL94.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Gone cue should play.
 */
export function shouldFlashMarketNotFoundRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.marketNotFound;
}

/**
 * One-line ephemeral copy when soft-refuse market not yours (PL94.2).
 * Complements refuse SFX; market ownership unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function marketNotYoursRefuseCueText(): string {
  return MARKET_NOT_YOURS_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the market-not-yours refuse ephemeral (PL94.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Yours cue should play.
 */
export function shouldFlashMarketNotYoursRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.marketNotYours;
}

/**
 * One-line ephemeral copy when soft-refuse guild invite invalid (PL95.1).
 * Complements refuse SFX; guild invite rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function guildInviteInvalidRefuseCueText(): string {
  return GUILD_INVITE_INVALID_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the guild-invite-invalid refuse ephemeral (PL95.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Code cue should play.
 */
export function shouldFlashGuildInviteInvalidRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.guildInviteInvalid;
}

/**
 * One-line ephemeral copy when soft-refuse guild name invalid (PL95.2).
 * Complements refuse SFX; guild naming bounds unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function guildNameInvalidRefuseCueText(): string {
  return GUILD_NAME_INVALID_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the guild-name-invalid refuse ephemeral (PL95.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Name cue should play.
 */
export function shouldFlashGuildNameInvalidRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.guildNameInvalid;
}

/**
 * One-line ephemeral copy when soft-refuse mail not found (PL96.1).
 * Complements refuse SFX; mail escrow unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function mailNotFoundRefuseCueText(): string {
  return MAIL_NOT_FOUND_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the mail-not-found refuse ephemeral (PL96.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Gone cue should play.
 */
export function shouldFlashMailNotFoundRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.mailNotFound;
}

/**
 * One-line ephemeral copy when soft-refuse mail only recipient (PL96.2).
 * Complements refuse SFX; mail claim rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function mailOnlyRecipientRefuseCueText(): string {
  return MAIL_ONLY_RECIPIENT_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the mail-only-recipient refuse ephemeral (PL96.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Wait cue should play.
 */
export function shouldFlashMailOnlyRecipientRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.mailOnlyRecipient;
}

/**
 * One-line ephemeral copy when soft-refuse mail only sender (PL96.3).
 * Complements refuse SFX; mail cancel rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function mailOnlySenderRefuseCueText(): string {
  return MAIL_ONLY_SENDER_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the mail-only-sender refuse ephemeral (PL96.3).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Sender cue should play.
 */
export function shouldFlashMailOnlySenderRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.mailOnlySender;
}

/**
 * One-line ephemeral copy when soft-refuse market need fee (PL97.1).
 * Complements refuse SFX; listing fee numbers unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function marketNeedFeeRefuseCueText(): string {
  return MARKET_NEED_FEE_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the market-need-fee refuse ephemeral (PL97.1).
 * Matches the dynamic `marketNeedFee(n)` template.
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Fee cue should play.
 */
export function shouldFlashMarketNeedFeeRefuseCue(
  error: string | null | undefined,
): boolean {
  if (!error) return false;
  // Reason: PL97.1 — marketNeedFee embeds fee qty; "listing fee" not place/upgrade "to".
  return /^You need \d+ coins to pay the market listing fee\.$/.test(error);
}

/**
 * One-line ephemeral copy when soft-refuse market not stackable (PL97.2).
 * Complements refuse SFX; market stack rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function marketNotStackableRefuseCueText(): string {
  return MARKET_NOT_STACKABLE_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the market-not-stackable refuse ephemeral (PL97.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Stack cue should play.
 */
export function shouldFlashMarketNotStackableRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.marketNotStackable;
}

/**
 * One-line ephemeral copy when soft-refuse guild bank full (PL98.1).
 * Complements refuse SFX; guild bank slots unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function guildBankFullRefuseCueText(): string {
  return GUILD_BANK_FULL_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the guild-bank-full refuse ephemeral (PL98.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Full cue should play.
 */
export function shouldFlashGuildBankFullRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.guildBankFull;
}

/**
 * One-line ephemeral copy when soft-refuse guild bank empty (PL98.2).
 * Complements refuse SFX; guild bank withdraw rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function guildBankEmptyRefuseCueText(): string {
  return GUILD_BANK_EMPTY_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the guild-bank-empty refuse ephemeral (PL98.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Empty cue should play.
 */
export function shouldFlashGuildBankEmptyRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.guildBankEmpty;
}

/**
 * One-line ephemeral copy when soft-refuse guild rank / invite forbidden (PL98.3).
 * Complements refuse SFX; guild rank / invite refresh rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function guildRankForbiddenRefuseCueText(): string {
  return GUILD_RANK_FORBIDDEN_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the guild-rank-forbidden refuse ephemeral (PL98.3).
 * Covers `guildRankForbidden` and `guildInviteForbidden`.
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Rank cue should play.
 */
export function shouldFlashGuildRankForbiddenRefuseCue(
  error: string | null | undefined,
): boolean {
  return (
    error === ACTION_ERROR.guildRankForbidden ||
    error === ACTION_ERROR.guildInviteForbidden
  );
}

/**
 * One-line ephemeral copy when soft-refuse hunt explore-only (PL99.1).
 * Complements refuse SFX; hunt map gate unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function huntExploreOnlyRefuseCueText(): string {
  return HUNT_EXPLORE_ONLY_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the hunt-explore-only refuse ephemeral (PL99.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Explore cue should play.
 */
export function shouldFlashHuntExploreOnlyRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.huntExploreOnly;
}

/**
 * One-line ephemeral copy when soft-refuse warrior training on homestead (PL99.2).
 * Complements refuse SFX; warrior / arena place rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function warriorHomesteadForbiddenRefuseCueText(): string {
  return WARRIOR_HOMESTEAD_FORBIDDEN_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the warrior-homestead-forbidden refuse ephemeral (PL99.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Arena cue should play.
 */
export function shouldFlashWarriorHomesteadForbiddenRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.warriorTrainingHomesteadForbidden;
}

/**
 * One-line ephemeral copy when soft-refuse repair need mats (PL100.1).
 * Complements refuse SFX; repair costs unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function needMatsRepairRefuseCueText(): string {
  return NEED_MATS_REPAIR_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the repair-need-mats refuse ephemeral (PL100.1).
 * Matches the dynamic `needMatsRepair(qty, name)` template.
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Mats cue should play.
 */
export function shouldFlashNeedMatsRepairRefuseCue(
  error: string | null | undefined,
): boolean {
  if (!error) return false;
  // Reason: PL100.1 — needMatsRepair embeds qty/name; "repair that tool" not place/upgrade.
  return /^You need \d+× .+ to repair that tool\.$/.test(error);
}

/**
 * One-line ephemeral copy when soft-refuse not-a-tool equip (PL100.2).
 * Complements refuse SFX; equip rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function notAToolRefuseCueText(): string {
  return NOT_A_TOOL_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the not-a-tool refuse ephemeral (PL100.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Tool cue should play.
 */
export function shouldFlashNotAToolRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.notATool;
}

/**
 * One-line ephemeral copy when soft-refuse gather node missing (PL101.1).
 * Complements refuse SFX; gather node rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function gatherNodeMissingRefuseCueText(): string {
  return GATHER_NODE_MISSING_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the gather-node-missing refuse ephemeral (PL101.1).
 * Covers ore / stump / dock / pen missing.
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Gone cue should play.
 */
export function shouldFlashGatherNodeMissingRefuseCue(
  error: string | null | undefined,
): boolean {
  return (
    error === ACTION_ERROR.oreNodeMissing ||
    error === ACTION_ERROR.woodStumpMissing ||
    error === ACTION_ERROR.fishingDockMissing ||
    error === ACTION_ERROR.animalPenMissing
  );
}

/**
 * One-line ephemeral copy when soft-refuse plot missing (PL101.2).
 * Complements refuse SFX; plot rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function plotMissingRefuseCueText(): string {
  return PLOT_MISSING_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the plot-missing refuse ephemeral (PL101.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Gone cue should play.
 */
export function shouldFlashPlotMissingRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.plotMissing;
}

/**
 * One-line ephemeral copy when soft-refuse hunt / claim node missing (PL101.3).
 * Complements refuse SFX; hunt / claim node rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function huntOrClaimMissingRefuseCueText(): string {
  return HUNT_OR_CLAIM_MISSING_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the hunt/claim-missing refuse ephemeral (PL101.3).
 * Covers hunt trail / claim beacon missing.
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Gone cue should play.
 */
export function shouldFlashHuntOrClaimMissingRefuseCue(
  error: string | null | undefined,
): boolean {
  return (
    error === ACTION_ERROR.huntMissing ||
    error === ACTION_ERROR.claimNodeMissing
  );
}

/**
 * One-line ephemeral copy when soft-refuse guild bank not stackable (PL102.1).
 * Complements refuse SFX; guild bank stack rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function guildBankNotStackableRefuseCueText(): string {
  return GUILD_BANK_NOT_STACKABLE_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the guild-bank-not-stackable refuse ephemeral (PL102.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Stack cue should play.
 */
export function shouldFlashGuildBankNotStackableRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.guildBankNotStackable;
}

/**
 * One-line ephemeral copy when soft-refuse guild bank unknown item (PL102.2).
 * Complements refuse SFX; guild bank item rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function guildBankUnknownItemRefuseCueText(): string {
  return GUILD_BANK_UNKNOWN_ITEM_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the guild-bank-unknown-item refuse ephemeral (PL102.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Item cue should play.
 */
export function shouldFlashGuildBankUnknownItemRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.guildBankUnknownItem;
}

/**
 * One-line ephemeral copy when soft-refuse guild bank bad qty (PL102.3).
 * Complements refuse SFX; guild bank qty rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function guildBankBadQtyRefuseCueText(): string {
  return GUILD_BANK_BAD_QTY_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the guild-bank-bad-qty refuse ephemeral (PL102.3).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Qty cue should play.
 */
export function shouldFlashGuildBankBadQtyRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.guildBankBadQty;
}

/**
 * One-line ephemeral copy when soft-refuse mail not stackable (PL103.1).
 * Complements refuse SFX; mail stack rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function mailNotStackableRefuseCueText(): string {
  return MAIL_NOT_STACKABLE_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the mail-not-stackable refuse ephemeral (PL103.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Stack cue should play.
 */
export function shouldFlashMailNotStackableRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.mailNotStackable;
}

/**
 * One-line ephemeral copy when soft-refuse market invalid (PL103.2).
 * Complements refuse SFX; market list validation unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function marketInvalidRefuseCueText(): string {
  return MARKET_INVALID_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the market-invalid refuse ephemeral (PL103.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the List cue should play.
 */
export function shouldFlashMarketInvalidRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.marketInvalid;
}

/**
 * One-line ephemeral copy when soft-refuse invalid qty (PL103.3).
 * Complements refuse SFX; qty validation unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function invalidQtyRefuseCueText(): string {
  return INVALID_QTY_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the invalid-qty refuse ephemeral (PL103.3).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Qty cue should play.
 */
export function shouldFlashInvalidQtyRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.invalidQty;
}

/**
 * One-line ephemeral copy when soft-refuse unknown recipe (PL104.1).
 * Complements refuse SFX; recipe catalog unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function unknownRecipeRefuseCueText(): string {
  return UNKNOWN_RECIPE_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the unknown-recipe refuse ephemeral (PL104.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Recipe cue should play.
 */
export function shouldFlashUnknownRecipeRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.unknownRecipe;
}

/**
 * One-line ephemeral copy when soft-refuse needs station (PL104.2).
 * Complements refuse SFX; station requirements unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function needsStationRefuseCueText(): string {
  return NEEDS_STATION_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the needs-station refuse ephemeral (PL104.2).
 * Matches the dynamic `needsStation(station)` template.
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Station cue should play.
 */
export function shouldFlashNeedsStationRefuseCue(
  error: string | null | undefined,
): boolean {
  if (!error) return false;
  // Reason: PL104.2 — needsStation embeds station name; craft-on-land gate.
  return /^You need a .+ on your land to craft that\.$/.test(error);
}

/**
 * One-line ephemeral copy when soft-refuse needs profession XP (PL104.3).
 * Complements refuse SFX; profession XP gates unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function needsXpRefuseCueText(): string {
  return NEEDS_XP_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the needs-xp refuse ephemeral (PL104.3).
 * Matches the dynamic `needsXp(profession, need)` template.
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the XP cue should play.
 */
export function shouldFlashNeedsXpRefuseCue(
  error: string | null | undefined,
): boolean {
  if (!error) return false;
  // Reason: PL104.3 — needsXp embeds need + profession; keep practicing tail.
  return /^You need \d+ .+ XP first\. Keep practicing or specialize\.$/.test(
    error,
  );
}

/**
 * One-line ephemeral copy when soft-refuse decor pad missing (PL105.1).
 * Complements refuse SFX; decor pad rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function decorPadMissingRefuseCueText(): string {
  return DECOR_PAD_MISSING_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the decor-pad-missing refuse ephemeral (PL105.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Pad cue should play.
 */
export function shouldFlashDecorPadMissingRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.decorPadMissing;
}

/**
 * One-line ephemeral copy when soft-refuse decor starter-only (PL105.2).
 * Complements refuse SFX; decor homestead gate unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function decorStarterOnlyRefuseCueText(): string {
  return DECOR_STARTER_ONLY_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the decor-starter-only refuse ephemeral (PL105.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Home cue should play.
 */
export function shouldFlashDecorStarterOnlyRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.decorStarterOnly;
}

/**
 * One-line ephemeral copy when soft-refuse no expand slots (PL105.3).
 * Complements refuse SFX; expand slot caps unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function noExpandSlotsRefuseCueText(): string {
  return NO_EXPAND_SLOTS_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the no-expand-slots refuse ephemeral (PL105.3).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Slots cue should play.
 */
export function shouldFlashNoExpandSlotsRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.noExpandSlots;
}

/**
 * One-line ephemeral copy when soft-refuse unknown decor (PL106.1).
 * Complements refuse SFX; decor catalog unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function unknownDecorRefuseCueText(): string {
  return UNKNOWN_DECOR_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the unknown-decor refuse ephemeral (PL106.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Decor cue should play.
 */
export function shouldFlashUnknownDecorRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.unknownDecor;
}

/**
 * One-line ephemeral copy when soft-refuse decor need coins (PL106.2).
 * Complements refuse SFX; decor prices unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function decorNeedCoinsRefuseCueText(): string {
  return DECOR_NEED_COINS_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the decor-need-coins refuse ephemeral (PL106.2).
 * Matches the dynamic `needCoinsDecor(n)` template (distinct from place/upgrade `to`
 * forms and market Fee).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Coins cue should play.
 */
export function shouldFlashDecorNeedCoinsRefuseCue(
  error: string | null | undefined,
): boolean {
  if (!error) return false;
  // Reason: PL106.2 — needCoinsDecor embeds price; uses "for that decor" not "to …".
  return /^You need \d+ coins for that decor/.test(error);
}

/**
 * One-line ephemeral copy when soft-refuse unknown seed (PL107.1).
 * Complements refuse SFX; plant rules unchanged; distinct from missing-seed Seed.
 *
 * @returns Short player-facing cue text.
 */
export function unknownSeedRefuseCueText(): string {
  return UNKNOWN_SEED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the unknown-seed refuse ephemeral (PL107.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Plant cue should play.
 */
export function shouldFlashUnknownSeedRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.unknownSeed;
}

/**
 * One-line ephemeral copy when soft-refuse crop missing (PL107.2).
 * Complements refuse SFX; crop rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function cropMissingRefuseCueText(): string {
  return CROP_MISSING_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the crop-missing refuse ephemeral (PL107.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Gone cue should play.
 */
export function shouldFlashCropMissingRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.cropMissing;
}

/**
 * One-line ephemeral copy when soft-refuse item missing from inventory (PL108.1).
 * Complements refuse SFX; inventory rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function itemMissingRefuseCueText(): string {
  return ITEM_MISSING_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the item-missing refuse ephemeral (PL108.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Item cue should play.
 */
export function shouldFlashItemMissingRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.itemMissing;
}

/**
 * One-line ephemeral copy when soft-refuse unknown station build (PL108.2).
 * Complements refuse SFX; station catalog unchanged; distinct from craft Station.
 *
 * @returns Short player-facing cue text.
 */
export function unknownStationRefuseCueText(): string {
  return UNKNOWN_STATION_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the unknown-station refuse ephemeral (PL108.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Build cue should play.
 */
export function shouldFlashUnknownStationRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.unknownStation;
}

/**
 * One-line ephemeral copy when soft-refuse guild not found (PL109.1).
 * Complements refuse SFX; guild lookup unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function guildNotFoundRefuseCueText(): string {
  return GUILD_NOT_FOUND_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the guild-not-found refuse ephemeral (PL109.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Gone cue should play.
 */
export function shouldFlashGuildNotFoundRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.guildNotFound;
}

/**
 * One-line ephemeral copy when soft-refuse guild target missing (PL109.2).
 * Complements refuse SFX; guild membership rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function guildTargetMissingRefuseCueText(): string {
  return GUILD_TARGET_MISSING_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the guild-target-missing refuse ephemeral (PL109.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Member cue should play.
 */
export function shouldFlashGuildTargetMissingRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.guildTargetMissing;
}

/**
 * One-line ephemeral copy when soft-refuse guild rank invalid (PL109.3).
 * Complements refuse SFX; rank enum unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function guildRankInvalidRefuseCueText(): string {
  return GUILD_RANK_INVALID_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the guild-rank-invalid refuse ephemeral (PL109.3).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Rank cue should play.
 */
export function shouldFlashGuildRankInvalidRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.guildRankInvalid;
}

/**
 * One-line ephemeral copy when soft-refuse quest unknown (PL110.1).
 * Complements refuse SFX; quest catalog unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function questUnknownRefuseCueText(): string {
  return QUEST_UNKNOWN_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the quest-unknown refuse ephemeral (PL110.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Quest cue should play.
 */
export function shouldFlashQuestUnknownRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.questUnknown;
}

/**
 * One-line ephemeral copy when soft-refuse dynamic missingItem(name) (PL110.2).
 * Complements refuse SFX; item requirements unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function missingItemRefuseCueText(): string {
  return MISSING_ITEM_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the missing-item refuse ephemeral (PL110.2).
 * Matches `missingItem(name)` → `You need ${name}.` with capitalized item names;
 * carves out coins / mats / station / XP / login / seed You-need templates.
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Need cue should play.
 */
export function shouldFlashMissingItemRefuseCue(
  error: string | null | undefined,
): boolean {
  if (!error) return false;
  // Reason: PL110.2 — item names are Title Case; exclude "You need a/to/N …" templates.
  if (!/^You need [A-Z].+\.$/.test(error)) return false;
  if (/^You need \d+/.test(error)) return false;
  if (/^You need a .+ on your land to craft that\.$/.test(error)) return false;
  if (error === ACTION_ERROR.missingSeed) return false;
  return true;
}

/**
 * One-line ephemeral copy when soft-refuse deed missing (PL112.1).
 * Complements refuse SFX; deed rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function deedMissingRefuseCueText(): string {
  return DEED_MISSING_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the deed-missing refuse ephemeral (PL112.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Gone cue should play.
 */
export function shouldFlashDeedMissingRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.deedMissing;
}

/**
 * One-line ephemeral copy when soft-refuse deed not yours (PL112.1).
 * Complements refuse SFX; deed ownership unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function deedNotYoursRefuseCueText(): string {
  return DEED_NOT_YOURS_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the deed-not-yours refuse ephemeral (PL112.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Yours cue should play.
 */
export function shouldFlashDeedNotYoursRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.deedNotYours;
}

/**
 * One-line ephemeral copy when soft-refuse deed need mint (PL112.2).
 * Complements refuse SFX; mint gate unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function deedNeedMintRefuseCueText(): string {
  return DEED_NEED_MINT_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the deed-need-mint refuse ephemeral (PL112.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Mint cue should play.
 */
export function shouldFlashDeedNeedMintRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.deedNeedMint;
}

/**
 * One-line ephemeral copy when soft-refuse deed already minted (PL112.2).
 * Complements refuse SFX; mint state unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function deedAlreadyMintedRefuseCueText(): string {
  return DEED_ALREADY_MINTED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the deed-already-minted refuse ephemeral (PL112.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Mint cue should play.
 */
export function shouldFlashDeedAlreadyMintedRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.deedAlreadyMinted;
}

/**
 * One-line ephemeral copy when soft-refuse deed already listed (PL112.2).
 * Complements refuse SFX; list state unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function deedAlreadyListedRefuseCueText(): string {
  return DEED_ALREADY_LISTED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the deed-already-listed refuse ephemeral (PL112.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Listed cue should play.
 */
export function shouldFlashDeedAlreadyListedRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.deedAlreadyListed;
}

/**
 * One-line ephemeral copy when soft-refuse deed not listed (PL112.2).
 * Complements refuse SFX; list state unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function deedNotListedRefuseCueText(): string {
  return DEED_NOT_LISTED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the deed-not-listed refuse ephemeral (PL112.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Unlisted cue should play.
 */
export function shouldFlashDeedNotListedRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.deedNotListed;
}

/**
 * One-line ephemeral copy when soft-refuse deed bad price (PL112.3).
 * Complements refuse SFX; price bounds unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function deedBadPriceRefuseCueText(): string {
  return DEED_BAD_PRICE_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the deed-bad-price refuse ephemeral (PL112.3).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Price cue should play.
 */
export function shouldFlashDeedBadPriceRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.deedBadPrice;
}

/**
 * One-line ephemeral copy when soft-refuse deed already owned (PL112.3).
 * Complements refuse SFX; ownership rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function deedAlreadyOwnedRefuseCueText(): string {
  return DEED_ALREADY_OWNED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the deed-already-owned refuse ephemeral (PL112.3).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Owned cue should play.
 */
export function shouldFlashDeedAlreadyOwnedRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.deedAlreadyOwned;
}

/**
 * One-line ephemeral copy when soft-refuse deed need forest (PL112.3).
 * Complements refuse SFX; forest unlock unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function deedNeedForestRefuseCueText(): string {
  return DEED_NEED_FOREST_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the deed-need-forest refuse ephemeral (PL112.3).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Forest cue should play.
 */
export function shouldFlashDeedNeedForestRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.deedNeedForest;
}

/**
 * One-line ephemeral copy when soft-refuse wallet already linked (PL113.1).
 * Complements refuse SFX; wallet rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function walletAlreadyLinkedRefuseCueText(): string {
  return WALLET_ALREADY_LINKED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the wallet-already-linked refuse ephemeral (PL113.1).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Linked cue should play.
 */
export function shouldFlashWalletAlreadyLinkedRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.walletAlreadyLinked;
}

/**
 * One-line ephemeral copy when soft-refuse wallet not linked (PL113.2).
 * Complements refuse SFX; disconnect rules unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function walletNotLinkedRefuseCueText(): string {
  return WALLET_NOT_LINKED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the wallet-not-linked refuse ephemeral (PL113.2).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Wallet cue should play.
 */
export function shouldFlashWalletNotLinkedRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.walletNotLinked;
}

/**
 * One-line ephemeral copy when soft-refuse tool already repaired (PL73.3).
 * Complements refuse SFX; repair rules / costs unchanged.
 *
 * @returns Short player-facing cue text.
 */
export function toolAlreadyRepairedRefuseCueText(): string {
  return TOOL_ALREADY_REPAIRED_REFUSE_CUE;
}

/**
 * Whether a failed action should flash the tool-already-repaired refuse ephemeral (PL73.3).
 *
 * @param error - Player-facing ACTION_ERROR string from an API failure.
 * @returns True when the Intact cue should play.
 */
export function shouldFlashToolAlreadyRepairedRefuseCue(
  error: string | null | undefined,
): boolean {
  return error === ACTION_ERROR.toolAlreadyRepaired;
}

/**
 * Whether applyState should flash the energy-low threshold cue (PL41.1).
 * True only on the edge into the low band (meter already warns while staying low).
 *
 * @param prevEnergy - Energy before the action (null skips — no prior snapshot).
 * @param prevMaxEnergy - Max energy before the action.
 * @param nextEnergy - Energy after the action.
 * @param nextMaxEnergy - Max energy after the action.
 * @returns True when the cue should play.
 */
export function shouldFlashEnergyLowCue(
  prevEnergy: number | null | undefined,
  prevMaxEnergy: number | null | undefined,
  nextEnergy: number,
  nextMaxEnergy: number,
): boolean {
  if (prevEnergy == null || prevMaxEnergy == null) return false;
  if (!Number.isFinite(prevEnergy) || !Number.isFinite(prevMaxEnergy)) {
    return false;
  }
  if (!Number.isFinite(nextEnergy) || !Number.isFinite(nextMaxEnergy)) {
    return false;
  }
  if (prevMaxEnergy <= 0 || nextMaxEnergy <= 0) return false;
  return (
    !isEnergyLow(prevEnergy, prevMaxEnergy) &&
    isEnergyLow(nextEnergy, nextMaxEnergy)
  );
}

/**
 * Whether applyState should flash the health-low threshold cue (PL64.1).
 * True only on the edge into the low band (TopBar accent PL67.1 warns while staying low).
 *
 * @param prevHealth - Health before the action (null skips — no prior snapshot).
 * @param prevMaxHealth - Max health before the action.
 * @param nextHealth - Health after the action.
 * @param nextMaxHealth - Max health after the action.
 * @returns True when the cue should play.
 */
export function shouldFlashHealthLowCue(
  prevHealth: number | null | undefined,
  prevMaxHealth: number | null | undefined,
  nextHealth: number,
  nextMaxHealth: number,
): boolean {
  if (prevHealth == null || prevMaxHealth == null) return false;
  if (!Number.isFinite(prevHealth) || !Number.isFinite(prevMaxHealth)) {
    return false;
  }
  if (!Number.isFinite(nextHealth) || !Number.isFinite(nextMaxHealth)) {
    return false;
  }
  if (prevMaxHealth <= 0 || nextMaxHealth <= 0) return false;
  return (
    !isHealthLow(prevHealth, prevMaxHealth) &&
    isHealthLow(nextHealth, nextMaxHealth)
  );
}

/**
 * Whether applyState should flash the tool-durability-low threshold cue (PL61.1).
 * True only on the edge into the low band for the same equipped stack
 * (meter accent already warns while staying low; swap/equip stays quiet).
 *
 * @param prevEquippedId - Equipped inventory id before the action.
 * @param prevDurability - Remaining durability before the action.
 * @param prevMaxDurability - Catalog max before the action.
 * @param nextEquippedId - Equipped inventory id after the action.
 * @param nextDurability - Remaining durability after the action.
 * @param nextMaxDurability - Catalog max after the action.
 * @returns True when the cue should play.
 */
export function shouldFlashToolDurabilityLowCue(
  prevEquippedId: string | null | undefined,
  prevDurability: number | null | undefined,
  prevMaxDurability: number | null | undefined,
  nextEquippedId: string | null | undefined,
  nextDurability: number | null | undefined,
  nextMaxDurability: number | null | undefined,
): boolean {
  if (!prevEquippedId || !nextEquippedId) return false;
  if (prevEquippedId !== nextEquippedId) return false;
  if (prevDurability == null || prevMaxDurability == null) return false;
  if (nextDurability == null || nextMaxDurability == null) return false;
  if (!Number.isFinite(prevDurability) || !Number.isFinite(prevMaxDurability)) {
    return false;
  }
  if (!Number.isFinite(nextDurability) || !Number.isFinite(nextMaxDurability)) {
    return false;
  }
  if (prevMaxDurability <= 0 || nextMaxDurability <= 0) return false;
  return (
    !isToolDurabilityLow(prevDurability, prevMaxDurability) &&
    isToolDurabilityLow(nextDurability, nextMaxDurability)
  );
}

/**
 * Convenience: edge-detect tool-low between two player-state snapshots (PL61.1).
 *
 * @param prev - State before the action (null skips — hydrate).
 * @param next - State after the action.
 * @returns True when the Tool low cue should play.
 */
export function shouldFlashToolDurabilityLowBetweenStates(
  prev:
    | {
        inventory: ReadonlyArray<{
          id: string;
          itemId: string;
          durability: number | null;
        }>;
        equippedToolInventoryId: string | null;
      }
    | null
    | undefined,
  next: {
    inventory: ReadonlyArray<{
      id: string;
      itemId: string;
      durability: number | null;
    }>;
    equippedToolInventoryId: string | null;
  },
): boolean {
  if (!prev) return false;
  const before = equippedToolDurabilitySnapshot(
    prev.inventory,
    prev.equippedToolInventoryId,
  );
  const after = equippedToolDurabilitySnapshot(
    next.inventory,
    next.equippedToolInventoryId,
  );
  return shouldFlashToolDurabilityLowCue(
    before.inventoryId,
    before.durability,
    before.maxDurability,
    after.inventoryId,
    after.durability,
    after.maxDurability,
  );
}

/**
 * One-line ephemeral copy when characterLevel increases (PL47.1).
 * XP curve stays server-side — cue is confirm only; TopBar Lv readout stays.
 *
 * @param level - New character level after the action.
 * @returns Short cue, or null when level is not a valid increase display.
 */
export function characterLevelUpCueText(
  level: number | null | undefined,
): string | null {
  if (level == null || !Number.isFinite(level) || level < 2) return null;
  return `${LEVEL_UP_SUCCESS_CUE_PREFIX}${Math.floor(level)}`;
}

/**
 * Whether applyState should flash the character level-up cue (PL47.1).
 * True only when level rises vs a prior snapshot (login hydrate skips).
 *
 * @param prevLevel - Character level before the action (null skips).
 * @param nextLevel - Character level after the action.
 * @returns True when the cue should play.
 */
export function shouldFlashCharacterLevelUpCue(
  prevLevel: number | null | undefined,
  nextLevel: number,
): boolean {
  if (prevLevel == null || !Number.isFinite(prevLevel)) return false;
  if (!Number.isFinite(nextLevel)) return false;
  return nextLevel > prevLevel;
}

/**
 * One-line ephemeral copy when cosmetic character title changes (PL49.1).
 * Titles stay cosmetic — cue is confirm only; no combat power / HUD column.
 *
 * @param title - New title after the level threshold (Settler / Homesteader / Veteran).
 * @returns Short cue, or null when title is empty.
 */
export function characterTitleChangeCueText(
  title: string | null | undefined,
): string | null {
  const cleaned = typeof title === "string" ? title.trim() : "";
  if (!cleaned) return null;
  return `${TITLE_CHANGE_SUCCESS_CUE_PREFIX}${cleaned}`;
}

/**
 * Whether applyState should flash the title-change cue (PL49.1).
 * True only when title string changes vs a prior snapshot (login hydrate skips).
 *
 * @param prevTitle - Title before the action (null skips).
 * @param nextTitle - Title after the action.
 * @returns True when the cue should play.
 */
export function shouldFlashCharacterTitleChangeCue(
  prevTitle: string | null | undefined,
  nextTitle: string | null | undefined,
): boolean {
  if (prevTitle == null || nextTitle == null) return false;
  const prev = prevTitle.trim();
  const next = nextTitle.trim();
  if (!prev || !next) return false;
  return prev !== next;
}

/**
 * One-line ephemeral when the soft extra decor pad unlocks (PL49.2).
 * Unlock level / pad slot stay server-side — cue is tip only; no HUD column.
 *
 * @returns Short player-facing cue text.
 */
export function extraDecorPadUnlockCueText(): string {
  return EXTRA_DECOR_PAD_UNLOCK_CUE;
}

/**
 * Combined TopBar copy when title change and decor-pad unlock share a tick (L5).
 * Keeps both PL49.1 title name and PL49.2 pad tip visible in one ephemeral.
 *
 * @param title - New cosmetic title (Homesteader at unlock).
 * @returns Short combined cue, or decor-only fallback when title is empty.
 */
export function titleWithDecorPadUnlockCueText(
  title: string | null | undefined,
): string {
  const cleaned = typeof title === "string" ? title.trim() : "";
  if (!cleaned) return EXTRA_DECOR_PAD_UNLOCK_CUE;
  return `${cleaned}${TITLE_DECOR_PAD_UNLOCK_CUE_SUFFIX}`;
}

/**
 * Whether applyState should flash the extra decor pad unlock tip (PL49.2).
 * True only on the edge into unlocked (login hydrate with null prev skips).
 *
 * @param prevUnlocked - Whether the pad was already unlocked before.
 * @param nextUnlocked - Whether the pad is unlocked after.
 * @returns True when the cue should play.
 */
export function shouldFlashExtraDecorPadUnlockCue(
  prevUnlocked: boolean | null | undefined,
  nextUnlocked: boolean,
): boolean {
  if (prevUnlocked == null) return false;
  return prevUnlocked === false && nextUnlocked === true;
}

/**
 * One-line ephemeral copy when an achievement flips unlocked (PL47.2).
 * Unlock rules stay server-side — cue is confirm only; A list still works.
 *
 * @param title - Achievement title from the unlocked row.
 * @returns Short player-facing cue text.
 */
export function achievementUnlockSuccessCueText(
  title: string | null | undefined,
): string {
  const cleaned = typeof title === "string" ? title.trim() : "";
  if (!cleaned) return ACHIEVEMENT_UNLOCK_SUCCESS_CUE;
  return `${ACHIEVEMENT_UNLOCK_SUCCESS_CUE_PREFIX}${cleaned}`;
}

export interface AchievementUnlockCueRow {
  id: string;
  title: string;
  unlocked: boolean;
}

/**
 * Titles of achievements that flipped locked → unlocked (PL47.2).
 * Null/undefined prev means not yet hydrated — no flash on first load.
 *
 * @param prev - Previous achievement rows (null = hydrate).
 * @param next - Fresh achievement rows from the API.
 * @returns Newly unlocked titles in list order (may be empty).
 */
export function newlyUnlockedAchievementTitles(
  prev: AchievementUnlockCueRow[] | null | undefined,
  next: AchievementUnlockCueRow[],
): string[] {
  if (prev == null) return [];
  const prevUnlocked = new Set(
    prev.filter((a) => a.unlocked).map((a) => a.id),
  );
  return next
    .filter((a) => a.unlocked && !prevUnlocked.has(a.id))
    .map((a) => a.title);
}

/**
 * One-line ephemeral copy when collecting from a held guild claim (PL31.2).
 * Yield rules stay server-side — cue is confirm only.
 *
 * @param qty - Collected amount from the claim response.
 * @returns Short cue, or null when qty is not a positive number.
 */
export function guildCollectSuccessCueText(
  qty: number | null | undefined,
): string | null {
  if (qty == null || !Number.isFinite(qty) || qty <= 0) return null;
  return `${GUILD_COLLECT_SUCCESS_CUE_PREFIX}${Math.floor(qty)}`;
}

/**
 * One-line ephemeral copy when delivering wood in a soft war (PL31.2 path).
 * Scoring rules stay server-side — cue is confirm only.
 *
 * @param qty - Delivered wood amount from the claim response.
 * @returns Short cue, or null when qty is not a positive number.
 */
export function guildDeliverSuccessCueText(
  qty: number | null | undefined,
): string | null {
  if (qty == null || !Number.isFinite(qty) || qty <= 0) return null;
  return `${GUILD_DELIVER_SUCCESS_CUE_PREFIX}${Math.floor(qty)}`;
}

/**
 * Whether an info line is an ephemeral success cue (safe to style/clear).
 *
 * @param text - Current TopBar info string.
 * @returns True when text matches a known ephemeral success cue.
 */
export function isCoreSuccessCueText(text: string | null | undefined): boolean {
  if (!text) return false;
  return (
    isActionLootCueLine(text) ||
    text === "Planted" ||
    text === "Harvested" ||
    text === "Crafted" ||
    text === "Arrived" ||
    text.startsWith("Arrived · ") ||
    text === "Listed" ||
    text === "Bought" ||
    text === "Cancelled" ||
    text === TUTOR_CLAIM_SUCCESS_CUE ||
    text === QUEST_CLAIM_SUCCESS_CUE ||
    text.startsWith(VISIT_SUCCESS_CUE_PREFIX) ||
    text === VISIT_LEAVE_SUCCESS_CUE ||
    text === DECOR_PLACE_SUCCESS_CUE ||
    text === MAIL_CLAIM_SUCCESS_CUE ||
    text === MAIL_SEND_SUCCESS_CUE ||
    text === MAIL_CANCEL_SUCCESS_CUE ||
    text.startsWith(TRADE_INVITE_RECEIVE_CUE_PREFIX) ||
    text.startsWith(TRADE_OFFER_SENT_CUE_PREFIX) ||
    text === TRADE_ACCEPT_SUCCESS_CUE ||
    text === TRADE_CANCEL_SUCCESS_CUE ||
    text === EAT_FOOD_SUCCESS_CUE ||
    text === EQUIP_TOOL_SUCCESS_CUE ||
    text === UNEQUIP_TOOL_SUCCESS_CUE ||
    text === EXPAND_FIELD_SUCCESS_CUE ||
    text === REPAIR_TOOL_SUCCESS_CUE ||
    text === HOMESTEAD_FIRST_PLACE_SUCCESS_CUE ||
    text === STATION_BUILT_SUCCESS_CUE ||
    text === CHAT_RECEIVE_SUCCESS_CUE ||
    text === CHAT_SEND_SUCCESS_CUE ||
    text === GUILD_CLAIM_SUCCESS_CUE ||
    text === SOFT_WAR_START_SUCCESS_CUE ||
    text.startsWith(GUILD_COLLECT_SUCCESS_CUE_PREFIX) ||
    text.startsWith(GUILD_DELIVER_SUCCESS_CUE_PREFIX) ||
    text === TOOL_BROKE_SUCCESS_CUE ||
    text === HUNT_WIN_SUCCESS_CUE ||
    text.startsWith(HUNT_WIN_SUCCESS_CUE_PREFIX) ||
    text === HUNT_LOSE_SUCCESS_CUE ||
    text.startsWith(HUNT_LOSE_SUCCESS_CUE_PREFIX) ||
    text === DEED_CLAIM_SUCCESS_CUE ||
    text === DEED_MINT_SUCCESS_CUE ||
    text === DEED_LIST_SUCCESS_CUE ||
    text === DEED_UNLIST_SUCCESS_CUE ||
    text === WALLET_LINK_SUCCESS_CUE ||
    text === WALLET_DISCONNECT_SUCCESS_CUE ||
    text === MUTE_ON_SUCCESS_CUE ||
    text === MUTE_OFF_SUCCESS_CUE ||
    text === ENERGY_LOW_SUCCESS_CUE ||
    text === HEALTH_LOW_SUCCESS_CUE ||
    text === TOOL_DURABILITY_LOW_SUCCESS_CUE ||
    text === BUSY_STATION_REFUSE_CUE ||
    text === FIRST_PORTAL_WALKUP_CUE ||
    text === FIRST_EXPLORE_WALKUP_CUE ||
    text === FIRST_ARENA_WALKUP_CUE ||
    text === FIRST_EMPTY_LAND_BUILD_BOARD_CUE ||
    text === FIRST_VISIT_LAND_CUE ||
    text === FIRST_WARRIOR_MAP_CUE ||
    text === FIRST_CITY_HUB_CUE ||
    text === FIRST_MARKET_WALKUP_CUE ||
    text === FIRST_VENDOR_WALKUP_CUE ||
    text === FIRST_FISHING_DOCK_WALKUP_CUE ||
    text === FIRST_ANIMAL_PEN_WALKUP_CUE ||
    text === FIRST_TREE_STUMP_WALKUP_CUE ||
    text === FIRST_ORE_NODE_WALKUP_CUE ||
    text === FIRST_CROP_PLOT_WALKUP_CUE ||
    text === FIRST_HUNT_TRAIL_WALKUP_CUE ||
    text === FIRST_KITCHEN_WALKUP_CUE ||
    text === FIRST_NOTICE_BOARD_WALKUP_CUE ||
    text === FIRST_EXPAND_PAD_WALKUP_CUE ||
    text === FIRST_MILL_WALKUP_CUE ||
    text === FIRST_WORKSHOP_WALKUP_CUE ||
    text === FIRST_FORGE_WALKUP_CUE ||
    text === FIRST_LOOM_WALKUP_CUE ||
    text === FIRST_ALCHEMY_BENCH_WALKUP_CUE ||
    text === FIRST_DECOR_PAD_WALKUP_CUE ||
    text === FIRST_TUTOR_WALKUP_CUE ||
    text === FIRST_CLAIM_NODE_WALKUP_CUE ||
    text === DAY_PHASE_DAWN_CUE ||
    text === DAY_PHASE_DUSK_CUE ||
    text === DAY_PHASE_NIGHT_CUE ||
    text === TOO_FAR_REFUSE_CUE ||
    text === COINS_REFUSE_CUE ||
    text === MATERIALS_REFUSE_CUE ||
    text === HAMMER_REFUSE_CUE ||
    text === CROP_NOT_READY_REFUSE_CUE ||
    text === PLOT_OCCUPIED_REFUSE_CUE ||
    text === CROP_READY_EDGE_CUE ||
    text === ORE_COOLDOWN_REFUSE_CUE ||
    text === WOOD_STUMP_COOLDOWN_REFUSE_CUE ||
    text === FISHING_DOCK_COOLDOWN_REFUSE_CUE ||
    text === ANIMAL_PEN_COOLDOWN_REFUSE_CUE ||
    text === HUNT_COOLDOWN_REFUSE_CUE ||
    text === MISSING_SEED_REFUSE_CUE ||
    text === NO_BREAD_REFUSE_CUE ||
    text === NO_FOOD_REFUSE_CUE ||
    text === BUILD_BOARD_MISSING_REFUSE_CUE ||
    text === BUILD_CELL_OCCUPIED_REFUSE_CUE ||
    text === TOOL_ALREADY_REPAIRED_REFUSE_CUE ||
    text === DECOR_ALREADY_PLACED_REFUSE_CUE ||
    text === QUEST_NOT_READY_REFUSE_CUE ||
    text === QUEST_LOCKED_REFUSE_CUE ||
    text === QUEST_ALREADY_CLAIMED_REFUSE_CUE ||
    text === VENDOR_WONT_BUY_REFUSE_CUE ||
    text === VENDOR_WONT_SELL_REFUSE_CUE ||
    text === CLAIM_NEED_GUILD_REFUSE_CUE ||
    text === CLAIM_HELD_BY_OTHER_REFUSE_CUE ||
    text === CLAIM_NOTHING_STORED_REFUSE_CUE ||
    text === CLAIM_WAR_ALREADY_OPEN_REFUSE_CUE ||
    text === CLAIM_WAR_NEED_MATS_REFUSE_CUE ||
    text === CLAIM_WAR_NOT_OPEN_REFUSE_CUE ||
    text === MARKET_OWN_LISTING_REFUSE_CUE ||
    text === MARKET_EXPIRED_REFUSE_CUE ||
    text === MAIL_SELF_REFUSE_CUE ||
    text === MAIL_INBOX_FULL_REFUSE_CUE ||
    text === TRAVEL_IN_PROGRESS_REFUSE_CUE ||
    text === TRADE_SELF_REFUSE_CUE ||
    text === TRADE_EMPTY_REFUSE_CUE ||
    text === TRADE_PLAYER_MISSING_REFUSE_CUE ||
    text === GUILD_ALREADY_IN_REFUSE_CUE ||
    text === GUILD_NOT_IN_REFUSE_CUE ||
    text === GUILD_EXISTS_REFUSE_CUE ||
    text === CLAIM_WAR_NEED_GUILD_REFUSE_CUE ||
    text === BUILD_PLAYER_LAND_ONLY_REFUSE_CUE ||
    text === ALREADY_UPGRADED_REFUSE_CUE ||
    text === CANNOT_UPGRADE_BUILDING_REFUSE_CUE ||
    text === TRAVEL_NEED_COINS_REFUSE_CUE ||
    text === TRADE_NOT_FOUND_REFUSE_CUE ||
    text === TRADE_NOT_YOURS_REFUSE_CUE ||
    text === TRADE_ONLY_RECIPIENT_REFUSE_CUE ||
    text === TRADE_BROKE_REFUSE_CUE ||
    text === TRADE_MISSING_ITEMS_REFUSE_CUE ||
    text === MAIL_EMPTY_REFUSE_CUE ||
    text === MAIL_PLAYER_MISSING_REFUSE_CUE ||
    text === MAIL_ALREADY_CLAIMED_REFUSE_CUE ||
    text === MARKET_NOT_FOUND_REFUSE_CUE ||
    text === MARKET_NOT_YOURS_REFUSE_CUE ||
    text === GUILD_INVITE_INVALID_REFUSE_CUE ||
    text === GUILD_NAME_INVALID_REFUSE_CUE ||
    text === MAIL_NOT_FOUND_REFUSE_CUE ||
    text === MAIL_ONLY_RECIPIENT_REFUSE_CUE ||
    text === MAIL_ONLY_SENDER_REFUSE_CUE ||
    text === MARKET_NEED_FEE_REFUSE_CUE ||
    text === MARKET_NOT_STACKABLE_REFUSE_CUE ||
    text === GUILD_BANK_FULL_REFUSE_CUE ||
    text === GUILD_BANK_EMPTY_REFUSE_CUE ||
    text === GUILD_RANK_FORBIDDEN_REFUSE_CUE ||
    text === HUNT_EXPLORE_ONLY_REFUSE_CUE ||
    text === WARRIOR_HOMESTEAD_FORBIDDEN_REFUSE_CUE ||
    text === NEED_MATS_REPAIR_REFUSE_CUE ||
    text === NOT_A_TOOL_REFUSE_CUE ||
    text === GATHER_NODE_MISSING_REFUSE_CUE ||
    text === PLOT_MISSING_REFUSE_CUE ||
    text === HUNT_OR_CLAIM_MISSING_REFUSE_CUE ||
    text === GUILD_BANK_NOT_STACKABLE_REFUSE_CUE ||
    text === GUILD_BANK_UNKNOWN_ITEM_REFUSE_CUE ||
    text === GUILD_BANK_BAD_QTY_REFUSE_CUE ||
    text === MAIL_NOT_STACKABLE_REFUSE_CUE ||
    text === MARKET_INVALID_REFUSE_CUE ||
    text === INVALID_QTY_REFUSE_CUE ||
    text === UNKNOWN_RECIPE_REFUSE_CUE ||
    text === NEEDS_STATION_REFUSE_CUE ||
    text === NEEDS_XP_REFUSE_CUE ||
    text === DECOR_PAD_MISSING_REFUSE_CUE ||
    text === DECOR_STARTER_ONLY_REFUSE_CUE ||
    text === NO_EXPAND_SLOTS_REFUSE_CUE ||
    text === UNKNOWN_DECOR_REFUSE_CUE ||
    text === DECOR_NEED_COINS_REFUSE_CUE ||
    text === UNKNOWN_SEED_REFUSE_CUE ||
    text === CROP_MISSING_REFUSE_CUE ||
    text === ITEM_MISSING_REFUSE_CUE ||
    text === UNKNOWN_STATION_REFUSE_CUE ||
    text === GUILD_NOT_FOUND_REFUSE_CUE ||
    text === GUILD_TARGET_MISSING_REFUSE_CUE ||
    text === GUILD_RANK_INVALID_REFUSE_CUE ||
    text === QUEST_UNKNOWN_REFUSE_CUE ||
    text === MISSING_ITEM_REFUSE_CUE ||
    text === DEED_MISSING_REFUSE_CUE ||
    text === DEED_NOT_YOURS_REFUSE_CUE ||
    text === DEED_NEED_MINT_REFUSE_CUE ||
    text === DEED_ALREADY_MINTED_REFUSE_CUE ||
    text === DEED_ALREADY_LISTED_REFUSE_CUE ||
    text === DEED_NOT_LISTED_REFUSE_CUE ||
    text === DEED_BAD_PRICE_REFUSE_CUE ||
    text === DEED_ALREADY_OWNED_REFUSE_CUE ||
    text === DEED_NEED_FOREST_REFUSE_CUE ||
    text === WALLET_ALREADY_LINKED_REFUSE_CUE ||
    text === WALLET_NOT_LINKED_REFUSE_CUE ||
    text === TUTOR_CLAIM_READY_EDGE_CUE ||
    text === GATHER_CHOP_SUCCESS_CUE ||
    text === GATHER_MINE_SUCCESS_CUE ||
    text === GATHER_FISH_SUCCESS_CUE ||
    text === GATHER_PEN_SUCCESS_CUE ||
    text === GATHER_SUCCESS_CUE ||
    text === VENDOR_SELL_SUCCESS_CUE ||
    text === VENDOR_BUY_SUCCESS_CUE ||
    text === ENERGY_REFUSE_CUE ||
    text === TRAVEL_ALREADY_HERE_CUE ||
    text === LEVEL_UP_SUCCESS_CUE ||
    /^Level \d+$/.test(text) ||
    text === TITLE_CHANGE_SUCCESS_CUE ||
    (text.startsWith(TITLE_CHANGE_SUCCESS_CUE_PREFIX) &&
      !text.slice(TITLE_CHANGE_SUCCESS_CUE_PREFIX.length).includes(" · ")) ||
    text === EXTRA_DECOR_PAD_UNLOCK_CUE ||
    text.endsWith(TITLE_DECOR_PAD_UNLOCK_CUE_SUFFIX) ||
    text === ACHIEVEMENT_UNLOCK_SUCCESS_CUE ||
    (text.startsWith(ACHIEVEMENT_UNLOCK_SUCCESS_CUE_PREFIX) &&
      !text.slice(ACHIEVEMENT_UNLOCK_SUCCESS_CUE_PREFIX.length).includes(" · ")) ||
    text === STATION_UPGRADE_SUCCESS_CUE ||
    text === GUILD_BANK_DEPOSIT_SUCCESS_CUE ||
    text === GUILD_BANK_WITHDRAW_SUCCESS_CUE ||
    text === GUILD_CREATE_SUCCESS_CUE ||
    text === GUILD_JOIN_SUCCESS_CUE ||
    text === GUILD_LEAVE_SUCCESS_CUE ||
    text === GUILD_INVITE_REFRESH_SUCCESS_CUE ||
    text === GUILD_RANK_CHANGE_SUCCESS_CUE
  );
}
