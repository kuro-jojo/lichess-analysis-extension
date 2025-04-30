chrome.runtime.onMessage.addListener(
    (request, _, sendResponse) => {
        if (request.message === "update_pgn") {
            console.log("Updating PGN");
            const pgnField = document.querySelector("textarea.TerVPsT9aZ0soO8yjZU4");

            if (!pgnField) {
                console.error("Could not find PGN textarea");
                showToast("Failed to find PGN textarea");
                sendResponse({ message: "error", error: "Could not find PGN textarea" });
                return;
            }

            // Set the value using multiple methods to ensure it sticks
            pgnField.value = request.pgn;
            pgnField.textContent = request.pgn;

            // Trigger input events to ensure the site recognizes the change
            const inputEvent = new Event('input', { bubbles: true });
            pgnField.dispatchEvent(inputEvent);

            // Add a mutation observer to watch for changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                        // If the value gets cleared, try to set it again
                        if (pgnField.value !== request.pgn) {
                            pgnField.value = request.pgn;
                            pgnField.textContent = request.pgn;
                            pgnField.dispatchEvent(inputEvent);
                        }
                    }
                });
            });

            // Start observing the textarea
            observer.observe(pgnField, {
                childList: true,
                characterData: true,
                subtree: true
            });

            // Clean up the observer after a delay
            setTimeout(() => {
                observer.disconnect();
            }, 5000); // Adjust this timeout as needed

            if (request.userColor) {
                const flipBtn = document.querySelector(".rHBNQrpvd7mwKp3HqjVQ.oHWNfW9fFqRD7Atq_lzR");
                if (flipBtn && request.userColor === "Black") {
                    flipBtn.click();
                }
            }

            // Get the review button
            const reviewBtn = document.querySelector(".rHBNQrpvd7mwKp3HqjVQ.THArhyJIfuOy42flULV6");

            if (!reviewBtn) {
                showToast("No review button found");
                sendResponse({ message: "error", error: "Could not find review button" });
                return;
            }

            // Add a click event listener to handle the button click
            reviewBtn.addEventListener('click', () => {
                // Check if the value is still there before clicking
                if (pgnField.value !== request.pgn) {
                    pgnField.value = request.pgn;
                    pgnField.textContent = request.pgn;
                    pgnField.dispatchEvent(inputEvent);
                }
            }, { once: true });

            // Click the button
            reviewBtn.click();

            // Send response and show toast
            sendResponse({ message: "PGN updated" });
            showToast("PGN updated successfully!");
        }
    }
);