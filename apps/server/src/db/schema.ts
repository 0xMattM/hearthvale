/**
 * Active Drizzle table exports for the selected driver (F16.1).
 * Shapes match across dialects; typed as the SQLite schema for call-site stability.
 */
import { resolveDbDriver } from "./driver.js";
import * as pgSchema from "./schema.pg.js";
import * as sqliteSchema from "./schema.sqlite.js";

const usePostgres = resolveDbDriver() === "postgres";
const active = usePostgres ? pgSchema : sqliteSchema;

export const users = active.users as typeof sqliteSchema.users;
export const sessions = active.sessions as typeof sqliteSchema.sessions;
export const players = active.players as typeof sqliteSchema.players;
export const guilds = active.guilds as typeof sqliteSchema.guilds;
export const lands = active.lands as typeof sqliteSchema.lands;
export const buildings = active.buildings as typeof sqliteSchema.buildings;
export const craftJobs = active.craftJobs as typeof sqliteSchema.craftJobs;
export const inventory = active.inventory as typeof sqliteSchema.inventory;
export const trades = active.trades as typeof sqliteSchema.trades;
export const marketListings =
  active.marketListings as typeof sqliteSchema.marketListings;
export const guildBank = active.guildBank as typeof sqliteSchema.guildBank;
export const claimNodes = active.claimNodes as typeof sqliteSchema.claimNodes;
export const claimContestScores =
  active.claimContestScores as typeof sqliteSchema.claimContestScores;
export const questClaims = active.questClaims as typeof sqliteSchema.questClaims;
export const achievementProgress =
  active.achievementProgress as typeof sqliteSchema.achievementProgress;
export const mail = active.mail as typeof sqliteSchema.mail;
export const landDeeds = active.landDeeds as typeof sqliteSchema.landDeeds;
export const coinSwaps = active.coinSwaps as typeof sqliteSchema.coinSwaps;
export const tokenItemListings =
  active.tokenItemListings as typeof sqliteSchema.tokenItemListings;
export const realmBalances =
  active.realmBalances as typeof sqliteSchema.realmBalances;
export const localLands = active.localLands as typeof sqliteSchema.localLands;
