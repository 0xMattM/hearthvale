import {
  ACHIEVEMENTS,
  characterLevelFromXp,
  type AchievementId,
} from "@game/shared";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import {
  achievementProgress,
  players,
  questClaims,
} from "../db/schema.js";

export interface AchievementRowDto {
  id: AchievementId;
  title: string;
  blurb: string;
  counter: number;
  target: number;
  unlocked: boolean;
  unlockedAt: number | null;
}

function playerByUserId(userId: string) {
  return db.select().from(players).where(eq(players.userId, userId)).get();
}

/**
 * Increments a counter achievement and unlocks when target is met.
 */
export function bumpAchievement(
  playerId: string,
  achievementId: AchievementId,
  delta = 1,
): void {
  const def = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!def || def.derived) return;

  const existing = db
    .select()
    .from(achievementProgress)
    .where(
      and(
        eq(achievementProgress.playerId, playerId),
        eq(achievementProgress.achievementId, achievementId),
      ),
    )
    .get();

  const now = Date.now();
  if (!existing) {
    const counter = Math.max(0, delta);
    const unlockedAt = counter >= def.target ? now : null;
    db.insert(achievementProgress)
      .values({
        playerId,
        achievementId,
        counter,
        unlockedAt,
      })
      .run();
    return;
  }

  if (existing.unlockedAt != null) {
    db.update(achievementProgress)
      .set({ counter: existing.counter + delta })
      .where(
        and(
          eq(achievementProgress.playerId, playerId),
          eq(achievementProgress.achievementId, achievementId),
        ),
      )
      .run();
    return;
  }

  const counter = existing.counter + delta;
  const unlockedAt = counter >= def.target ? now : null;
  db.update(achievementProgress)
    .set({ counter, unlockedAt })
    .where(
      and(
        eq(achievementProgress.playerId, playerId),
        eq(achievementProgress.achievementId, achievementId),
      ),
    )
    .run();
}

function derivedProgress(
  playerId: string,
  achievementId: AchievementId,
): { counter: number; unlockedAt: number | null } {
  const player = db.select().from(players).where(eq(players.id, playerId)).get();
  if (!player) return { counter: 0, unlockedAt: null };

  if (achievementId === "quests_complete") {
    const n = db
      .select()
      .from(questClaims)
      .where(eq(questClaims.playerId, playerId))
      .all().length;
    return {
      counter: n,
      unlockedAt: n >= 5 ? Date.now() : null,
    };
  }
  if (achievementId === "reach_level_5") {
    const level = characterLevelFromXp(player.characterXp);
    return {
      counter: level,
      unlockedAt: level >= 5 ? Date.now() : null,
    };
  }
  return { counter: 0, unlockedAt: null };
}

/**
 * Lists all achievement stubs with counters for the player.
 */
export function listAchievements(userId: string): AchievementRowDto[] {
  const player = playerByUserId(userId);
  if (!player) return [];

  const rows = db
    .select()
    .from(achievementProgress)
    .where(eq(achievementProgress.playerId, player.id))
    .all();
  const byId = new Map(rows.map((r) => [r.achievementId, r]));

  return ACHIEVEMENTS.map((def) => {
    if (def.derived) {
      const d = derivedProgress(player.id, def.id);
      // Persist unlock stamp once so UI stays stable
      if (d.unlockedAt != null && !byId.get(def.id)?.unlockedAt) {
        const existing = byId.get(def.id);
        if (existing) {
          db.update(achievementProgress)
            .set({
              counter: d.counter,
              unlockedAt: existing.unlockedAt ?? d.unlockedAt,
            })
            .where(
              and(
                eq(achievementProgress.playerId, player.id),
                eq(achievementProgress.achievementId, def.id),
              ),
            )
            .run();
        } else {
          db.insert(achievementProgress)
            .values({
              playerId: player.id,
              achievementId: def.id,
              counter: d.counter,
              unlockedAt: d.unlockedAt,
            })
            .run();
        }
      }
      const stored = db
        .select()
        .from(achievementProgress)
        .where(
          and(
            eq(achievementProgress.playerId, player.id),
            eq(achievementProgress.achievementId, def.id),
          ),
        )
        .get();
      return {
        id: def.id,
        title: def.title,
        blurb: def.blurb,
        counter: Math.max(d.counter, stored?.counter ?? 0),
        target: def.target,
        unlocked: Boolean(stored?.unlockedAt ?? d.unlockedAt),
        unlockedAt: stored?.unlockedAt ?? null,
      };
    }

    const row = byId.get(def.id);
    const counter = row?.counter ?? 0;
    return {
      id: def.id,
      title: def.title,
      blurb: def.blurb,
      counter,
      target: def.target,
      unlocked: Boolean(row?.unlockedAt) || counter >= def.target,
      unlockedAt: row?.unlockedAt ?? null,
    };
  });
}
