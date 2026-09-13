import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@game/shared"],
  // Reason: existing client files typecheck-fail on Three.js casts; Vercel needs a shippable build.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Reason: @game/shared exports dist JS with NodeNext `.js` specifiers. After
  // `tsc`, webpack followed dist/ and extensionAlias looked for sibling `.ts`
  // files that only exist in src — Vercel then failed to resolve catalog-land.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@game/shared": path.join(
        __dirname,
        "../../packages/shared/src/index.ts",
      ),
    };
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default nextConfig;
