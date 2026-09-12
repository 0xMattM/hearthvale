import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-mail-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { sendMail, claimMail, cancelMail, listMail } = await import(
  "../../apps/server/src/game/mail.ts"
);
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

describe("mail offline delivery F13.4", () => {
  let senderId = "";
  let receiverId = "";
  let senderPlayerId = "";
  let receiverName = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const a = registerUser(`mail_a_${stamp}`, "password123");
    const b = registerUser(`mail_b_${stamp}`, "password123");
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
      "Hello",
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

  it("sender can cancel unclaimed parcel (edge)", () => {
    addItem(senderPlayerId, "flour", 1);
    const send = sendMail(
      senderId,
      receiverName,
      [{ itemId: "flour", qty: 1 }],
      0,
      "Cancel me",
    );
    expect(send.ok).toBe(true);
    const pending = listMail(senderId).find(
      (m) => m.direction === "sent" && m.status === "pending",
    )!;
    const flourBefore =
      getPlayerState(senderId)!.inventory.find((i) => i.itemId === "flour")
        ?.qty ?? 0;
    expect(cancelMail(senderId, pending.id).ok).toBe(true);
    expect(
      getPlayerState(senderId)!.inventory.find((i) => i.itemId === "flour")
        ?.qty ?? 0,
    ).toBe(flourBefore + 1);
  });

  it("rejects tools and self-mail (failure)", () => {
    const tool = sendMail(
      senderId,
      receiverName,
      [{ itemId: "wooden_hoe", qty: 1 }],
      0,
    );
    expect(tool.ok).toBe(false);
    if (!tool.ok) expect(tool.error).toBe(ACTION_ERROR.mailNotStackable);

    const self = sendMail(
      senderId,
      getPlayerState(senderId)!.username,
      [{ itemId: "wheat", qty: 1 }],
      0,
    );
    expect(self.ok).toBe(false);
    if (!self.ok) expect(self.error).toBe(ACTION_ERROR.mailSelf);
  });
});
