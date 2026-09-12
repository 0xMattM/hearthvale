import { describe, expect, it } from "vitest";
import { resolveCorsOrigins } from "../../apps/server/src/cors.ts";

describe("CORS origins RF4.4", () => {
  it("defaults to localhost:3000 (happy)", () => {
    expect(resolveCorsOrigins({})).toEqual(["http://localhost:3000"]);
  });

  it("parses comma-separated origins (edge)", () => {
    expect(
      resolveCorsOrigins({
        GAME_CORS_ORIGIN: "https://a.example, https://b.example",
      }),
    ).toEqual(["https://a.example", "https://b.example"]);
  });

  it("drops empty segments (fail/empty)", () => {
    expect(resolveCorsOrigins({ GAME_CORS_ORIGIN: " ,  ,x" })).toEqual(["x"]);
  });
});
