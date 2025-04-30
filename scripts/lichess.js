showToast("Lichess extension loaded");

const lichessReportBar = document.querySelector("#main-wrap > main > div.analyse__tools");
const GAME_REPORT_URL = "https://wintrchess.com/";
const BUTTON_NAME = "wintrchess-button";

const checkUserColor = (pgn) => {
    const userName = document.getElementById("user_tag")?.innerHTML;
    const lines = pgn.split('\n');
    for (let line of lines) {
        if (line.includes(userName)) {
            return line.startsWith('[White') ? 'White' : 'Black';
        }
    }
    return 'White'; // If user not found in PGN
}



const addBtn = (() => {
    let btn = document.getElementById(BUTTON_NAME);
    if (!btn) {
        btn = document.createElement("button");
        btn.id = BUTTON_NAME;
        btn.innerText = "Analyze on wintrchess";
        btn.classList.add(BUTTON_NAME);
    }

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

        const pgn = pgnClass[0].innerText;

        if (!pgn) {
            showToast("No PGN found");
            return;
        }
        const userColor = checkUserColor(pgn);
        sendMessageToOpenTab(pgn, userColor);
    };
    lichessReportBar.insertBefore(btn, lichessReportBar.firstChild);
})()

const sendMessageToOpenTab = (pgn, userColor) => {
    chrome.runtime.sendMessage({
        message: "open_new_tab",
        url: GAME_REPORT_URL,
        pgn: pgn,
        userColor: userColor    
    })
}

