import type { NextConfig } from "next";

const isGitHubPages = process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github';

const nextConfig: NextConfig = {
  // Required for static export
  output: 'export',

  // GitHub Pages serves from /repo-name/ (only for GitHub Pages)
  basePath: isGitHubPages ? '/epstein-files-gallery' : '',
  assetPrefix: isGitHubPages ? '/epstein-files-gallery/' : '',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Ensure trailing slashes for static hosting
  trailingSlash: true,
};

export default nextConfig;
