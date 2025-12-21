import traceback
try:
    import easyocr
    print("EasyOCR imported successfully!")
    print(f"Version: {easyocr.__version__}")
except Exception as e:
    print("Error importing easyocr:")
    traceback.print_exc()
