import pytesseract
from PIL import Image
from ollama import ChatResponse, chat


pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Load an image from file
image_path = 'example receipt from angry woman on X.jpeg'
image = Image.open(image_path)

# Use pytesseract to do OCR on the image
extracted_text = pytesseract.image_to_string(image)
print(f"EXTRACTED TEXT: \n{extracted_text}")
# Function to interact with the llama model
def process_with_llama(text):
    # Use the extracted text as input for the chat model with a standardized output format
    response: ChatResponse = chat(model='llama3.2:3b', messages=[
    {
        'role': 'user',
        'content': (
            f"Please reformat my text: \n{text}.\n"
            "Retrieve the following properties from the text 'price' and 'date' and no others: "
            "{'price': 'XX.XX', 'date': 'DD-MM-YYYY'} This should be all that is in the message"
            "Here is an example of quality output in its entirety: {'price': '€60.66', 'date': '05/11/21'}"
        )
    },
    ])
    print(type(response))
    print(response['message']['content'])
    return response

# Process the extracted text with the llama model
for i in range(100):
    result = process_with_llama(extracted_text)
    # Print the results
    print(f"Iteration {i}")
    # print(result)
print("IT FUCKING WORKS!")