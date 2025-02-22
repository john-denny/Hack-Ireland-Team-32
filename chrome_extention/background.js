//open popup when user navigates to the page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url.includes("https://www.ros.ie/myreceipts-web/ros/receipt/expense-details/add")) {
        chrome.action.openPopup(); 
    }
});
