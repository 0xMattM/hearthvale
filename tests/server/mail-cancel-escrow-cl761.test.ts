import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ACTION_ERROR } from "@game/shared";
import { eq } from "drizzle-orm";

const dbFile = path.join(
  os.tmpdir(),
  `game-cl761-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
);

process.env.GAME_DB_PATH = dbFile;

const { migrateSqlite, db } = await import(
  "../../apps/server/src/db/client.ts"
);
const { registerUser, userIdFromToken } = await import(
  "../../apps/server/src/auth/auth.ts"
);
const { sendMail, cancelMail, listMail } = await import(
  "../../apps/server/src/game/mail.ts"
);
const { getPlayerState, addItem } = await import(
  "../../apps/server/src/game/player.ts"
);
const { players } = await import("../../apps/server/src/db/schema.ts");

/**
 * CL76.1 — Mail cancel returns escrow still green.
 * Choice: assert-only send → cancel restore (parity with CL69.3 market cancel; no mail invent).
 */
describe("CityLands CL76.1 Mail cancel returns escrow still green", () => {
  let senderId = "";
  let receiverId = "";
  let otherId = "";
  let senderPlayerId = "";
  let receiverName = "";

  beforeAll(() => {
    migrateSqlite();
    const stamp = Date.now().toString(36);
    const a = registerUser(`cl761a_${stamp}`, "password123");
    const b = registerUser(`cl761b_${stamp}`, "password123");
    const c = registerUser(`cl761c_${stamp}`, "password123");
    expect(a.ok && b.ok && c.ok).toBe(true);
    if (!a.ok || !b.ok || !c.ok) throw new Error("register failed");
    senderId = userIdFromToken(a.token)!;
    receiverId = userIdFromToken(b.token)!;
    otherId = userIdFromToken(c.token)!;
    senderPlayerId = db
      .select()
      .from(players)
      .where(eq(players.userId, senderId))
      .get()!.id;
    receiverName = getPlayerState(receiverId)!.username;
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {
      /* ignore */
    }
  });

  it("sends parcel then cancel restores goods to sender (happy)", () => {
    addItem(senderPlayerId, "cloth_bandage", 1);
    const beforeQty =
      getPlayerState(senderId)!.inventory.find(
        (i) => i.itemId === "cloth_bandage",
      )?.qty ?? 0;

    const send = sendMail(
      senderId,
      receiverName,
      [{ itemId: "cloth_bandage", qty: 1 }],
      0,
      "CL76.1 cancel me",
    );
    expect(send.ok).toBe(true);
    expect(
      getPlayerState(senderId)!.inventory.find(
        (i) => i.itemId === "cloth_bandage",
      )?.qty ?? 0,
    ).toBe(beforeQty - 1);

    const pending = listMail(senderId).find(
      (m) => m.direction === "sent" && m.status === "pending",
    )!;
    expect(pending).toBeTruthy();

    const midQty =
      getPlayerState(senderId)!.inventory.find(
        (i) => i.itemId === "cloth_bandage",
      )?.qty ?? 0;
    expect(cancelMail(senderId, pending.id).ok).toBe(true);
    expect(
      getPlayerState(senderId)!.inventory.find(
        (i) => i.itemId === "cloth_bandage",
      )?.qty ?? 0,
    ).toBe(midQty + 1);
    // Reason: listMail only surfaces pending/claimed — cancelled drops out.
    expect(listMail(senderId).some((m) => m.id === pending.id)).toBe(false);
  });

  it("keeps cancelled parcel out of recipient inbox claim path (edge)", () => {
    const inbox = listMail(receiverId).filter(
      (m) => m.direction === "inbox" && m.status === "pending",
    );
    expect(inbox.every((m) => m.subject !== "CL76.1 cancel me")).toBe(true);
  });

  it("refuses cancel of another player's parcel (failure)", () => {
    addItem(senderPlayerId, "flour", 1);
    const send = sendMail(
      senderId,
      receiverName,
      [{ itemId: "flour", qty: 1 }],
      0,
      "CL76.1 not yours",
    );
    expect(send.ok).toBe(true);
    const pending = listMail(senderId).find(
      (m) =>
        m.direction === "sent" &&
        m.status === "pending" &&
        m.subject === "CL76.1 not yours",
    )!;
    expect(pending).toBeTruthy();

    const stolen = cancelMail(otherId, pending.id);
    expect(stolen.ok).toBe(false);
    if (!stolen.ok) {
      expect(stolen.error).toBe(ACTION_ERROR.mailOnlySender);
    }

    // Reason: parcel stays pending for real sender after foreign cancel refuse.
    expect(
      listMail(senderId).some(
        (m) => m.id === pending.id && m.status === "pending",
      ),
    ).toBe(true);
  });
});
