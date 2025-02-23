# Use Ubuntu as the base image
FROM ubuntu:22.04

# Set environment variables to prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update package list and install dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    tesseract-ocr

# Set Python3 as the default Python version
RUN ln -s /usr/bin/python3 /usr/bin/python

# Set the working directory
WORKDIR /app

# Copy the application files
COPY . .


# Install Flask
RUN pip3 install --no-cache-dir Flask  pytesseract pillow 

# Expose the Flask default port
EXPOSE 5000

# Run the Flask app
CMD ["python3", "main.py"]
