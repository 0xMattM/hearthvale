import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const pkg = JSON.parse(
  readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
) as { scripts?: Record<string, string> };

describe("root start/dev port hygiene", () => {
  it("frees 8787/3000 before production start (happy)", () => {
    expect(pkg.scripts?.prestart).toContain("scripts/free-ports.mjs");
    expect(pkg.scripts?.prestart).toContain("npm run build");
  });

  it("builds Next before next start (edge)", () => {
    expect(pkg.scripts?.build).toContain("@game/server");
    expect(pkg.scripts?.build).toContain("@game/web");
    expect(pkg.scripts?.prestart).toMatch(/npm run build(?:\s|$)/);
    expect(pkg.scripts?.start).toContain("@game/server");
    expect(pkg.scripts?.start).toContain("@game/web");
  });

  it("does not start without a port-free step (failure)", () => {
    expect(pkg.scripts?.prestart).toBeTruthy();
    expect(pkg.scripts?.start).not.toMatch(/free-ports/);
    expect(pkg.scripts?.prestart).not.toMatch(/build -w @game\/server\s*$/);
    expect(pkg.scripts?.["chain:deploy"]).toContain("@game/server");
  });
});
