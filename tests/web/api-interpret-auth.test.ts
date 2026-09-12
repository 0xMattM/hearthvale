import { describe, expect, it } from "vitest";
import { interpretAuthResponse } from "../../apps/web/lib/api.ts";

describe("interpretAuthResponse SEC-7", () => {
  it("passes through a 200 body (happy)", () => {
    const res = interpretAuthResponse(200, { ok: true, token: "abc" });
    expect(res.ok).toBe(true);
    expect(res.unauthorized).toBeUndefined();
  });

  it("marks 401 as unauthorized (edge)", () => {
    const res = interpretAuthResponse(401, { ok: false, error: "nope" });
    expect(res.ok).toBe(false);
    expect(res.unauthorized).toBe(true);
    expect(res.error).toBe("nope");
  });

  it("maps HTML/non-json failures to HTTP status (failure)", () => {
    const res = interpretAuthResponse(502, "bad gateway");
    expect(res.ok).toBe(false);
    expect(res.error).toBe("HTTP 502");
  });
});
