# Archival Image Gallery

A fast, zero-backend static image gallery for viewing images extracted from PDF documents.

## Features

- **Masonry Grid** - Beautiful responsive layout
- **Infinite Scroll** - Loads images progressively
- **Fullscreen Modal** - Zoom, navigate, download
- **Face Priority** - Images with people shown first
- **Dark Mode** - Easy on the eyes
- **Keyboard Shortcuts** - Arrow keys, +/- zoom, Esc close

## Tech Stack

- **Frontend**: Next.js 16, Tailwind CSS
- **Extraction**: Python + PyMuPDF + OpenCV
- **Zero Backend**: All data is static JSON

## Project Structure

```
├── data/               # Source ZIP files (not in git)
├── scripts/            # Python extraction tools
├── web/                # Next.js application
│   ├── public/processed/   # Extracted images + manifest
│   └── src/            # React components
└── requirements.txt    # Python dependencies
```

## Setup

### 1. Install Dependencies

```bash
# Python (for extraction)
pip install -r requirements.txt

# Node.js (for web app)
cd web && npm install
```

### 2. Extract Images (if starting fresh)

Place your ZIP files containing PDFs in `/data/`, then:

```bash
python scripts/extract_images.py
```

### 3. Run Development Server

```bash
cd web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

The `/web` directory can be deployed to Vercel:

```bash
cd web
vercel
```

## License

Private - All Rights Reserved
