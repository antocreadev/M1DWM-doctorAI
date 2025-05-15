import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    swcPlugins: [],
    optimizeCss: {
      lightningCss: {
        implementation: "wasm", // Forcer usage du fallback WebAssembly
      },
    },
  },
};

export default nextConfig;
