import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@game/shared"],
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
