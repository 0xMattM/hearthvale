import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR, LIVE_COMBAT, WORLD } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-live-combat-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { startLiveCombat, actLiveCombat, tickLiveCombatSession, pulseActiveCombatSessions } = await import(
  "../../apps/server/src/game/actions/combat-live.ts"
);
const { huntTrail } = await import(
  "../../apps/server/src/game/actions/hunting.ts"
);
const { travelToLandKind } = await import(
  "../../apps/server/src/game/land.ts"
);
const { getPlayerState } = await import(
  "../../apps/server/src/game/player.ts"
);
const { equipCombatGear } = await import(
  "../../apps/server/src/game/actions/equipment.ts"
);
const { addItem } = await import("../../apps/server/src/game/player.ts");
const { buildings, players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

describe("live combat Explore + Arena + gear", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `livec_${Date.now().toString(36)}`,
      "password123",
    );
    expect(reg.ok).toBe(true);
    if (!reg.ok) throw new Error("register failed");
    userId = userIdFromToken(reg.token)!;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("starts a hunt on the Explore trail and wins with attacks (happy)", () => {
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const state = getPlayerState(userId)!;
    const trail = state.buildings.find((b) => b.type === "game_trail");
    expect(trail).toBeTruthy();
    const pos = buildingPos(trail!);
    const started = startLiveCombat(userId, trail!.id, pos);
    expect(started.ok).toBe(true);
    expect(started.combat?.active).toBe(true);
    expect(started.combat?.foeName).toBe("Forest Hare");
    expect(
      Math.hypot(
        (started.combat!.foeX ?? 0) - pos.x,
        (started.combat!.foeZ ?? 0) - pos.z,
      ),
    ).toBeGreaterThan(LIVE_COMBAT.wanderRadius * 0.5);

    let now = Date.now();
    let last = started;
    for (
      let i = 0;
      i < 50 && last.combat?.active && last.combat.inStrikeRange === false;
      i += 1
    ) {
      now += LIVE_COMBAT.tickMs;
      last = tickLiveCombatSession(userId, pos, now);
    }
    for (let i = 0; i < 24 && last.combat?.active; i += 1) {
      now += LIVE_COMBAT.tickMs;
      last = actLiveCombat(userId, "attack", pos, true, now);
      expect(last.ok).toBe(true);
    }
    expect(last.encounter?.won).toBe(true);
    expect(last.combat).toBeNull();
    const after = getPlayerState(userId)!;
    expect(after.inventory.some((i) => i.itemId === "leather")).toBe(true);
  });

  it("blocks in the Arena dummy spar and refuses combat on player land (edge)", () => {
    expect(travelToLandKind(userId, "warrior").ok).toBe(true);
    const arena = getPlayerState(userId)!;
    const dummy = arena.buildings.find((b) => b.type === "arena_dummy");
    expect(dummy).toBeTruthy();
    const started = startLiveCombat(userId, dummy!.id, buildingPos(dummy!));
    expect(started.ok).toBe(true);
    expect(started.combat?.foeName).toBe("Training Dummy");
    const blocked = actLiveCombat(userId, "block", buildingPos(dummy!));
    expect(blocked.ok).toBe(true);
    expect(blocked.combat?.blocking).toBe(true);
    expect(typeof blocked.combat?.foeX).toBe("number");

    expect(travelToLandKind(userId, "player_land").ok).toBe(true);
    const home = getPlayerState(userId)!;
    const plot = home.buildings[0];
    const refused = startLiveCombat(
      userId,
      plot?.id ?? "none",
      plot ? buildingPos(plot) : { x: 0, z: 0 },
    );
    expect(refused.ok).toBe(false);
    expect(
      refused.error === ACTION_ERROR.combatTargetMissing ||
        refused.error === ACTION_ERROR.combatZoneOnly,
    ).toBe(true);
  });

  it("equips a sword and refuses city hunt (failure)", () => {
    const pid = db.select().from(players).where(eq(players.userId, userId)).get()!.id;
    addItem(pid, "iron_sword", 1);
    const withSword = getPlayerState(userId)!;
    const sword = withSword.inventory.find((i) => i.itemId === "iron_sword");
    expect(sword).toBeTruthy();
    expect(equipCombatGear(userId, sword!.id).ok).toBe(true);
    const geared = getPlayerState(userId)!;
    expect(geared.equippedWeaponInventoryId).toBe(sword!.id);
    expect(geared.damage).toBeGreaterThan(10);

    expect(travelToLandKind(userId, "city").ok).toBe(true);
    const city = getPlayerState(userId)!;
    const hunt = huntTrail(
      userId,
      city.buildings[0]?.id ?? "x",
      { x: 0, z: 0 },
    );
    expect(hunt.ok).toBe(false);
    expect(hunt.error).toBe(ACTION_ERROR.huntExploreOnly);
  });

  it("lets the hare bite on tick without a player swing (edge)", () => {
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    const state = getPlayerState(userId)!;
    const trail = state.buildings.find((b) => b.type === "game_trail");
    expect(trail).toBeTruthy();
    db.update(buildings)
      .set({ readyAt: null })
      .where(eq(buildings.id, trail!.id))
      .run();
    const home = buildingPos(trail!);
    const pos = { x: home.x + LIVE_COMBAT.wanderRadius, z: home.z };
    const started = startLiveCombat(userId, trail!.id, pos);
    expect(started.ok).toBe(true);
    const hp = getPlayerState(userId)!.health;
    let now = Date.now();
    for (let i = 0; i < 80; i += 1) {
      now += LIVE_COMBAT.tickMs;
      pulseActiveCombatSessions(now);
    }
    const after = getPlayerState(userId)!;
    expect(after.health).toBeLessThan(hp);
  });
});
