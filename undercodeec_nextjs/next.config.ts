import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Allow JSX files to be imported
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
