import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const CONFIG = path.join(process.cwd(), "apps/web/next.config.ts");

/**
 * Reads the Next config so tests can lock the Vercel shared-package alias.
 */
function nextConfigSource(): string {
  return fs.readFileSync(CONFIG, "utf8");
}

describe("Next @game/shared webpack alias", () => {
  it("points the package at TypeScript source (happy)", () => {
    const src = nextConfigSource();
    expect(src).toContain('transpilePackages: ["@game/shared"]');
    expect(src).toContain("@game/shared");
    expect(src).toContain("packages/shared/src/index.ts");
  });

  it("keeps NodeNext .js specifiers mapped to .ts (edge)", () => {
    const src = nextConfigSource();
    expect(src).toContain('".js": [".ts", ".tsx", ".js"]');
  });

  it("does not resolve the web app through shared dist (failure)", () => {
    const src = nextConfigSource();
    expect(src).not.toContain("packages/shared/dist/index.js");
  });
});
