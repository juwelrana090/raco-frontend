import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.madrasah.dev",
      },
    ],
  },
};

export default nextConfig;
