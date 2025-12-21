"""
AI-Assisted Image Analysis Script
Analyzes images offline for:
- Face detection (OpenCV)
- Text detection (EasyOCR)
- Scene classification (basic heuristics)

Results are stored in the manifest for fast runtime filtering.
"""

import json
import os
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed
import cv2
import numpy as np

# Try to import optional dependencies
try:
    import easyocr
    HAS_OCR = True
except ImportError:
    HAS_OCR = False
    print("⚠️  EasyOCR not installed. Text detection disabled.")
    print("   Install with: pip install easyocr")

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
WEB_PUBLIC = PROJECT_ROOT / "web" / "public"
PROCESSED_DIR = WEB_PUBLIC / "processed"
MANIFEST_PATH = PROCESSED_DIR / "images.json"
OUTPUT_PATH = PROCESSED_DIR / "images_analyzed.json"

# OpenCV face detector
FACE_CASCADE = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

# Initialize OCR reader (lazy load)
ocr_reader = None

def get_ocr_reader():
    global ocr_reader
    if ocr_reader is None and HAS_OCR:
        print("🔤 Initializing OCR engine (first time may take a moment)...")
        ocr_reader = easyocr.Reader(['en'], gpu=False, verbose=False)
    return ocr_reader


def detect_faces(img_path: str) -> int:
    """Detect number of faces in image using OpenCV."""
    try:
        img = cv2.imread(img_path)
        if img is None:
            return 0
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = FACE_CASCADE.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        return len(faces)
    except Exception as e:
        print(f"  ⚠️ Face detection error: {e}")
        return 0


def detect_text(img_path: str) -> dict:
    """Detect if image contains readable text using EasyOCR."""
    reader = get_ocr_reader()
    if reader is None:
        return {"has_text": False, "text_confidence": 0, "text_sample": ""}
    
    try:
        results = reader.readtext(img_path, detail=1, paragraph=True)
        if not results:
            return {"has_text": False, "text_confidence": 0, "text_sample": ""}
        
        # Calculate average confidence
        confidences = [r[2] for r in results if len(r) > 2]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        # Get text sample (first 100 chars)
        text_parts = [r[1] for r in results if len(r) > 1]
        text_sample = " ".join(text_parts)[:100]
        
        return {
            "has_text": avg_confidence > 0.5,
            "text_confidence": round(avg_confidence, 2),
            "text_sample": text_sample
        }
    except Exception as e:
        print(f"  ⚠️ OCR error: {e}")
        return {"has_text": False, "text_confidence": 0, "text_sample": ""}


def classify_scene(img_path: str, face_count: int, has_text: bool) -> list[str]:
    """
    Basic scene classification based on image properties.
    Returns list of tags.
    """
    tags = []
    
    try:
        img = cv2.imread(img_path)
        if img is None:
            return tags
        
        height, width = img.shape[:2]
        
        # Aspect ratio hints
        aspect = width / height
        if aspect > 1.5:
            tags.append("wide")
        elif aspect < 0.7:
            tags.append("portrait")
        
        # Color analysis
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        avg_saturation = np.mean(hsv[:, :, 1])
        avg_value = np.mean(hsv[:, :, 2])
        
        if avg_saturation < 30:
            tags.append("grayscale")
        if avg_value < 50:
            tags.append("dark")
        elif avg_value > 200:
            tags.append("bright")
        
        # Edge density (complexity)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        
        if edge_density > 0.15:
            tags.append("detailed")
        elif edge_density < 0.03:
            tags.append("simple")
        
        # Content-based tags
        if face_count > 0:
            tags.append("people")
            if face_count >= 3:
                tags.append("group")
        
        if has_text:
            tags.append("documents")
        
        # Size-based tags (for thumbnails vs full images)
        pixels = width * height
        if pixels > 2000000:  # > 2MP
            tags.append("high-res")
        elif pixels < 100000:  # < 0.1MP
            tags.append("thumbnail")
        
    except Exception as e:
        print(f"  ⚠️ Scene classification error: {e}")
    
    return tags


def analyze_image(image_data: dict) -> dict:
    """Analyze a single image and return enriched metadata."""
    src = image_data.get("src", "")
    
    # Construct full path
    if src.startswith("/"):
        img_path = str(WEB_PUBLIC) + src
    else:
        img_path = str(WEB_PUBLIC / src)
    
    if not os.path.exists(img_path):
        print(f"  ⚠️ Image not found: {img_path}")
        return {**image_data, "ai": {"error": "not_found"}}
    
    # Run analysis
    face_count = detect_faces(img_path)
    text_result = detect_text(img_path) if HAS_OCR else {"has_text": False, "text_confidence": 0, "text_sample": ""}
    tags = classify_scene(img_path, face_count, text_result.get("has_text", False))
    
    # Build AI metadata
    ai_metadata = {
        "faces": face_count,
        "has_text": text_result.get("has_text", False),
        "text_confidence": text_result.get("text_confidence", 0),
        "text_sample": text_result.get("text_sample", ""),
        "tags": tags
    }
    
    return {**image_data, "ai": ai_metadata}


def main():
    print("=" * 60)
    print("🤖 AI-Assisted Image Analysis")
    print("=" * 60)
    
    # Load existing manifest
    if not MANIFEST_PATH.exists():
        print(f"❌ Manifest not found: {MANIFEST_PATH}")
        print("   Run the image extraction script first.")
        return
    
    with open(MANIFEST_PATH, 'r') as f:
        manifest = json.load(f)
    
    images = manifest.get("images", [])
    print(f"📊 Found {len(images)} images to analyze")
    
    if not images:
        print("❌ No images in manifest")
        return
    
    # Analyze images
    analyzed_images = []
    total = len(images)
    
    for i, img in enumerate(images):
        progress = (i + 1) / total * 100
        print(f"\r🔍 Analyzing [{i+1}/{total}] ({progress:.1f}%) - {img.get('id', 'unknown')[:20]}...", end="", flush=True)
        
        result = analyze_image(img)
        analyzed_images.append(result)
    
    print("\n")
    
    # Update manifest with AI data
    manifest["images"] = analyzed_images
    
    # Add AI stats
    ai_stats = {
        "images_with_faces": sum(1 for img in analyzed_images if img.get("ai", {}).get("faces", 0) > 0),
        "images_with_text": sum(1 for img in analyzed_images if img.get("ai", {}).get("has_text", False)),
        "total_faces_detected": sum(img.get("ai", {}).get("faces", 0) for img in analyzed_images),
        "tag_distribution": {}
    }
    
    # Count tags
    for img in analyzed_images:
        for tag in img.get("ai", {}).get("tags", []):
            ai_stats["tag_distribution"][tag] = ai_stats["tag_distribution"].get(tag, 0) + 1
    
    manifest["ai_stats"] = ai_stats
    
    # Save enhanced manifest
    # First to a new file (safe)
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"✅ Analysis complete!")
    print(f"   Output: {OUTPUT_PATH}")
    print()
    print("📊 AI Statistics:")
    print(f"   Images with faces: {ai_stats['images_with_faces']}")
    print(f"   Images with text:  {ai_stats['images_with_text']}")
    print(f"   Total faces found: {ai_stats['total_faces_detected']}")
    print()
    print("🏷️  Tag Distribution:")
    for tag, count in sorted(ai_stats["tag_distribution"].items(), key=lambda x: -x[1]):
        print(f"   {tag}: {count}")
    
    print()
    print("💡 Next steps:")
    print("   1. Review the output file")
    print("   2. Replace images.json with images_analyzed.json")
    print("   3. The UI filters will automatically work!")


if __name__ == "__main__":
    main()
