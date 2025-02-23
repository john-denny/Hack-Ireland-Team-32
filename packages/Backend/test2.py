import cv2
import pytesseract
import re

# Load and preprocess the image
image = cv2.imread('example receipt from angry woman on X.jpeg')

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Perform OCR
extracted_text = pytesseract.image_to_string(image)

# Extract dates
date_pattern = r'\b(?:\d{1,2}[-/]){2}\d{2,4}\b'
dates = re.findall(date_pattern, extracted_text)

# Extract prices
price_pattern = r'[\$\€]\d+\.\d{2}'
prices = re.findall(price_pattern, extracted_text)

print("Dates found:", dates)
print("Prices found:", prices)
