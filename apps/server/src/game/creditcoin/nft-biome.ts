/**
 * Seeds Creditcoin NFT homestead gather nodes from the plot biome.
 */

import { isNftLandBiomeSlot, isPlayerLandKind, nftLandBiomeBuildings } from "@game/shared";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../../db/client.js";
import { buildings, lands, localLands } from "../../db/schema.js";

/**
 * Seeds choppable trees / ore / crop plots on a Creditcoin NFT homestead.
 * Free starter land is skipped. Stock nodes are permanent — they are never
 * restored after a pickup, and pickup of biome slots is refused.
 *
 * Args:
 *   landId: Target `lands.id`.
 */
export function ensureNftBiomeBuildings(landId: string): void {
  const land = db.select().from(lands).where(eq(lands.id, landId)).get();
  if (!land?.nftTokenId || !isPlayerLandKind(land.kind)) return;

  const ledger = db
    .select()
    .from(localLands)
    .where(eq(localLands.id, land.nftTokenId))
    .get();
  if (!ledger) return;

  const defs = nftLandBiomeBuildings(ledger.biome, ledger.size);
  if (defs.length === 0) return;

  const existing = db
    .select()
    .from(buildings)
    .where(eq(buildings.landId, landId))
    .all();
  const hasBiome = existing.some((row) => isNftLandBiomeSlot(row.slotIndex));
  if (hasBiome) return;
  // Reason: a lived-in yard with no biome slots already had stock lifted —
  // never respawn the template (infinite tree-kit exploit). Fresh NFT yards
  // insert biome while `existing` is still empty.
  if (existing.length > 0) return;

  const taken = new Set(existing.map((row) => `${row.x},${row.z}`));
  for (const def of defs) {
    const key = `${def.x},${def.z}`;
    if (taken.has(key)) continue;
    taken.add(key);
    db.insert(buildings)
      .values({
        id: nanoid(),
        landId,
        type: def.type,
        slotIndex: def.slotIndex,
        x: def.x,
        z: def.z,
        tier: 1,
        cropId: def.cropId ?? null,
        plantedAt: null,
        readyAt: null,
      })
      .run();
  }
}
