from flask import Flask, request, jsonify
from flask_socketio import SocketIO
import pytesseract
from PIL import Image
import io
import cv2
import re
import os

app = Flask(__name__)
socketio = SocketIO(app)

# Function to downscale image if larger than 2MB
def downscale_image(image):
    max_size = 2 * 1024 * 1024  # 2MB
    if image.size > max_size:
        # Downscale logic (example: resize to 80% of original)
        new_size = (int(image.width * 0.8), int(image.height * 0.8))
        image = image.resize(new_size, Image.ANTIALIAS)
    return image

@socketio.on('upload_file')
def handle_file_upload(data):
    file = data['file']  # Assuming the file is sent as base64
    image = Image.open(io.BytesIO(file))
    image = downscale_image(image)  # Downscale if necessary

    # Perform OCR
    ocr_result = pytesseract.image_to_string(image)

    # Extract data using regex (similar to test2.py)
    extracted_data = extract_data(ocr_result)

    # Send back the extracted data
    socketio.emit('ocr_result', extracted_data)

def extract_data(extracted_text):
    # Extract dates
    date_pattern = r'\b(?:\d{1,2}[-/]){2}\d{2,4}\b'
    dates = re.findall(date_pattern, extracted_text)

    # Extract prices
    price_pattern = r'[\$\€]\d+\.\d{2}'
    prices = re.findall(price_pattern, extracted_text)

    return {
        'dates': dates,
        'prices': prices
    }

if __name__ == '__main__':
    socketio.run(app, debug=True)