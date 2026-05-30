import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Allow JSX files to be imported
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
