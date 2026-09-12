import { describe, expect, it } from "vitest";

/**
 * Pure helpers mirroring trade validation rules.
 */
function normalizeLegs(
  legs: Array<{ itemId: string; qty: number }>,
): Array<{ itemId: string; qty: number }> {
  return legs
    .filter((l) => l.qty > 0)
    .map((l) => ({ itemId: l.itemId, qty: Math.floor(l.qty) }));
}

function canCreateOffer(input: {
  selfId: string;
  otherId: string;
  give: Array<{ itemId: string; qty: number }>;
  want: Array<{ itemId: string; qty: number }>;
  giveCoins: number;
  wantCoins: number;
  softCurrency: number;
  inventory: Record<string, number>;
}): { ok: boolean; error?: string } {
  if (input.selfId === input.otherId) return { ok: false, error: "Cannot trade with yourself" };
  const give = normalizeLegs(input.give);
  const want = normalizeLegs(input.want);
  if (give.length === 0 && want.length === 0 && input.giveCoins === 0 && input.wantCoins === 0) {
    return { ok: false, error: "Trade is empty" };
  }
  if (input.softCurrency < input.giveCoins) {
    return { ok: false, error: "Not enough coins to offer" };
  }
  for (const leg of give) {
    if ((input.inventory[leg.itemId] ?? 0) < leg.qty) {
      return { ok: false, error: `Missing ${leg.itemId} to offer` };
    }
  }
  return { ok: true };
}

describe("trade offer validation", () => {
  it("accepts a valid wheat-for-ore offer", () => {
    expect(
      canCreateOffer({
        selfId: "a",
        otherId: "b",
        give: [{ itemId: "wheat", qty: 2 }],
        want: [{ itemId: "iron_ore", qty: 1 }],
        giveCoins: 0,
        wantCoins: 0,
        softCurrency: 40,
        inventory: { wheat: 2 },
      }).ok,
    ).toBe(true);
  });

  it("rejects self-trade", () => {
    expect(
      canCreateOffer({
        selfId: "a",
        otherId: "a",
        give: [{ itemId: "wheat", qty: 1 }],
        want: [],
        giveCoins: 0,
        wantCoins: 0,
        softCurrency: 40,
        inventory: { wheat: 1 },
      }).error,
    ).toBe("Cannot trade with yourself");
  });

  it("rejects empty trade", () => {
    expect(
      canCreateOffer({
        selfId: "a",
        otherId: "b",
        give: [],
        want: [],
        giveCoins: 0,
        wantCoins: 0,
        softCurrency: 40,
        inventory: {},
      }).error,
    ).toBe("Trade is empty");
  });
});
