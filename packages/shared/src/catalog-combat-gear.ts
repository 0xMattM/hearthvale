/**
 * v1 combat gear SoT — weapons, armor, shields (Combat.md equipment).
 * Crafted only; never NFT / chain power. Tools stay gather-only.
 */

import type { ItemId } from "./catalog-items.js";
import { TOOL_HUNT_DAMAGE } from "./catalog-items.js";

/** Inventory slot used by combat gear (tools stay on `equipSlot: "tool"`). */
export type CombatEquipSlot = "weapon" | "armor" | "shield";

/** Melee needs walk-up range; bows reach farther after the fight starts. */
export type WeaponStyle = "melee" | "ranged";

export interface WeaponGearDef {
  slot: "weapon";
  style: WeaponStyle;
  damage: number;
  maxDurability: number;
}

export interface ArmorGearDef {
  slot: "armor";
  defense: number;
  maxDurability: number;
}

export interface ShieldGearDef {
  slot: "shield";
  defense: number;
  blockReduction: number;
  maxDurability: number;
}

export type CombatGearDef = WeaponGearDef | ArmorGearDef | ShieldGearDef;

/**
 * Compact v1 loadout — blacksmith / carpenter / weaver sinks (Combat.md).
 * Numbers stay small so unarmed hunting still works.
 */
export const COMBAT_GEAR = {
  wooden_club: {
    slot: "weapon",
    style: "melee",
    damage: 3,
    maxDurability: 40,
  },
  iron_sword: {
    slot: "weapon",
    style: "melee",
    damage: 8,
    maxDurability: 70,
  },
  wooden_bow: {
    slot: "weapon",
    style: "ranged",
    damage: 6,
    maxDurability: 50,
  },
  leather_armor: {
    slot: "armor",
    defense: 6,
    maxDurability: 60,
  },
  wooden_shield: {
    slot: "shield",
    defense: 2,
    blockReduction: 0.7,
    maxDurability: 50,
  },
} as const satisfies Record<string, CombatGearDef>;

export type CombatGearItemId = keyof typeof COMBAT_GEAR;

/**
 * Realtime hunt timings (Explore + Arena only).
 * Animals chase and strike on their own cadence; player LMB is a swing, not a round.
 */
export const LIVE_COMBAT = {
  attackCooldownMs: 450,
  blockWindowMs: 700,
  unarmedBlockReduction: 0.25,
  meleeRange: 1.35,
  rangedRange: 4.2,
  maxRounds: 80,
  tickMs: 80,
  leash: 8,
  stopDistance: 0.95,
  lungeMs: 280,
  maxFightMs: 90_000,
  /** Chase is slower than the player (4.4) so wildlife does not rocket in. */
  hareSpeed: 1.35,
  boarSpeed: 1.1,
  dummySpeed: 0,
  /** Idle patrol as a fraction of chase speed. */
  wanderSpeedMul: 0.72,
  hareAttackMs: 1100,
  boarAttackMs: 1400,
  dummyAttackMs: 1400,
  hareAttackRange: 1.1,
  boarAttackRange: 1.2,
  dummyAttackRange: 1.25,
  /** Tight roam disk — you walk up to the animal, not a hunt plot. */
  wanderRadius: 4.2,
  /** Unused habitat leftover; animals no longer sit in brush props. */
  habitatRadius: 4.8,
  /** Visual chase / bite telegraph — walk-up only. */
  aggroRange: 2.55,
  /** Extra reach past the roam disk so the fight starts on the animal, not the pad. */
  engagePadding: 1.05,
  dummyAggroRange: 1.6,
} as const;

/**
 * Arena training dummy (Warrior map). Practice only — no hunter XP / loot.
 */
export const ARENA_DUMMY = {
  name: "Training Dummy",
  health: 36,
  damage: 7,
  defense: 3,
  cooldownMs: 8_000,
} as const;

/**
 * True when itemId is v1 combat gear.
 *
 * @param itemId - Catalog item id.
 */
export function isCombatGearItemId(itemId: string): itemId is CombatGearItemId {
  return itemId in COMBAT_GEAR;
}

/**
 * Combat equip slot for a catalog item, or null when not gear.
 *
 * @param itemId - Catalog item id.
 */
export function combatGearSlot(itemId: string): CombatEquipSlot | null {
  if (!isCombatGearItemId(itemId)) return null;
  return COMBAT_GEAR[itemId].slot;
}

/**
 * Weapon style for an equipped weapon id (unarmed = melee).
 *
 * @param itemId - Equipped weapon item id, or null.
 */
export function weaponStyleFor(
  itemId: string | null | undefined,
): WeaponStyle {
  if (!itemId || !isCombatGearItemId(itemId)) return "melee";
  const def = COMBAT_GEAR[itemId];
  return def.slot === "weapon" ? def.style : "melee";
}

/** In-hand silhouette while a live fight is active. */
export type HeldCombatWeaponKind = "club" | "sword" | "bow";

const HELD_COMBAT_WEAPON_KIND: Record<string, HeldCombatWeaponKind> = {
  wooden_club: "club",
  iron_sword: "sword",
  wooden_bow: "bow",
};

/**
 * Held weapon mesh to show on the avatar during a live fight.
 * Work tools, armor, shields, and idle walking stay empty-handed.
 *
 * @param itemId - Equipped combat weapon catalog id, or null when unarmed.
 * @param inCombat - True only while a live foe encounter is active.
 * @returns Club / sword / bow, or null when nothing should be drawn.
 */
export function heldCombatWeaponKind(
  itemId: string | null | undefined,
  inCombat: boolean,
): HeldCombatWeaponKind | null {
  if (!inCombat || !itemId) return null;
  if (!isCombatGearItemId(itemId)) return null;
  if (COMBAT_GEAR[itemId].slot !== "weapon") return null;
  return HELD_COMBAT_WEAPON_KIND[itemId] ?? null;
}

export interface CombatLoadoutInput {
  weaponItemId?: string | null;
  armorItemId?: string | null;
  shieldItemId?: string | null;
  toolItemId?: string | null;
}

export interface CombatLoadoutBonuses {
  damage: number;
  defense: number;
  style: WeaponStyle;
  blockReduction: number;
  twoHanded: boolean;
}

/**
 * Damage / defense / block bonuses from equipped gear.
 * Weapon replaces the soft tool hunt bonus (F9.4) when a weapon is on.
 *
 * @param input - Equipped combat + gather item ids.
 */
export function combatLoadoutBonuses(
  input: CombatLoadoutInput,
): CombatLoadoutBonuses {
  const weaponId = input.weaponItemId ?? null;
  const armorId = input.armorItemId ?? null;
  const shieldId = input.shieldItemId ?? null;
  const toolId = input.toolItemId ?? null;

  let damage = 0;
  let style: WeaponStyle = "melee";
  let twoHanded = false;
  if (weaponId && isCombatGearItemId(weaponId)) {
    const def = COMBAT_GEAR[weaponId];
    if (def.slot === "weapon") {
      damage += def.damage;
      style = def.style;
      twoHanded = def.style === "ranged";
    }
  } else if (toolId) {
    damage += TOOL_HUNT_DAMAGE[toolId as ItemId] ?? 0;
  }

  let defense = 0;
  let blockReduction: number = LIVE_COMBAT.unarmedBlockReduction;
  if (armorId && isCombatGearItemId(armorId)) {
    const def = COMBAT_GEAR[armorId];
    if (def.slot === "armor") defense += def.defense;
  }
  if (!twoHanded && shieldId && isCombatGearItemId(shieldId)) {
    const def = COMBAT_GEAR[shieldId];
    if (def.slot === "shield") {
      defense += def.defense;
      blockReduction = def.blockReduction;
    }
  }

  return { damage, defense, style, blockReduction, twoHanded };
}

/**
 * Interact / strike range for the current weapon style.
 *
 * @param style - Melee or ranged.
 */
export function combatReachFor(style: WeaponStyle): number {
  return style === "ranged" ? LIVE_COMBAT.rangedRange : LIVE_COMBAT.meleeRange;
}

/**
 * True when a building type can host a live fight.
 *
 * @param type - Building type id.
 */
export function isCombatBuildingType(type: string): boolean {
  return (
    type === "game_trail" || type === "edge_thicket" || type === "arena_dummy"
  );
}
