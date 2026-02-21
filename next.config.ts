import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We need server-side API routes to log questions to a file,
  // so we use the default Node.js server mode (not static export).
  // Deploy with: `npm run build && npm start`
};

export default nextConfig;
