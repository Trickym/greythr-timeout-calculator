// contentScript.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in script worker");
  if (message.action === "fetchElementData") {
    try {
      const samePage = window.location.href?.includes("/attendance-info");
      let day = "";
      let presentMonth = "";
      let in_time = "";
      let date = "";

      const tableElements = document.querySelectorAll("table.ng-star-inserted");
      const selectedDate = document.querySelectorAll(
        ".ng-star-inserted.selected"
      );
      const presentMonthSelector = document.querySelectorAll(
        ".gt-calendar-control"
      );

      if (tableElements.length > 0) {
        const firstTableChild = tableElements[0];
        const tableBody = firstTableChild.querySelector("tbody");
        if (tableBody) {
          const tableRows = tableBody.querySelectorAll("tr.ng-star-inserted");
          if (tableRows.length > 0) {
            const tableRowColumns = tableRows[0].querySelectorAll("td");
            if (tableRowColumns.length > 0) {
              const tableRowColumn = tableRowColumns[0];
              const paragraphTags = tableRowColumn.querySelectorAll("p");
              if (paragraphTags.length > 0) {
                const targetParagraph = paragraphTags[0];
                in_time = targetParagraph.textContent.trim();
                date = paragraphTags[1]?.textContent.trim();
              }
            }
          }
        }
      }

      if (selectedDate?.length > 0) {
        day = selectedDate[0].querySelector(".cell-date")?.textContent;
      }
      if (presentMonthSelector?.length > 0) {
        presentMonth = presentMonthSelector[0]
          .querySelector(".text-3")
          ?.textContent?.trim();
      }

      console.log({ in_time, day, presentMonth });

      if (in_time && date) {
        sendResponse({ in_time, samePage, day, presentMonth, date });
      } else {
        sendResponse({
          error: "Element not found or data extraction failed",
          samePage,
          notPunchData: samePage,
          day,
          presentMonth,
        });
      }
    } catch (error) {
      console.error("Error in content script:", error);
      sendResponse({ error: error.message });
    }
    return true; // Indicates the response will be sent asynchronously
  }
});
