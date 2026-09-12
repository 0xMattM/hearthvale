/**
 * Realtime foe motion + independent strikes (Explore hunt + Arena dummy).
 * Player swings live in combat-live.ts; animals do not wait for a click.
 */

import { LIVE_COMBAT } from "./catalog-combat-gear.js";
import { strikeDamage } from "./combat.js";
import type {
  LiveCombatState,
  LiveCombatStepResult,
  LiveCombatZone,
} from "./combat-live.js";

export interface CombatFoeProfile {
  speed: number;
  attackMs: number;
  attackRange: number;
}

/**
 * Movement / bite profile for a live-fight zone.
 *
 * @param zone - Hunt trail, thicket, or arena dummy.
 */
export function combatFoeProfile(zone: LiveCombatZone): CombatFoeProfile {
  if (zone === "edge_thicket") {
    return {
      speed: LIVE_COMBAT.boarSpeed,
      attackMs: LIVE_COMBAT.boarAttackMs,
      attackRange: LIVE_COMBAT.boarAttackRange,
    };
  }
  if (zone === "arena_dummy") {
    return {
      speed: LIVE_COMBAT.dummySpeed,
      attackMs: LIVE_COMBAT.dummyAttackMs,
      attackRange: LIVE_COMBAT.dummyAttackRange,
    };
  }
  return {
    speed: LIVE_COMBAT.hareSpeed,
    attackMs: LIVE_COMBAT.hareAttackMs,
    attackRange: LIVE_COMBAT.hareAttackRange,
  };
}

/**
 * Horizontal distance between two world points.
 *
 * @param ax - First X.
 * @param az - First Z.
 * @param bx - Second X.
 * @param bz - Second Z.
 */
export function worldDist(ax: number, az: number, bx: number, bz: number): number {
  return Math.hypot(bx - ax, bz - az);
}

/**
 * Fight-start reach: hunt animals aggro off the pad; dummy stays in the ring.
 *
 * @param zone - Live combat zone.
 */
export function combatAggroRange(zone: LiveCombatZone): number {
  return zone === "arena_dummy"
    ? LIVE_COMBAT.dummyAggroRange
    : LIVE_COMBAT.aggroRange;
}

/**
 * RPG encounter radius from the den cell: covers the roam disk so the fight
 * starts when you meet the animal in the grass, not at a hunt station.
 *
 * @param zone - Live combat zone.
 */
export function combatEngageRange(zone: LiveCombatZone): number {
  if (zone === "arena_dummy") return LIVE_COMBAT.dummyAggroRange;
  return LIVE_COMBAT.wanderRadius + LIVE_COMBAT.engagePadding;
}

/**
 * Spawns the animal inside the territory disk, opposite the player.
 *
 * @param zone - Live combat zone.
 * @param homeX - Den world X.
 * @param homeZ - Den world Z.
 * @param playerX - Player world X.
 * @param playerZ - Player world Z.
 */
export function huntFoeSpawn(
  zone: LiveCombatZone,
  homeX: number,
  homeZ: number,
  playerX: number,
  playerZ: number,
): { x: number; z: number } {
  if (zone === "arena_dummy") return { x: homeX, z: homeZ };
  const dx = playerX - homeX;
  const dz = playerZ - homeZ;
  const d = Math.hypot(dx, dz);
  const r = LIVE_COMBAT.wanderRadius * 0.72;
  if (d < 0.4) return { x: homeX + r, z: homeZ + r * 0.22 };
  return { x: homeX - (dx / d) * r, z: homeZ - (dz / d) * r };
}

export type HuntFoeVisualKind = "hare" | "boar" | "dummy";

/**
 * Territory-local idle pose so the mesh starts in the grass, not on a plot.
 *
 * @param kind - Hare, boar, or dummy.
 * @param seed - Stable 0..1 from the building id.
 */
export function huntFoeIdleOffset(
  kind: HuntFoeVisualKind,
  seed: number,
): { x: number; z: number } {
  if (kind === "dummy") return { x: 0, z: 0 };
  return huntTerritoryPoint(seed, 0, LIVE_COMBAT.wanderRadius);
}

/**
 * Seeded point inside a hunt territory disk (wildlife spawn / brush).
 *
 * @param seed - Stable 0..1 from the den id.
 * @param slot - Distinct point index (0 = creature idle).
 * @param radius - Disk radius in world units.
 */
export function huntTerritoryPoint(
  seed: number,
  slot: number,
  radius: number,
): { x: number; z: number } {
  const u = frac(seed * 17.13 + slot * 9.41);
  const v = frac(seed * 31.77 + slot * 5.29);
  const a = u * Math.PI * 2;
  const r = radius * Math.sqrt(0.18 + 0.82 * v);
  return { x: Math.cos(a) * r, z: Math.sin(a) * r * 0.88 };
}

function frac(n: number): number {
  return n - Math.floor(n);
}

/**
 * Stable 0..1 seed from a hunt den building id.
 *
 * @param buildingId - Trail / thicket building id.
 */
export function huntDenSeed(buildingId: string): number {
  let h = 2166136261;
  for (let i = 0; i < buildingId.length; i += 1) {
    h ^= buildingId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

export interface HuntFoeVisualStep {
  x: number;
  z: number;
  yaw: number;
  chasing: boolean;
}

/**
 * Client-side roam / chase in den-local XZ. Animals wander the territory and run at the player.
 *
 * @param input - Kind, dt, current pose, player in pad space, and flags.
 */
export function stepHuntFoeVisual(input: {
  kind: HuntFoeVisualKind;
  dt: number;
  x: number;
  z: number;
  yaw: number;
  playerLocalX: number;
  playerLocalZ: number;
  timeSec: number;
  seed: number;
  ready: boolean;
  combatActive: boolean;
}): HuntFoeVisualStep {
  if (input.kind === "dummy") {
    return { x: 0, z: 0, yaw: input.yaw, chasing: input.combatActive };
  }
  const dt = Math.min(0.05, Math.max(0, input.dt));
  const speed =
    input.kind === "boar" ? LIVE_COMBAT.boarSpeed : LIVE_COMBAT.hareSpeed;
  const pdx = input.playerLocalX - input.x;
  const pdz = input.playerLocalZ - input.z;
  const pdist = Math.hypot(pdx, pdz);
  const chasing =
    input.ready && (input.combatActive || pdist <= LIVE_COMBAT.aggroRange);

  if (!input.ready) {
    return { x: input.x * 0.9, z: input.z * 0.9, yaw: input.yaw, chasing: false };
  }

  if (chasing) {
    const yaw = pdist > 0.001 ? Math.atan2(pdx, pdz) : input.yaw;
    if (pdist <= LIVE_COMBAT.stopDistance || pdist < 0.001) {
      return { x: input.x, z: input.z, yaw, chasing: true };
    }
    const step = Math.min(pdist - LIVE_COMBAT.stopDistance, speed * dt);
    const inv = 1 / pdist;
    return {
      x: input.x + pdx * inv * step,
      z: input.z + pdz * inv * step,
      yaw,
      chasing: true,
    };
  }

  const pulse =
    0.38 +
    0.62 * (0.5 + 0.5 * Math.sin(input.timeSec * 0.27 + input.seed * 5.1));
  const r = LIVE_COMBAT.wanderRadius * pulse;
  const targetX =
    Math.sin(input.timeSec * 0.55 + input.seed * 6.2) * r;
  const targetZ =
    Math.cos(input.timeSec * 0.41 + input.seed * 4.1) * r * 0.88;
  const dx = targetX - input.x;
  const dz = targetZ - input.z;
  const dist = Math.hypot(dx, dz);
  if (dist < 0.04) {
    return { x: input.x, z: input.z, yaw: input.yaw, chasing: false };
  }
  const step = Math.min(dist, speed * LIVE_COMBAT.wanderSpeedMul * dt);
  const inv = 1 / dist;
  return {
    x: input.x + dx * inv * step,
    z: input.z + dz * inv * step,
    yaw: Math.atan2(dx, dz),
    chasing: false,
  };
}

/**
 * Shortest-path yaw blend so creatures do not spin the long way.
 *
 * @param from - Current yaw.
 * @param to - Target yaw.
 * @param t - 0..1 mix.
 */
export function lerpYaw(from: number, to: number, t: number): number {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  const k = Math.min(1, Math.max(0, t));
  return from + d * k;
}

/**
 * Fight pose follows the server animal; idle still roams the grass.
 *
 * @param input - Visual step plus authoritative pad-local server pose.
 */
export function stepCombatFoeDisplay(
  input: Parameters<typeof stepHuntFoeVisual>[0] & {
    serverOffsetX: number;
    serverOffsetZ: number;
    serverYaw: number;
  },
): HuntFoeVisualStep {
  const dt = Math.min(0.05, Math.max(0, input.dt));
  const follow = 1 - Math.exp(-10 * dt);
  if (input.kind === "dummy") {
    const face = Math.atan2(input.playerLocalX, input.playerLocalZ);
    return {
      x: 0,
      z: 0,
      yaw: input.combatActive ? lerpYaw(input.yaw, face, follow) : input.yaw,
      chasing: input.combatActive,
    };
  }
  if (input.combatActive) {
    return {
      x: input.x + (input.serverOffsetX - input.x) * follow,
      z: input.z + (input.serverOffsetZ - input.z) * follow,
      yaw: lerpYaw(input.yaw, input.serverYaw, follow),
      chasing: true,
    };
  }
  return stepHuntFoeVisual(input);
}

function cloneState(state: LiveCombatState): LiveCombatState {
  return { ...state, log: state.log.slice() };
}

function finishedResult(
  state: LiveCombatState,
  extra: Partial<LiveCombatStepResult>,
): LiveCombatStepResult {
  return {
    state,
    finished: state.foeHealth <= 0 || state.playerHealth <= 0,
    won: state.foeHealth <= 0 && state.playerHealth > 0,
    playerHit: 0,
    foeHit: 0,
    blocked: false,
    missed: false,
    ...extra,
  };
}

function clampToLeash(
  x: number,
  z: number,
  homeX: number,
  homeZ: number,
  leash: number,
): { x: number; z: number } {
  const d = worldDist(homeX, homeZ, x, z);
  if (d <= leash || d < 0.001) return { x, z };
  const k = leash / d;
  return { x: homeX + (x - homeX) * k, z: homeZ + (z - homeZ) * k };
}

/**
 * Advances foe chase and lets the animal strike when in bite range.
 * Does not resolve a player swing.
 *
 * @param state - Current session (not mutated).
 * @param playerX - Client world X.
 * @param playerZ - Client world Z.
 * @param now - Server epoch ms.
 */
export function tickLiveCombat(
  state: LiveCombatState,
  playerX: number,
  playerZ: number,
  now: number,
): LiveCombatStepResult {
  const next = cloneState(state);
  next.playerX = playerX;
  next.playerZ = playerZ;

  const dt = Math.min(0.25, Math.max(0, (now - next.lastTickAt) / 1000));
  next.lastTickAt = now;

  if (next.foeHealth <= 0 || next.playerHealth <= 0) {
    return finishedResult(next, {});
  }
  if (now - next.startedAt >= LIVE_COMBAT.maxFightMs) {
    next.log.push("The fight runs too long.");
    return finishedResult(next, { finished: true, won: false });
  }

  const profile = combatFoeProfile(next.zone);
  const dx = playerX - next.foeX;
  const dz = playerZ - next.foeZ;
  const dist = worldDist(next.foeX, next.foeZ, playerX, playerZ);
  if (dist > 0.001) next.foeYaw = Math.atan2(dx, dz);

  if (profile.speed > 0 && dist > LIVE_COMBAT.stopDistance && dt > 0) {
    const step = Math.min(dist - LIVE_COMBAT.stopDistance, profile.speed * dt);
    const inv = 1 / dist;
    next.foeX += dx * inv * step;
    next.foeZ += dz * inv * step;
    const leashed = clampToLeash(
      next.foeX,
      next.foeZ,
      next.homeX,
      next.homeZ,
      LIVE_COMBAT.leash,
    );
    next.foeX = leashed.x;
    next.foeZ = leashed.z;
  }

  const biteDist = worldDist(next.foeX, next.foeZ, playerX, playerZ);
  const canBite =
    biteDist <= profile.attackRange &&
    now >= next.lastFoeAttackAt + profile.attackMs;

  if (!canBite) {
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

  next.lastFoeAttackAt = now;
  next.lungeUntilMs = now + LIVE_COMBAT.lungeMs;
  next.rounds += 1;
  const raw = strikeDamage(next.foeDamage, next.playerDefense);
  const blocked = now < next.blockingUntilMs;
  const playerHit = blocked
    ? Math.max(0, Math.floor(raw * (1 - next.blockReduction)))
    : raw;
  next.playerHealth = Math.max(0, next.playerHealth - playerHit);
  if (playerHit > 0) next.tookHit = true;
  if (blocked) {
    next.didBlock = true;
    next.blockingUntilMs = 0;
    next.log.push(
      playerHit === 0
        ? `You block the ${next.foeName}.`
        : `You block; the ${next.foeName} hits you for ${playerHit}.`,
    );
  } else {
    next.log.push(`The ${next.foeName} hits you for ${playerHit}.`);
  }

  return finishedResult(next, { playerHit, blocked });
}
