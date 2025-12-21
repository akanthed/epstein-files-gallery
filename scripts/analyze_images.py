"""
AI-Assisted Image Analysis Script (v2 - DNN Face Detector)
Analyzes images offline for:
- Face detection (OpenCV DNN - more accurate than Haar cascades)
- Text detection (EasyOCR)
- Scene classification (basic heuristics)

Results are stored in the manifest for fast runtime filtering.
"""

import json
import os
import urllib.request
from pathlib import Path
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

# DNN Face Detector paths
MODEL_DIR = SCRIPT_DIR / "models"
PROTOTXT_PATH = MODEL_DIR / "deploy.prototxt"
CAFFEMODEL_PATH = MODEL_DIR / "res10_300x300_ssd_iter_140000.caffemodel"

# DNN Model URLs (OpenCV's pre-trained face detector)
PROTOTXT_URL = "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt"
CAFFEMODEL_URL = "https://github.com/opencv/opencv_3rdparty/raw/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel"

# Global face detector
face_net = None

def download_model_files():
    """Download DNN model files if not present."""
    MODEL_DIR.mkdir(exist_ok=True)
    
    if not PROTOTXT_PATH.exists():
        print("📥 Downloading face detection model (prototxt)...")
        urllib.request.urlretrieve(PROTOTXT_URL, PROTOTXT_PATH)
    
    if not CAFFEMODEL_PATH.exists():
        print("📥 Downloading face detection model (caffemodel ~10MB)...")
        urllib.request.urlretrieve(CAFFEMODEL_URL, CAFFEMODEL_PATH)
    
    print("✅ Model files ready")

def get_face_detector():
    """Get or initialize the DNN face detector."""
    global face_net
    if face_net is None:
        download_model_files()
        face_net = cv2.dnn.readNetFromCaffe(str(PROTOTXT_PATH), str(CAFFEMODEL_PATH))
    return face_net

# Initialize OCR reader (lazy load)
ocr_reader = None

def get_ocr_reader():
    global ocr_reader
    if ocr_reader is None and HAS_OCR:
        print("🔤 Initializing OCR engine (first time may take a moment)...")
        ocr_reader = easyocr.Reader(['en'], gpu=False, verbose=False)
    return ocr_reader


def detect_faces_dnn(img_path: str, confidence_threshold: float = 0.5) -> int:
    """
    Detect faces using OpenCV's DNN-based face detector.
    Much more accurate than Haar cascades, fewer false positives.
    """
    try:
        img = cv2.imread(img_path)
        if img is None:
            return 0
        
        (h, w) = img.shape[:2]
        
        # Create blob from image
        blob = cv2.dnn.blobFromImage(
            cv2.resize(img, (300, 300)), 
            1.0, 
            (300, 300), 
            (104.0, 177.0, 123.0)
        )
        
        # Pass through network
        net = get_face_detector()
        net.setInput(blob)
        detections = net.forward()
        
        # Count faces with confidence above threshold
        face_count = 0
        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            if confidence > confidence_threshold:
                face_count += 1
        
        return face_count
        
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
            if face_count == 1:
                tags.append("solo")
        
        if has_text:
            tags.append("documents")
        
        # Size-based tags
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
    
    # Run analysis with DNN face detector
    face_count = detect_faces_dnn(img_path, confidence_threshold=0.6)
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
    print("🤖 AI-Assisted Image Analysis (v2 - DNN Face Detector)")
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
    
    # Initialize face detector
    print("🧠 Loading DNN face detector...")
    get_face_detector()
    
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
