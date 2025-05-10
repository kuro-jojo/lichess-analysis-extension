// Constants
const PGN_VALUE = "PGN";
const SELECTOR_PGN_TEXTAREA = 'textarea';
const SELECTOR_PGN_DROPDOWN = 'div';
const SELECTOR_REVIEW_BUTTON = 'button';
const SELECTOR_FLIP_BUTTON = 'button';
const LOCAL_STORAGE_KEY = 'wintrchess_preferred_language';
const ENGLISH_LANGUAGE = 'en';
const GAME_NOT_FOUND_MESSAGE = 'Please select a Chess game.';
const EVALUATING_MESSAGE = 'Evaluating';
const TIMEOUT_OBSERVER = 10000;
const LOADING_TIMEOUT = 10000;

// Error Messages
const ERROR_MESSAGES = {
    PGN_NOT_FOUND: 'Could not find PGN textarea',
    DROPDOWN_NOT_FOUND: 'Could not find PGN dropdown',
    REVIEW_BUTTON_NOT_FOUND: 'Could not find review button',
    FLIP_BUTTON_NOT_FOUND: 'Could not find flip board button',
    UNEXPECTED_ERROR: 'An unexpected error occurred',
    LANGUAGE_ERROR: 'This extension only works with the English version for now.',
    LOADING_TIMEOUT: 'Page loading timeout exceeded'
};

// DOM Selection Helper
const findElement = (selector, filterFn, noError = false) => {
    const elements = document.querySelectorAll(selector);
    const element = Array.from(elements).find(filterFn);
    if (!element && !noError) {
        console.error(`Element not found for selector: ${selector}`);
    }
    return element;
};

// Loading State Observer
const waitForLoadingToComplete = () => {
    return new Promise((resolve) => {
        const observer = new MutationObserver(() => {
            const loadingElements = document.querySelectorAll('span');
            const loadingSpan = Array.from(loadingElements).find(span =>
                span.textContent.trim().toLowerCase().includes('loading')
            );

            if (!loadingSpan) {
                observer.disconnect();
                resolve(true);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Timeout if loading takes too long
        setTimeout(() => {
            observer.disconnect();
            resolve(false);
        }, LOADING_TIMEOUT);
    });
};

// Element Finders
const findPGNField = (noError = false) => {
    // First try to find textarea by PGN placeholder
    const textarea = findElement(SELECTOR_PGN_TEXTAREA, el =>
        el.placeholder && el.placeholder.toLowerCase().includes('pgn'), noError
    );

    if (textarea) return textarea;

    // If not found, try to find textarea that is a sibling of the dropdown label's parent
    const label = findPGNDropdownLabel();
    if (label) {
        const parent = label.parentElement;
        if (parent) {
            const nextElement = parent.nextElementSibling;
            if (nextElement && nextElement.tagName === 'TEXTAREA') {
                return nextElement;
            }
        }
    }

    return null;
};

const findPGNDropdownLabel = () => {
    const divs = document.querySelectorAll(SELECTOR_PGN_DROPDOWN);
    for (const div of divs) {
        if (div.textContent.trim() === 'Load game from') {
            const nextElement = div.nextElementSibling;
            if (nextElement && nextElement.tagName === 'SELECT') {
                return div;
            }
        }
    }
    return null;
};

const findReviewButton = () => {
    // First try to find button by text content
    const button = findElement(SELECTOR_REVIEW_BUTTON, button =>
        button.textContent.trim() === 'Analyse'
    );

    if (button) return button;

    // If not found, try to find the 4th element in a div with 6 children where 1st contains "Game Report"
    const buttons = document.querySelectorAll(SELECTOR_REVIEW_BUTTON);
    for (const button of buttons) {
        const parentDiv = button.closest('div');
        if (parentDiv && parentDiv.children.length === 6) {
            const firstChild = parentDiv.children[0];
            if (firstChild.textContent.toLowerCase().includes('game report')) {
                const elements = Array.from(parentDiv.children);
                return elements[3];
            }
        }
    }

    return null;
};

const findFlipButton = () => {
    // First try to find button by title or data-tooltip-id
    const button = findElement(SELECTOR_FLIP_BUTTON, button =>
        button.title.toLowerCase().includes('flip') ||
        (button.dataset?.tooltipId?.toLowerCase()?.includes('flip') ?? false)
    );

    if (button) return button;

    // If not found, try to find the first button in a div with exactly 3 buttons
    const buttons = document.querySelectorAll(SELECTOR_FLIP_BUTTON);
    for (const button of buttons) {
        const parentDiv = button.closest('div');
        if (parentDiv && parentDiv.children.length === 3) {
            const buttonsInDiv = Array.from(parentDiv.children).filter(child => child.tagName === 'BUTTON');
            if (buttonsInDiv.length === 3) {
                return buttonsInDiv[0];
            }
        }
    }

    return null;
};

/**
 * Selects the PGN option in the dropdown menu
 * @returns {boolean} true if successful, false otherwise
 */
const selectPGNOption = () => {
    try {
        const label = findPGNDropdownLabel();
        if (!label) {
            console.error(ERROR_MESSAGES.DROPDOWN_NOT_FOUND);
            return false;
        }
        // Get the select element directly from the label since we know it exists
        const select = label.nextElementSibling;
        if (!select || select.tagName !== 'SELECT') {
            console.error('No SELECT element found next to dropdown label');
            return false;
        }

        if (select.value !== PGN_VALUE) {
            select.value = PGN_VALUE;
            const eventOptions = { bubbles: true };
            select.dispatchEvent(new Event('input', eventOptions));
            select.dispatchEvent(new Event('change', eventOptions));
        }

        return true;
    } catch (error) {
        console.error(`Error setting PGN option: ${error.message}`);
        return false;
    }
};

/**
 * Updates the PGN field value and ensures it persists
 * @param {string} pgn - The PGN string to set
 * @returns {boolean} true if successful, false otherwise
 */
const updatePGNField = (pgn) => {
    const pgnField = findPGNField();
    if (!pgnField) {
        console.error(ERROR_MESSAGES.PGN_NOT_FOUND);
        showToast(ERROR_MESSAGES.PGN_NOT_FOUND, true);
        return false;
    }

    // Set the value using multiple methods to ensure it sticks
    pgnField.value = pgn;
    pgnField.textContent = pgn;

    // Trigger input events
    const inputEvent = new Event('input', { bubbles: true });
    pgnField.dispatchEvent(inputEvent);

    // Add mutation observer
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                if (pgnField.value !== pgn) {
                    pgnField.value = pgn;
                    pgnField.textContent = pgn;
                    pgnField.dispatchEvent(inputEvent);
                }
            }
        });
    });

    observer.observe(pgnField, {
        childList: true,
        characterData: true,
        subtree: true
    });

    // Clean up after 5 seconds
    setTimeout(() => observer.disconnect(), TIMEOUT_OBSERVER);
    return true;
};

const handleGameReview = async (request) => {
    // Select PGN option
    if (!selectPGNOption()) {
        return { success: false, error: ERROR_MESSAGES.DROPDOWN_NOT_FOUND };
    }

    // Update PGN field
    if (!updatePGNField(request.pgn)) {
        return { success: false, error: ERROR_MESSAGES.PGN_NOT_FOUND };
    }

    // Handle board orientation
    if (request.userColor === "Black") {
        const flipBtn = findFlipButton();
        if (flipBtn) {
            flipBtn.click();
        }
    }

    // Click review button
    const reviewBtn = findReviewButton();
    if (!reviewBtn) {
        return { success: false, error: ERROR_MESSAGES.REVIEW_BUTTON_NOT_FOUND };
    }

    // Monitor for analysis start
    const waitForAnalysisStart = async () => {
        return new Promise((resolve, reject) => {
            const observer = new MutationObserver(() => {
                // Check if error message appears
                const errorMessage = document.querySelectorAll('span');
                const errorSpan = Array.from(errorMessage).find(span => span.textContent.includes(GAME_NOT_FOUND_MESSAGE));
                if (errorSpan) {
                    observer.disconnect();
                    console.info('WintrChess didn\'t find the game to analyze. Retrying...');
                    handleGameReview(request);
                    return;
                }

                // Check if PGN textarea is removed
                const pgnField = findPGNField(noError = true);
                if (!pgnField) {
                    // Check if evaluation started
                    const evaluatingSpan = Array.from(document.querySelectorAll('span')).find(span => span.textContent.includes(EVALUATING_MESSAGE));
                    if (evaluatingSpan && evaluatingSpan.textContent.includes(EVALUATING_MESSAGE)) {
                        observer.disconnect();
                        resolve(true);
                        return;
                    }
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Timeout if analysis doesn't start
            setTimeout(() => {
                observer.disconnect();
                reject(new Error('Analysis timeout'));
            }, TIMEOUT_OBSERVER);
        });
    };

    // Add click handler to ensure PGN is still set
    const cleanup = addEventListenerWithCleanup(reviewBtn, 'click', () => {
        const pgnField = findPGNField();
        if (pgnField && pgnField.value !== request.pgn) {
            pgnField.value = request.pgn;
            pgnField.textContent = request.pgn;
            pgnField.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }, { once: true });

    // Clean up event listener when done
    const cleanupTimeout = setTimeout(cleanup, TIMEOUT_OBSERVER);
    reviewBtn.addEventListener('click', () => clearTimeout(cleanupTimeout), { once: true });

    // Click the button and wait for analysis to start
    reviewBtn.click();

    try {
        await waitForAnalysisStart();
        return { success: true };
    } catch (error) {
        console.error('Analysis failed:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Adds an event listener that cleans up after itself
 * @param {HTMLElement} element - The element to attach the listener to
 * @param {string} event - The event type
 * @param {Function} handler - The event handler function
 * @param {Object} options - Event listener options
 * @returns {Function} Cleanup function
 */
const addEventListenerWithCleanup = (element, event, handler, options = {}) => {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
};

/**
 * Handles the message listener for PGN updates
 * @param {Object} request - The message request
 * @param {Object} _ - The sender object (unused)
 * @param {Function} sendResponse - The response callback
 */
chrome.runtime.onMessage.addListener(async (request, _, sendResponse) => {
    if (request.message === "update_pgn") {
        try {
            // First try to find elements without waiting
            const preferredLanguage = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (preferredLanguage && preferredLanguage !== ENGLISH_LANGUAGE) {
                sendResponse({ message: "error", error: ERROR_MESSAGES.LANGUAGE_ERROR });
                showToast(ERROR_MESSAGES.LANGUAGE_ERROR, true);
                return;
            }
            const result = await handleGameReview(request);
            if (result.success) {
                showToast("PGN updated! Please wait for the analysis to complete.");
                sendResponse({ message: "PGN updated" });
                return;
            }
            // If initial attempt failed, check if page is still loading
            const loadingSpan = Array.from(document.querySelectorAll('span'))
                .find(span => span.textContent.trim().toLowerCase().includes('loading'));

            console.log("Waiting for loading to complete", loadingSpan);
            if (loadingSpan) {
                // Wait for loading to complete
                waitForLoadingToComplete().then(async isReady => {
                    console.log("Loading complete", isReady);
                    if (!isReady) {
                        sendResponse({
                            message: "error",
                            error: ERROR_MESSAGES.LOADING_TIMEOUT
                        });
                        showToast(ERROR_MESSAGES.LOADING_TIMEOUT, true);
                        return;
                    }

                    // Try again after loading completes
                    const result = await handleGameReview(request);
                    if (result.success) {
                        sendResponse({ message: "PGN updated" });
                        showToast("PGN updated! Please wait for the analysis to complete.");
                    } else {
                        sendResponse({ message: "error", error: result.error });
                        showToast(result.error, true);
                    }
                });
            } else {
                // If not loading but still failed, return the error
                sendResponse({ message: "error", error: result.error });
                showToast(result.error, true);
            }
        } catch (error) {
            console.error(`Error processing PGN update: ${error.message}`);
            const errorMessage = error.message || ERROR_MESSAGES.UNEXPECTED_ERROR;
            sendResponse({ message: "error", error: errorMessage });
            showToast(errorMessage, true);
        }
    }
    return true;
});