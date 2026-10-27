import type { NextConfig } from "next";

const backendInternalUrl =
  process.env.BACKEND_INTERNAL_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
    : "http://10.5.6.8:3001");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${backendInternalUrl}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/dashboard/mon-espace/demandes",
        destination: "/absences/demandes",
        permanent: false,
      },
      {
        source: "/dashboard/mon-equipe/demandes",
        destination: "/absences/validations",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
