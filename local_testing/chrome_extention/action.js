document.getElementById('submitButton').addEventListener('click', function () {
    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];
  
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
  
      fetch('https://your-server.com/upload', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
          alert('Image uploaded successfully!');
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('Error uploading image.');
        });
    } else {
      alert('Please select an image first.');
    }
  });