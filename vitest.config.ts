/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    // Reason: shared uses NodeNext `.js` specifiers pointing at `.ts` sources.
    extensionAlias: {
      ".js": [".ts", ".js"],
    },
    alias: {
      "@game/shared": path.resolve(__dirname, "packages/shared/src/index.ts"),
      // Reason: Vite cannot resolve ethers package exports from server creditcoin imports.
      ethers: path.resolve(__dirname, "node_modules/ethers/lib.esm/index.js"),
    },
  },
});
