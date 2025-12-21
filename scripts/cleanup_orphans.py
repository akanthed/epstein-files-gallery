import json
import os
from pathlib import Path

# Configuration
PROCESSED_DIR = Path('web/public/processed')
MANIFEST_FILE = PROCESSED_DIR / 'images.json'
IMAGES_DIR = PROCESSED_DIR / 'images/full'
THUMBS_DIR = PROCESSED_DIR / 'images/thumb'

def cleanup():
    if not MANIFEST_FILE.exists():
        print("Manifest not found. Aborting cleanup.")
        return

    print("Loading manifest...")
    with open(MANIFEST_FILE, 'r') as f:
        data = json.load(f)
    
    # Get all valid filenames from manifest
    valid_files = set()
    for img in data['images']:
        # Extract filename from src path (e.g., /processed/images/full/uuid.jpg)
        valid_files.add(os.path.basename(img['src']))

    print(f"Manifest contains {len(valid_files)} valid images.")

    # Check full images
    full_deleted = 0
    for img_file in IMAGES_DIR.glob('*.jpg'):
        if img_file.name not in valid_files:
            img_file.unlink()
            full_deleted += 1
    
    # Check thumbnails
    thumb_deleted = 0
    for thumb_file in THUMBS_DIR.glob('*.jpg'):
        if thumb_file.name not in valid_files:
            thumb_file.unlink()
            thumb_deleted += 1

    print(f"Cleanup complete!")
    print(f"Deleted {full_deleted} orphan full images.")
    print(f"Deleted {thumb_deleted} orphan thumbnails.")

if __name__ == "__main__":
    cleanup()
