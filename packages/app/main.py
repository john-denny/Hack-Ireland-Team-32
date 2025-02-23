from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pytesseract
from PIL import Image
import cv2
import numpy as np

import io
import re
import os
import base64
import sqlite3
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

pytesseract.pytesseract.tesseract_cmd = r"/usr/bin/tesseract"

# Define a directory to save images
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Database setup (create a new SQLite database or connect to an existing one)
def init_db():
    conn = sqlite3.connect('receipts.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS receipts
                 (id INTEGER PRIMARY KEY, date TEXT, price TEXT, image_path TEXT)''')
    conn.commit()
    conn.close()

# Function to downscale image if larger than 2MB using OpenCV
def downscale_image(image):
    max_size = 2 * 1024 * 1024  # 2MB
    print("Beginning downscaling")
    
    # Convert PIL image to OpenCV format
    image_np = np.array(image)
    image_cv = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
    
    # Check the file size
    is_success, buffer = cv2.imencode(".png", image_cv)
    file_size = len(buffer)
    
    if file_size > max_size:
        print("Image size:", file_size)
        # Downscale logic (example: resize to 80% of original)
        new_size = (int(image_cv.shape[1] * 0.8), int(image_cv.shape[0] * 0.8))
        image_cv = cv2.resize(image_cv, new_size, interpolation=cv2.INTER_AREA)
        print("New image size:", new_size)
    
    # Convert back to PIL image
    image = Image.fromarray(cv2.cvtColor(image_cv, cv2.COLOR_BGR2RGB))
    print("Downscaling done")
    return image

@app.route('/upload_file', methods=['POST'])
def handle_file_upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    try:
        file = request.files['file']
        image = Image.open(file.stream)
        
        print("Image received")
        image = downscale_image(image)  # Downscale if necessary
        print("Downscaling done")
        # Save the image to the uploads directory
        image_name = f"receipt_{int(time.time())}.png"  # Unique name based on timestamp
        print("Image saved as:", image_name)
        image_path = os.path.join(UPLOAD_FOLDER, image_name)
        image.save(image_path)

        # Perform OCR
        ocr_result = pytesseract.image_to_string(image)

        # Extract data using regex
        extracted_data = extract_data(ocr_result)
        print(extracted_data)
        # Insert data into the database
        insert_receipt(extracted_data['dates'], extracted_data['prices'], image_path)

        # Send back the extracted data as JSON response
        return jsonify(extracted_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


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


def insert_receipt(dates, prices, image_path):
    DATABASE_PATH = os.path.join(os.getcwd(), 'receipts.db')
    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()
    for date, price in zip(dates, prices):
        c.execute("INSERT INTO receipts (date, price, image_path) VALUES (?, ?, ?)", 
                  (date, price, image_path))
    conn.commit()
    conn.close()

@app.route('/download_receipts', methods=['GET'])
def download_receipts():
    conn = sqlite3.connect('receipts.db')
    c = conn.cursor()
    c.execute("SELECT * FROM receipts")
    receipts = c.fetchall()
    conn.close()

    # Create a list of URLs for the receipt images
    receipt_urls = [f"/uploads/{receipt[3].split('/')[-1]}" for receipt in receipts]

    return jsonify(receipt_urls)  # Return the list of URLs as JSON

@app.route('/show_database', methods=['GET'])
def show_database():
    conn = sqlite3.connect('receipts.db')
    c = conn.cursor()
    c.execute("SELECT * FROM receipts")
    receipts = c.fetchall()
    conn.close()

    # Convert the database rows to a list of dictionaries
    receipt_list = []
    for receipt in receipts:
        receipt_dict = {
            'id': receipt[0],
            'date': receipt[1],
            'price': receipt[2],
            'image_path': receipt[3]
        }
        receipt_list.append(receipt_dict)

    return jsonify(receipt_list)  # Return the list of receipts as JSON

# Initialize the database when the app starts
init_db()

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=80, debug=True)
