const gameReportTabId = "game-report-tab-id";
const FAILED_CONNECTION_ERROR = "Could not establish connection. Receiving end does not exist.";
const RETRY_LIMIT = 5;

async function getCallerTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

chrome.runtime.onMessage.addListener(async (request, _, sendResponse) => {
    if (request.message === "open_new_tab") {
        const callerTab = await getCallerTab();

        let newTabIndex;
        if (callerTab) {
            newTabIndex = callerTab.index + 1;
        }

        try {
            const result = await chrome.storage.local.get(['gameReportTabId']);
            let tabId = result.gameReportTabId;

            if (!tabId) {
                await createGameReportTab(request.url, request.pgn, request.userColor, newTabIndex);
            } else {
                try {
                    await deleteGameReportTab(tabId);
                    await createGameReportTab(request.url, request.pgn, request.userColor, newTabIndex);
                } catch (error) {
                    console.error("Error", error);
                    await createGameReportTab(request.url, request.pgn, request.userColor, newTabIndex);
                }
            }
        } catch (error) {
            console.error("Error retrieving tab id : ", error);
        }
        sendResponse({ message: "Message received" });
    }
});

const createGameReportTab = async (url, pgn, userColor, index) => {
    console.log("Creating new tab");
    try {
        let properties = { url: url };
        if (index) {
            properties.index = index;
        }
        const tab = await chrome.tabs.create(properties);
        await chrome.storage.local.set({ gameReportTabId: tab.id });

        await sendPGNToGameReport(tab.id, pgn, userColor);
    } catch (error) {
        throw new Error("Failed to create game report tab");
    }
}

const deleteGameReportTab = async (tabId) => {
    try {
        console.log("Deleting game report tab");
        const tab = await chrome.tabs.get(tabId);
        if (tab) {
            await chrome.tabs.remove(tab.id);
        }
    } catch (error) {
        console.error("Error deleting game report tab : ", error);
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