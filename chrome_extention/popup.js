document.getElementById("submitBtn").addEventListener("click", function () {
    let fileInput = document.getElementById("fileInput").files[0];
    
    if (!fileInput) {
        alert("Please select a file!");
        return;
    }

    alert("File selected: " + fileInput.name);
});
