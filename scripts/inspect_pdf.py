import fitz  # pymupdf
import os

pdf_path = r"c:/Users/inkantak/Documents/Projects/Epstein/data/B. Flight Log Released in US v. Maxwell, 1.20-cr-00330 (SDNY 2020).pdf"

if not os.path.exists(pdf_path):
    print(f"Error: File not found at {pdf_path}")
    exit(1)

try:
    doc = fitz.open(pdf_path)
    print(f"Successfully opened PDF. Total pages: {len(doc)}")
    
    # Inspect first few pages to see structure (text vs image, columns etc)
    for i in range(min(5, len(doc))):
        page = doc[i]
        text = page.get_text()
        print(f"\n--- Page {i+1} Output ---")
        print(text[:1000]) # First 1000 chars
        print("-----------------------")
        
except Exception as e:
    print(f"Error reading PDF: {e}")
