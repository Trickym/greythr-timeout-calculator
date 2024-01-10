chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in service worker");
  if (message.action === "fetchElement") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(
        activeTab.id,
        { action: "fetchElementData" }, // Change the action name
        (response) => {
          if (response) {
            console.log("Response from content script:", response);
            sendResponse(response); // Sending back the response from content script
          } else {
            sendResponse({ error: "No response from content script" });
          }
        }
      );
    });
    return true; // Indicates the response will be sent asynchronously
  }
});
