// Додаємо кнопку для завантаження файлів
function addUploadButton() {
    let input = document.createElement("input");
    input.id = "fileField";
    input.type = "file";
    input.hidden = true;
    input.multiple = true;

    let label = document.createElement("label");
    label.htmlFor = "fileField";
    label.textContent = "Upload receipt";

    document.body.appendChild(input);
    document.body.appendChild(label);

    input.addEventListener("change", function (e) {
        let files = e.target.files;
        if (files.length === 0) {
            return;
        }

        for (let file of files) {
            uploadImage(file);
            console.log("Image uploaded:", file.name);
        }
    }, false);
}

// Функція для введення значення по одному символу
async function typeInputValue(inputElement, value) {
    inputElement.value = "";
    for (let char of value) {
        inputElement.value += char;
        inputElement.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    inputElement.dispatchEvent(new Event("change", { bubbles: true }));
}

// Функція для очікування появи опцій у select
async function waitForOptions(selectElement, timeout = 5000) {
    let startTime = Date.now();
    while (selectElement.options.length <= 1) {
        if (Date.now() - startTime > timeout) {
            console.error("Timeout: options not loaded in", selectElement.id);
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 300));
    }
}


// Функція для очищення бази даних
async function clearDatabase() {
    try {
        let response = await fetch("http://127.0.0.1:8000/clear_database", {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let data = await response.json();
        console.log('Database cleared:', data);
    } catch (error) {
        console.error('Error clearing database:', error);
    }
}

// Функція для завантаження зображення на сервер
async function uploadImage(file) {

    clearDatabase();
    const formData = new FormData();
    formData.append('file', file);

    try {
        let response = await fetch('http://127.0.0.1:8000/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let data = await response.json();
        console.log('Success:', data);
    } catch (error) {
        console.error('Error:', error);
        alert('Error uploading image.');
    }
}

// Функція для отримання даних з сервера
async function fetchReceipts() {
    try {
        let response = await fetch("http://127.0.0.1:8000/get_receipts");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let receipts = await response.json();
        console.log("Receipts:", receipts);
        return receipts;
    } catch (error) {
        console.error("Error fetching receipts:", error);
        return [];
    }
}

// Функція для завантаження зображення в поле файлу
async function uploadImageToInput(imageUrl, inputElementId, receiptId) {
    try {
        let response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image from URL: ${imageUrl}`);
        }

        let blob = await response.blob();
        let file = new File([blob], `${receiptId}.jpg`, { type: "image/jpeg" });

        let dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        let inputElement = document.getElementById(inputElementId);
        if (!inputElement) {
            throw new Error(`Input element with id ${inputElementId} not found!`);
        }

        inputElement.files = dataTransfer.files;

        let event = new Event("change", { bubbles: true });
        inputElement.dispatchEvent(event);

        console.log("Image added to input:", inputElementId);
    } catch (error) {
        console.error('Error uploading image to input:', error);
        throw error;
    }
}

// Форматування поля суми
function formatInputField(id) {
    let inputElement = document.getElementById(id);
    if (inputElement) {
        let formattedValue = parseFloat(inputElement.value).toFixed(2);
        inputElement.value = isNaN(formattedValue) ? "" : formattedValue;
    }
}

// Функція для автоматичного заповнення форми
async function autoFillForm() {
    let receipts = await fetchReceipts();
    if (receipts.length === 0) {
        alert("No receipts found!");
        return;
    }

    for (let receipt of receipts) {
        console.log("Processing receipt:", receipt);

        let form = document.getElementById("inputRecipetDetailsForm");
        form.reset();
        if (!form) {
            console.error("Form not found!");
            return;
        }

        let dayInput = document.getElementById("dob-day-input");
        let monthInput = document.getElementById("dob-month-input");
        let yearInput = document.getElementById("dob-year-input");
        let amountInput = document.getElementById("amount");
        let categorySelect = document.getElementById("categorySelect");
        let subCategorySelect = document.getElementById("subCategorySelect");
        let fileInput = document.getElementById("fileField");

        if (!dayInput || !monthInput || !yearInput || !amountInput || !categorySelect || !subCategorySelect || !fileInput) {
            console.error("One or more elements not found!");
            return;
        }

        dayInput.value = receipt.date.split("-")[2];
        monthInput.value = receipt.date.split("-")[1];
        await typeInputValue(yearInput, receipt.date.split("-")[0]);

        await waitForOptions(categorySelect);
        categorySelect.value = receipt.category;
        categorySelect.dispatchEvent(new Event("change", { bubbles: true }));

        await waitForOptions(subCategorySelect);
        subCategorySelect.value = receipt.subcategory;
        subCategorySelect.dispatchEvent(new Event("change", { bubbles: true }));

        let amount = parseFloat(receipt.amount).toFixed(2);
        await typeInputValue(amountInput, amount);
        formatInputField("amount");

        console.log("Form filled. Uploading image...");
        await uploadImageToInput(receipt.image_url, "uploadContent1", receipt.id);

        console.log("Submitting form...");
        let formData = new FormData(form);
        await fetch(form.action, { method: "POST", body: formData });

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await clearDatabase();
}

// Додаємо кнопку для автоматичного заповнення форми
function addAutoFillButton() {
    let button = document.createElement("button");
    button.textContent = "Auto Fill Form";
    button.id = "autoFillButton";
    document.body.appendChild(button);

    button.addEventListener("click", async () => {
        await autoFillForm();
    });
}

// Викликаємо необхідні функції
addUploadButton();
addAutoFillButton();
