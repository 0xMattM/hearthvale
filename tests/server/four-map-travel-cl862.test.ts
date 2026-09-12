import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ACTION_ERROR,
  CANONICAL_LAND_KINDS,
  LAND_DESTINATIONS,
  TRAVEL,
  formatFreeTravelCircuit,
  freeTravelPortalPrompt,
  type BuildingDto,
  type CanonicalLandKind,
} from "@game/shared";
import { eq } from "drizzle-orm";
import { resolveInteractPrompt } from "../../apps/web/lib/hud/interact-prompt";
import type { InteractTarget } from "../../apps/web/components/land-scene/landProximity";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl862-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
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
const { players } = await import("../../apps/server/src/db/schema.ts");

function buildingTarget(type: BuildingDto["type"]): InteractTarget {
  const building: BuildingDto = {
    id: "b1",
    type,
    slotIndex: 0,
    x: 0,
    z: 0,
    tier: 1,
    cropState: null,
    cropId: null,
    plantedAt: null,
    readyAt: null,
    claim: null,
    tutorialNpcId: null,
  };
  return { kind: "building", dist: 1, building };
}

const FOUR: CanonicalLandKind[] = [
  "city",
  "player_land",
  "explore",
  "warrior",
];

/**
 * CL86.2 — Four-map free travel / portal prompts still green.
 * Choice: assert-only fare-free circuit + Free travel · Exit · N (parity with CL78.2 / CL74.1).
 */
describe("CityLands CL86.2 four-map free travel / portal prompts still green", () => {
  let userId = "";

  beforeAll(() => {
    migrateSqlite();
    const reg = registerUser(
      `cl862_${Date.now().toString(36)}`,
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

  it("circuits city ↔ land ↔ explore ↔ warrior instantly with no fare (happy)", () => {
    const before = getPlayerState(userId)!;
    const coins = before.softCurrency;
    const pid = before.playerId;
    addItem(pid, "travel_ration", 2);
    addItem(pid, "bread", 1);

    const circuit = [
      "city",
      "player_land",
      "explore",
      "warrior",
      "city",
    ] as const;
    for (const kind of circuit) {
      expect(travelToLandKind(userId, kind).ok).toBe(true);
      const state = getPlayerState(userId)!;
      expect(state.landKind).toBe(kind);
      expect(state.travelArriveAt).toBeNull();
      expect(state.travelDestinationKind).toBeNull();
      expect(state.softCurrency).toBe(coins);
    }

    const inv = getPlayerState(userId)!.inventory;
    expect(inv.some((i) => i.itemId === "travel_ration" && i.qty >= 2)).toBe(
      true,
    );
    expect(inv.some((i) => i.itemId === "bread" && i.qty >= 1)).toBe(true);
  });

  it("labels portal Free travel + warrior Exit · N (happy prompts)", () => {
    const circuit = formatFreeTravelCircuit();
    expect(circuit).toContain("City");
    expect(circuit).toContain("Your Land");
    expect(circuit).toContain("Exploration");
    expect(circuit).toContain("Warrior Arena");
    expect(LAND_DESTINATIONS.map((d) => d.kind)).toEqual(FOUR);

    for (const kind of ["city", "player_land", "explore"] as const) {
      const prompt = resolveInteractPrompt({
        target: buildingTarget("portal"),
        visiting: false,
        gameNow: 0,
        occupiedSlotIndexes: [],
        landKind: kind,
      });
      expect(prompt?.showKey).toBe(true);
      expect(prompt?.label).toBe(freeTravelPortalPrompt(kind));
      expect(prompt!.label).toMatch(/^Travel · free ·/);
      expect(prompt!.label).toContain(circuit);
      expect(prompt!.label.toLowerCase()).not.toMatch(/fare|caravan|coins/);
    }

    const warrior = resolveInteractPrompt({
      target: buildingTarget("portal"),
      visiting: false,
      gameNow: 0,
      occupiedSlotIndexes: [],
      landKind: "warrior",
    });
    expect(warrior?.label).toMatch(/^Exit · Travel · free/);
    expect(warrior?.label).toMatch(/\bN\b/);
    expect(warrior?.label).toBe(freeTravelPortalPrompt("warrior"));
  });

  it("keeps destination book + caravan constants unused for map hops (edge)", () => {
    expect(LAND_DESTINATIONS.map((d) => d.kind)).toEqual([
      ...CANONICAL_LAND_KINDS,
    ]);
    expect(TRAVEL.durationMs).toBeGreaterThan(0);
    expect(TRAVEL.coinCost).toBeGreaterThan(0);

    const home = getPlayerState(userId)!;
    db.update(players)
      .set({ softCurrency: 0 })
      .where(eq(players.id, home.playerId))
      .run();
    expect(travelToLandKind(userId, "explore").ok).toBe(true);
    expect(getPlayerState(userId)!.softCurrency).toBe(0);
    expect(getPlayerState(userId)!.travelArriveAt).toBeNull();
  });

  it("refuses already-here travel (failure)", () => {
    expect(getPlayerState(userId)!.landKind).toBe("explore");
    const again = travelToLandKind(userId, "explore");
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.travelAlreadyHere);
    }
  });
});
