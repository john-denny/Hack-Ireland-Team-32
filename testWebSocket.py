import socketio
import base64
import os

# Initialize SocketIO client
sio = socketio.Client()

# Connect to the server
@sio.event
def connect():
    print("Successfully connected to the server.")

# Listen for OCR result from the server
@sio.event
def ocr_result(data):
    print("Received OCR result:", data)
    sio.disconnect()

# Handle connection errors
@sio.event
def connect_error(data):
    print("Failed to connect to the server.")

# Handle disconnection
@sio.event
def disconnect():
    print("Disconnected from the server.")

# Connect to the SocketIO server
sio.connect('http://localhost:5001')

# Function to convert an image file to base64
def image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Path to the image you want to upload (update with the correct path)
image_path = 'example_receipt.jpeg'  # Replace with an actual file path

# Check if the image exists
if not os.path.exists(image_path):
    print(f"Image file not found at: {image_path}")
else:
    # Convert image to base64
    base64_image = image_to_base64(image_path)

    # Prepare data to send
    data = {'file': base64_image}

    # Emit the event with the image data
    sio.emit('upload_file', data)

    # Wait for the server response
    sio.wait()

