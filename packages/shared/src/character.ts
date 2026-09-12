/**
 * Character level derived from characterXp (F13.1).
 * Soft unlocks only — never combat power.
 */

/** Cumulative XP required to *reach* each level (index = level). Level 1 = 0. */
export const CHARACTER_LEVEL_THRESHOLDS = [
  0, // unused (levels are 1-based)
  0, // L1
  40, // L2
  100, // L3
  180, // L4
  280, // L5 — unlocks extra decor pad
  400, // L6
  540, // L7
  700, // L8
  880, // L9
  1100, // L10 cap display
] as const;

export const CHARACTER_LEVEL = {
  max: CHARACTER_LEVEL_THRESHOLDS.length - 1,
  /** Soft unlock: cosmetic decor_pad on starter yard. */
  extraDecorPadAtLevel: 5,
  extraDecorPad: { slotIndex: 19, x: -4, z: -2 },
} as const;

const TITLES: Array<{ minLevel: number; title: string }> = [
  { minLevel: 8, title: "Veteran" },
  { minLevel: 5, title: "Homesteader" },
  { minLevel: 3, title: "Settler" },
  { minLevel: 1, title: "Newcomer" },
];

/**
 * Character level from total characterXp (minimum 1).
 */
export function characterLevelFromXp(xp: number): number {
  const safe = Math.max(0, Math.floor(xp));
  let level = 1;
  for (let L = 2; L <= CHARACTER_LEVEL.max; L += 1) {
    if (safe >= CHARACTER_LEVEL_THRESHOLDS[L]!) level = L;
    else break;
  }
  return level;
}

/**
 * Cosmetic title for a level (no combat effect).
 */
export function characterTitleForLevel(level: number): string {
  for (const row of TITLES) {
    if (level >= row.minLevel) return row.title;
  }
  return "Newcomer";
}

/**
 * Progress within the current level toward the next.
 */
export function characterXpProgress(xp: number): {
  level: number;
  title: string;
  xpIntoLevel: number;
  xpToNext: number | null;
} {
  const level = characterLevelFromXp(xp);
  const floor = CHARACTER_LEVEL_THRESHOLDS[level] ?? 0;
  const xpIntoLevel = Math.max(0, Math.floor(xp) - floor);
  if (level >= CHARACTER_LEVEL.max) {
    return {
      level,
      title: characterTitleForLevel(level),
      xpIntoLevel,
      xpToNext: null,
    };
  }
  const next = CHARACTER_LEVEL_THRESHOLDS[level + 1] ?? floor;
  return {
    level,
    title: characterTitleForLevel(level),
    xpIntoLevel,
    xpToNext: Math.max(0, next - Math.floor(xp)),
  };
}

/**
 * True when characterXp unlocks the extra cosmetic decor pad.
 */
export function hasExtraDecorPadUnlock(xp: number): boolean {
  return characterLevelFromXp(xp) >= CHARACTER_LEVEL.extraDecorPadAtLevel;
}
