import base64
import socketio
import time

# Create a SocketIO client
sio = socketio.Client()

# Function to convert an image file to base64
def image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Event handler for receiving OCR results
@sio.event
def ocr_result(data):
    print("Received OCR result:", data)

# Connect to the Flask-SocketIO server
sio.connect('http://0.0.0.0:5001')

# Path to the image you want to upload
image_path = 'example receipt from angry woman on X.jpeg'  # Update this path

# Convert the image to base64
base64_image = image_to_base64(image_path)

# Prepare the data to send
data = {
    'file': base64_image
}

# Emit the upload_file event with the base64 image
sio.emit('upload_file', data)

# Wait for a response (optional)
sio.wait()