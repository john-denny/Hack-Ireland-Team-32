
import base64
import requests
import json

# Function to convert an image file to base64
def image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Path to the image you want to upload
image_path = 'example receipt from angry woman on X.jpeg'  # Update this path

# Convert the image to base64
base64_image = image_to_base64(image_path)

# Prepare the data to send
data = {
    'file': base64_image
}

# Send the data to the Flask-SocketIO server
# Note: Replace 'http://localhost:5000' with your server's URL if different
url = 'http://localhost:5000/upload_file'
response = requests.post(url, json=data)

# Print the response from the server
print('Response:', response)