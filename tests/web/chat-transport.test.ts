import { describe, expect, it } from "vitest";
import { preferWsChat } from "../../apps/web/lib/chatTransport.ts";

describe("chat transport F8.4", () => {
  it("prefers websocket when ready (happy)", () => {
    expect(preferWsChat(true)).toBe("websocket");
  });

  it("falls back to http when socket down (edge)", () => {
    expect(preferWsChat(false)).toBe("http");
  });

  it("treats falsey ready as http (failure)", () => {
    expect(preferWsChat(Boolean(0))).toBe("http");
  });
});
