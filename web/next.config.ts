import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for static export
  output: 'export',

  // GitHub Pages serves from /repo-name/
  basePath: '/epstein-files-gallery',
  assetPrefix: '/epstein-files-gallery/',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Ensure trailing slashes for static hosting
  trailingSlash: true,
};

export default nextConfig;
