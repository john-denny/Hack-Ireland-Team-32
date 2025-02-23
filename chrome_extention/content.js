chrome.storage.local.get(["dobMonth", "dobYear", "dobDay", "dobCategory", "imgData"], function (data) {
    if (!data.dobMonth || !data.dobYear || !data.dobDay) {
        console.log("DOB information is incomplete in storage.");
        return;
    }

    function triggerAllEvents(element) {
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
        element.dispatchEvent(new Event("blur", { bubbles: true }));
        element.dispatchEvent(new Event("focusout", { bubbles: true }));
    }

    function autoFillInputById(elementId, value) {
        const textBox = document.getElementById(elementId);

        if (textBox) {
            textBox.value = value;
            triggerAllEvents(textBox);
            console.log(`Input with ID ${elementId} filled automatically with`, value);
        } else {
            console.warn(`Input with ID ${elementId} not found!`);
        }
    }

    function autoFillDropDowns() {
        const categories = ["Health", "Remote Working", "Rental", "Stay and Spend", "Trade", "Other"];
        const categorySelect = document.getElementById("categorySelect");

        categories.forEach((category, index) => {
            let option = document.createElement("option");
            option.value = index;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        categorySelect.value = categories.indexOf(data.dobCategory);
        triggerAllEvents(categorySelect);
    }

    function autoFillSubCategory() {
        const subCategorySelect = document.getElementById("subCategorySelect");

        // Clear existing options
        subCategorySelect.innerHTML = '';

        // Add the required options
        const options = [
            { value: "", text: "" },
            { value: "0", text: "General" },
            { value: "1", text: "Dental (non-routine)" },
            { value: "2", text: "Nursing home" }
        ];

        options.forEach(optionData => {
            let option = document.createElement("option");
            option.value = optionData.value;
            option.textContent = optionData.text;
            subCategorySelect.appendChild(option);
        });

        // Set the value to "General"
        subCategorySelect.value = "0";
        subCategorySelect.disabled = false;
        triggerAllEvents(subCategorySelect);
    }

    function waitForDynamicContent(selector, callback, timeout = 5000) {
        const startTime = Date.now();

        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element && element.offsetParent !== null) { // Check if element is visible
                clearInterval(interval);
                callback(element);
            }

            if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                console.warn("Dynamic content did not load in time.");
            }
        }, 200); // Check every 200ms
    }

    // Нова функція для створення Blob з base64 і імітації завантаження файлу
    function createFileFromBase64(base64Data, fileName = "uploaded_image.png") {
        const byteString = atob(base64Data);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }

        return new Blob([arrayBuffer], { type: "image/png" });
    }

    function autoUploadFile(fileInput) {
        // Отримуємо зображення з chrome.storage.local
        if (data.imgData) {
            // Створюємо файл із base64 даних
            const file = createFileFromBase64(data.imgData);
            
            // Імітуємо завантаження файлу через DataTransfer
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(new File([file], "uploaded_image.png", { type: "image/png" }));
            
            // Спробуємо присвоїти файли (якщо це можливо)
            try {
                fileInput.files = dataTransfer.files;
                triggerAllEvents(fileInput);
                console.log("Зображення завантажено в поле завантаження автоматично");
            } catch (error) {
                console.warn("Не вдалося присвоїти файли через обмеження безпеки. Спробуємо інший підхід.");
                
                // Альтернативний підхід: імітація кліку та завантаження через Blob URL
                const blobUrl = URL.createObjectURL(file);
                const event = new MouseEvent('click', { bubbles: true });
                fileInput.dispatchEvent(event);
                
                // Присвоєння через програмний вибір файлу не завжди працює через безпеку
                console.log("Спроба імітації завантаження через Blob URL:", blobUrl);
            }
        } else {
            console.log("Зображення не знайдено в chrome.storage.local");
        }
    }

    function autoFillAmount() {
        const amountInput = document.querySelector("#amount-div .input-group input");

        if (amountInput) {
            amountInput.value = "100";
            triggerAllEvents(amountInput);
            console.log(`Input with ID amount filled automatically with 100`);
        } else {
            console.warn(`Input with ID amount not found!`);
        }
    }

    // Спочатку заповнюємо поля дати, категорії та підкатегорії
    autoFillInputById("dob-day-input", data.dobDay);
    autoFillInputById("dob-month-input", data.dobMonth);
    autoFillInputById("dob-year-input", data.dobYear);

    autoFillDropDowns();
    autoFillSubCategory();

    autoFillAmount();

    // Чекаємо на появу поля завантаження файлу після заповнення інших полів
    waitForDynamicContent("#uploadContent1", autoUploadFile);
});