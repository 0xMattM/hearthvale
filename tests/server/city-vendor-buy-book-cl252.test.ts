import { describe, expect, it } from "vitest";
import { getVendorPrices, type ItemId } from "@game/shared";

/** Content Lock / City hub vendor (CL2.3 / CL25.2) — basic tools + seeds. */
const CITY_BUY_BOOK_LOCK: ReadonlyArray<{ itemId: ItemId; price: number }> = [
  { itemId: "wheat_seed", price: 8 },
  { itemId: "wooden_hoe", price: 12 },
  { itemId: "iron_hammer", price: 28 },
];

describe("CityLands CL25.2 city vendor buy book completeness", () => {
  it("sells seeds + wooden_hoe + iron_hammer at Content Lock rates (happy)", () => {
    const book = getVendorPrices("city").buy;
    for (const row of CITY_BUY_BOOK_LOCK) {
      expect(book[row.itemId]).toBe(row.price);
    }
    expect(Object.keys(book).sort()).toEqual(
      CITY_BUY_BOOK_LOCK.map((r) => r.itemId).sort(),
    );
  });

  it("keeps explore/land buy books thinner than city tools (edge)", () => {
    const explore = getVendorPrices("explore").buy;
    const land = getVendorPrices("player_land").buy;
    expect(explore.wooden_hoe).toBeUndefined();
    expect(explore.iron_hammer).toBeUndefined();
    expect(land.wooden_hoe).toBeUndefined();
    expect(land.iron_hammer).toBeUndefined();
    expect(explore.wheat_seed).toBe(10);
    expect(land.wheat_seed).toBe(8);
  });

  it("does not invent extra basic profession tools beyond Content Lock (failure)", () => {
    const book = getVendorPrices("city").buy;
    const allowed = new Set(CITY_BUY_BOOK_LOCK.map((r) => r.itemId));
    for (const key of Object.keys(book) as ItemId[]) {
      expect(allowed.has(key)).toBe(true);
    }
    // No fishing rod / pick / sickle SKUs in city buy book yet.
    expect(book.fish).toBeUndefined();
    expect((book as Record<string, number>).wooden_pick).toBeUndefined();
    expect((book as Record<string, number>).fishing_rod).toBeUndefined();
  });
});
