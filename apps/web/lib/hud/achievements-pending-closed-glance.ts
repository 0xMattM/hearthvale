/**
 * Achievements-pending closed glance (PL195.2).
 * Quiet TopBar/A chip while a new unlock is pending review and Achievements
 * panel closed — complements unlock rim PL136.1 + open accent PL46.2; no
 * always-on achievements column. Unlock rules unchanged; clears when none
 * pending or panel open; mute ok.
 */

/** Soft pending new unlock (client-staged after locked→unlocked flip). */
export interface PendingAchievementUnlock {
  /** Achievement id (stable). */
  id: string;
  /** Display title for optional copy; chip uses count only. */
  title: string;
}

/**
 * Soft closed-glance chip chrome (PL195.2).
 * Amber-violet kinship with achievement unlock rim — not a permanent
 * Achievements column.
 */
export const ACHIEVEMENTS_PENDING_CLOSED_GLANCE = {
  /** Hotkey letter (KEYBINDS KeyJ — A is WASD move). */
  hotkey: "J",
  /** Quiet chip word — not an Achievements column. */
  word: "Unlock",
  borderColor: "#9078a8",
  textColor: "#b8a0c8",
  className: "topbar-achievements-glance",
} as const;

/**
 * Count staged new unlocks awaiting panel review (PL195.2).
 *
 * @param pending - Staged unlock rows.
 * @returns Number of pending unlocks with a non-empty id.
 */
export function countPendingAchievementUnlocks(
  pending: ReadonlyArray<PendingAchievementUnlock>,
): number {
  let n = 0;
  for (const row of pending) {
    if (row.id.trim().length > 0) n += 1;
  }
  return n;
}

/**
 * Whether any new unlock is pending review (PL195.2).
 *
 * @param pending - Staged unlock rows.
 * @returns True when at least one unlock id is staged.
 */
export function hasPendingAchievementUnlock(
  pending: ReadonlyArray<PendingAchievementUnlock>,
): boolean {
  return countPendingAchievementUnlocks(pending) > 0;
}

/**
 * Whether the closed achievements glance chip should render (PL195.2).
 * True only while a new unlock is pending and Achievements panel is closed.
 *
 * @param pending - Staged unlock rows.
 * @param achievementsPanelOpen - True when Achievements is the open panel.
 * @returns True when the quiet TopBar/A chip should show.
 */
export function shouldShowAchievementsPendingClosedGlance(
  pending: ReadonlyArray<PendingAchievementUnlock>,
  achievementsPanelOpen: boolean,
): boolean {
  if (achievementsPanelOpen) return false;
  return hasPendingAchievementUnlock(pending);
}

/**
 * Compact chip label for pending closed glance (PL195.2).
 * `J · Unlock` or `J · Unlock · N` when more than one staged unlock.
 *
 * @param pending - Staged unlock rows.
 * @returns Chip text; empty string when nothing pending (caller should gate).
 */
export function achievementsPendingClosedGlanceLabel(
  pending: ReadonlyArray<PendingAchievementUnlock>,
): string {
  const n = countPendingAchievementUnlocks(pending);
  if (n <= 0) return "";
  const { hotkey, word } = ACHIEVEMENTS_PENDING_CLOSED_GLANCE;
  if (n > 1) return `${hotkey} · ${word} · ${n}`;
  return `${hotkey} · ${word}`;
}

/**
 * Merge newly unlocked achievement ids into the pending glance list (PL195.2).
 * Dedupes by id; newest title wins. Unlock rules unchanged.
 *
 * @param current - Existing staged unlocks.
 * @param incoming - Newly unlocked rows (id + title).
 * @returns Next pending list.
 */
export function mergePendingAchievementUnlocks(
  current: ReadonlyArray<PendingAchievementUnlock>,
  incoming: ReadonlyArray<{ id: string; title: string }>,
): PendingAchievementUnlock[] {
  const byId = new Map<string, PendingAchievementUnlock>();
  for (const row of current) {
    const id = row.id.trim();
    if (!id) continue;
    byId.set(id, { id, title: row.title.trim() });
  }
  for (const row of incoming) {
    const id = row.id.trim();
    const title = row.title.trim();
    if (!id) continue;
    byId.set(id, { id, title });
  }
  return [...byId.values()];
}

/**
 * Clear all staged unlocks after Achievements panel opens (PL195.2).
 * Review = acknowledged; unlock SoT unchanged.
 *
 * @returns Empty pending list.
 */
export function clearPendingAchievementUnlocks(): PendingAchievementUnlock[] {
  return [];
}

/**
 * Rows that flipped locked → unlocked (PL195.2 staging).
 * Null/undefined prev means not yet hydrated — no stage on first load.
 *
 * @param prev - Previous achievement rows (null = hydrate).
 * @param next - Fresh achievement rows from the API.
 * @returns Newly unlocked id+title rows (may be empty).
 */
export function newlyUnlockedAchievementGlanceRows(
  prev:
    | ReadonlyArray<{ id: string; title: string; unlocked: boolean }>
    | null
    | undefined,
  next: ReadonlyArray<{ id: string; title: string; unlocked: boolean }>,
): PendingAchievementUnlock[] {
  if (prev == null) return [];
  const prevUnlocked = new Set(
    prev.filter((a) => a.unlocked).map((a) => a.id),
  );
  return next
    .filter((a) => a.unlocked && !prevUnlocked.has(a.id))
    .map((a) => ({ id: a.id, title: a.title }));
}
