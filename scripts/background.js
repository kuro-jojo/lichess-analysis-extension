const gameReportTabId = "game-report-tab-id";
const FAILED_CONNECTION_ERROR = "Could not establish connection. Receiving end does not exist.";
const RETRY_LIMIT = 3;

async function getCallerTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
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
                console.log("No tab id found");
                await createGameReportTab(request.url, request.pgn, newTabIndex);
            } else {
                try {
                    const tab = await chrome.tabs.get(tabId);
                    await sendPGNToGameReport(tabId, request.pgn);
                    await setTabActive(tabId);
                } catch (error) {
                    console.log("Error", error);
                    await createGameReportTab(request.url, request.pgn, newTabIndex);
                }
            }
        } catch (error) {
            console.error("Error retrieving tab id:", error);
        }
        sendResponse({ message: "Message received" });
    }
});

const createGameReportTab = async (url, pgn, index) => {
    try {
        let properties = { url: url };
        if (index) {
            properties.index = index;
        }
        const tab = await chrome.tabs.create(properties);
        await chrome.storage.local.set({ gameReportTabId: tab.id });

        sendPGNToGameReport(tab.id, pgn);
    } catch (error) {
        console.error(`Error creating tab: ${error.message}`);
    }
}


const setTabActive = async (tabId) => {
    try {
        await chrome.tabs.update(tabId, { active: true });
    } catch (error) {
        console.error(`Error setting tab active: ${error.message}`);
    }
}

const sendPGNToGameReport = async (tabId, pgn, retries = 0) => {
    try {
        console.log("Sending PGN to game report");
        const response = await chrome.tabs.sendMessage(tabId, { message: "update_pgn", pgn: pgn });
        console.log("Message sent successfully:", response);
    } catch (error) {
        console.error("Error sending message to tab:", error);
        if (error.message === FAILED_CONNECTION_ERROR && retries < RETRY_LIMIT) {
            const delay = Math.pow(2, retries) * 500; // Exponential backoff
            console.log(`Retrying in ${delay}ms, attempt ${retries + 1}`);
            setTimeout(() => sendPGNToGameReport(tabId, pgn, retries + 1), delay);
            return;
        }
    }
}