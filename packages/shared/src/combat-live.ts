/**
 * Realtime hunt combat (Explore + Arena).
 * Animals chase and bite on their own timer; LMB is a spatial swing, RMB a guard.
 */

import {
  LIVE_COMBAT,
  type WeaponStyle,
} from "./catalog-combat-gear.js";
import { strikeDamage, type EncounterFoe } from "./combat.js";
import { tickLiveCombat, huntFoeSpawn, worldDist } from "./combat-ai.js";

export type LiveCombatAction = "attack" | "block";

export type LiveCombatZone = "game_trail" | "edge_thicket" | "arena_dummy";

export interface LiveCombatState {
  buildingId: string;
  zone: LiveCombatZone;
  foeName: string;
  foeMaxHealth: number;
  foeHealth: number;
  foeDamage: number;
  foeDefense: number;
  playerHealth: number;
  playerMaxHealth: number;
  playerDamage: number;
  playerDefense: number;
  blockReduction: number;
  style: WeaponStyle;
  blockingUntilMs: number;
  lastAttackAt: number;
  lastFoeAttackAt: number;
  lastTickAt: number;
  lungeUntilMs: number;
  startedAt: number;
  homeX: number;
  homeZ: number;
  foeX: number;
  foeZ: number;
  foeYaw: number;
  playerX: number;
  playerZ: number;
  tookHit: boolean;
  didBlock: boolean;
  rounds: number;
  log: string[];
}

export interface LiveCombatDto {
  active: boolean;
  buildingId: string;
  zone: LiveCombatZone;
  foeName: string;
  foeHealth: number;
  foeMaxHealth: number;
  playerHealth: number;
  playerMaxHealth: number;
  blocking: boolean;
  weaponStyle: WeaponStyle;
  canAttackAt: number;
  foeX: number;
  foeZ: number;
  homeX: number;
  homeZ: number;
  foeYaw: number;
  inStrikeRange: boolean;
  foeLunging: boolean;
}

export interface LiveCombatStepResult {
  state: LiveCombatState;
  finished: boolean;
  won: boolean;
  playerHit: number;
  foeHit: number;
  blocked: boolean;
  missed: boolean;
}

/**
 * Opens a live fight from player + foe combat stats.
 *
 * @param input - Building, zone, stats, spawn, and clock.
 */
export function createLiveCombatState(input: {
  buildingId: string;
  zone: LiveCombatZone;
  foe: EncounterFoe;
  playerHealth: number;
  playerMaxHealth: number;
  playerDamage: number;
  playerDefense: number;
  blockReduction: number;
  style: WeaponStyle;
  now: number;
  homeX?: number;
  homeZ?: number;
  playerX?: number;
  playerZ?: number;
  foeX?: number;
  foeZ?: number;
}): LiveCombatState {
  const homeX = input.homeX ?? 0;
  const homeZ = input.homeZ ?? 0;
  const playerX = input.playerX ?? homeX;
  const playerZ = input.playerZ ?? homeZ;
  const spawn = huntFoeSpawn(
    input.zone,
    homeX,
    homeZ,
    playerX,
    playerZ,
  );
  return {
    buildingId: input.buildingId,
    zone: input.zone,
    foeName: input.foe.name,
    foeMaxHealth: Math.max(1, input.foe.health),
    foeHealth: Math.max(0, input.foe.health),
    foeDamage: Math.max(0, input.foe.damage),
    foeDefense: Math.max(0, input.foe.defense),
    playerHealth: Math.max(0, input.playerHealth),
    playerMaxHealth: Math.max(1, input.playerMaxHealth),
    playerDamage: Math.max(0, input.playerDamage),
    playerDefense: Math.max(0, input.playerDefense),
    blockReduction: Math.min(1, Math.max(0, input.blockReduction)),
    style: input.style,
    blockingUntilMs: 0,
    lastAttackAt: 0,
    lastFoeAttackAt: input.now,
    lastTickAt: input.now,
    lungeUntilMs: 0,
    startedAt: input.now,
    homeX,
    homeZ,
    foeX: input.foeX ?? spawn.x,
    foeZ: input.foeZ ?? spawn.z,
    foeYaw: 0,
    playerX,
    playerZ,
    tookHit: false,
    didBlock: false,
    rounds: 0,
    log: [],
  };
}

/**
 * True when the player swing can reach the live foe.
 *
 * @param state - Live session.
 */
export function isPlayerInStrikeRange(state: LiveCombatState): boolean {
  const reach =
    state.style === "ranged" ? LIVE_COMBAT.rangedRange : LIVE_COMBAT.meleeRange;
  return worldDist(state.playerX, state.playerZ, state.foeX, state.foeZ) <= reach;
}

/**
 * Public HUD snapshot for an in-progress fight.
 *
 * @param state - Live session.
 * @param now - Server epoch ms.
 */
export function liveCombatDto(
  state: LiveCombatState,
  now: number,
): LiveCombatDto {
  return {
    active: state.foeHealth > 0 && state.playerHealth > 0,
    buildingId: state.buildingId,
    zone: state.zone,
    foeName: state.foeName,
    foeHealth: state.foeHealth,
    foeMaxHealth: state.foeMaxHealth,
    playerHealth: state.playerHealth,
    playerMaxHealth: state.playerMaxHealth,
    blocking: now < state.blockingUntilMs,
    weaponStyle: state.style,
    canAttackAt: state.lastAttackAt + LIVE_COMBAT.attackCooldownMs,
    foeX: state.foeX,
    foeZ: state.foeZ,
    homeX: state.homeX,
    homeZ: state.homeZ,
    foeYaw: state.foeYaw,
    inStrikeRange: isPlayerInStrikeRange(state),
    foeLunging: now < state.lungeUntilMs,
  };
}

/**
 * True when an attack is still on cooldown.
 *
 * @param state - Live session.
 * @param now - Server epoch ms.
 * @param skipCooldown - Test / auto-resolve helper.
 */
export function isAttackOnCooldown(
  state: LiveCombatState,
  now: number,
  skipCooldown = false,
): boolean {
  if (skipCooldown) return false;
  return now < state.lastAttackAt + LIVE_COMBAT.attackCooldownMs;
}

/**
 * Applies one player input: swing (range-checked) or raise guard.
 * Does not make the foe counter — animals strike from {@link tickLiveCombat}.
 *
 * @param state - Current session (not mutated).
 * @param action - Left-click attack or right-click block.
 * @param now - Server epoch ms.
 */
export function applyLiveCombatAction(
  state: LiveCombatState,
  action: LiveCombatAction,
  now: number,
): LiveCombatStepResult {
  const next: LiveCombatState = {
    ...state,
    log: state.log.slice(),
  };

  if (action === "block") {
    next.blockingUntilMs = now + LIVE_COMBAT.blockWindowMs;
    next.log.push("You raise your guard.");
    return {
      state: next,
      finished: false,
      won: false,
      playerHit: 0,
      foeHit: 0,
      blocked: false,
      missed: false,
    };
  }

  next.lastAttackAt = now;
  if (!isPlayerInStrikeRange(next)) {
    next.log.push("Your swing misses.");
    return {
      state: next,
      finished: false,
      won: false,
      playerHit: 0,
      foeHit: 0,
      blocked: false,
      missed: true,
    };
  }

  next.rounds += 1;
  const toFoe = strikeDamage(next.playerDamage, next.foeDefense);
  next.foeHealth = Math.max(0, next.foeHealth - toFoe);
  next.log.push(`You hit the ${next.foeName} for ${toFoe}.`);

  const finished = next.foeHealth <= 0 || next.playerHealth <= 0;
  return {
    state: next,
    finished,
    won: next.foeHealth <= 0 && next.playerHealth > 0,
    playerHit: 0,
    foeHit: toFoe,
    blocked: false,
    missed: false,
  };
}

/**
 * Stands the player at the den and plays chase + strikes until one side falls.
 * Used by huntTrail tests / legacy auto-resolve.
 *
 * @param state - Open session.
 * @param now - Server epoch ms.
 */
export function autoResolveLiveCombat(
  state: LiveCombatState,
  now: number,
): LiveCombatStepResult {
  let current: LiveCombatState = {
    ...state,
    playerX: state.homeX,
    playerZ: state.homeZ,
  };
  let last: LiveCombatStepResult = {
    state: current,
    finished: current.foeHealth <= 0 || current.playerHealth <= 0,
    won: current.foeHealth <= 0 && current.playerHealth > 0,
    playerHit: 0,
    foeHit: 0,
    blocked: false,
    missed: false,
  };
  let t = now;
  for (let i = 0; i < 220 && !last.finished; i += 1) {
    t += LIVE_COMBAT.tickMs;
    last = tickLiveCombat(current, current.homeX, current.homeZ, t);
    current = last.state;
    if (last.finished) break;
    if (!isAttackOnCooldown(current, t)) {
      last = applyLiveCombatAction(current, "attack", t);
      current = last.state;
    }
  }
  return last;
}

export {
  tickLiveCombat,
  worldDist,
  combatFoeProfile,
  combatAggroRange,
  combatEngageRange,
  huntFoeSpawn,
  huntFoeIdleOffset,
  huntTerritoryPoint,
  huntDenSeed,
  stepHuntFoeVisual,
  stepCombatFoeDisplay,
  lerpYaw,
} from "./combat-ai.js";
