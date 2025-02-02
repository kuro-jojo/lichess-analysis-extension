// import { showToast } from "./toast.js";
console.log("I'm a content script");

// Add CSS for the toast
showToast("Content script loaded");
chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.message === "update_pgn") {
            console.log("Updating PGN");
            console.log(request.pgn);

            const pgnField = document.getElementById("pgn");
            pgnField.value = request.pgn;

            const reviewBtn = document.getElementById("review-button");
            if (reviewBtn) {
                reviewBtn.click();
                sendResponse({ message: "PGN updated" });
                showToast("PGN updated successfully!");
            } else {
                showToast("No review button found");
            }
        }
    }
);