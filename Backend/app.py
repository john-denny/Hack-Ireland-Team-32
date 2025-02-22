from flask import Flask, request, jsonify
import pytesseract
from PIL import Image
import io

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    image = Image.open(file.stream)
    ocr_result = pytesseract.image_to_string(image)

    # Process OCR result with a local LLM
    extracted_data = process_with_llm(ocr_result)

    return jsonify(extracted_data)

def process_with_ll
    # Perform OCRm(ocr_text):
    # Placeholder for LLM processing
    # Extract date, cost, and classification
    # This is where you would integrate your local LLM
    return {
        'date': 'extracted_date',
        'cost': 'extracted_cost',
        'classification': 'extracted_classification'
    }

if __name__ == '__main__':
    app.run(debug=True)