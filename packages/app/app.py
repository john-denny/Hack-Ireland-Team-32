from flask import Flask, request, jsonify, send_file
from flask_socketio import SocketIO
import pytesseract
from PIL import Image
import io
import cv2
import re
import os
import base64
import sqlite3
import time
import zipfile

app = Flask(__name__)
socketio = SocketIO(app)

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

# Function to downscale image if larger than 2MB
# TODO: redo compression 
def downscale_image(image):
    max_size = 2 * 1024 * 1024  # 2MB
    
    if (image.size[0] * image.size[1]) > max_size:
        # Downscale logic (example: resize to 80% of original)
        new_size = (int(image.width * 0.8), int(image.height * 0.8))
        image = image.resize(new_size, Image.ANTIALIAS)
    return image

@socketio.on('upload_file')
def handle_file_upload(data):
    file = data['file']  # Assuming the file is sent as base64
    file = base64.b64decode(file)
    image = Image.open(io.BytesIO(file))
    image = downscale_image(image)  # Downscale if necessary

    # Save the image to the uploads directory
    image_name = f"receipt_{int(time.time())}.png"  # Unique name based on timestamp
    image_path = os.path.join(UPLOAD_FOLDER, image_name)
    image.save(image_path)

    # Perform OCR
    ocr_result = pytesseract.image_to_string(image)

    # Extract data using regex
    extracted_data = extract_data(ocr_result)

    # Insert data into the database
    insert_receipt(extracted_data['dates'], extracted_data['prices'], image_path)

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


def insert_receipt(dates, prices, image_path):
    DATABASE_PATH = os.path.join(os.getcwd(), 'receipts.db')
    conn = sqlite3.connect(DATABASE_PATH)
    c = conn.cursor()
    for date, price in zip(dates, prices):
        c.execute("INSERT INTO receipts (date, price, image_path) VALUES (?, ?, ?)", 
                  (date, price, image_path))
    conn.commit()
    conn.close()

# TODO: redo the download receipts json 
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

# Initialize the database when the app starts
init_db()

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
