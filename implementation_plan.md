# PDF Image Gallery Implementation Plan

# Goal Description
Unlock images embedded in PDFs inside large ZIP datasets and present them as a seamless, image-first web gallery without requiring users to open PDFs. The architecture focuses on offline processing to generate static assets, ensuring a zero-backend-cost, high-performance static site deployable on Vercel.

## User Review Required
> [!IMPORTANT]
> **Storage & Processing Strategy**: 
> - Dataset size is ~2.5GB compressed. Image extraction will increase disk usage significantly.
> - Processing is designed to be done **offline** (local machine or CI), not at runtime on Vercel.
> - The web app effectively becomes a static viewer for the pre-processed `processed/` directory.

## Proposed Changes

### Data Processing (Python - Offline)
Scripts to scan, extract, and optimize images from source PDFs.

#### [NEW] [scripts/extract_images.py](file:///c:/Users/inkantak/Documents/Projects/Epstein/scripts/extract_images.py)
- **Libraries**: `pdf2image`, `poppler`, `Pillow`
- **Functionality**:
    - Scan ZIP/PDF files in the source directory.
    - Convert PDF pages to optimized JPEGs (Quality: 75-80%, Max width: 1600px).
    - Generate Thumbnails.
    - Output structure:
      ```
      processed/
        ├── images/full/
        ├── images/thumb/
        └── images.json
      ```
    - `images.json` structure:
      ```json
      {
        "stats": { "totalImages": 0, "totalPdfs": 0 },
        "images": [ { "id": "...", "src": "...", "thumb": "...", "width": 0, "height": 0 } ]
      }
      ```

### Web Application (Frontend - Vercel)
A Next.js application to display the gallery.

#### [NEW] [Project Structure]
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Key Features**:
    - **Masonry Grid**: Visual polish for varying aspect ratios.
    - **Infinite Scroll**: Efficient loading of large image sets.
    - **Fullscreen Modal**: Detailed viewer with zoom and keyboard navigation.
    - **Toolbar**: Icon-only controls for Zoom, Fullscreen, Dark/Light mode, Grid size.
    - **Zero Backend**: Reads from the static `images.json`.

## Verification Plan

### Automated Tests
- **Script Validation**: Run `python scripts/extract_images.py --limit 5` to verify output directory structure and JSON generation.
- **Linting**: Run `npm run lint` and `npm run build` to ensure the Next.js app builds correctly.

### Manual Verification
- **Visual Check**: Open the local server (`npm run dev`) and verify the masonry grid layout.
- **Performance**: Scroll through generated images to test lazy loading and virtualization smoothness.
- **Interactions**: Test opening the modal, zooming, and navigating via keyboard.
