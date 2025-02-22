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


    chrome.storage.local.set({ dobMonth: month, dobDay: day, dobYear: year, dobCategory: category }, function () {
        console.log("DOB month saved:", month);
        console.log("DOB day saved:", day);
        console.log("DOB year saved:", year);
        console.log("DOB category saved:", category);

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            let activeTab = tabs[0];
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ["content.js"]
            });
        });
    });
});
