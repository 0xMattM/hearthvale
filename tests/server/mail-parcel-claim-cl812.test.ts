import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl812-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { sendMail, claimMail, listMail } = await import(
  "../../apps/server/src/game/mail.ts"
);
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

/**
 * CL81.2 — Mail parcel claim still green.
 * Choice: assert-only send → claim escrow (parity with CL69.1; no mail invent).
 */
describe("CityLands CL81.2 Mail parcel claim still green", () => {
  let senderId = "";
  let receiverId = "";
  let senderPlayerId = "";
  let receiverName = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const a = registerUser(`cl812a_${stamp}`, "password123");
    const b = registerUser(`cl812b_${stamp}`, "password123");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) throw new Error("register failed");
    senderId = userIdFromToken(a.token)!;
    receiverId = userIdFromToken(b.token)!;
    senderPlayerId = db
      .select()
      .from(players)
      .where(eq(players.userId, senderId))
      .get()!.id;
    receiverName = getPlayerState(receiverId)!.username;
    addItem(senderPlayerId, "wheat", 4);
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("sends parcel offline and recipient claims when online (happy)", () => {
    const wheatBefore =
      getPlayerState(senderId)!.inventory.find((i) => i.itemId === "wheat")
        ?.qty ?? 0;
    const send = sendMail(
      senderId,
      receiverName,
      [{ itemId: "wheat", qty: 2 }],
      5,
      "CL81.2 parcel",
    );
    expect(send.ok).toBe(true);
    expect(
      getPlayerState(senderId)!.inventory.find((i) => i.itemId === "wheat")
        ?.qty ?? 0,
    ).toBe(wheatBefore - 2);

    const inbox = listMail(receiverId).filter(
      (m) => m.direction === "inbox" && m.status === "pending",
    );
    expect(inbox.length).toBe(1);
    const coinsBefore = getPlayerState(receiverId)!.softCurrency;
    const claim = claimMail(receiverId, inbox[0]!.id);
    expect(claim.ok).toBe(true);
    expect(
      getPlayerState(receiverId)!.inventory.find((i) => i.itemId === "wheat")
        ?.qty ?? 0,
    ).toBeGreaterThanOrEqual(2);
    expect(getPlayerState(receiverId)!.softCurrency).toBe(coinsBefore + 5);
  });

  it("refuses second claim of already-claimed parcel (edge)", () => {
    const claimed = listMail(receiverId).find(
      (m) => m.direction === "inbox" && m.status === "claimed",
    );
    expect(claimed).toBeTruthy();
    const again = claimMail(receiverId, claimed!.id);
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe(ACTION_ERROR.mailAlreadyClaimed);
    }
  });

  it("rejects claim of missing parcel (failure)", () => {
    const missing = claimMail(receiverId, "mail_missing_cl812");
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.error).toBe(ACTION_ERROR.mailNotFound);
    }
  });
});
