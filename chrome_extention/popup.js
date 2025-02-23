document.addEventListener("DOMContentLoaded", function () {
    const categories = ["Health", "Remote Working", "Rental", "Stay and Spend", "Trade", "Other"];
    const categorySelect = document.getElementById("categorySelect");

    categories.forEach((category, index) => {
        let option = document.createElement("option");
        option.value = index;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    // Always select the "Health" option
    categorySelect.value = categories.indexOf("Health");
});

document.getElementById("submitBtn").addEventListener("click", function () {
    let month = "07"; 
    let day = "23"; 
    let year = "2024"; 
    let category = "Health";

    // Отримуємо файл з інпуту
    const file = document.getElementById('fileInput').files[0];
    
    // Якщо файл є, обробляємо його
    if (!file) {
        alert("Будь ласка, виберіть зображення!");
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        img.src = e.target.result;
        
        img.onload = function() {
            // Отримуємо base64 дані зображення
            const imgData = getBase64Image(img);
            // Зберігаємо в chrome.storage.local
            chrome.storage.local.set({ 
                imgData: imgData,
                dobMonth: month,
                dobDay: day,
                dobYear: year,
                dobCategory: category 
            }, function() {
                console.log("Зображення та дані збережено в chrome.storage.local:", {
                    imgData: imgData.substring(0, 20) + "...",
                    dobMonth: month,
                    dobDay: day,
                    dobYear: year,
                    dobCategory: category
                });

                // Запускаємо content.js
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    let activeTab = tabs[0];
                    chrome.scripting.executeScript({
                        target: { tabId: activeTab.id },
                        files: ["content.js"]
                    });
                });
            });
        };
    };
    
    reader.readAsDataURL(file);
});

// Функція для отримання base64 зображення
function getBase64Image(img) {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
}