const gameReportTabId = "game-report-tab-id";
const FAILED_CONNECTION_ERROR = "Could not establish connection. Receiving end does not exist.";
const RETRY_LIMIT = 3;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.message === "open_new_tab") {
        try {
            const result = await chrome.storage.local.get(['gameReportTabId']);
            let tabId = result.gameReportTabId;

            if (!tabId) {
                console.log("No tab id found");
                await createGameReportTab(request.url, request.pgn);
            } else {
                try {
                    const tab = await chrome.tabs.get(tabId);
                    console.log(tab);
                    await sendPGNToGameReport(tabId, request.pgn);
                    await setTabActive(tabId);
                } catch (error) {
                    console.log("Error", error);
                    console.log("Tab does not exist");
                    await createGameReportTab(request.url, request.pgn);
                }
            }
        } catch (error) {
            console.error("Error retrieving tab id:", error);
        }
        sendResponse({ message: "Message received" });
    }
});
const createGameReportTab = async (url, pgn) => {
    try {
        const tab = await chrome.tabs.create({ url: url });
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
            const delay = Math.pow(2, retries) * 100; // Exponential backoff
            console.log(`Retrying in ${delay}ms, attempt ${retries + 1}`);
            setTimeout(() => sendPGNToGameReport(tabId, pgn, retries + 1), delay);
            return;
        }
    }
}