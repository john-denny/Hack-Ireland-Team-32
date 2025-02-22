chrome.storage.local.get(["dobMonth", "dobYear", "dobDay", "dobCategory"], function (data) {
        if (!data.dobMonth || !data.dobYear || !data.dobDay) {
            console.log("DOB information is incomplete in storage.");
            return;
        }

        function autoFillInputById(elementId, value) {
            const textBox = document.getElementById(elementId);

            if (textBox) {
                textBox.value = value;
                textBox.dispatchEvent(new Event("input", { bubbles: true })); 
                textBox.dispatchEvent(new Event("change", { bubbles: true }));
                console.log(`Input with ID ${elementId} filled automatically with`, value);
            } else {
                console.warn(`Input with ID ${elementId} not found!`);
            }
        }

        function autoFillDropDowns(){
            const categories = ["Health", "Remote Working", "Rental", "Stay and Spend", "Trade", "Other"];
            const categorySelect = document.getElementById("categorySelect");

            categories.forEach((category, index) => {
                let option = document.createElement("option");
                option.value = index;
                option.textContent = category;
                categorySelect.appendChild(option);
            });

            categorySelect.value = categories.indexOf(data.dobCategory);
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
        }



        autoFillInputById("dob-month-input", data.dobMonth);
        autoFillInputById("dob-year-input", data.dobYear);
        autoFillInputById("dob-day-input", data.dobDay);

        autoFillDropDowns();
        autoFillSubCategory();

});
