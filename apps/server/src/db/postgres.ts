/**
 * Postgres Drizzle client + fresh-schema migrate (F16.1).
 * Historical SQLite step-migrations stay on the SQLite path; Postgres boots at current version.
 */
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import { resolvePostgresUrl } from "./driver.js";
import * as schema from "./schema.pg.js";

const { Pool } = pg;

/** Must stay aligned with SQLite SCHEMA_VERSION in client.ts. */
export const POSTGRES_SCHEMA_VERSION = 31;

const FULL_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS schema_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS market_listings (
  id TEXT PRIMARY KEY,
  seller_player_id TEXT NOT NULL REFERENCES players(id),
  item_id TEXT NOT NULL,
  qty INTEGER NOT NULL,
  price_coins INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS guilds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  owner_player_id TEXT NOT NULL REFERENCES players(id),
  invite_code TEXT,
  created_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS guilds_invite_code_uq ON guilds(invite_code);

CREATE TABLE IF NOT EXISTS guild_bank (
  id TEXT PRIMARY KEY,
  guild_id TEXT NOT NULL REFERENCES guilds(id),
  item_id TEXT NOT NULL,
  qty INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS guild_bank_guild_item_uq
  ON guild_bank(guild_id, item_id);

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

CREATE TABLE IF NOT EXISTS claim_contest_scores (
  id TEXT PRIMARY KEY,
  claim_node_id TEXT NOT NULL REFERENCES claim_nodes(id),
  guild_id TEXT NOT NULL REFERENCES guilds(id),
  score INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS claim_contest_scores_uq
  ON claim_contest_scores(claim_node_id, guild_id);

CREATE TABLE IF NOT EXISTS quest_claims (
  player_id TEXT NOT NULL REFERENCES players(id),
  quest_id TEXT NOT NULL,
  claimed_at INTEGER NOT NULL,
  PRIMARY KEY (player_id, quest_id)
);

CREATE TABLE IF NOT EXISTS achievement_progress (
  player_id TEXT NOT NULL REFERENCES players(id),
  achievement_id TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  unlocked_at INTEGER,
  PRIMARY KEY (player_id, achievement_id)
);

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

export type PostgresDb = NodePgDatabase<typeof schema>;

export interface PostgresHandle {
  pool: pg.Pool;
  db: PostgresDb;
  migrate: () => Promise<void>;
}

/**
 * Opens a Postgres pool + Drizzle client from env URL.
 */
export function openPostgres(
  env: NodeJS.ProcessEnv = process.env,
): PostgresHandle {
  const connectionString = resolvePostgresUrl(env);
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  /**
   * Applies current full schema when empty; no-ops when already at version.
   */
  async function migrate(): Promise<void> {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    const versionRes = await pool.query<{ value: string }>(
      `SELECT value FROM schema_meta WHERE key = 'version'`,
    );
    const current = versionRes.rows[0]
      ? Number(versionRes.rows[0].value)
      : 0;

    if (current === POSTGRES_SCHEMA_VERSION) {
      await ensureWildGroveClaim(pool);
      await pool.query(
        `ALTER TABLE players ADD COLUMN IF NOT EXISTS health_updated_at INTEGER NOT NULL DEFAULT 0`,
      );
      return;
    }

    if (current !== 0 && current !== POSTGRES_SCHEMA_VERSION) {
      // Reason: Postgres path is new — only fresh (0) or current; avoid half-migrated SQLite dumps.
      throw new Error(
        `Unsupported Postgres schema version ${current}; expected 0 or ${POSTGRES_SCHEMA_VERSION}.`,
      );
    }

    await pool.query(FULL_SCHEMA_SQL);
    await ensureWildGroveClaim(pool);
    await pool.query(
      `INSERT INTO schema_meta(key, value) VALUES('version', $1)
       ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value`,
      [String(POSTGRES_SCHEMA_VERSION)],
    );
  }

  return { pool, db, migrate };
}

/**
 * Seeds the default Wild Grove claim node when missing.
 */
async function ensureWildGroveClaim(pool: pg.Pool): Promise<void> {
  const existing = await pool.query<{ id: string }>(
    `SELECT id FROM claim_nodes WHERE slug = $1`,
    ["wild_grove"],
  );
  if (existing.rows[0]) return;
  const id = `claim_${Date.now().toString(36)}`;
  await pool.query(
    `INSERT INTO claim_nodes(id, slug, name, produce_item_id, stored_qty)
     VALUES ($1, 'wild_grove', 'Wild Grove', 'wood', 0)`,
    [id],
  );
}
