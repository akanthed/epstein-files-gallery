// Base path for GitHub Pages deployment
// In production, images are served from /epstein-files-gallery/
// In development, they're served from /
export const BASE_PATH = process.env.NODE_ENV === 'production' ? '/epstein-files-gallery' : '';

// Helper to get the correct image URL
export function getImageUrl(path: string): string {
    // If path already starts with http, return as-is
    if (path.startsWith('http')) return path;

    // Add base path for production
    return `${BASE_PATH}${path}`;
}
