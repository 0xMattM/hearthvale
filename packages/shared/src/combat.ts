/** Version-1 combat attributes (Combat.md) — equipment modifiers come later. */

export const COMBAT = {
  maxHealthStart: 100,
  damageStart: 10,
  defenseStart: 5,
  /**
   * Passive HP regen while below max (mirrors ENERGY regen cadence).
   * Paused during an open live fight; food still heals immediately.
   */
  regenAmount: 1,
  regenIntervalMs: 30_000,
  /**
   * PL64.1 / PL67.1 — soft TopBar when health is at or below this % of max.
   * Clears automatically once recovered above the threshold (min HUD, no toast).
   * Mirrors ENERGY.lowWarnPct; does not change combat damage / heal rules.
   */
  lowWarnPct: 25,
} as const;

/** F9.5 — downed penalties: energy + time only; never wipe inventory/lands. */
export const DOWNED = {
  /** Extra energy lost on defeat (after hunt cost already paid). */
  energyPenalty: 20,
  /** Health after getting up. */
  healthAfter: 1,
  /** Extra zone cooldown added on downed. */
  extraCooldownMs: 45_000,
} as const;

/**
 * Applies Bible-safe downed penalties (no loot/gear wipe).
 */
export function applyDownedPenalty(input: {
  energy: number;
  health: number;
}): { energy: number; health: number; energyLost: number } {
  const energyLost = Math.min(
    Math.max(0, input.energy),
    DOWNED.energyPenalty,
  );
  return {
    energy: Math.max(0, input.energy - energyLost),
    health: DOWNED.healthAfter,
    energyLost,
  };
}

export interface CombatStats {
  health: number;
  maxHealth: number;
  damage: number;
  defense: number;
}

/**
 * Applies passive health ticks from elapsed time (mirrors energy regen).
 *
 * @param input.health - Current HP.
 * @param input.maxHealth - Max HP.
 * @param input.healthUpdatedAt - Last regen watermark (0 = treat as `now`).
 * @param input.now - Clock ms.
 * @param input.pause - When true, freeze the watermark without healing (open fight).
 * @returns Clamped HP and the watermark to persist.
 */
export function nextHealthAfterRegen(input: {
  health: number;
  maxHealth: number;
  healthUpdatedAt: number;
  now: number;
  pause?: boolean;
}): { health: number; healthUpdatedAt: number } {
  const maxHealth = Math.max(1, input.maxHealth);
  const health = Math.min(maxHealth, Math.max(0, input.health));
  const now = input.now;
  const last =
    input.healthUpdatedAt > 0 ? input.healthUpdatedAt : now;

  if (input.pause === true) {
    return { health, healthUpdatedAt: now };
  }
  if (health >= maxHealth) {
    return { health: maxHealth, healthUpdatedAt: now };
  }

  const elapsed = Math.max(0, now - last);
  const ticks = Math.floor(elapsed / COMBAT.regenIntervalMs);
  if (ticks <= 0) return { health, healthUpdatedAt: last };

  return {
    health: Math.min(maxHealth, health + ticks * COMBAT.regenAmount),
    healthUpdatedAt: last + ticks * COMBAT.regenIntervalMs,
  };
}

/**
 * Normalizes stored combat columns with starter defaults.
 */
export function normalizeCombatStats(input: {
  health?: number | null;
  maxHealth?: number | null;
  damage?: number | null;
  defense?: number | null;
}): CombatStats {
  const maxHealth = Math.max(
    1,
    input.maxHealth ?? COMBAT.maxHealthStart,
  );
  const health = Math.min(
    maxHealth,
    Math.max(0, input.health ?? maxHealth),
  );
  const damage = Math.max(0, input.damage ?? COMBAT.damageStart);
  const defense = Math.max(0, input.defense ?? COMBAT.defenseStart);
  return { health, maxHealth, damage, defense };
}

/**
 * Damage after simple defense reduction (Combat.md v1).
 */
export function strikeDamage(
  attackerDamage: number,
  defenderDefense: number,
): number {
  return Math.max(1, attackerDamage - Math.floor(defenderDefense / 2));
}

export interface EncounterFoe {
  name: string;
  health: number;
  damage: number;
  defense: number;
}

export interface EncounterResult {
  won: boolean;
  playerHealth: number;
  foeHealth: number;
  rounds: number;
  log: string[];
}

/**
 * Runs a deterministic alternating-strike fight until one side is down.
 * Player strikes first each round.
 */
export function resolveEncounter(
  player: CombatStats,
  foe: EncounterFoe,
  maxRounds = 24,
): EncounterResult {
  let playerHp = Math.max(0, player.health);
  let foeHp = Math.max(0, foe.health);
  const log: string[] = [];
  let rounds = 0;

  while (playerHp > 0 && foeHp > 0 && rounds < maxRounds) {
    rounds += 1;
    const toFoe = strikeDamage(player.damage, foe.defense);
    foeHp = Math.max(0, foeHp - toFoe);
    log.push(`You hit the ${foe.name} for ${toFoe}.`);
    if (foeHp <= 0) break;

    const toYou = strikeDamage(foe.damage, player.defense);
    playerHp = Math.max(0, playerHp - toYou);
    log.push(`The ${foe.name} hits you for ${toYou}.`);
  }

  return {
    won: foeHp <= 0 && playerHp > 0,
    playerHealth: playerHp,
    foeHealth: foeHp,
    rounds,
    log,
  };
}
