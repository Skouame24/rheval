import type { NextConfig } from "next";

const backendInternalUrl = process.env.BACKEND_INTERNAL_URL || "http://10.5.6.8:3001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${backendInternalUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
