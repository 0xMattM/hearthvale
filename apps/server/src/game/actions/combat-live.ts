import {
  ACTION_ERROR,
  ARENA_DUMMY,
  DOWNED,
  EDGE_CREATURE,
  EDGE_HUNT,
  HUNT,
  ORE_NODE,
  TRAIL_CREATURE,
  WORLD,
  applyDownedPenalty,
  applyLiveCombatAction,
  autoResolveLiveCombat,
  combatLoadoutBonuses,
  combatEngageRange,
  createLiveCombatState,
  isAttackOnCooldown,
  isCombatBuildingType,
  isExploreLandKind,
  isWarriorLandKind,
  liveCombatDto,
  normalizeCombatStats,
  tickLiveCombat,
  type ItemId,
  type LiveCombatAction,
  type LiveCombatDto,
  type LiveCombatStepResult,
  type LiveCombatZone,
} from "@game/shared";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { buildings, players } from "../../db/schema.js";
import { getActiveLand } from "../land.js";
import { addItem, grantXp, spendEnergy } from "../player.js";
import { bumpAchievement } from "../achievements.js";
import { guardCombatIndependentOfChain } from "../chain-combat-guard.js";
import { requireNearGridRange, type Pos } from "../proximity.js";
import {
  equippedLoadoutItemIds,
  wearEquippedStack,
} from "./equipment.js";
import {
  clearCombatSession,
  getCombatSession,
  listCombatSessions,
  setCombatSession,
} from "../combat-session.js";
import type { ActionResult } from "./farming.js";

export interface CombatActionResult extends ActionResult {
  combat?: LiveCombatDto | null;
  encounter?: {
    won: boolean;
    foeName: string;
    rounds: number;
    leather: number;
    meat: number;
    tusks: number;
    toolBonus: number;
    downed?: boolean;
    energyLost?: number;
    zone?: LiveCombatZone;
  };
}

function landOwnedByPlayer(userId: string) {
  const player = db.select().from(players).where(eq(players.userId, userId)).get();
  if (!player) return null;
  const land = getActiveLand(player.id);
  if (!land) return null;
  return { player, land };
}

function zoneForBuilding(
  type: string,
  landKind: string,
): LiveCombatZone | null {
  if (isExploreLandKind(landKind) && type === "game_trail") return "game_trail";
  if (isExploreLandKind(landKind) && type === "edge_thicket") {
    return "edge_thicket";
  }
  if (isWarriorLandKind(landKind) && type === "arena_dummy") return "arena_dummy";
  return null;
}

function foeForZone(zone: LiveCombatZone) {
  if (zone === "edge_thicket") {
    return {
      name: EDGE_CREATURE.name,
      health: EDGE_CREATURE.health,
      damage: EDGE_CREATURE.damage,
      defense: EDGE_CREATURE.defense,
    };
  }
  if (zone === "arena_dummy") {
    return {
      name: ARENA_DUMMY.name,
      health: ARENA_DUMMY.health,
      damage: ARENA_DUMMY.damage,
      defense: ARENA_DUMMY.defense,
    };
  }
  return {
    name: TRAIL_CREATURE.name,
    health: TRAIL_CREATURE.health,
    damage: TRAIL_CREATURE.damage,
    defense: TRAIL_CREATURE.defense,
  };
}

function energyCostForZone(zone: LiveCombatZone): number {
  if (zone === "edge_thicket") return EDGE_HUNT.energyCost;
  return HUNT.energyCost;
}

function cooldownForZone(zone: LiveCombatZone): number {
  if (zone === "edge_thicket") return EDGE_HUNT.cooldownMs;
  if (zone === "arena_dummy") return ARENA_DUMMY.cooldownMs;
  return HUNT.cooldownMs;
}

function settleFight(input: {
  playerId: string;
  buildingId: string;
  zone: LiveCombatZone;
  won: boolean;
  playerHealth: number;
  foeName: string;
  rounds: number;
  toolItemId: string | null;
  weaponId: string | null;
  armorId: string | null;
  shieldId: string | null;
  tookHit: boolean;
  blocked: boolean;
  toolBonus: number;
}): CombatActionResult["encounter"] {
  const now = Date.now();
  const player = db.select().from(players).where(eq(players.id, input.playerId)).get();
  if (!player) return undefined;

  let nextHealth = input.playerHealth;
  let downed = false;
  let energyLost = 0;
  let zoneCooldown = cooldownForZone(input.zone);
  let nextEnergy = player.energy;

  if (!input.won) {
    const penalty = applyDownedPenalty({
      energy: nextEnergy,
      health: input.playerHealth,
    });
    nextHealth = penalty.health;
    nextEnergy = penalty.energy;
    energyLost = penalty.energyLost;
    downed = true;
    zoneCooldown += DOWNED.extraCooldownMs;
  }

  db.update(players)
    .set({
      health: nextHealth,
      energy: nextEnergy,
      energyUpdatedAt: Date.now(),
      healthUpdatedAt: Date.now(),
    })
    .where(eq(players.id, player.id))
    .run();

  db.update(buildings)
    .set({ readyAt: now + zoneCooldown })
    .where(eq(buildings.id, input.buildingId))
    .run();

  if (input.weaponId) wearEquippedStack(player.id, input.weaponId);
  else if (input.toolBonus > 0) {
    wearEquippedStack(player.id, player.equippedToolInventoryId);
  }
  if (input.blocked) wearEquippedStack(player.id, input.shieldId);
  if (input.tookHit) wearEquippedStack(player.id, input.armorId);

  let leather = 0;
  let meat = 0;
  let tusks = 0;

  if (input.won && input.zone === "edge_thicket") {
    tusks = EDGE_HUNT.tuskQty;
    meat = EDGE_HUNT.meatQty;
    addItem(player.id, "boar_tusk" as ItemId, tusks);
    addItem(player.id, "raw_meat", meat);
    grantXp(player.id, "monster_hunter", EDGE_HUNT.xp);
  } else if (input.won && input.zone === "game_trail") {
    leather = HUNT.leatherQty;
    meat = HUNT.meatQty;
    if (input.toolItemId === ORE_NODE.requiredTool) {
      leather += HUNT.hammerBonusLeather;
    }
    addItem(player.id, "leather", leather);
    addItem(player.id, "raw_meat", meat);
    grantXp(player.id, "animal_hunter", HUNT.xp);
  }

  if (input.zone !== "arena_dummy") bumpAchievement(player.id, "hunts");

  return {
    won: input.won,
    foeName: input.foeName,
    rounds: input.rounds,
    leather,
    meat,
    tusks,
    toolBonus: input.toolBonus,
    downed: downed || undefined,
    energyLost: energyLost || undefined,
    zone: input.zone,
  };
}

function worldHome(building: { x: number; z: number }) {
  return { x: building.x * WORLD.GRID, z: building.z * WORLD.GRID };
}

/**
 * Writes health while the fight is open, or settles loot / downed when it ends.
 *
 * @param player - DB player row.
 * @param step - Latest sim result.
 * @param now - Server epoch ms.
 */
function persistOpenOrSettle(
  player: {
    id: string;
    equippedToolInventoryId: string | null;
    equippedWeaponInventoryId?: string | null;
    equippedArmorInventoryId?: string | null;
    equippedShieldInventoryId?: string | null;
    health: number;
  },
  step: LiveCombatStepResult,
  now: number,
): CombatActionResult {
  if (!step.finished) {
    setCombatSession(player.id, step.state);
    if (step.state.playerHealth !== player.health) {
      db.update(players)
        .set({
          health: step.state.playerHealth,
          healthUpdatedAt: now,
        })
        .where(eq(players.id, player.id))
        .run();
    }
    return { ok: true, combat: liveCombatDto(step.state, now) };
  }

  clearCombatSession(player.id);
  const loadout = equippedLoadoutItemIds(player);
  const bonuses = combatLoadoutBonuses(loadout);
  const encounter = settleFight({
    playerId: player.id,
    buildingId: step.state.buildingId,
    zone: step.state.zone,
    won: step.won,
    playerHealth: step.state.playerHealth,
    foeName: step.state.foeName,
    rounds: step.state.rounds,
    toolItemId: loadout.toolItemId,
    weaponId: player.equippedWeaponInventoryId ?? null,
    armorId: player.equippedArmorInventoryId ?? null,
    shieldId: player.equippedShieldInventoryId ?? null,
    tookHit: step.state.tookHit || step.playerHit > 0,
    blocked: step.state.didBlock || step.blocked,
    toolBonus: bonuses.damage,
  });
  return { ok: true, combat: null, encounter };
}

/**
 * Starts a realtime hunt on Explore trails/thickets or the Arena dummy.
 *
 * @param userId - Auth user id.
 * @param buildingId - Hunt node or arena dummy.
 * @param pos - Client world position.
 */
export function startLiveCombat(
  userId: string,
  buildingId: string,
  pos?: Pos,
): CombatActionResult {
  guardCombatIndependentOfChain(userId);

  const owned = landOwnedByPlayer(userId);
  if (!owned) return { ok: false, error: ACTION_ERROR.playerMissing };
  const { player, land } = owned;

  const existing = getCombatSession(player.id);
  if (existing && existing.buildingId === buildingId) {
    return { ok: true, combat: liveCombatDto(existing, Date.now()) };
  }
  if (existing) {
    return { ok: false, error: ACTION_ERROR.combatAlreadyActive };
  }

  const building = db
    .select()
    .from(buildings)
    .where(and(eq(buildings.id, buildingId), eq(buildings.landId, land.id)))
    .get();
  if (!building || !isCombatBuildingType(building.type)) {
    return { ok: false, error: ACTION_ERROR.combatTargetMissing };
  }

  const zone = zoneForBuilding(building.type, land.kind);
  if (!zone) {
    return { ok: false, error: ACTION_ERROR.combatZoneOnly };
  }

  const loadout = equippedLoadoutItemIds(player);
  const bonuses = combatLoadoutBonuses(loadout);
  const near = requireNearGridRange(
    pos,
    building.x,
    building.z,
    combatEngageRange(zone),
  );
  if (!near.ok) return near;

  const now = Date.now();
  if (building.readyAt != null && now < building.readyAt) {
    return { ok: false, error: ACTION_ERROR.huntCooldown };
  }

  const energy = spendEnergy(player.id, energyCostForZone(zone));
  if (!energy.ok) return energy;

  const combat = normalizeCombatStats({
    health: player.health,
    maxHealth: player.maxHealth,
    damage: player.damage + bonuses.damage,
    defense: player.defense + bonuses.defense,
  });

  const home = worldHome(building);
  const session = createLiveCombatState({
    buildingId: building.id,
    zone,
    foe: foeForZone(zone),
    playerHealth: combat.health,
    playerMaxHealth: combat.maxHealth,
    playerDamage: combat.damage,
    playerDefense: combat.defense,
    blockReduction: bonuses.blockReduction,
    style: bonuses.style,
    now,
    homeX: home.x,
    homeZ: home.z,
    playerX: pos?.x ?? home.x,
    playerZ: pos?.z ?? home.z,
  });
  setCombatSession(player.id, session);
  return { ok: true, combat: liveCombatDto(session, now) };
}

/**
 * Applies one player swing or guard. Animals keep moving/striking via tick.
 *
 * @param userId - Auth user id.
 * @param action - Left-click attack or right-click block.
 * @param pos - Client world position.
 * @param skipCooldown - Auto-resolve helper (huntTrail tests).
 * @param now - Clock ms (tests inject time so the animal can close in).
 */
export function actLiveCombat(
  userId: string,
  action: LiveCombatAction | string,
  pos?: Pos,
  skipCooldown = false,
  now = Date.now(),
): CombatActionResult {
  guardCombatIndependentOfChain(userId);

  const owned = landOwnedByPlayer(userId);
  if (!owned) return { ok: false, error: ACTION_ERROR.playerMissing };
  const { player, land } = owned;

  const session = getCombatSession(player.id);
  if (!session) return { ok: false, error: ACTION_ERROR.combatNotActive };

  const kind: LiveCombatAction = action === "block" ? "block" : "attack";
  const building = db
    .select()
    .from(buildings)
    .where(and(eq(buildings.id, session.buildingId), eq(buildings.landId, land.id)))
    .get();
  if (!building) {
    clearCombatSession(player.id);
    return { ok: false, error: ACTION_ERROR.combatTargetMissing };
  }

  const px = pos?.x ?? session.playerX;
  const pz = pos?.z ?? session.playerZ;
  let step = tickLiveCombat(session, px, pz, now);
  if (step.finished) return persistOpenOrSettle(player, step, now);

  if (kind === "attack" && isAttackOnCooldown(step.state, now, skipCooldown)) {
    setCombatSession(player.id, step.state);
    return {
      ok: false,
      error: ACTION_ERROR.combatAttackWait,
      combat: liveCombatDto(step.state, now),
    };
  }

  step = applyLiveCombatAction(step.state, kind, now);
  return persistOpenOrSettle(player, step, now);
}

/**
 * Advances animal chase / bites from the player's live position.
 *
 * @param userId - Auth user id.
 * @param pos - Client world position.
 * @param now - Clock ms (tests inject time).
 */
export function tickLiveCombatSession(
  userId: string,
  pos?: Pos,
  now = Date.now(),
): CombatActionResult {
  guardCombatIndependentOfChain(userId);

  const owned = landOwnedByPlayer(userId);
  if (!owned) return { ok: false, error: ACTION_ERROR.playerMissing };
  const { player, land } = owned;

  const session = getCombatSession(player.id);
  if (!session) return { ok: false, error: ACTION_ERROR.combatNotActive };

  const building = db
    .select()
    .from(buildings)
    .where(and(eq(buildings.id, session.buildingId), eq(buildings.landId, land.id)))
    .get();
  if (!building) {
    clearCombatSession(player.id);
    return { ok: false, error: ACTION_ERROR.combatTargetMissing };
  }

  const step = tickLiveCombat(
    session,
    pos?.x ?? session.playerX,
    pos?.z ?? session.playerZ,
    now,
  );
  return persistOpenOrSettle(player, step, now);
}

/**
 * Server heartbeat: animals chase and bite without a player click.
 *
 * @param now - Clock ms.
 * @returns Number of open fights pulsed.
 */
export function pulseActiveCombatSessions(now = Date.now()): number {
  const open = listCombatSessions();
  for (const [playerId, session] of open) {
    const player = db.select().from(players).where(eq(players.id, playerId)).get();
    if (!player) {
      clearCombatSession(playerId);
      continue;
    }
    persistOpenOrSettle(
      player,
      tickLiveCombat(session, session.playerX, session.playerZ, now),
      now,
    );
  }
  return open.length;
}

/**
 * Auto-plays remaining chase + strikes until the fight ends (legacy huntTrail).
 *
 * @param userId - Auth user id.
 * @param _pos - Unused; auto-resolve stands at the den.
 */
export function autoResolveOpenCombat(
  userId: string,
  _pos?: Pos,
): CombatActionResult {
  const owned = landOwnedByPlayer(userId);
  if (!owned) return { ok: false, error: ACTION_ERROR.playerMissing };
  const session = getCombatSession(owned.player.id);
  if (!session) return { ok: false, error: ACTION_ERROR.combatNotActive };

  const now = Date.now();
  const step = autoResolveLiveCombat(session, now);
  return persistOpenOrSettle(owned.player, step, now);
}

/** Re-export for huntTrail building-type checks. */
export { isCombatBuildingType };
