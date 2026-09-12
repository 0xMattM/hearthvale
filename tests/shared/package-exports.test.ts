import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const pkg = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "packages/shared/package.json"),
    "utf8",
  ),
) as {
  main?: string;
  types?: string;
  exports?: unknown;
};

describe("shared package exports for Node production", () => {
  it("points Node import at compiled dist (happy)", () => {
    const exported = pkg.exports as { ".": { import: string } };
    expect(exported["."].import).toBe("./dist/index.js");
    expect(pkg.main).toBe("./dist/index.js");
  });

  it("keeps TypeScript types on src for editors (edge)", () => {
    const exported = pkg.exports as { ".": { types: string } };
    expect(exported["."].types).toBe("./src/index.ts");
    expect(pkg.types).toBe("./src/index.ts");
  });

  it("does not export raw src/index.ts to Node (failure)", () => {
    expect(pkg.exports).not.toBe("./src/index.ts");
    const exported = pkg.exports as { "."?: { import?: string; default?: string } };
    expect(exported["."]?.import).not.toMatch(/src\/index\.ts$/);
    expect(exported["."]?.default).not.toMatch(/src\/index\.ts$/);
  });
});
