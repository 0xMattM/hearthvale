import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at").notNull(),
  /** Optional stub wallet (F15.1). Never grants combat power. */
  walletAddress: text("wallet_address"),
});

export const sessions = sqliteTable("sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at").notNull(),
});

export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  softCurrency: integer("soft_currency").notNull().default(0),
  energy: integer("energy").notNull().default(100),
  maxEnergy: integer("max_energy").notNull().default(100),
  energyUpdatedAt: integer("energy_updated_at").notNull(),
  characterXp: integer("character_xp").notNull().default(0),
  farmerXp: integer("farmer_xp").notNull().default(0),
  blacksmithXp: integer("blacksmith_xp").notNull().default(0),
  cookXp: integer("cook_xp").notNull().default(0),
  hunterXp: integer("hunter_xp").notNull().default(0),
  animalHunterXp: integer("animal_hunter_xp").notNull().default(0),
  monsterHunterXp: integer("monster_hunter_xp").notNull().default(0),
  carpenterXp: integer("carpenter_xp").notNull().default(0),
  weaverXp: integer("weaver_xp").notNull().default(0),
  foresterXp: integer("forester_xp").notNull().default(0),
  minerXp: integer("miner_xp").notNull().default(0),
  builderXp: integer("builder_xp").notNull().default(0),
  fisherXp: integer("fisher_xp").notNull().default(0),
  animalBreederXp: integer("animal_breeder_xp").notNull().default(0),
  alchemistXp: integer("alchemist_xp").notNull().default(0),
  guildId: text("guild_id"),
  /** owner | officer | member when guild_id set (F12.1). */
  guildRank: text("guild_rank"),
  health: integer("health").notNull().default(100),
  maxHealth: integer("max_health").notNull().default(100),
  healthUpdatedAt: integer("health_updated_at").notNull().default(0),
  damage: integer("damage").notNull().default(10),
  defense: integer("defense").notNull().default(5),
  equippedToolInventoryId: text("equipped_tool_inventory_id"),
  equippedWeaponInventoryId: text("equipped_weapon_inventory_id"),
  equippedArmorInventoryId: text("equipped_armor_inventory_id"),
  equippedShieldInventoryId: text("equipped_shield_inventory_id"),
  activeLandId: text("active_land_id"),
  travelDestinationKind: text("travel_destination_kind"),
  travelArriveAt: integer("travel_arrive_at"),
});

export const guilds = sqliteTable("guilds", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  ownerPlayerId: text("owner_player_id")
    .notNull()
    .references(() => players.id),
  /** Join key shared by owner/officers (F12.1). */
  inviteCode: text("invite_code"),
  createdAt: integer("created_at").notNull(),
});

export const lands = sqliteTable("lands", {
  id: text("id").primaryKey(),
  playerId: text("player_id")
    .notNull()
    .references(() => players.id),
  kind: text("kind").notNull().default("player_land"),
  buildSlots: integer("build_slots").notNull().default(8),
  /** Creditcoin LandNFT token id; null on the free starter homestead. */
  nftTokenId: text("nft_token_id"),
});

export const buildings = sqliteTable("buildings", {
  id: text("id").primaryKey(),
  landId: text("land_id")
    .notNull()
    .references(() => lands.id),
  type: text("type").notNull(),
  slotIndex: integer("slot_index").notNull(),
  x: integer("x").notNull(),
  z: integer("z").notNull(),
  tier: integer("tier").notNull().default(1),
  cropId: text("crop_id"),
  plantedAt: integer("planted_at"),
  readyAt: integer("ready_at"),
});

/** Process-station craft jobs — start spends mats; collect grants output (schema v31). */
export const craftJobs = sqliteTable("craft_jobs", {
  id: text("id").primaryKey(),
  playerId: text("player_id")
    .notNull()
    .references(() => players.id),
  buildingId: text("building_id")
    .notNull()
    .references(() => buildings.id),
  landId: text("land_id")
    .notNull()
    .references(() => lands.id),
  recipeId: text("recipe_id").notNull(),
  startedAt: integer("started_at").notNull(),
  readyAt: integer("ready_at").notNull(),
});

export const inventory = sqliteTable("inventory", {
  id: text("id").primaryKey(),
  playerId: text("player_id")
    .notNull()
    .references(() => players.id),
  itemId: text("item_id").notNull(),
  qty: integer("qty").notNull(),
  durability: integer("durability"),
});

export const trades = sqliteTable("trades", {
  id: text("id").primaryKey(),
  fromPlayerId: text("from_player_id")
    .notNull()
    .references(() => players.id),
  toPlayerId: text("to_player_id")
    .notNull()
    .references(() => players.id),
  status: text("status").notNull().default("pending"),
  giveJson: text("give_json").notNull(),
  wantJson: text("want_json").notNull(),
  giveCoins: integer("give_coins").notNull().default(0),
  wantCoins: integer("want_coins").notNull().default(0),
  createdAt: integer("created_at").notNull(),
});

/** Open market board listings (stackable goods for coins). */
export const marketListings = sqliteTable("market_listings", {
  id: text("id").primaryKey(),
  sellerPlayerId: text("seller_player_id")
    .notNull()
    .references(() => players.id),
  itemId: text("item_id").notNull(),
  qty: integer("qty").notNull(),
  priceCoins: integer("price_coins").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: integer("created_at").notNull(),
});

/** Shared guild vault stacks (F12.2) — stackables only. */
export const guildBank = sqliteTable("guild_bank", {
  id: text("id").primaryKey(),
  guildId: text("guild_id")
    .notNull()
    .references(() => guilds.id),
  itemId: text("item_id").notNull(),
  qty: integer("qty").notNull(),
});

/** Neutral claim nodes (F12.3) — shared world territory points. */
export const claimNodes = sqliteTable("claim_nodes", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  produceItemId: text("produce_item_id").notNull(),
  claimedGuildId: text("claimed_guild_id"),
  claimedAt: integer("claimed_at"),
  lastProduceAt: integer("last_produce_at"),
  storedQty: integer("stored_qty").notNull().default(0),
  /** Soft war end epoch ms (F12.4). */
  contestEndsAt: integer("contest_ends_at"),
});

/** Per-guild soft-war scores for a claim node (F12.4). */
export const claimContestScores = sqliteTable("claim_contest_scores", {
  id: text("id").primaryKey(),
  claimNodeId: text("claim_node_id")
    .notNull()
    .references(() => claimNodes.id),
  guildId: text("guild_id")
    .notNull()
    .references(() => guilds.id),
  score: integer("score").notNull().default(0),
});

/** Claimed starter quest rewards (F13.2). */
export const questClaims = sqliteTable("quest_claims", {
  playerId: text("player_id")
    .notNull()
    .references(() => players.id),
  questId: text("quest_id").notNull(),
  claimedAt: integer("claimed_at").notNull(),
});

/** Achievement counter stubs (F13.3). */
export const achievementProgress = sqliteTable("achievement_progress", {
  playerId: text("player_id")
    .notNull()
    .references(() => players.id),
  achievementId: text("achievement_id").notNull(),
  counter: integer("counter").notNull().default(0),
  unlockedAt: integer("unlocked_at"),
});

/** Offline mail parcels (F13.4) — claim when online. */
export const mail = sqliteTable("mail", {
  id: text("id").primaryKey(),
  fromPlayerId: text("from_player_id")
    .notNull()
    .references(() => players.id),
  toPlayerId: text("to_player_id")
    .notNull()
    .references(() => players.id),
  subject: text("subject").notNull(),
  itemsJson: text("items_json").notNull(),
  coins: integer("coins").notNull().default(0),
  status: text("status").notNull().default("pending"),
  createdAt: integer("created_at").notNull(),
});

/** Off-chain premium land deeds (F15.2–F15.3) — no combat power. */
export const landDeeds = sqliteTable("land_deeds", {
  id: text("id").primaryKey(),
  playerId: text("player_id")
    .notNull()
    .references(() => players.id),
  landId: text("land_id")
    .notNull()
    .references(() => lands.id),
  title: text("title").notNull(),
  createdAt: integer("created_at").notNull(),
  /** held | listed */
  status: text("status").notNull().default("held"),
  listPriceCoins: integer("list_price_coins"),
  mintTxStub: text("mint_tx_stub"),
});

/** Coin → REALM swaps via Attestcoin (schema v32). */
export const coinSwaps = sqliteTable("coin_swaps", {
  id: text("id").primaryKey(),
  playerId: text("player_id")
    .notNull()
    .references(() => players.id),
  walletAddress: text("wallet_address").notNull(),
  coinsBurned: integer("coins_burned").notNull(),
  realmAmount: text("realm_amount").notNull(),
  nonce: text("nonce").notNull().unique(),
  status: text("status").notNull().default("pending"),
  sepoliaTxHash: text("sepolia_tx_hash"),
  creditcoinTxHash: text("creditcoin_tx_hash"),
  createdAt: integer("created_at").notNull(),
});

/** REALM-priced item listings (escrow in-game, pay on Creditcoin). */
export const tokenItemListings = sqliteTable("token_item_listings", {
  id: text("id").primaryKey(),
  sellerPlayerId: text("seller_player_id")
    .notNull()
    .references(() => players.id),
  itemId: text("item_id").notNull(),
  qty: integer("qty").notNull(),
  priceRealm: text("price_realm").notNull(),
  onchainListingId: text("onchain_listing_id"),
  status: text("status").notNull().default("escrowed"),
  createdAt: integer("created_at").notNull(),
});

/** Local-dev REALM ledger when Attestcoin contracts are not configured. */
export const realmBalances = sqliteTable("realm_balances", {
  playerId: text("player_id")
    .primaryKey()
    .references(() => players.id),
  amountWei: text("amount_wei").notNull().default("0"),
});

export const localLands = sqliteTable("local_lands", {
  id: text("id").primaryKey(),
  playerId: text("player_id")
    .notNull()
    .references(() => players.id),
  biome: text("biome").notNull(),
  size: text("size").notNull(),
  createdAt: integer("created_at").notNull(),
});
