import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three ships untranspiled ESM examples; Next handles it, but this keeps
  // the r3f/drei chunk out of the initial server bundle graph.
  transpilePackages: ["three"],
};

export default nextConfig;
