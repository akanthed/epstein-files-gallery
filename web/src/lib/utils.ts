// Base path for deployment
// - GitHub Pages needs /epstein-files-gallery/
// - Netlify/Vercel serve from root /
// We use NEXT_PUBLIC_BASE_PATH set in the build environment

const isGitHubPages = process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github';

export const BASE_PATH = isGitHubPages ? '/epstein-files-gallery' : '';

// Helper to get the correct image URL
export function getImageUrl(path: string): string {
    // If path already starts with http, return as-is
    if (path.startsWith('http')) return path;

    // Add base path if needed
    return `${BASE_PATH}${path}`;
}
