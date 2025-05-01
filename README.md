# Lichess-Wintrchess Analyzer

## Overview

The Lichess-Wintrchess Analyzer is a browser extension that integrates with Lichess to analyze chess games using the wintrchess site. It adds a button to the Lichess analysis board, allowing users to quickly send the PGN (Portable Game Notation) of their game to the wintrchess site for detailed analysis.

## Features

- Adds a "Analyze on wintrchess" button to the Lichess analysis board.
- Automatically opens a new tab with the wintrchess site and sends the PGN for analysis.
- Displays toast notifications for user feedback.
- Automatically switches to the black perspective on the wintrchess site if the user played as black on Lichess.

## Installation

1. Clone or download this repository.
2. Open your browser's extension page (e.g., `chrome://extensions/`).
3. Enable "Developer mode".
4. Click "Load unpacked" and select the directory containing this extension.

## Usage

1. Navigate to a game on Lichess and open the analysis board.
2. Click the "Analyze on wintrchess" button added by the extension.
3. A new tab will open with the wintrchess site, and the PGN of your game will be sent for analysis.
4. Review the analysis on the wintrchess site.

## Files

- `manifest.json`: The manifest file that defines the extension's metadata and permissions.
- `popup.html`: The HTML file for the extension's popup.
- `scripts/background.js`: The background script that handles communication between tabs.
- `scripts/gameReport.js`: The content script that interacts with the wintrchess site.
- `scripts/lichess.js`: The content script that adds the button to the Lichess analysis board.
- `styles/lichess.css`: The CSS file for the extension's styles on the Lichess site.
- `styles/toast.css`: The CSS file for the extension's toast notifications.

## Permissions

- `storage`: Used to store the tab ID of the wintrchess site.
- `tabs`: Used to create and manage tabs for the wintrchess site.

## Issues

- Sometimes, after loading the pgn on wintrchess, the button is not clicked. It is inconsistent.  