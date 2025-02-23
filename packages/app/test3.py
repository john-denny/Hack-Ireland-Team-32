import base64
import requests

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

# Send HTTP POST request to the Flask server
url = 'http://0.0.0.0:5000/upload_file'
response = requests.post(url, json=data)

# Check the response from the server
if response.status_code == 200:
    print("Extracted Data:", response.json())
else:
    print("Failed to upload file. Status code:", response.status_code)
    print("Response:", response.text)