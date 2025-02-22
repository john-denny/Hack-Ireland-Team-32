chrome.storage.local.get("dobMonth", function (data) {
    if (!data.dobMonth) {
        console.log("No DOB month found in storage.");
        return;
    }

    let storedMonth = data.dobMonth;

    function autoFillDOBMonth(month) {
        const textBox = document.getElementById("dob-month-input");

        if (textBox) {
            textBox.value = month;
            textBox.dispatchEvent(new Event("input", { bubbles: true })); 
            textBox.dispatchEvent(new Event("change", { bubbles: true }));
            console.log("DOB Month input filled automatically with", month);
        } else {
            console.warn("DOB month input not found!");
        }
    }

    autoFillDOBMonth(storedMonth);
});
