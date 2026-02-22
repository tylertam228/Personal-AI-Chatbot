import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/ai/:path*",
        destination: `${process.env.FASTAPI_URL || "http://localhost:8000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
