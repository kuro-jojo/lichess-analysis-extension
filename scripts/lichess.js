const lichessReportBar = document.querySelector("#main-wrap > main > div.analyse__tools > div.ceval");
const pgn = document.getElementsByClassName("pgn")[0].innerText;

const GAME_REPORT_URL = "https://chess.wintrcat.uk/";
const addBtn = (() => {
    const btnExists = document.getElementById("lichess-extension");

    if (btnExists) return;
    const btn = document.createElement("button");
    btn.id = "lichess-extension";
    btn.innerText = "To game report";
    btn.classList.add("button", "text", "ceval__button");
    btn.onclick = () => {
        const pgnClass = document.getElementsByClassName("pgn");
        if (pgnClass.length == 0) {
            alert("No PGN element found");
            return;
        }

        const pgn = pgnClass[0].innerText;
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

