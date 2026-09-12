import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveDbDriver } from "./driver.js";
import * as schema from "./schema.sqlite.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const useSqlite = resolveDbDriver() === "sqlite";

let sqlite: Database.Database;
let db: BetterSQLite3Database<typeof schema>;

if (useSqlite) {
  const dataDir = path.resolve(__dirname, "../../data");
  fs.mkdirSync(dataDir, { recursive: true });
  const dbPath =
    process.env.GAME_DB_PATH === ":memory:"
      ? ":memory:"
      : process.env.GAME_DB_PATH ?? path.join(dataDir, "game.db");
  sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  db = drizzle(sqlite, { schema });
} else {
  // Reason: module still loads under Postgres driver; avoid opening a local SQLite file.
  sqlite = null as unknown as Database.Database;
  db = null as unknown as BetterSQLite3Database<typeof schema>;
}

export { db };

const SCHEMA_VERSION = 32;

const MARKET_SQL = `
    CREATE TABLE IF NOT EXISTS market_listings (
      id TEXT PRIMARY KEY,
      seller_player_id TEXT NOT NULL REFERENCES players(id),
      item_id TEXT NOT NULL,
      qty INTEGER NOT NULL,
      price_coins INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      created_at INTEGER NOT NULL
    );
`;

const GUILDS_SQL = `
    CREATE TABLE IF NOT EXISTS guilds (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      owner_player_id TEXT NOT NULL REFERENCES players(id),
      invite_code TEXT,
      created_at INTEGER NOT NULL
    );
`;

const GUILD_BANK_SQL = `
    CREATE TABLE IF NOT EXISTS guild_bank (
      id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL REFERENCES guilds(id),
      item_id TEXT NOT NULL,
      qty INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS guild_bank_guild_item_uq
      ON guild_bank(guild_id, item_id);
`;

const CLAIM_NODES_SQL = `
    CREATE TABLE IF NOT EXISTS claim_nodes (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      produce_item_id TEXT NOT NULL,
      claimed_guild_id TEXT,
      claimed_at INTEGER,
      last_produce_at INTEGER,
      stored_qty INTEGER NOT NULL DEFAULT 0,
      contest_ends_at INTEGER
    );
`;

const CLAIM_CONTEST_SCORES_SQL = `
    CREATE TABLE IF NOT EXISTS claim_contest_scores (
      id TEXT PRIMARY KEY,
      claim_node_id TEXT NOT NULL REFERENCES claim_nodes(id),
      guild_id TEXT NOT NULL REFERENCES guilds(id),
      score INTEGER NOT NULL DEFAULT 0
    );
    CREATE UNIQUE INDEX IF NOT EXISTS claim_contest_scores_uq
      ON claim_contest_scores(claim_node_id, guild_id);
`;

const QUEST_CLAIMS_SQL = `
    CREATE TABLE IF NOT EXISTS quest_claims (
      player_id TEXT NOT NULL REFERENCES players(id),
      quest_id TEXT NOT NULL,
      claimed_at INTEGER NOT NULL,
      PRIMARY KEY (player_id, quest_id)
    );
`;

const ACHIEVEMENT_PROGRESS_SQL = `
    CREATE TABLE IF NOT EXISTS achievement_progress (
      player_id TEXT NOT NULL REFERENCES players(id),
      achievement_id TEXT NOT NULL,
      counter INTEGER NOT NULL DEFAULT 0,
      unlocked_at INTEGER,
      PRIMARY KEY (player_id, achievement_id)
    );
`;

const MAIL_SQL = `
    CREATE TABLE IF NOT EXISTS mail (
      id TEXT PRIMARY KEY,
      from_player_id TEXT NOT NULL REFERENCES players(id),
      to_player_id TEXT NOT NULL REFERENCES players(id),
      subject TEXT NOT NULL,
      items_json TEXT NOT NULL,
      coins INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL
    );
`;

const V5_SQL = `
    ${GUILDS_SQL}
`;

/**
 * Additive combat columns (F9.1 / schema v6).
 */
function ensureCombatColumns(): void {
  ensureColumn("players", "health", "health INTEGER NOT NULL DEFAULT 100");
  ensureColumn("players", "max_health", "max_health INTEGER NOT NULL DEFAULT 100");
  ensureColumn("players", "damage", "damage INTEGER NOT NULL DEFAULT 10");
  ensureColumn("players", "defense", "defense INTEGER NOT NULL DEFAULT 5");
}

/**
 * Passive HP regen watermark (mirrors energy_updated_at).
 */
function ensureHealthUpdatedAtColumn(): void {
  ensureColumn(
    "players",
    "health_updated_at",
    "health_updated_at INTEGER NOT NULL DEFAULT 0",
  );
}

/**
 * Additive combat gear equip slots (Explore / Arena live fights).
 */
function ensureCombatGearEquipColumns(): void {
  ensureColumn(
    "players",
    "equipped_weapon_inventory_id",
    "equipped_weapon_inventory_id TEXT",
  );
  ensureColumn(
    "players",
    "equipped_armor_inventory_id",
    "equipped_armor_inventory_id TEXT",
  );
  ensureColumn(
    "players",
    "equipped_shield_inventory_id",
    "equipped_shield_inventory_id TEXT",
  );
}

/**
 * Additive hunter XP (F10.1 / schema v7).
 */
function ensureHunterXpColumn(): void {
  ensureColumn("players", "hunter_xp", "hunter_xp INTEGER NOT NULL DEFAULT 0");
}

/**
 * Additive carpenter XP (F10.2 / schema v8).
 */
function ensureCarpenterXpColumn(): void {
  ensureColumn(
    "players",
    "carpenter_xp",
    "carpenter_xp INTEGER NOT NULL DEFAULT 0",
  );
}

/**
 * Additive weaver XP (CL13.3 / schema v23).
 */
function ensureWeaverXpColumn(): void {
  ensureColumn(
    "players",
    "weaver_xp",
    "weaver_xp INTEGER NOT NULL DEFAULT 0",
  );
}

/**
 * Additive forester XP (CL18.1 / schema v24).
 */
function ensureForesterXpColumn(): void {
  ensureColumn(
    "players",
    "forester_xp",
    "forester_xp INTEGER NOT NULL DEFAULT 0",
  );
}

/**
 * Additive miner XP (CL18.2 / schema v25).
 */
function ensureMinerXpColumn(): void {
  ensureColumn(
    "players",
    "miner_xp",
    "miner_xp INTEGER NOT NULL DEFAULT 0",
  );
}

/**
 * Additive builder XP (CL18.3 / schema v26).
 */
function ensureBuilderXpColumn(): void {
  ensureColumn(
    "players",
    "builder_xp",
    "builder_xp INTEGER NOT NULL DEFAULT 0",
  );
}

/**
 * Additive fisher XP (CL23.1 / schema v27).
 */
function ensureFisherXpColumn(): void {
  ensureColumn(
    "players",
    "fisher_xp",
    "fisher_xp INTEGER NOT NULL DEFAULT 0",
  );
}

/**
 * Additive animal breeder XP (CL27.2 / schema v28).
 */
function ensureAnimalBreederXpColumn(): void {
  ensureColumn(
    "players",
    "animal_breeder_xp",
    "animal_breeder_xp INTEGER NOT NULL DEFAULT 0",
  );
}

/**
 * Additive Animal / Monster Hunter XP (CL31.1 / schema v29).
 */
function ensureAnimalHunterXpColumn(): void {
  ensureColumn(
    "players",
    "animal_hunter_xp",
    "animal_hunter_xp INTEGER NOT NULL DEFAULT 0",
  );
}

/**
 * Additive Monster Hunter XP (CL31.1 / schema v29).
 */
function ensureMonsterHunterXpColumn(): void {
  ensureColumn(
    "players",
    "monster_hunter_xp",
    "monster_hunter_xp INTEGER NOT NULL DEFAULT 0",
  );
}

/**
 * One-shot: copy legacy shared `hunter_xp` into `animal_hunter_xp` (CL31.1).
 * Choice: migrate into Animal Hunter (not 50/50 split) — trail was the shared loop's primary path.
 */
function migrateHunterXpSplitV29(): void {
  ensureAnimalHunterXpColumn();
  ensureMonsterHunterXpColumn();
  sqlite.exec(`
    UPDATE players
    SET animal_hunter_xp = hunter_xp
    WHERE animal_hunter_xp = 0 AND hunter_xp > 0
  `);
}

/**
 * Additive Alchemist XP (CL31.3 / schema v30).
 */
function ensureAlchemistXpColumn(): void {
  ensureColumn(
    "players",
    "alchemist_xp",
    "alchemist_xp INTEGER NOT NULL DEFAULT 0",
  );
}

/**
 * Process-station craft jobs (wait/collect) — schema v31.
 */
function ensureCraftJobsV31(): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS craft_jobs (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id),
      building_id TEXT NOT NULL REFERENCES buildings(id),
      land_id TEXT NOT NULL REFERENCES lands(id),
      recipe_id TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      ready_at INTEGER NOT NULL
    );
  `);
  sqlite.exec(
    `CREATE INDEX IF NOT EXISTS craft_jobs_building_idx ON craft_jobs(building_id)`,
  );
  sqlite.exec(
    `CREATE INDEX IF NOT EXISTS craft_jobs_player_building_idx ON craft_jobs(player_id, building_id)`,
  );
}

/**
 * Additive building tier (F10.4 / schema v9).
 */
function ensureBuildingTierColumn(): void {
  ensureColumn("buildings", "tier", "tier INTEGER NOT NULL DEFAULT 1");
}

/**
 * Multi-land per player + active pointer (F11.1 / schema v10).
 */
function migrateMultiLandV10(): void {
  ensureColumn("players", "active_land_id", "active_land_id TEXT");
  sqlite.exec(`PRAGMA foreign_keys = OFF;`);
  sqlite.exec(`DROP TABLE IF EXISTS lands_v10;`);
  sqlite.exec(`
    CREATE TABLE lands_v10 (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id),
      kind TEXT NOT NULL DEFAULT 'starter',
      build_slots INTEGER NOT NULL DEFAULT 8
    );
  `);
  sqlite.exec(`
    INSERT INTO lands_v10 (id, player_id, kind, build_slots)
    SELECT id, player_id, kind, build_slots FROM lands;
  `);
  sqlite.exec(`DROP TABLE lands;`);
  sqlite.exec(`ALTER TABLE lands_v10 RENAME TO lands;`);
  sqlite.exec(`PRAGMA foreign_keys = ON;`);

  const rows = sqlite
    .prepare(`SELECT id, player_id FROM lands WHERE kind = 'starter'`)
    .all() as Array<{ id: string; player_id: string }>;
  const byPlayer = new Map<string, string>();
  for (const row of rows) {
    if (!byPlayer.has(row.player_id)) byPlayer.set(row.player_id, row.id);
  }
  const allLands = sqlite
    .prepare(`SELECT id, player_id FROM lands`)
    .all() as Array<{ id: string; player_id: string }>;
  for (const row of allLands) {
    if (!byPlayer.has(row.player_id)) byPlayer.set(row.player_id, row.id);
  }
  const upd = sqlite.prepare(
    `UPDATE players SET active_land_id = COALESCE(active_land_id, ?) WHERE id = ?`,
  );
  for (const [playerId, landId] of byPlayer) {
    upd.run(landId, playerId);
  }
}

/**
 * Caravan travel columns (F11.2 / schema v11).
 */
function ensureTravelColumns(): void {
  ensureColumn(
    "players",
    "travel_destination_kind",
    "travel_destination_kind TEXT",
  );
  ensureColumn("players", "travel_arrive_at", "travel_arrive_at INTEGER");
}

/**
 * Guild ranks + invite codes (F12.1 / schema v12).
 */
function ensureGuildRanksV12(): void {
  ensureColumn("guilds", "invite_code", "invite_code TEXT");
  ensureColumn("players", "guild_rank", "guild_rank TEXT");
  sqlite.exec(
    `CREATE UNIQUE INDEX IF NOT EXISTS guilds_invite_code_uq ON guilds(invite_code)`,
  );

  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  function freshCode(): string {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)]!;
    }
    return code;
  }

  const guildRows = sqlite
    .prepare(`SELECT id, owner_player_id, invite_code FROM guilds`)
    .all() as Array<{
    id: string;
    owner_player_id: string;
    invite_code: string | null;
  }>;

  for (const g of guildRows) {
    if (!g.invite_code) {
      let code = freshCode();
      while (
        (
          sqlite
            .prepare(`SELECT id FROM guilds WHERE invite_code = ?`)
            .get(code) as { id: string } | undefined
        )?.id
      ) {
        code = freshCode();
      }
      sqlite
        .prepare(`UPDATE guilds SET invite_code = ? WHERE id = ?`)
        .run(code, g.id);
    }
    sqlite
      .prepare(
        `UPDATE players SET guild_rank = 'owner' WHERE id = ? AND guild_id = ?`,
      )
      .run(g.owner_player_id, g.id);
    sqlite
      .prepare(
        `UPDATE players SET guild_rank = 'member'
         WHERE guild_id = ? AND id != ?
           AND (guild_rank IS NULL OR guild_rank = '')`,
      )
      .run(g.id, g.owner_player_id);
  }
}

/**
 * Guild shared vault (F12.2 / schema v13).
 */
function ensureGuildBankV13(): void {
  sqlite.exec(GUILD_BANK_SQL);
}

/**
 * Neutral claim nodes (F12.3 / schema v14).
 */
function ensureClaimNodesV14(): void {
  sqlite.exec(CLAIM_NODES_SQL);
  const existing = sqlite
    .prepare(`SELECT id FROM claim_nodes WHERE slug = ?`)
    .get("wild_grove") as { id: string } | undefined;
  if (!existing) {
    sqlite
      .prepare(
        `INSERT INTO claim_nodes(id, slug, name, produce_item_id, stored_qty)
         VALUES (?, 'wild_grove', 'Wild Grove', 'wood', 0)`,
      )
      .run(`claim_${Date.now().toString(36)}`);
  }
}

/**
 * Soft-war contest columns + scores (F12.4 / schema v15).
 */
function ensureClaimWarV15(): void {
  ensureColumn("claim_nodes", "contest_ends_at", "contest_ends_at INTEGER");
  sqlite.exec(CLAIM_CONTEST_SCORES_SQL);
}

/**
 * Starter quest claim ledger (F13.2 / schema v16).
 */
function ensureQuestsV16(): void {
  sqlite.exec(QUEST_CLAIMS_SQL);
}

/**
 * Achievement progress stubs (F13.3 / schema v17).
 */
function ensureAchievementsV17(): void {
  sqlite.exec(ACHIEVEMENT_PROGRESS_SQL);
}

/**
 * Offline mail parcels (F13.4 / schema v18).
 */
function ensureMailV18(): void {
  sqlite.exec(MAIL_SQL);
}

/**
 * Optional wallet address on users (F15.1 / schema v19).
 */
function ensureWalletV19(): void {
  ensureColumn("users", "wallet_address", "wallet_address TEXT");
}

const LAND_DEEDS_SQL = `
    CREATE TABLE IF NOT EXISTS land_deeds (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id),
      land_id TEXT NOT NULL REFERENCES lands(id),
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'held',
      list_price_coins INTEGER,
      mint_tx_stub TEXT
    );
`;

/**
 * Off-chain premium land deeds (F15.2 / schema v20).
 */
function ensureLandDeedsV20(): void {
  sqlite.exec(LAND_DEEDS_SQL);
}

/**
 * Mint/list stub columns on land_deeds (F15.3 / schema v21).
 */
function ensureDeedMarketV21(): void {
  ensureLandDeedsV20();
  ensureColumn("land_deeds", "status", "status TEXT NOT NULL DEFAULT 'held'");
  ensureColumn("land_deeds", "list_price_coins", "list_price_coins INTEGER");
  ensureColumn("land_deeds", "mint_tx_stub", "mint_tx_stub TEXT");
}

const CREDITCOIN_SQL = `
    CREATE TABLE IF NOT EXISTS coin_swaps (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id),
      wallet_address TEXT NOT NULL,
      coins_burned INTEGER NOT NULL,
      realm_amount TEXT NOT NULL,
      nonce TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      sepolia_tx_hash TEXT,
      creditcoin_tx_hash TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS token_item_listings (
      id TEXT PRIMARY KEY,
      seller_player_id TEXT NOT NULL REFERENCES players(id),
      item_id TEXT NOT NULL,
      qty INTEGER NOT NULL,
      price_realm TEXT NOT NULL,
      onchain_listing_id TEXT,
      status TEXT NOT NULL DEFAULT 'escrowed',
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS realm_balances (
      player_id TEXT PRIMARY KEY REFERENCES players(id),
      amount_wei TEXT NOT NULL DEFAULT '0'
    );
    CREATE TABLE IF NOT EXISTS local_lands (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id),
      biome TEXT NOT NULL,
      size TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
`;

/**
 * Creditcoin REALM swaps + token market (schema v32).
 */
function ensureCreditcoinV32(): void {
  sqlite.exec(CREDITCOIN_SQL);
}

/**
 * NFT homestead pointer on lands (Creditcoin LandNFT → playable player_land).
 */
function ensureNftHomesteadColumn(): void {
  ensureColumn("lands", "nft_token_id", "nft_token_id TEXT");
}

function ensureColumn(table: string, column: string, ddl: string): void {
  const cols = sqlite.prepare(`PRAGMA table_info(${table})`).all() as Array<{
    name: string;
  }>;
  if (!cols.some((c) => c.name === column)) {
    sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  }
}
const FULL_SCHEMA_SQL = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      wallet_address TEXT
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
      soft_currency INTEGER NOT NULL DEFAULT 0,
      energy INTEGER NOT NULL DEFAULT 100,
      max_energy INTEGER NOT NULL DEFAULT 100,
      energy_updated_at INTEGER NOT NULL,
      character_xp INTEGER NOT NULL DEFAULT 0,
      farmer_xp INTEGER NOT NULL DEFAULT 0,
      blacksmith_xp INTEGER NOT NULL DEFAULT 0,
      cook_xp INTEGER NOT NULL DEFAULT 0,
      hunter_xp INTEGER NOT NULL DEFAULT 0,
      animal_hunter_xp INTEGER NOT NULL DEFAULT 0,
      monster_hunter_xp INTEGER NOT NULL DEFAULT 0,
      carpenter_xp INTEGER NOT NULL DEFAULT 0,
      weaver_xp INTEGER NOT NULL DEFAULT 0,
      forester_xp INTEGER NOT NULL DEFAULT 0,
      miner_xp INTEGER NOT NULL DEFAULT 0,
      builder_xp INTEGER NOT NULL DEFAULT 0,
      fisher_xp INTEGER NOT NULL DEFAULT 0,
      animal_breeder_xp INTEGER NOT NULL DEFAULT 0,
      alchemist_xp INTEGER NOT NULL DEFAULT 0,
      guild_id TEXT,
      guild_rank TEXT,
      health INTEGER NOT NULL DEFAULT 100,
      max_health INTEGER NOT NULL DEFAULT 100,
      health_updated_at INTEGER NOT NULL DEFAULT 0,
      damage INTEGER NOT NULL DEFAULT 10,
      defense INTEGER NOT NULL DEFAULT 5,
      equipped_tool_inventory_id TEXT,
      equipped_weapon_inventory_id TEXT,
      equipped_armor_inventory_id TEXT,
      equipped_shield_inventory_id TEXT,
      active_land_id TEXT,
      travel_destination_kind TEXT,
      travel_arrive_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS lands (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id),
      kind TEXT NOT NULL DEFAULT 'player_land',
      build_slots INTEGER NOT NULL DEFAULT 8,
      nft_token_id TEXT
    );
    CREATE TABLE IF NOT EXISTS buildings (
      id TEXT PRIMARY KEY,
      land_id TEXT NOT NULL REFERENCES lands(id),
      type TEXT NOT NULL,
      slot_index INTEGER NOT NULL,
      x INTEGER NOT NULL,
      z INTEGER NOT NULL,
      tier INTEGER NOT NULL DEFAULT 1,
      crop_id TEXT,
      planted_at INTEGER,
      ready_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS craft_jobs (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id),
      building_id TEXT NOT NULL REFERENCES buildings(id),
      land_id TEXT NOT NULL REFERENCES lands(id),
      recipe_id TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      ready_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id),
      item_id TEXT NOT NULL,
      qty INTEGER NOT NULL,
      durability INTEGER
    );
    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      from_player_id TEXT NOT NULL REFERENCES players(id),
      to_player_id TEXT NOT NULL REFERENCES players(id),
      status TEXT NOT NULL DEFAULT 'pending',
      give_json TEXT NOT NULL,
      want_json TEXT NOT NULL,
      give_coins INTEGER NOT NULL DEFAULT 0,
      want_coins INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    ${MARKET_SQL}
    ${GUILDS_SQL}
    ${GUILD_BANK_SQL}
    ${CLAIM_NODES_SQL}
    ${CLAIM_CONTEST_SCORES_SQL}
    ${QUEST_CLAIMS_SQL}
    ${ACHIEVEMENT_PROGRESS_SQL}
    ${MAIL_SQL}
    ${LAND_DEEDS_SQL}
`;

/**
 * CityLands CL1.1 — rename legacy kinds; keep existing building rows.
 * starter → player_land, forest → explore.
 */
function migrateCityLandsKindsV22(): void {
  sqlite.exec(
    `UPDATE lands SET kind = 'player_land' WHERE kind = 'starter'`,
  );
  sqlite.exec(`UPDATE lands SET kind = 'explore' WHERE kind = 'forest'`);
  sqlite.exec(
    `UPDATE players SET travel_destination_kind = 'player_land' WHERE travel_destination_kind = 'starter'`,
  );
  sqlite.exec(
    `UPDATE players SET travel_destination_kind = 'explore' WHERE travel_destination_kind = 'forest'`,
  );
}

/**
 * Applies MVP schema. Additive upgrades preferred; unknown versions wipe.
 */
export function migrateSqlite(): void {
  if (!useSqlite) {
    throw new Error("migrateSqlite() called while DB driver is not sqlite");
  }
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS schema_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const row = sqlite
    .prepare(`SELECT value FROM schema_meta WHERE key = 'version'`)
    .get() as { value: string } | undefined;
  const current = row ? Number(row.value) : 0;

  // Reason: always ensure deed columns even when version matches — CREATE TABLE
  // IF NOT EXISTS leaves older land_deeds shapes without status/mint stubs.
  if (current === SCHEMA_VERSION) {
    ensureLandDeedsV20();
    ensureDeedMarketV21();
    migrateCityLandsKindsV22();
    ensureWeaverXpColumn();
    ensureForesterXpColumn();
    ensureMinerXpColumn();
    ensureBuilderXpColumn();
    ensureFisherXpColumn();
    ensureAnimalBreederXpColumn();
    migrateHunterXpSplitV29();
    ensureAlchemistXpColumn();
    ensureCraftJobsV31();
    ensureCombatGearEquipColumns();
    ensureHealthUpdatedAtColumn();
    ensureCreditcoinV32();
    ensureNftHomesteadColumn();
    return;
  }

  if (current === 0) {
    sqlite.exec(FULL_SCHEMA_SQL);
    ensureGuildRanksV12();
    ensureGuildBankV13();
    ensureClaimNodesV14();
    ensureClaimWarV15();
    ensureQuestsV16();
    ensureAchievementsV17();
    ensureMailV18();
    ensureWalletV19();
  } else if (current === 2) {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY,
        from_player_id TEXT NOT NULL REFERENCES players(id),
        to_player_id TEXT NOT NULL REFERENCES players(id),
        status TEXT NOT NULL DEFAULT 'pending',
        give_json TEXT NOT NULL,
        want_json TEXT NOT NULL,
        give_coins INTEGER NOT NULL DEFAULT 0,
        want_coins INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );
    `);
    sqlite.exec(MARKET_SQL);
    ensureColumn("players", "cook_xp", "cook_xp INTEGER NOT NULL DEFAULT 0");
    ensureColumn("players", "guild_id", "guild_id TEXT");
    sqlite.exec(V5_SQL);
    ensureCombatColumns();
    ensureHunterXpColumn();
    ensureCarpenterXpColumn();
    ensureBuildingTierColumn();
    migrateMultiLandV10();
    ensureTravelColumns();
    ensureGuildRanksV12();
    ensureGuildBankV13();
    ensureClaimNodesV14();
    ensureClaimWarV15();
    ensureQuestsV16();
    ensureAchievementsV17();
    ensureMailV18();    ensureWalletV19();  } else if (current === 3) {
    sqlite.exec(MARKET_SQL);
    ensureColumn("players", "cook_xp", "cook_xp INTEGER NOT NULL DEFAULT 0");
    ensureColumn("players", "guild_id", "guild_id TEXT");
    sqlite.exec(V5_SQL);
    ensureCombatColumns();
    ensureHunterXpColumn();
    ensureCarpenterXpColumn();
    ensureBuildingTierColumn();
    migrateMultiLandV10();
    ensureTravelColumns();
    ensureGuildRanksV12();
    ensureGuildBankV13();
    ensureClaimNodesV14();
    ensureClaimWarV15();
    ensureQuestsV16();
    ensureAchievementsV17();
    ensureMailV18();    ensureWalletV19();  } else if (current === 4) {
    ensureColumn("players", "cook_xp", "cook_xp INTEGER NOT NULL DEFAULT 0");
    ensureColumn("players", "guild_id", "guild_id TEXT");
    sqlite.exec(V5_SQL);
    ensureCombatColumns();
    ensureHunterXpColumn();
    ensureCarpenterXpColumn();
    ensureBuildingTierColumn();
    migrateMultiLandV10();
    ensureTravelColumns();
    ensureGuildRanksV12();
    ensureGuildBankV13();
    ensureClaimNodesV14();
    ensureClaimWarV15();
    ensureQuestsV16();
    ensureAchievementsV17();
    ensureMailV18();    ensureWalletV19();  } else if (current === 5) {
    ensureCombatColumns();
    ensureHunterXpColumn();
    ensureCarpenterXpColumn();
    ensureBuildingTierColumn();
    migrateMultiLandV10();
    ensureTravelColumns();
    ensureGuildRanksV12();
    ensureGuildBankV13();
    ensureClaimNodesV14();
    ensureClaimWarV15();
    ensureQuestsV16();
    ensureAchievementsV17();
    ensureMailV18();    ensureWalletV19();  } else if (current === 6) {
    ensureHunterXpColumn();
    ensureCarpenterXpColumn();
    ensureBuildingTierColumn();
    migrateMultiLandV10();
    ensureTravelColumns();
    ensureGuildRanksV12();
    ensureGuildBankV13();
    ensureClaimNodesV14();
    ensureClaimWarV15();
    ensureQuestsV16();
    ensureAchievementsV17();
    ensureMailV18();    ensureWalletV19();  } else if (current === 7) {
    ensureCarpenterXpColumn();
    ensureBuildingTierColumn();
    migrateMultiLandV10();
    ensureTravelColumns();
    ensureGuildRanksV12();
    ensureGuildBankV13();
    ensureClaimNodesV14();
    ensureClaimWarV15();
    ensureQuestsV16();
    ensureAchievementsV17();
    ensureMailV18();    ensureWalletV19();  } else if (current === 8) {
    ensureBuildingTierColumn();
    migrateMultiLandV10();
    ensureTravelColumns();
    ensureGuildRanksV12();
    ensureGuildBankV13();
    ensureClaimNodesV14();
    ensureClaimWarV15();
    ensureQuestsV16();
    ensureAchievementsV17();
    ensureMailV18();    ensureWalletV19();  } else if (current === 9) {
    migrateMultiLandV10();
    ensureTravelColumns();
    ensureGuildRanksV12();
    ensureGuildBankV13();
    ensureClaimNodesV14();
    ensureClaimWarV15();
    ensureQuestsV16();
    ensureAchievementsV17();
    ensureMailV18();    ensureWalletV19();  } else if (current === 10) {
    ensureTravelColumns();
    ensureGuildRanksV12();
    ensureGuildBankV13();
    ensureClaimNodesV14();
    ensureClaimWarV15();
    ensureQuestsV16();
    ensureAchievementsV17();
    ensureMailV18();    ensureWalletV19();  } else if (current === 11) {
    ensureGuildRanksV12();
    ensureGuildBankV13();
    ensureClaimNodesV14();
    ensureClaimWarV15();
    ensureQuestsV16();
    ensureAchievementsV17();
    ensureMailV18();    ensureWalletV19();  } else if (current === 12) {
    ensureGuildBankV13();
    ensureClaimNodesV14();
    ensureClaimWarV15();
    ensureQuestsV16();
    ensureAchievementsV17();
    ensureMailV18();    ensureWalletV19();  } else if (current === 13) {
    ensureClaimNodesV14();
    ensureClaimWarV15();
    ensureQuestsV16();
    ensureAchievementsV17();
    ensureMailV18();    ensureWalletV19();  } else if (current === 14) {
    ensureClaimWarV15();
    ensureQuestsV16();
    ensureAchievementsV17();
    ensureMailV18();    ensureWalletV19();  } else if (current === 15) {
    ensureQuestsV16();
    ensureAchievementsV17();
    ensureMailV18();    ensureWalletV19();  } else if (current === 16) {
    ensureAchievementsV17();
    ensureMailV18();    ensureWalletV19();  } else if (current === 17) {
    ensureMailV18();    ensureWalletV19();  } else if (current === 18) {
    ensureWalletV19();
  } else if (current === 19) {
    /* land deeds + mint columns below */
  } else if (current === 20) {
    /* mint/list columns only below */
  } else if (current === 21) {
    /* CityLands kind rename only below */
  } else if (current === 22) {
    /* weaver XP only below */
  } else if (current === 23) {
    /* forester XP only below */
  } else if (current === 24) {
    /* miner XP only below */
  } else if (current === 25) {
    /* builder XP only below */
  } else if (current === 26) {
    /* fisher XP only below */
  } else if (current === 27) {
    /* animal breeder XP only below */
  } else if (current === 28) {
    /* dual hunter XP only below */
  } else if (current === 29) {
    /* alchemist XP only below */
  } else if (current === 30) {
    /* craft jobs only below */
  } else if (current === 31) {
    /* Creditcoin REALM tables only below */
  } else {
    sqlite.exec(`
      PRAGMA foreign_keys = OFF;
      DROP TABLE IF EXISTS land_deeds;
      DROP TABLE IF EXISTS mail;
      DROP TABLE IF EXISTS achievement_progress;
      DROP TABLE IF EXISTS quest_claims;
      DROP TABLE IF EXISTS claim_contest_scores;
      DROP TABLE IF EXISTS claim_nodes;
      DROP TABLE IF EXISTS guild_bank;
      DROP TABLE IF EXISTS guilds;
      DROP TABLE IF EXISTS market_listings;
      DROP TABLE IF EXISTS trades;
      DROP TABLE IF EXISTS plots;
      DROP TABLE IF EXISTS buildings;
      DROP TABLE IF EXISTS inventory;
      DROP TABLE IF EXISTS lands;
      DROP TABLE IF EXISTS sessions;
      DROP TABLE IF EXISTS players;
      DROP TABLE IF EXISTS users;
      PRAGMA foreign_keys = ON;
    `);
    sqlite.exec(FULL_SCHEMA_SQL);
    ensureGuildRanksV12();
    ensureGuildBankV13();
    ensureClaimNodesV14();
    ensureClaimWarV15();
    ensureQuestsV16();
    ensureAchievementsV17();
    ensureMailV18();    ensureWalletV19();  }

  ensureLandDeedsV20();

  ensureDeedMarketV21();

  migrateCityLandsKindsV22();

  ensureWeaverXpColumn();

  ensureForesterXpColumn();

  ensureMinerXpColumn();

  ensureBuilderXpColumn();

  ensureFisherXpColumn();

  ensureAnimalBreederXpColumn();

  migrateHunterXpSplitV29();

  ensureAlchemistXpColumn();

  ensureCraftJobsV31();

  ensureCombatGearEquipColumns();

  ensureHealthUpdatedAtColumn();

  ensureCreditcoinV32();
  ensureNftHomesteadColumn();

  sqlite
    .prepare(
      `INSERT INTO schema_meta(key, value) VALUES('version', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    )
    .run(String(SCHEMA_VERSION));
}
