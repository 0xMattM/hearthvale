import { afterEach, describe, expect, it } from "vitest";
import { authClientIp } from "../../apps/server/src/auth/clientIp.ts";

function req(xff?: string) {
  return {
    req: {
      header: (name: string) =>
        name.toLowerCase() === "x-forwarded-for" ? xff : undefined,
    },
  };
}

describe("auth client IP SEC-5", () => {
  afterEach(() => {
    delete process.env.GAME_TRUST_PROXY;
  });

  it("uses a shared local bucket by default (happy)", () => {
    expect(authClientIp(req("203.0.113.9"))).toBe("local");
  });

  it("honors X-Forwarded-For only with GAME_TRUST_PROXY=1 (edge)", () => {
    process.env.GAME_TRUST_PROXY = "1";
    expect(authClientIp(req("203.0.113.9, 10.0.0.1"))).toBe("203.0.113.9");
  });

  it("falls back to local when the proxy header is empty (failure)", () => {
    process.env.GAME_TRUST_PROXY = "1";
    expect(authClientIp(req(undefined))).toBe("local");
    process.env.GAME_TRUST_PROXY = "0";
    expect(authClientIp(req("198.51.100.2"))).toBe("local");
  });
});
