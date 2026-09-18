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
  experimental: {
    // Evita que los builds en VPS con poca RAM creen varios workers pesados.
    cpus: 1,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/landing-primary/index.html",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        // La home se entrega desde este archivo estático, pero esta URL de
        // recurso no debe competir con su canonical público: /.
        source: "/landing-primary/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/admin/dashboard",
        destination: "/admin/crm/administracion/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
