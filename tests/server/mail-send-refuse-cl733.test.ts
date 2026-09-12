import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl733-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { sendMail } = await import("../../apps/server/src/game/mail.ts");
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

/**
 * CL73.3 — Mail send refuse edges still green.
 * Choice: assert-only missing recipient + empty parcel refuses (no mail invent).
 */
describe("CityLands CL73.3 mail send refuse edges still green", () => {
  let senderId = "";
  let receiverName = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const a = registerUser(`cl733a_${stamp}`, "password123");
    const b = registerUser(`cl733b_${stamp}`, "password123");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("register failed");
    senderId = userIdFromToken(a.token)!;
    const receiverId = userIdFromToken(b.token)!;
    receiverName = getPlayerState(receiverId)!.username;
    const senderPlayerId = db
      .select()
      .from(players)
      .where(eq(players.userId, senderId))
      .get()!.id;
    addItem(senderPlayerId, "wheat", 2);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("refuses send to missing recipient (refuse path 1)", () => {
    const missing = sendMail(
      senderId,
      "nobody_cl733_missing",
      [{ itemId: "wheat", qty: 1 }],
      0,
    );
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.error).toBe(ACTION_ERROR.mailPlayerMissing);
    }
  });

  it("refuses empty parcel with no goods and no coins (refuse path 2)", () => {
    const empty = sendMail(senderId, receiverName, [], 0);
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.error).toBe(ACTION_ERROR.mailEmpty);
    }

    const emptyLegs = sendMail(
      senderId,
      receiverName,
      [{ itemId: "wheat", qty: 0 }],
      0,
    );
    expect(emptyLegs.ok).toBe(false);
    if (!emptyLegs.ok) {
      expect(emptyLegs.error).toBe(ACTION_ERROR.mailEmpty);
    }
  });

  it("still sends a real parcel when recipient + goods present (edge happy)", () => {
    const wheatBefore =
      getPlayerState(senderId)!.inventory.find((i) => i.itemId === "wheat")
        ?.qty ?? 0;
    expect(wheatBefore).toBeGreaterThanOrEqual(1);
    const send = sendMail(
      senderId,
      receiverName,
      [{ itemId: "wheat", qty: 1 }],
      0,
      "CL73.3 ok",
    );
    expect(send.ok).toBe(true);
    expect(
      getPlayerState(senderId)!.inventory.find((i) => i.itemId === "wheat")
        ?.qty ?? 0,
    ).toBe(wheatBefore - 1);
  });
});
