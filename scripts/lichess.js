showToast("Lichess extension loaded");

const lichessReportBar = document.querySelector("#main-wrap > main > div.analyse__tools > div.ceval");
const pgn = document.getElementsByClassName("pgn")[0].innerText;

const GAME_REPORT_URL = "https://chess.wintrcat.uk/";
const addBtn = (() => {
    let btn = document.getElementById("lichess-extension");

    if (!btn) {
        btn = document.createElement("button");
        btn.id = "lichess-extension";
        btn.innerText = "To game report";
        btn.classList.add("button", "text", "ceval__button");
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
        sendMessageToOpenTab(pgn);
    };
    lichessReportBar.appendChild(btn);
})()

const sendMessageToOpenTab = (pgn) => {
    chrome.runtime.sendMessage({
        message: "open_new_tab",
        url: GAME_REPORT_URL,
        pgn: pgn
    })
}

