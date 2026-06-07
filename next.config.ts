import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images from Google avatars
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'sexpositions.club',
      },
    ],
  },
  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
