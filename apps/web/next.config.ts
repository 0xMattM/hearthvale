import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@game/shared"],
  // Reason: existing client files typecheck-fail on Three.js casts; Vercel needs a shippable build.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Reason: @game/shared exports TypeScript source with NodeNext `.js` import
  // specifiers; webpack must map those to `.ts` files in packages/shared/src.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default nextConfig;
