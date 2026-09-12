import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  ANIMAL_PEN,
  WORLD,
  isCityLandKind,
} from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-pl1702-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { travelToLandKind } = await import(
  "../../apps/server/src/game/land.ts"
);
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { feedAnimalPen } = await import(
  "../../apps/server/src/game/actions/gathering.ts"
);
const { isCityStationContendedByOther } = await import(
  "../../apps/server/src/game/stationContention.ts"
);
const {
  reportPresence,
  resetPresence,
} = await import("../../apps/server/src/game/presence.ts");
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingPos(b: { x: number; z: number }) {
  return { x: WORLD.GRID * b.x, z: WORLD.GRID * b.z };
}

/**
 * PL170.2 — City scarce animal_pen soft contention (SoT yields unchanged).
 * Choice: match fishing_dock presence lock so scarce pen competes; land unlimited.
 */
describe("CityLands PL170.2 city scarce animal_pen contention", () => {
  let aliceId = "";
  let aliceName = "";
  let bobId = "";
  let bobName = "";
  let cityLandId = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    aliceName = `pl1702a_${stamp}`;
    bobName = `pl1702b_${stamp}`;
    const a = registerUser(aliceName, "password123");
    const b = registerUser(bobName, "password123");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("register failed");
    aliceId = userIdFromToken(a.token)!;
    bobId = userIdFromToken(b.token)!;
    expect(travelToLandKind(aliceId, "city").ok).toBe(true);
    expect(travelToLandKind(bobId, "city").ok).toBe(true);
    cityLandId = getPlayerState(aliceId)!.landId;
    expect(getPlayerState(bobId)!.landId).toBe(cityLandId);
    expect(isCityLandKind(getPlayerState(aliceId)!.landKind)).toBe(true);
  });

  afterEach(() => {
    resetPresence();
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("second breeder at scarce city pen gets wait refuse (contention)", () => {
    const city = getPlayerState(aliceId)!;
    const pen = city.buildings.find((b) => b.type === "animal_pen");
    expect(pen).toBeTruthy();
    if (!pen) return;

    const pos = buildingPos(pen);
    reportPresence({
      userId: aliceId,
      username: aliceName,
      landId: cityLandId,
      x: pos.x,
      z: pos.z,
    });
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        pen.x,
        pen.z,
        bobId,
      ),
    ).toBe(true);

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, getPlayerState(bobId)!.playerId))
      .run();
    addItem(getPlayerState(bobId)!.playerId, ANIMAL_PEN.feedItemId, 2);

    const result = feedAnimalPen(bobId, pen.id, pos);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(ACTION_ERROR.stationBusy);
    }
    expect(ANIMAL_PEN.cooldownMs).toBe(45_000);
    expect(ANIMAL_PEN.xp).toBe(5);
  });

  it("solo care at city pen succeeds; yields SoT (edge)", () => {
    const city = getPlayerState(aliceId)!;
    const pen = city.buildings.find((b) => b.type === "animal_pen");
    expect(pen).toBeTruthy();
    if (!pen) return;

    db.update(players)
      .set({ energy: 100 })
      .where(eq(players.id, city.playerId))
      .run();
    addItem(city.playerId, ANIMAL_PEN.feedItemId, 2);

    const pos = buildingPos(pen);
    reportPresence({
      userId: aliceId,
      username: aliceName,
      landId: cityLandId,
      x: pos.x,
      z: pos.z,
    });
    expect(
      isCityStationContendedByOther(
        "city",
        cityLandId,
        pen.x,
        pen.z,
        aliceId,
      ),
    ).toBe(false);

    const result = feedAnimalPen(aliceId, pen.id, pos);
    expect(result.ok).toBe(true);
    expect(getPlayerState(aliceId)!.animalBreederXp).toBeGreaterThanOrEqual(
      ANIMAL_PEN.xp,
    );
  });

  it("does not invent livestock combat (failure)", () => {
    expect(String(ACTION_ERROR.stationBusy).toLowerCase()).not.toMatch(
      /combat|nft|loot/,
    );
    expect(ANIMAL_PEN.feedItemId).toBe("wheat");
    expect(ANIMAL_PEN.cleanItemId).toBe("wood");
  });
});
