import { ne } from "drizzle-orm";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";

/**
 * Other registered players (for trade discovery). MVP directory, not a social graph.
 */
export function listOtherPlayers(userId: string): Array<{ username: string }> {
  return db
    .select({ username: users.username })
    .from(users)
    .where(ne(users.id, userId))
    .all()
    .map((row) => ({ username: row.username }))
    .sort((a, b) => a.username.localeCompare(b.username));
}
