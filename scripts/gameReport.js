chrome.runtime.onMessage.addListener(
    (request, _, sendResponse) => {
        if (request.message === "update_pgn") {

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