# Lichess Analysis Extension

## Overview

The Lichess Analysis Extension is a browser extension that integrates with Lichess to analyze chess games using the Game Report site. It adds a button to the Lichess analysis board, allowing users to quickly send the PGN (Portable Game Notation) of their game to the Game Report site for detailed analysis.

## Features

- Adds a "To game report" button to the Lichess analysis board.
- Automatically opens a new tab with the Game Report site and sends the PGN for analysis.
- Displays toast notifications for user feedback.

## Installation

1. Clone or download this repository.
2. Open your browser's extension page (e.g., `chrome://extensions/`).
3. Enable "Developer mode".
4. Click "Load unpacked" and select the directory containing this extension.

## Usage

1. Navigate to a game on Lichess and open the analysis board.
2. Click the "To game report" button added by the extension.
3. A new tab will open with the Game Report site, and the PGN of your game will be sent for analysis.
4. Review the analysis on the Game Report site.

## Files

- `manifest.json`: The manifest file that defines the extension's metadata and permissions.
- `popup.html`: The HTML file for the extension's popup.
- `scripts/background.js`: The background script that handles communication between tabs.
- `scripts/gameReport.js`: The content script that interacts with the Game Report site.
- `scripts/lichess.js`: The content script that adds the button to the Lichess analysis board.
- `scripts/toast.js`: The script that handles toast notifications.

## Permissions

- `storage`: Used to store the tab ID of the Game Report site.
- `tabs`: Used to create and manage tabs for the Game Report site.

