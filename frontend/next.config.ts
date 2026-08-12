import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // For smooth drag-and-drop animations without double-invoke interference
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
