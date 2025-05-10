
const LICHESS_REPORT_BAR_SELECTOR = "#main-wrap > main > div.analyse__tools";
const GAME_REPORT_URL = "https://wintrchess.com/";
const BUTTON_ID = "wintrchess-button";
const BUTTON_TEXT = "Analyze on WintrChess";

const checkUserColor = (pgn) => {
    const userName = document.getElementById("user_tag")?.textContent;
    const lines = pgn.split('\n');
    for (let line of lines) {
        if (line.includes(userName)) {
            return line.startsWith('[White') ? 'White' : 'Black';
        }
    }
    if (window.location.href.endsWith('black')) {
        return 'Black';
    }
    return 'White';
};

const createButton = () => {
    const btn = document.createElement("button");
    btn.id = BUTTON_ID;
    btn.textContent = BUTTON_TEXT;
    btn.classList.add(BUTTON_ID);
    return btn;
};

const addAnalysisButton = () => {
    const lichessReportBar = document.querySelector(LICHESS_REPORT_BAR_SELECTOR);
    if (!lichessReportBar) return;

    // Remove any existing button first
    const existingBtn = document.getElementById(BUTTON_ID);
    if (existingBtn) {
        existingBtn.remove();
    }

    const btn = createButton();
    btn.onclick = () => {
        const textArea = document.querySelector("textarea.copyable");
        if (textArea) {
            const pgn = textArea.value;
            if (!pgn) {
                showToast("No PGN found");
                return;
            }
            sendMessageToOpenTab(pgn);
            return;
        }

        const pgnClass = document.getElementsByClassName("pgn");
        if (pgnClass.length == 0) {
            showToast("No PGN element found");
            return;
        }

        const pgn = pgnClass[0].textContent;
        if (!pgn) {
            showToast("No PGN found");
            return;
        }
        const userColor = checkUserColor(pgn);
        sendMessageToOpenTab(pgn, userColor);
    };

    lichessReportBar.insertBefore(btn, lichessReportBar.firstChild);
};

const sendMessageToOpenTab = async (pgn, userColor) => {
    try {
        await chrome.runtime.sendMessage({
            message: "open_new_tab",
            url: GAME_REPORT_URL,
            pgn: pgn,
            userColor: userColor
        });
    } catch (error) {
        console.error("Error sending message to background script:", error);
    }
};

// Watch for changes to the analysis bar
const observer = new MutationObserver((mutations) => {
    // Check if the analysis bar exists
    const lichessReportBar = document.querySelector(LICHESS_REPORT_BAR_SELECTOR);
    if (lichessReportBar && !document.getElementById(BUTTON_ID)) {
        addAnalysisButton();
        // Disconnect observer after successful button addition
        observer.disconnect();
    }
});

// Start observing changes to the analysis bar
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial check
addAnalysisButton();

// Cleanup function for when the page unloads
const cleanup = () => {
    // Disconnect observer if it's still running
    if (observer) {
        observer.disconnect();
    }
};

// Add cleanup on page unload
window.addEventListener('unload', cleanup);

// Also add cleanup on page visibility change (if user switches tabs)
window.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cleanup();
    }
});