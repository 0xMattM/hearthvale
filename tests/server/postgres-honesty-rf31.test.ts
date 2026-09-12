import { describe, expect, it } from "vitest";
import { DbConfigError } from "../../apps/server/src/db/driver.ts";
import { assertSupportedDbDriver } from "../../apps/server/src/db/client.ts";

describe("postgres honesty RF3.1", () => {
  it("allows sqlite (happy)", () => {
    expect(() => assertSupportedDbDriver("sqlite")).not.toThrow();
  });

  it("hard-fails postgres (fail)", () => {
    expect(() => assertSupportedDbDriver("postgres")).toThrow(DbConfigError);
    expect(() => assertSupportedDbDriver("postgres")).toThrow(/not supported/i);
  });
});
