import type { NextConfig } from "next";
import { assertEnv } from "./lib/env";
import { WORKSPACE_PATH } from "./lib/routes";

assertEnv();

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [{ source: "/", destination: WORKSPACE_PATH, permanent: false }];
  },
};

export default nextConfig;
