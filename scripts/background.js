const FAILED_CONNECTION_ERROR = "Could not establish connection. Receiving end does not exist.";
const RETRY_LIMIT = 5;

async function getCallerTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function findGameReportTab() {
    // Look for existing game report tabs
    try {
        const tabs = await chrome.tabs.query({
            url: "*://wintrchess.com/*",
            currentWindow: true
        });
        return tabs[0];
    } catch (error) {
        console.error("Error querying tabs:", error);
        return null;
    }
}

async function createGameReportTab(url, pgn, userColor, index) {
    console.log("Creating new tab");
    try {
        let properties = { url: url };
        if (index) {
            properties.index = index;
        }
        const tab = await chrome.tabs.create(properties);
        await sendPGNToGameReport(tab.id, pgn, userColor);
    } catch (error) {
        throw new Error("Failed to create game report tab");
    }
}

const sendPGNToGameReport = async (tabId, pgn, userColor, retries = 0) => {
    try {
        await chrome.tabs.sendMessage(tabId, { message: "update_pgn", pgn: pgn, tabId: tabId, userColor: userColor });
    } catch (error) {
        if (error.message !== FAILED_CONNECTION_ERROR || retries >= RETRY_LIMIT) {
            throw new Error("Failed to send PGN to game report");
        }

        const delay = Math.pow(2, retries) * 500; // Exponential backoff
        console.log(`Retrying in ${delay}ms, attempt ${retries + 1}`);
        setTimeout(() => sendPGNToGameReport(tabId, pgn, userColor, retries + 1), delay);
    }
}

chrome.runtime.onMessage.addListener(async (request, _, sendResponse) => {
    if (request.message === "open_new_tab") {
        console.log("Opening new tab");
        const callerTab = await getCallerTab();
        let newTabIndex;
        if (callerTab) {
            newTabIndex = callerTab.index + 1;
        }

        try {
            const existingTab = await findGameReportTab();
            if (existingTab) {
                await chrome.tabs.remove(existingTab.id);
            }
            
            await createGameReportTab(request.url, request.pgn, request.userColor, newTabIndex);
            sendResponse({ success: true });
        } catch (error) {
            console.error("Error managing game report tab:", error);
            sendResponse({ success: false, error: error.message });
        }
        return true;
    }
});