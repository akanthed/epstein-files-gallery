import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Required for static export
  output: 'export',

  // GitHub Pages serves from /repo-name/ (only in production)
  basePath: isProd ? '/epstein-files-gallery' : '',
  assetPrefix: isProd ? '/epstein-files-gallery/' : '',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Ensure trailing slashes for static hosting
  trailingSlash: true,
};

export default nextConfig;
