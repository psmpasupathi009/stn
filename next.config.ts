import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  // Tree-shake lucide-react so only used icons are bundled (faster loads)
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
