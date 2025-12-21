import os
import sys
import zipfile
import json
import uuid
import argparse
from pathlib import Path
import fitz  # PyMuPDF
import cv2
import numpy as np

from PIL import Image
from tqdm import tqdm

# Configuration
PROCESSED_DIR = Path('web/public/processed')
IMAGES_DIR = PROCESSED_DIR / 'images/full'
THUMBS_DIR = PROCESSED_DIR / 'images/thumb'
MANIFEST_FILE = PROCESSED_DIR / 'images.json'

# Image Settings
IMG_QUALITY = 80
MAX_WIDTH = 1600
THUMB_WIDTH = 400

# Load OpenCV face detector (Haar Cascade - fast and good enough)
FACE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def setup_directories():
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    THUMBS_DIR.mkdir(parents=True, exist_ok=True)

def detect_faces(pil_image):
    """Detect faces in a PIL Image. Returns count of faces found."""
    try:
        # Convert PIL to OpenCV format (RGB -> BGR -> Grayscale)
        img_array = np.array(pil_image)
        if len(img_array.shape) == 3:
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        else:
            gray = img_array
        
        # Detect faces - tune parameters for speed
        # scaleFactor: How much to reduce image each scale. Higher = faster, less accurate.
        # minNeighbors: Higher = fewer false positives, may miss some.
        # minSize: Ignore small faces (noise).
        faces = FACE_CASCADE.detectMultiScale(
            gray, 
            scaleFactor=1.2, 
            minNeighbors=4, 
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        return len(faces)
    except Exception as e:
        return 0

def optimize_image(image, output_path, max_width, quality=80):
    """Resize and save image as optimized JPEG."""
    if image.mode in ('RGBA', 'P'):
        image = image.convert('RGB')
    
    w, h = image.size
    if w > max_width:
        ratio = max_width / float(w)
        new_height = int(float(h) * ratio)
        image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)
    
    image.save(output_path, 'JPEG', quality=quality, optimize=True)
    return image.size

def process_pdf_bytes(pdf_bytes, pdf_name, pbar=None):
    """Convert PDF bytes to images and save them."""
    try:
        doc = fitz.open("pdf", pdf_bytes)
    except Exception as e:
        print(f"\nError converting PDF {pdf_name}: {e}")
        return []

    processed_images = []
    
    for i, page in enumerate(doc):
        image_id = str(uuid.uuid4())
        page_filename = f"{image_id}.jpg"
        
        full_path = IMAGES_DIR / page_filename
        thumb_path = THUMBS_DIR / page_filename
        
        # Render page to Pixmap
        pix = page.get_pixmap(matrix=fitz.Matrix(2.5, 2.5))
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        
        # Detect faces BEFORE resizing for better accuracy
        face_count = detect_faces(img)
        
        # Save Full Optimized
        w, h = optimize_image(img, full_path, MAX_WIDTH, IMG_QUALITY)
        
        # Save Thumbnail
        optimize_image(img, thumb_path, THUMB_WIDTH, 60)
        
        processed_images.append({
            "id": image_id,
            "src": f"/processed/images/full/{page_filename}",
            "thumb": f"/processed/images/thumb/{page_filename}",
            "width": w,
            "height": h,
            "source_pdf": pdf_name,
            "page": i + 1,
            "faces": face_count  # New field!
        })
        
        if pbar:
            pbar.update(1)
            
    return processed_images

def process_zip(zip_path):
    print(f"Processing ZIP: {zip_path}")
    results = []
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as z:
            pdf_files = [f for f in z.namelist() if f.lower().endswith('.pdf')]
            print(f"Found {len(pdf_files)} PDFs in {zip_path.name}")
            
            with tqdm(total=len(pdf_files) * 2) as pbar:
                for pdf_file in pdf_files:
                    pbar.set_description(f"Extracting {Path(pdf_file).name}")
                    try:
                        pdf_data = z.read(pdf_file)
                        images = process_pdf_bytes(pdf_data, f"{zip_path.name}/{pdf_file}", pbar)
                        results.extend(images)
                    except Exception as e:
                        print(f"Failed to read {pdf_file}: {e}")
                        
    except Exception as e:
        print(f"Error reading ZIP {zip_path}: {e}")
        
    return results

def main():
    parser = argparse.ArgumentParser(description="Extract images from PDFs in ZIPs.")
    parser.add_argument('--limit', type=int, help="Limit number of PDFs processed (for testing)", default=None)
    parser.add_argument('--data-dir', type=str, default='data', help="Directory containing ZIP files")
    args = parser.parse_args()

    setup_directories()
    
    data_dir = Path(args.data_dir)
    print(f"Scanning {data_dir}...")
    
    zip_files = list(data_dir.glob('*.zip'))
    
    all_images = []
    
    for zip_file in zip_files:
        images = process_zip(zip_file)
        all_images.extend(images)
        if args.limit and len(all_images) >= args.limit:
            break
    
    # SORT: Images with faces first (descending by count), then rest
    all_images.sort(key=lambda x: x.get('faces', 0), reverse=True)
    
    # Count stats
    images_with_faces = sum(1 for img in all_images if img.get('faces', 0) > 0)
    
    # Save Manifest
    manifest = {
        "stats": {
            "totalImages": len(all_images),
            "totalZips": len(zip_files),
            "imagesWithFaces": images_with_faces
        },
        "images": all_images
    }
    
    with open(MANIFEST_FILE, 'w') as f:
        json.dump(manifest, f, indent=2)
        
    print(f"\nDone! Processed {len(all_images)} images.")
    print(f"Images with detected faces: {images_with_faces}")
    print(f"Manifest saved to {MANIFEST_FILE}")

if __name__ == "__main__":
    main()
