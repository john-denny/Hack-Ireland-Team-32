document.getElementById("submitBtn").addEventListener("click", function () {
    let month = "12"; 

    chrome.storage.local.set({ dobMonth: month }, function () {
        console.log("DOB month saved:", month);

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            let activeTab = tabs[0];
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ["content.js"]
            });
        });
    });
});
