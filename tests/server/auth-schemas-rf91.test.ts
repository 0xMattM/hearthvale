import { describe, expect, it } from "vitest";
import {
  marketListSchema,
  parseAuthCredentials,
  parseBody,
  vendorBodySchema,
} from "../../apps/server/src/auth/schemas.ts";
import { ACTION_ERROR } from "@game/shared";

describe("auth zod schemas RF9.1", () => {
  it("accepts valid credentials (happy)", () => {
    const parsed = parseAuthCredentials({
      username: "alice",
      password: "password123",
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data.username).toBe("alice");
      expect(parsed.data.password).toBe("password123");
    }
  });

  it("rejects missing fields (fail)", () => {
    expect(parseAuthCredentials({}).ok).toBe(false);
    expect(parseAuthCredentials({ username: "a" }).ok).toBe(false);
    expect(parseAuthCredentials(null).ok).toBe(false);
  });

  it("rejects oversized strings (edge)", () => {
    const long = "x".repeat(300);
    expect(
      parseAuthCredentials({ username: long, password: "password123" }).ok,
    ).toBe(false);
  });

  it("accepts an integer vendor qty (happy)", () => {
    const parsed = parseBody(
      vendorBodySchema,
      { itemId: "wood", qty: 2 },
      ACTION_ERROR.invalidQty,
    );
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.data.qty).toBe(2);
  });

  it("rejects a fractional market qty (edge)", () => {
    const parsed = parseBody(
      marketListSchema,
      { itemId: "wheat", qty: 1.5, priceCoins: 4 },
      ACTION_ERROR.invalidQty,
    );
    expect(parsed.ok).toBe(false);
  });

  it("rejects Infinity and zero market prices (failure)", () => {
    expect(
      parseBody(
        marketListSchema,
        { itemId: "wheat", qty: 1, priceCoins: Number.POSITIVE_INFINITY },
        ACTION_ERROR.invalidQty,
      ).ok,
    ).toBe(false);
    expect(
      parseBody(
        marketListSchema,
        { itemId: "wheat", qty: 1, priceCoins: 0 },
        ACTION_ERROR.invalidQty,
      ).ok,
    ).toBe(false);
  });
});
