// contentScript.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in script worker");
  if (message.action === "fetchElementData") {
    try {
      let samePage = window.location.href?.includes("/attendance-info");
      let tableElements = document.querySelectorAll("table.ng-star-inserted");
      if (tableElements.length > 0) {
        let firstTableChild = tableElements[0];
        let tableBody = firstTableChild.querySelector("tbody");
        if (tableBody) {
          let tableRows = tableBody.querySelectorAll("tr.ng-star-inserted");
          if (tableRows.length > 0) {
            let tableRowColumns = tableRows[0].querySelectorAll("td");
            if (tableRowColumns.length > 0) {
              let tableRowColumn = tableRowColumns[0];
              let paragraphTags = tableRowColumn.querySelectorAll("p");
              if (paragraphTags.length > 0) {
                let targetParagraph = paragraphTags[0];
                let in_time = targetParagraph.textContent.trim();
                if (in_time) {
                  sendResponse({ in_time, samePage });
                  return true; // Indicates the response will be sent asynchronously
                }
              }
            }
          }
        }
      }
      sendResponse({
        error: "Element not found or data extraction failed",
        samePage,
        notPunchData: samePage ? true : false,
      });
    } catch (error) {
      sendResponse({ error: error.message });
    }
  }
});
