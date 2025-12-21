import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages deployment
  output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Ensure trailing slashes for static hosting
  trailingSlash: true,
};

export default nextConfig;
