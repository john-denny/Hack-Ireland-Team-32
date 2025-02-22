chrome.storage.local.get(["dobMonth", "dobYear", "dobDay", "dobCategory", "savedFile"], function (data) {
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

    async function safeAutoFillAmount() {
        const amountInput = document.getElementById("amount");
        console.log(getEventListeners(amountInput));
    
        if (amountInput) {
            const value = "1"; // Correct amount
    
            // Temporarily disable inline `oninput` and other event listeners
            const originalOnInput = amountInput.getAttribute("oninput");
            amountInput.removeAttribute("oninput");
    
            // Backup existing event listeners (if any)
            const oldEventListeners = {
                input: amountInput.oninput,
                change: amountInput.onchange,
                blur: amountInput.onblur,
            };
    
            // Remove all handlers temporarily
            amountInput.oninput = null;
            amountInput.onchange = null;
            amountInput.onblur = null;
    
            // Directly set the value
            amountInput.focus();
            amountInput.value = value;
    
            // Trigger all required events manually
            amountInput.dispatchEvent(new Event("input", { bubbles: true }));
            amountInput.dispatchEvent(new Event("change", { bubbles: true }));
            amountInput.dispatchEvent(new Event("blur", { bubbles: true }));
            amountInput.dispatchEvent(new Event("focusout", { bubbles: true }));
    
            // Restore original event handlers after a slight delay
            setTimeout(() => {
                if (originalOnInput) {
                    amountInput.setAttribute("oninput", originalOnInput);
                }
    
                // Restore other event listeners
                amountInput.oninput = oldEventListeners.input;
                amountInput.onchange = oldEventListeners.change;
                amountInput.onblur = oldEventListeners.blur;
    
                console.log(`Input with ID 'amount' successfully filled with '${value}'.`);
            }, 500);
        } else {
            console.warn("Amount input field not found!");
        }
    }
    // Run the function safely
    
    function waitForDynamicContent(selector, timeout = 5000, intervalTime = 200) {
        const startTime = Date.now();
    
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
    
            // Check if element exists and is visible
            if (element && element.offsetParent !== null) {
                clearInterval(interval); // Stop checking
                console.log(`Element '${selector}' is now visible.`);
            }
    
            // Stop checking after the timeout
            if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                console.warn(`Element '${selector}' did not appear within the timeout period.`);
            }
        }, intervalTime);
    }
    
    

    // Auto-fill form field
    autoFillInputById("dob-day-input", data.dobDay);
    autoFillInputById("dob-month-input", data.dobMonth);
    autoFillInputById("dob-year-input", data.dobYear);

    autoFillDropDowns();
    autoFillSubCategory();

    // Wait for the dynamic content (file upload field) to appear
    waitForDynamicContent("#uploadContent1");    
    safeAutoFillAmount();
    // Run the function to simulate typing


});
