
	// content.js
// Author:
// Author URI: https://
// Author Github URI: https://www.github.com/
// Project Repository URI: https://github.com/
// Description: Handles all the webpage-level activities (e.g., manipulating page data, etc.)
// License: MIT

// Theme configurations
const themes = {
    light: {
        container: {
            background: '#ffffff',
            border: '2px solid #0dcaf0'
        },
        header: {
            background: '#a4e6ff',
            color: '#333'
        },
        content: {
            background: '#f8f9fa'
        },
        input: {
            background: 'white',
            border: '1px solid #e0e0e0',
            color: '#333'
        },
        sendButton: {
            background: '#a4e6ff',
            color: '#333'
        },
        message: {
            user: {
                background: '#a4e6ff',
                color: '#333'
            },
            ai: {
                background: 'white',
                color: '#333'
            }
        }
    },
    dark: {
        container: {
            background: '#161d29',
            border: '2px solid #0dcaf0'
        },
        header: {
            background: '#314059',
            color: '#ffffff'
        },
        content: {
            background: '#161d29'
        },
        input: {
            background: '#2c2c2c',
            border: '1px solid #404040',
            color: '#ffffff'
        },
        sendButton: {
            background: '#404040',
            color: '#ffffff'
        },
        message: {
            user: {
                background: '#404040',
                color: '#ffffff'
            },
            ai: {
                background: '#2c2c2c',
                color: '#ffffff'
            }
        }
    }
};


let lastPageVisited = "";


// Define global variables to hold the editorial code and hints data
let editorialCode = [];
let hints = {};

// Observe DOM changes
const observer = new MutationObserver(() => {
    handleContentChange();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial content change check
handleContentChange();

function handleContentChange() {
    if (isPageChange()) handlePageChange();
}

function isPageChange() {
    const currentPage = window.location.pathname;
    if (currentPage === lastPageVisited) return false;
    lastPageVisited = currentPage;
    return true;
}

function handlePageChange() {
    if (onTargetPage()) {
        cleanUpPage();
        addInjectScripts();
        addAIChatbotButton();
    }
}

function onTargetPage() {
    const pathname = window.location.pathname;
    return pathname.startsWith("/problems/") && pathname.length > "/problems/".length;
}

function cleanUpPage() {
    const existingButton = document.getElementById("AI_HELPER_BUTTON_ID");
    if (existingButton) {
        existingButton.remove();
    }

    const existingChatContainer = document.getElementById("CHAT_CONTAINER_ID");
    if (existingChatContainer) {
        existingChatContainer.remove();
    }
}

function addInjectScripts() {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("inject.js");
    document.documentElement.insertAdjacentElement("afterbegin", script);
    script.remove();

    const script1 = document.createElement("script");
    script1.src = chrome.runtime.getURL("prompt.js");
    document.documentElement.appendChild(script1);

    const script2 = document.createElement("script");
    script2.src = chrome.runtime.getURL("scraper.js");
    document.documentElement.appendChild(script2);

    script1.remove();
    script2.remove();
}

function getProblemKey() {
    const pathname = window.location.pathname;
    const match = pathname.match(/\/problems\/([\w-]+)/);
    // console.log(match);
    // console.log("key genereation");

    return match ? match[1] : null;
}

function saveChat(problemKey, chatHistory) {
    if (problemKey) {
        const storageObj = {};
        storageObj[problemKey] = chatHistory; // Store key-value pair
        chrome.storage.local.set(storageObj, () => {
            console.log(`Chat history saved for problem key: ${problemKey}`);
        });
    }
}

function loadChat(problemKey) {
    return new Promise((resolve) => {
        if (problemKey) {
            chrome.storage.local.get(problemKey, (result) => {
                resolve(result[problemKey] || []);
            });
        } else {
            resolve([]);
        }
    });
}



// Updated listener for messages from the page context
window.addEventListener("message", (event) => {
    if (event.source !== window || event.data.type !== "xhrDataFetched") {
        return; // Ignore messages that don't match the expected type
    }

    const { url, response } = event.data.detail;

    // console.log("API Request URL:", url);
    // console.log("API Response:", response);

    if (url.startsWith("https://api2.maang.in/problems/user/")) {
        try {
            const jsonResponse = JSON.parse(response);

            // Extract editorial code and hints
            const { editorial_code, hints: responseHints } = jsonResponse.data;

            if (editorial_code && editorial_code.length > 0) {
                editorial_code.forEach((codeEntry) => {
                    console.log(`Editorial Code (${codeEntry.language}):\n${codeEntry.code}`);
                });
                editorialCode = editorial_code;
            } else {
                console.log("No editorial code available in the response.");
            }

            if (responseHints) {
                // console.log("Hints:");
                Object.keys(responseHints).forEach((key) => {
                    console.log(`${key}: ${responseHints[key] || "No value provided"}`);
                });
                hints = responseHints;
            } else {
                console.log("No hints available in the response.");
            }
        } catch (error) {
            console.error("Failed to parse the response or extract editorial code and hints:", error);
        }
    }
});

function addAIChatbotButton() {
    // Find the "Doubt Forum" list item by matching its innerText
    const allListItems = document.querySelectorAll("li.d-flex.flex-row");

    let doubtForumItem = null;
    for (const li of allListItems) {
        if (li.textContent.trim().includes("Doubt Forum")) {
            doubtForumItem = li;
            break;
        }
    }

    if (doubtForumItem) {
        // Remove existing AI button if it exists
        const existingButton = document.querySelector(".ai-chatbot-button");
        if (existingButton) {
            existingButton.remove();
        }

        // Create the new "Ask AI" button
        const aiButton = document.createElement("li");
        aiButton.className = "ai-chatbot-button d-flex flex-row rounded-3 dmsans align-items-center coding_list__V_ZOZ coding_card_mod_unactive__O_IEq";
        aiButton.style.padding = "0.36rem 1rem";
        aiButton.style.whiteSpace = "nowrap";

        aiButton.innerHTML = `
            <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" class="me-1" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548-.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            <span class="coding_ask_doubt_gradient_text__FX_hZ">Ask AI</span>
        `;

        aiButton.addEventListener("click", () => {
            const chatbox = document.getElementById("CHAT_CONTAINER_ID");
            if (chatbox) {
                chatbox.style.display = chatbox.style.display === "block" ? "none" : "block";
            } else {
                console.log("Chatbox not found.");
            }
        });

        // Insert AI button after "Doubt Forum"
        doubtForumItem.parentNode.insertBefore(aiButton, doubtForumItem.nextSibling);

        // Ensure chatbox logic is set up
        addChatbox();
    } else {
        console.log("Doubt Forum button not found.");
    }
}


async function summarizeChatWithGemini(chatMessages) {
    const earlyMessages = chatMessages.slice(0, chatMessages.length - 8);
    const recentMessages = chatMessages.slice(-8);

    const oldChatText = earlyMessages
        .map(msg => `${msg.sender}: ${msg.message}`)
        .join("\n");

    const prompt = `Summarize the following conversation between a user and an AI in 4-5 lines:\n\n${oldChatText}`;

    const payload = {
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }]
            }
        ]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCvT3QKetP5mtqmBhuLtnukL3gWLEEBQRU`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    const summary = responseData?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary available.";

    // Combine summary and recent messages
    const finalText = `Earlier Chat Summary:\n${summary}\n\nRecent Messages:\n${recentMessages.map(msg => `${msg.sender}: ${msg.message}`).join("\n")}`;
    return finalText;
}



// async function fetchAIResponse(apiRequestPayload) {
//     const apiKey = "AIzaSyCZeiZWq2Pkmg1FiEpKbfoiBzlbTnMFkHM"; // Replace with your actual API key
//     const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
//     // Construct the request content in the correct format
//     const messages = Array.isArray(apiRequestPayload)
//         ? apiRequestPayload.map(({ sender, message }) => ({
//             role: sender === "You" ? "user" : "model", // "user" or "model" role
//             parts: [{ text: message }] // Wrap message in the 'parts' array
//         }))
//         : [{
//             role: "user", // Default to "user" if it's a single string
//             parts: [{ text: apiRequestPayload }]
//         }];
    
//     // Construct the payload with 'contents' array
//     const payload = {
//         contents: messages
//     };

//     try {
//         const response = await fetch(apiUrl, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(payload),
//         });

//         const responseData = await response.json();
//         console.log("API Response:", responseData);

//         // Extract the response text from the response structure
//         if (
//             responseData &&
//             responseData.candidates &&
//             Array.isArray(responseData.candidates) &&
//             responseData.candidates.length > 0 &&
//             responseData.candidates[0].content &&
//             responseData.candidates[0].content.parts &&
//             Array.isArray(responseData.candidates[0].content.parts)
//         ) {
//             return responseData.candidates[0].content.parts[0].text; // Extract the text from the first part
//         } else {
//             throw new Error("Unexpected API response structure");
//         }
//     } catch (error) {
//         console.error("Error calling AI API:", error);
//         throw error;
//     }
// }

async function fetchAIResponse(apiRequestPayload) {
    const apiKey = "AIzaSyCvT3QKetP5mtqmBhuLtnukL3gWLEEBQRU"; // Replace with your actual API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    // Construct the request content in the correct format
    const messages = Array.isArray(apiRequestPayload)
        ? apiRequestPayload.map(({ sender, message }) => ({
            role: sender === "You" ? "user" : "model", // "user" or "model" role
            parts: [{ text: message }] // Wrap message in the 'parts' array
        }))
        : [
            {
                role: "user", // Default to "user" if it's a single string
                parts: [{ text: apiRequestPayload }]
            }
        ];
    
    // Construct the payload with 'contents' array
    const payload = {
        contents: messages
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const responseData = await response.json();
        console.log("API Response:", responseData);

        // Extract the response text from the response structure
        if (
            responseData &&
            responseData.candidates &&
            Array.isArray(responseData.candidates) &&
            responseData.candidates.length > 0 &&
            responseData.candidates[0].content &&
            responseData.candidates[0].content.parts &&
            Array.isArray(responseData.candidates[0].content.parts)
        ) {
            return responseData.candidates[0].content.parts[0].text; // Extract the text from the first part
        } else {
            throw new Error("Unexpected API response structure");
        }
    } catch (error) {
        console.error("Error calling AI API:", error);
        throw error;
    }
}




function applyTheme(isDarkMode) {
    const theme = isDarkMode ? themes.dark : themes.light;
    const container = document.getElementById('CHAT_CONTAINER_ID');
    if (!container) return;

    // Apply container styles
    Object.assign(container.style, {
        backgroundColor: theme.container.background,
        border: theme.container.border
    });

    // Apply header styles
    const header = document.getElementById('chat-header');
    if (header) {
        Object.assign(header.style, {
            background: theme.header.background,
            color: theme.header.color
        });
    }

    // Apply content styles
    const content = document.getElementById('chat-content');
    if (content) {
        Object.assign(content.style, {
            backgroundColor: theme.content.background
        });
    }

    // Apply input styles
    const input = document.getElementById('chat-message-input');
    if (input) {
        Object.assign(input.style, {
            backgroundColor: theme.input.background,
            border: theme.input.border,
            color: theme.input.color
        });
    }

    // Apply send button styles
    const sendButton = document.getElementById('send-message');
    if (sendButton) {
        Object.assign(sendButton.style, {
            background: theme.sendButton.background,
            color: theme.sendButton.color
        });
    }

    // Update message bubbles
    const messages = document.querySelectorAll('#chat-messages > div');
    messages.forEach(messageDiv => {
        const messageBubble = messageDiv.querySelector('div:last-child');
        if (!messageBubble) return;

        const isUserMessage = messageDiv.style.alignItems === 'flex-end';
        const messageTheme = isUserMessage ? theme.message.user : theme.message.ai;
        
        Object.assign(messageBubble.style, {
            backgroundColor: messageTheme.background,
            color: messageTheme.color
        });
    });
}

function extractLanguage(jsonObject) {
    return jsonObject.language;
}

// Function to extract problem ID from URL
function extractProblemId(url) {
    const match = url.match(/problems\/.*?-(\d+)/);
    return match ? match[1] : null;
}

function getCurrentUrl() {
    return window.location.href;
}

// Function to find the key ending with `_problemId_language` in local storage
function findLocalStorageKey(problemId, language) {
    const suffix = `_${problemId}_${language}`;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.endsWith(suffix)) {
            return key; // Return the matching key
        }
    }
    return null; // No matching key found
}

// Main function to get the value from local storage
function getSolutionFromLocalStorage(jsonObject, url) {
    // No need to parse, since jsonObject is already an object

    // Extract the language
    let language = extractLanguage(jsonObject);

    // Extract the problem ID
    const problemId = extractProblemId(url);

    if (problemId && language) {
        // Find the key in local storage
        const localStorageKey = findLocalStorageKey(problemId, language);

        if (localStorageKey) {
            // Retrieve the value from local storage
            const solution = localStorage.getItem(localStorageKey);
            return solution ? solution : `No solution found for key: ${localStorageKey}`;
        } else {
            return `No key found ending with _${problemId}_${language}`;
        }
    } else {
        return "Problem ID or Language could not be extracted.";
    }
}


let isFirstCall = true; // Tracks whether it's the first API call

let globalChatHistoryContent = ""; // Variable to store all content

async function printChatHistory() {
    const problemKey = getProblemKey(); // Get the problem key from the current URL
    if (!problemKey) {
        console.error("Problem key not found.");
        return;
    }

    try {
        const chatHistory = await loadChat(problemKey); // Wait for the chat history to be loaded

        if (chatHistory && chatHistory.length > 0) {
            globalChatHistoryContent = `Chat History for Problem Key: ${problemKey}\n`; // Reset content for new history
            chatHistory.forEach(({ sender, message }, index) => {
                const line = `${index + 1}. ${sender}: ${message}\n`;
                globalChatHistoryContent += line; // Append to the variable
            });
             // Display content
        } else {
            globalChatHistoryContent = "No chat history found for this problem.\n";
            console.log(globalChatHistoryContent);
        }
    } catch (error) {
        console.error("Failed to load chat history:", error);
    }
}


const referencePanel = document.querySelector(".coding_responsive_sidepannel__obXtI");

let panelRect = {
    left: 50,
    width: 400
};

if (referencePanel) {
    const rect = referencePanel.getBoundingClientRect();
    panelRect = {
        left: rect.left,
        width: rect.width
    };
}

window.addEventListener("resize", () => {
    const panel = document.querySelector(".coding_responsive_sidepannel__obXtI");
    const chatbox = document.getElementById("CHAT_CONTAINER_ID");

    if (panel && chatbox) {
        const rect = panel.getBoundingClientRect();
        chatbox.style.left = `${rect.left}px`;
        chatbox.style.width = `${rect.width}px`;
        chatbox.style.height = `${rect.height}px`;
    }
});



// Updated addChatbox function with improved styling and positioning
// Enhanced content.js with draggable and resizable chatbox features
// Add these functions to your existing content.js

// Global variables for drag and resize functionality
let isDragging = false;
let isResizing = false;
let dragStartX = 0;
let dragStartY = 0;
let chatboxStartX = 0;
let chatboxStartY = 0;
let resizeStartX = 0;
let resizeStartY = 0;
let chatboxStartWidth = 0;
let chatboxStartHeight = 0;
let minWidth = 300;
let minHeight = 400;
let maxWidth = window.innerWidth * 0.8;
let maxHeight = window.innerHeight * 0.9;

// Enhanced addChatbox function with drag and resize capabilities
// Updated addChatbox function with proper dark mode support
function getCurrentTheme() {
    return localStorage.getItem('chatbox-dark-mode') === 'true';
}

function setCurrentTheme(isDarkMode) {
    localStorage.setItem('chatbox-dark-mode', isDarkMode.toString());
}

function updateExistingMessages(isDarkMode) {
    const theme = isDarkMode ? themes.dark : themes.light;
    const messages = document.querySelectorAll('#chat-messages .message-bubble');
    
    messages.forEach(bubble => {
        const isUserMessage = bubble.classList.contains('user-message') || 
                             bubble.parentElement.classList.contains('user-message');
        
        if (isUserMessage) {
            bubble.style.backgroundColor = theme.message.user.background;
            bubble.style.color = theme.message.user.color;
        } else {
            bubble.style.backgroundColor = theme.message.ai.background;
            bubble.style.color = theme.message.ai.color;
        }
    });
}


function addChatbox() {
    const problemKey = getProblemKey();

    loadChat(problemKey).then((chatHistory) => {
        // Get reference panel for positioning
        const referencePanel = document.querySelector(".coding_responsive_sidepannel__obXtI");
        let panelRect = { left: 50, width: 400, height: 600 };
        
        if (referencePanel) {
            const rect = referencePanel.getBoundingClientRect();
            panelRect = {
                left: rect.left,
                width: rect.width,
                height: Math.min(rect.height, 600)
            };
        }

        // Check current theme preference (you can get this from storage or a global variable)
        const isDarkMode = getCurrentTheme(); // You'll need to implement this function

        const currentTheme = isDarkMode ? themes.dark : themes.light;

        const chatboxHTML = `<div id="CHAT_CONTAINER_ID" style="
    display: none;
    position: fixed;
    bottom: 20px;
    left: ${panelRect.left}px;
    width: ${panelRect.width}px;
    height: ${panelRect.height}px;
    min-width: ${minWidth}px;
    min-height: ${minHeight}px;
    max-width: ${maxWidth}px;
    max-height: ${maxHeight}px;
    background-color: ${currentTheme.container.background};
    border: ${currentTheme.container.border};
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 10000;
    backdrop-filter: blur(10px);
    cursor: default;
">
    <!-- Resize handles -->
    <div class="resize-handle resize-handle-n" style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        cursor: n-resize;
        z-index: 10001;
    "></div>
    <div class="resize-handle resize-handle-s" style="
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        cursor: s-resize;
        z-index: 10001;
    "></div>
    <div class="resize-handle resize-handle-w" style="
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 4px;
        cursor: w-resize;
        z-index: 10001;
    "></div>
    <div class="resize-handle resize-handle-e" style="
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 4px;
        cursor: e-resize;
        z-index: 10001;
    "></div>
    <div class="resize-handle resize-handle-nw" style="
        position: absolute;
        top: 0;
        left: 0;
        width: 8px;
        height: 8px;
        cursor: nw-resize;
        z-index: 10002;
    "></div>
    <div class="resize-handle resize-handle-ne" style="
        position: absolute;
        top: 0;
        right: 0;
        width: 8px;
        height: 8px;
        cursor: ne-resize;
        z-index: 10002;
    "></div>
    <div class="resize-handle resize-handle-sw" style="
        position: absolute;
        bottom: 0;
        left: 0;
        width: 8px;
        height: 8px;
        cursor: sw-resize;
        z-index: 10002;
    "></div>
    <div class="resize-handle resize-handle-se" style="
        position: absolute;
        bottom: 0;
        right: 0;
        width: 8px;
        height: 8px;
        cursor: se-resize;
        z-index: 10002;
        background: linear-gradient(-45deg, transparent 0%, transparent 30%, rgba(13, 202, 240, 0.3) 30%, rgba(13, 202, 240, 0.3) 100%);
    "></div>

    <div id="chat-header" class="drag-handle" style="
        background: ${currentTheme.header.background};
        color: ${currentTheme.header.color};
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(13, 202, 240, 0.2);
        user-select: none;
        cursor: move;
        position: relative;
        z-index: 10001;
    ">
        <div style="display: flex; align-items: center; gap: 8px;">
            <div style="
                width: 8px;
                height: 8px;
                background: #00ff88;
                border-radius: 50%;
                animation: pulse 2s infinite;
            "></div>
            <span style="font-weight: 600; font-size: 16px;">AI Coding Assistant</span>
            <div class="drag-indicator" style="
                display: flex;
                gap: 2px;
                margin-left: 8px;
                opacity: 0.5;
            ">
                <div style="width: 3px; height: 3px; background: currentColor; border-radius: 50%;"></div>
                <div style="width: 3px; height: 3px; background: currentColor; border-radius: 50%;"></div>
                <div style="width: 3px; height: 3px; background: currentColor; border-radius: 50%;"></div>
                <div style="width: 3px; height: 3px; background: currentColor; border-radius: 50%;"></div>
                <div style="width: 3px; height: 3px; background: currentColor; border-radius: 50%;"></div>
                <div style="width: 3px; height: 3px; background: currentColor; border-radius: 50%;"></div>
            </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
            <button id="theme-toggle" style="
                background: none;
                border: none;
                color: ${currentTheme.header.color};
                cursor: pointer;
                font-size: 16px;
                padding: 4px 8px;
                border-radius: 4px;
                opacity: 0.7;
                transition: all 0.2s;
            " title="Toggle Theme">${isDarkMode ? '☀️' : '🌙'}</button>
            <button id="minimize-chat" style="
                background: none;
                border: none;
                color: ${currentTheme.header.color};
                cursor: pointer;
                font-size: 16px;
                padding: 4px 8px;
                border-radius: 4px;
                opacity: 0.7;
                transition: all 0.2s;
            " title="Minimize">−</button>
            <button id="delete-chat" style="
                background: none;
                border: none;
                color: #ff4d4f;
                cursor: pointer;
                font-size: 14px;
                padding: 4px 8px;
                border-radius: 4px;
                opacity: 0.7;
                transition: all 0.2s;
            " title="Clear Chat">🗑️</button>
            <button id="close-chatbox" style="
                background: none;
                border: none;
                color: ${currentTheme.header.color};
                cursor: pointer;
                font-size: 18px;
                padding: 4px 8px;
                border-radius: 4px;
                opacity: 0.7;
                transition: all 0.2s;
            " title="Close">×</button>
        </div>
    </div>
    
    <div id="chat-content" style="
        height: calc(100% - 120px);
        overflow-y: auto;
        padding: 16px;
        background-color: ${currentTheme.content.background};
        scroll-behavior: smooth;
    ">
        <div id="chat-messages"></div>
        <div id="typing-indicator" style="display: none; padding: 8px 0;">
            <div style="display: flex; align-items: center; gap: 8px; color: ${isDarkMode ? '#a0a0a0' : '#666'}; font-size: 14px;">
                <div style="display: flex; gap: 2px;">
                    <div style="width: 6px; height: 6px; background: #0dcaf0; border-radius: 50%; animation: typing 1.4s infinite;"></div>
                    <div style="width: 6px; height: 6px; background: #0dcaf0; border-radius: 50%; animation: typing 1.4s infinite 0.2s;"></div>
                    <div style="width: 6px; height: 6px; background: #0dcaf0; border-radius: 50%; animation: typing 1.4s infinite 0.4s;"></div>
                </div>
                <span>AI is typing...</span>
            </div>
        </div>
    </div>
    
    <div id="chat-input" style="
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background-color: ${currentTheme.container.background};
        border-top: 1px solid rgba(13, 202, 240, 0.2);
    ">
        <input type="text" id="chat-message-input" style="
            flex: 1;
            height: 40px;
            padding: 10px 12px;
            border: ${currentTheme.input.border};
            border-radius: 20px;
            outline: none;
            font-size: 14px;
            background-color: ${currentTheme.input.background};
            color: ${currentTheme.input.color};
            transition: all 0.2s;
        " placeholder="Ask me anything about this problem..." />
        
        <button id="send-message" style="
            height: 40px;
            width: 40px;
            border-radius: 50%;
            background: ${currentTheme.sendButton.background};
            color: ${currentTheme.sendButton.color};
            border: none;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            position: relative;
            overflow: hidden;
        " title="Send message">
            <span id="send-icon">→</span>
            <div id="send-loading" style="display: none;">
                <div style="width: 16px; height: 16px; border: 2px solid ${currentTheme.sendButton.color}; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
        </button>
    </div>
</div>`;

        document.body.insertAdjacentHTML("beforeend", chatboxHTML);

        // Get all elements
        const chatbox = document.getElementById("CHAT_CONTAINER_ID");
        const chatMessages = document.getElementById("chat-messages");
        const chatMessageInput = document.getElementById("chat-message-input");
        const sendMessageButton = document.getElementById("send-message");
        const sendIcon = document.getElementById("send-icon");
        const sendLoading = document.getElementById("send-loading");
        const typingIndicator = document.getElementById("typing-indicator");
        const closeChatboxButton = document.getElementById("close-chatbox");
        const deleteChatButton = document.getElementById("delete-chat");
        const minimizeButton = document.getElementById("minimize-chat");
        const themeToggleButton = document.getElementById("theme-toggle");

        // Initialize drag and resize functionality
        initializeDragAndResize(chatbox);

        // Load previous chat history
        chatHistory.forEach(({ sender, message }) => {
            appendMessageToChat(sender, message, chatMessages);
        });

        // Theme toggle event listener
        themeToggleButton.addEventListener("click", () => {
            const currentIsDark = getCurrentTheme();
            const newIsDark = !currentIsDark;
            setCurrentTheme(newIsDark);
            applyTheme(newIsDark);
            themeToggleButton.textContent = newIsDark ? '☀️' : '🌙';
        });

        // Rest of your existing event listeners...
        closeChatboxButton.addEventListener("click", () => {
            chatbox.style.display = "none";
        });

        minimizeButton.addEventListener("click", () => {
            const content = document.getElementById("chat-content");
            const input = document.getElementById("chat-input");
            const isMinimized = content.style.display === "none";
            
            if (isMinimized) {
                content.style.display = "block";
                input.style.display = "flex";
                minimizeButton.textContent = "−";
                chatbox.style.height = `${panelRect.height}px`;
            } else {
                content.style.display = "none";
                input.style.display = "none";
                minimizeButton.textContent = "□";
                chatbox.style.height = "50px";
            }
        });

        deleteChatButton.addEventListener("click", () => {
            if (confirm("Clear chat history? This action cannot be undone.")) {
                chatMessages.innerHTML = "";
                chatHistory.length = 0;
                saveChat(problemKey, chatHistory);
            }
        });

        // Your existing sendMessage functionality...
        // This function needs to be outside or above addChatbox/sendMessage, 
// as it relies on the global scope of content.js

// The corrected sendMessage function
const sendMessage = async () => {
    const message = chatMessageInput.value.trim();
    if (!message) return;

    // Clear input
    chatMessageInput.value = "";

    // Append user message (temporarily, before sending to API)
    appendMessageToChat("You", message, chatMessages);

    // Show typing indicator
    typingIndicator.style.display = "block";
    sendMessageButton.disabled = true; // Disable button to prevent spam
    
    // UI Loading state
    sendIcon.style.display = "none";
    sendLoading.style.display = "block";

    try {
        let apiRequestPayload;

        if (isFirstCall) {
            console.log("--- FIRST CALL: Sending full context prompt ---");
            
            // 1. Gather all required context data
            const problemDetails = window.getProblemContextAndDetails();
            const currentUrl = getCurrentUrl();
            const userSolution = getSolutionFromLocalStorage(problemDetails, currentUrl);
            
            // Format hints and editorials (extracted from window listeners)
            const hintsText = Object.entries(hints).map(([key, value]) => `${key}: ${value}`).join('\n');
            const editorialText = editorialCode.map(e => `Language: ${e.language}\nCode:\n${e.code}`).join('\n\n');
            
            const previousChatText = chatHistory
                .map(msg => `${msg.sender}: ${msg.message}`)
                .join("\n");

            // 2. Generate the single, massive prompt string
            apiRequestPayload = window.generatePrompt(
                problemDetails,
                hintsText,
                editorialText,
                message, // Pass the current user message as the final question
                userSolution,
                previousChatText
            );
            
            // Save the user's message to history *after* context is used
            chatHistory.push({ sender: "You", message });
            isFirstCall = false; // Next call will be conversational

        } else {
            console.log("--- SUBSEQUENT CALL: Sending chat history ---");

            // Save the user's message to history *before* fetching AI response
            chatHistory.push({ sender: "You", message }); 
            
            // For subsequent calls, send the structured chat history array
            // NOTE: fetchAIResponse handles mapping {sender, message} to {role, parts}
            apiRequestPayload = chatHistory;
        }

        // Send to Gemini API
        const aiResponse = await fetchAIResponse(apiRequestPayload);

        // Append AI response
        appendMessageToChat("AI", aiResponse, chatMessages);
        chatHistory.push({ sender: "AI", message: aiResponse });
        saveChat(problemKey, chatHistory);

    } catch (error) {
        appendMessageToChat("AI", "⚠️ **Error:** Failed to get response. Please ensure your API key is valid and check the browser console for network details.", chatMessages, true);
        console.error("AI Response Error:", error);
    } finally {
        // Reset UI state
        typingIndicator.style.display = "none";
        sendIcon.style.display = "block";
        sendLoading.style.display = "none";
        sendMessageButton.disabled = false;
        
        // Save history (important for error cases too)
        saveChat(problemKey, chatHistory); 
    }
};

// ... event listeners for sendMessageButton and chatMessageInput below this ...

        sendMessageButton.addEventListener("click", sendMessage);
        chatMessageInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Initialize theme and responsive behavior
        initializeThemeAndResize(chatbox, panelRect);
    });
}

// Helper functions for theme management
function getCurrentTheme() {
    // Get from localStorage or default to light mode
    return localStorage.getItem('chatbox-dark-mode') === 'true';
}

function setCurrentTheme(isDarkMode) {
    localStorage.setItem('chatbox-dark-mode', isDarkMode.toString());
}

// Updated applyTheme function that works with your existing elements
function applyTheme(isDarkMode) {
    const theme = isDarkMode ? themes.dark : themes.light;
    
    const container = document.getElementById('CHAT_CONTAINER_ID');
    if (container) {
        container.style.backgroundColor = theme.container.background;
        container.style.border = theme.container.border;
    }

    const header = document.getElementById('chat-header');
    if (header) {
        header.style.background = theme.header.background;
        header.style.color = theme.header.color;
        
        const headerButtons = header.querySelectorAll('button:not(#delete-chat)');
        headerButtons.forEach(btn => {
            btn.style.color = theme.header.color;
        });
    }

    const content = document.getElementById('chat-content');
    if (content) {
        content.style.backgroundColor = theme.content.background;
    }

    const inputArea = document.getElementById('chat-input');
    if (inputArea) {
        inputArea.style.backgroundColor = theme.container.background;
    }

    const input = document.getElementById('chat-message-input');
    if (input) {
        input.style.backgroundColor = theme.input.background;
        input.style.border = theme.input.border;
        input.style.color = theme.input.color;
    }

    const sendButton = document.getElementById('send-message');
    if (sendButton) {
        sendButton.style.background = theme.sendButton.background;
        sendButton.style.color = theme.sendButton.color;
    }

    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        const typingText = typingIndicator.querySelector('span');
        if (typingText) {
            typingText.style.color = isDarkMode ? '#a0a0a0' : '#666';
        }
    }

    updateExistingMessages(isDarkMode);
}

// Function to update existing message bubbles
function updateExistingMessages(isDarkMode) {
    const theme = isDarkMode ? themes.dark : themes.light;
    const messages = document.querySelectorAll('#chat-messages .message-bubble');
    
    messages.forEach(bubble => {
        const isUserMessage = bubble.classList.contains('user-message') || 
                             bubble.parentElement.classList.contains('user-message');
        
        if (isUserMessage) {
            bubble.style.backgroundColor = theme.message.user.background;
            bubble.style.color = theme.message.user.color;
        } else {
            bubble.style.backgroundColor = theme.message.ai.background;
            bubble.style.color = theme.message.ai.color;
        }
    });
}

// Initialize drag and resize functionality
function initializeDragAndResize(chatbox) {
    // Update max dimensions based on viewport
    const updateMaxDimensions = () => {
        maxWidth = window.innerWidth * 0.8;
        maxHeight = window.innerHeight * 0.9;
        chatbox.style.maxWidth = `${maxWidth}px`;
        chatbox.style.maxHeight = `${maxHeight}px`;
    };

    updateMaxDimensions();
    window.addEventListener('resize', updateMaxDimensions);

    // Drag functionality
    const dragHandle = chatbox.querySelector('.drag-handle');
    
    dragHandle.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return; // Don't drag when clicking buttons
        
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        
        const rect = chatbox.getBoundingClientRect();
        chatboxStartX = rect.left;
        chatboxStartY = rect.top;
        
        chatbox.style.transition = 'none';
        chatbox.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.3)';
        chatbox.style.transform = 'scale(1.02)';
        
        document.body.style.userSelect = 'none';
        dragHandle.style.cursor = 'grabbing';
        
        e.preventDefault();
    });

    // Resize functionality
    const resizeHandles = chatbox.querySelectorAll('.resize-handle');
    
    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            const direction = handle.className.split(' ')[1].replace('resize-handle-', '');
            
            resizeStartX = e.clientX;
            resizeStartY = e.clientY;
            
            const rect = chatbox.getBoundingClientRect();
            chatboxStartWidth = rect.width;
            chatboxStartHeight = rect.height;
            chatboxStartX = rect.left;
            chatboxStartY = rect.top;
            
            chatbox.style.transition = 'none';
            chatbox.style.boxShadow = '0 16px 48px rgba(13, 202, 240, 0.3)';
            
            document.body.style.userSelect = 'none';
            
            // Store resize direction
            chatbox.dataset.resizeDirection = direction;
            
            e.stopPropagation();
            e.preventDefault();
        });
    });

    // Mouse move handler
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - dragStartX;
            const deltaY = e.clientY - dragStartY;
            
            let newX = chatboxStartX + deltaX;
            let newY = chatboxStartY + deltaY;
            
            // Constrain to viewport
            const rect = chatbox.getBoundingClientRect();
            newX = Math.max(0, Math.min(newX, window.innerWidth - rect.width));
            newY = Math.max(0, Math.min(newY, window.innerHeight - rect.height));
            
            chatbox.style.left = `${newX}px`;
            chatbox.style.top = `${newY}px`;
            chatbox.style.bottom = 'auto';
        }
        
        if (isResizing) {
            const direction = chatbox.dataset.resizeDirection;
            const deltaX = e.clientX - resizeStartX;
            const deltaY = e.clientY - resizeStartY;
            
            let newWidth = chatboxStartWidth;
            let newHeight = chatboxStartHeight;
            let newX = chatboxStartX;
            let newY = chatboxStartY;
            
            // Calculate new dimensions based on resize direction
            switch (direction) {
                case 'e': // East (right)
                    newWidth = chatboxStartWidth + deltaX;
                    break;
                case 'w': // West (left)
                    newWidth = chatboxStartWidth - deltaX;
                    newX = chatboxStartX + deltaX;
                    break;
                case 's': // South (bottom)
                    newHeight = chatboxStartHeight + deltaY;
                    break;
                case 'n': // North (top)
                    newHeight = chatboxStartHeight - deltaY;
                    newY = chatboxStartY + deltaY;
                    break;
                case 'se': // Southeast (bottom-right)
                    newWidth = chatboxStartWidth + deltaX;
                    newHeight = chatboxStartHeight + deltaY;
                    break;
                case 'sw': // Southwest (bottom-left)
                    newWidth = chatboxStartWidth - deltaX;
                    newHeight = chatboxStartHeight + deltaY;
                    newX = chatboxStartX + deltaX;
                    break;
                case 'ne': // Northeast (top-right)
                    newWidth = chatboxStartWidth + deltaX;
                    newHeight = chatboxStartHeight - deltaY;
                    newY = chatboxStartY + deltaY;
                    break;
                case 'nw': // Northwest (top-left)
                    newWidth = chatboxStartWidth - deltaX;
                    newHeight = chatboxStartHeight - deltaY;
                    newX = chatboxStartX + deltaX;
                    newY = chatboxStartY + deltaY;
                    break;
            }
            
            // Apply constraints
            newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
            newHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
            
            // Constrain position to viewport
            newX = Math.max(0, Math.min(newX, window.innerWidth - newWidth));
            newY = Math.max(0, Math.min(newY, window.innerHeight - newHeight));
            
            // Apply new dimensions and position
            chatbox.style.width = `${newWidth}px`;
            chatbox.style.height = `${newHeight}px`;
            
            if (['w', 'sw', 'nw'].includes(direction)) {
                chatbox.style.left = `${newX}px`;
            }
            if (['n', 'ne', 'nw'].includes(direction)) {
                chatbox.style.top = `${newY}px`;
                chatbox.style.bottom = 'auto';
            }
        }
    });

    // Mouse up handler
    document.addEventListener('mouseup', () => {
        if (isDragging || isResizing) {
            // Reset styles
            chatbox.style.transition = 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            chatbox.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
            chatbox.style.transform = 'scale(1)';
            
            document.body.style.userSelect = '';
            dragHandle.style.cursor = 'move';
            
            // Save position and size to localStorage for persistence
            const rect = chatbox.getBoundingClientRect();
            const chatboxState = {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
            };
            localStorage.setItem('chatbox_state', JSON.stringify(chatboxState));
        }
        
        isDragging = false;
        isResizing = false;
        delete chatbox.dataset.resizeDirection;
    });

    // Load saved position and size
    const savedState = localStorage.getItem('chatbox_state');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            
            // Validate saved state is within current viewport
            if (state.left >= 0 && state.left + state.width <= window.innerWidth &&
                state.top >= 0 && state.top + state.height <= window.innerHeight) {
                
                chatbox.style.left = `${state.left}px`;
                chatbox.style.top = `${state.top}px`;
                chatbox.style.width = `${state.width}px`;
                chatbox.style.height = `${state.height}px`;
                chatbox.style.bottom = 'auto';
            }
        } catch (e) {
            console.warn('Failed to restore chatbox state:', e);
        }
    }

    // Prevent text selection when interacting with resize handles
    resizeHandles.forEach(handle => {
        handle.addEventListener('selectstart', (e) => e.preventDefault());
    });
}

// Add enhanced styles for resize handles
const resizeStyles = document.createElement('style');
resizeStyles.textContent = `
.resize-handle {
    background: transparent;
    transition: background-color 0.2s ease;
}

.resize-handle:hover {
    background-color: rgba(13, 202, 240, 0.2) !important;
}

.resize-handle-se::after {
    content: '';
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-bottom: 6px solid rgba(13, 202, 240, 0.6);
}

.drag-handle:hover .drag-indicator {
    opacity: 0.8 !important;
}

.drag-handle:active {
    cursor: grabbing !important;
}

/* Visual feedback for dragging */
#CHAT_CONTAINER_ID.dragging {
    z-index: 10001 !important;
    transform: scale(1.02) !important;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3) !important;
}

/* Visual feedback for resizing */
#CHAT_CONTAINER_ID.resizing {
    z-index: 10001 !important;
    box-shadow: 0 16px 48px rgba(13, 202, 240, 0.3) !important;
}

/* Smooth transitions when not dragging/resizing */
#CHAT_CONTAINER_ID:not(.dragging):not(.resizing) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
`;
document.head.appendChild(resizeStyles);

// Helper function for theme and resize handling
function initializeThemeAndResize(chatbox, panelRect) {
    // Theme observer
    const modeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "attributes") {
                const switchButton = mutation.target;
                const isDarkMode = switchButton.getAttribute("aria-checked") === "true";
                applyTheme(isDarkMode);
            }
        });
    });

    function observeModeSwitch() {
        const modeSwitch = document.querySelector(".ant-switch[role='switch']");
        if (modeSwitch) {
            modeObserver.observe(modeSwitch, { 
                attributes: true, 
                attributeFilter: ["aria-checked", "class"] 
            });
            const isDarkMode = modeSwitch.getAttribute("aria-checked") === "true";
            applyTheme(isDarkMode);
        } else {
            setTimeout(observeModeSwitch, 1000);
        }
    }

    observeModeSwitch();

    // Resize handler
    const handleResize = () => {
        const panel = document.querySelector(".coding_responsive_sidepannel__obXtI");
        if (panel && chatbox) {
            const rect = panel.getBoundingClientRect();
            chatbox.style.left = `${rect.left}px`;
            chatbox.style.width = `${rect.width}px`;
            chatbox.style.height = `${Math.min(rect.height, 600)}px`;
        }
    };

    window.addEventListener("resize", handleResize);
    
    // Initial positioning
    setTimeout(handleResize, 100);
}

// Enhanced message append function
// Enhanced message append function with better formatting
function appendMessageToChat(sender, message, chatMessages, isError = false) {
    const messageDiv = document.createElement("div");
    messageDiv.style.cssText = `
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        align-items: ${sender === "You" ? "flex-end" : "flex-start"};
        animation: fadeIn 0.3s ease-out;
    `;

    const messageBubble = document.createElement("div");
    messageBubble.style.cssText = `
        max-width: 85%;
        padding: 16px 20px;
        border-radius: ${sender === "You" ? "20px 20px 6px 20px" : "20px 20px 20px 6px"};
        background-color: ${isError ? "#fee" : (sender === "You" ? "#a4e6ff" : "white")};
        color: ${isError ? "#c00" : "#333"};
        border: 2px solid ${isError ? "#c00" : (sender === "You" ? "#0dcaf0" : "#e0e0e0")};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        position: relative;
        word-wrap: break-word;
        line-height: 1.6;
        font-size: 14px;
    `;

    const senderName = document.createElement("div");
    senderName.style.cssText = `
        font-size: 11px;
        margin-bottom: 6px;
        color: #666;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    `;
    senderName.textContent = sender;

    // Enhanced content formatting
    if (sender === "AI") {
        messageBubble.appendChild(formatAIResponse(message));
    } else {
        messageBubble.textContent = message;
    }

    messageDiv.appendChild(senderName);
    messageDiv.appendChild(messageBubble);
    chatMessages.appendChild(messageDiv);
    
    // Smooth scroll to bottom
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// Enhanced AI response formatting function
function formatAIResponse(message) {
    const container = document.createElement("div");
    
    // Split message into sections for better formatting
    const sections = parseMessageSections(message);
    
    sections.forEach(section => {
        switch (section.type) {
            case 'heading':
                container.appendChild(createHeading(section.content, section.level));
                break;
            case 'code':
                container.appendChild(createCodeBlock(section.content, section.language));
                break;
            case 'list':
                container.appendChild(createList(section.items, section.ordered));
                break;
            case 'quote':
                container.appendChild(createQuote(section.content));
                break;
            case 'table':
                container.appendChild(createTable(section.data));
                break;
            case 'text':
                container.appendChild(createFormattedText(section.content));
                break;
            case 'divider':
                container.appendChild(createDivider());
                break;
        }
    });
    
    return container;
}

// Parse message into different sections
function parseMessageSections(message) {
    const sections = [];
    const lines = message.split('\n');
    let currentSection = { type: 'text', content: '' };
    let inCodeBlock = false;
    let codeLanguage = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Handle code blocks
        if (trimmedLine.startsWith('```')) {
            if (inCodeBlock) {
                // End of code block
                if (currentSection.content.trim()) {
                    sections.push({
                        type: 'code',
                        content: currentSection.content.trim(),
                        language: codeLanguage
                    });
                }
                inCodeBlock = false;
                currentSection = { type: 'text', content: '' };
            } else {
                // Start of code block
                if (currentSection.content.trim()) {
                    sections.push(currentSection);
                }
                inCodeBlock = true;
                codeLanguage = trimmedLine.substring(3).trim() || 'text';
                currentSection = { type: 'code', content: '' };
            }
            continue;
        }
        
        if (inCodeBlock) {
            currentSection.content += line + '\n';
            continue;
        }
        
        // Handle headings
        if (trimmedLine.match(/^#{1,6}\s/)) {
            if (currentSection.content.trim()) {
                sections.push(currentSection);
            }
            const level = trimmedLine.match(/^#+/)[0].length;
            const content = trimmedLine.replace(/^#+\s*/, '');
            sections.push({ type: 'heading', content, level });
            currentSection = { type: 'text', content: '' };
            continue;
        }
        
        // Handle horizontal rules
        if (trimmedLine.match(/^[-*_]{3,}$/)) {
            if (currentSection.content.trim()) {
                sections.push(currentSection);
            }
            sections.push({ type: 'divider' });
            currentSection = { type: 'text', content: '' };
            continue;
        }
        
        // Handle lists
        if (trimmedLine.match(/^[\*\-\+]\s/) || trimmedLine.match(/^\d+\.\s/)) {
            if (currentSection.type !== 'list') {
                if (currentSection.content.trim()) {
                    sections.push(currentSection);
                }
                currentSection = { 
                    type: 'list', 
                    items: [],
                    ordered: trimmedLine.match(/^\d+\./)
                };
            }
            const content = trimmedLine.replace(/^[\*\-\+\d+\.]\s*/, '');
            currentSection.items.push(content);
            continue;
        }
        
        // Handle quotes
        if (trimmedLine.startsWith('>')) {
            if (currentSection.type !== 'quote') {
                if (currentSection.content.trim()) {
                    sections.push(currentSection);
                }
                currentSection = { type: 'quote', content: '' };
            }
            currentSection.content += trimmedLine.substring(1).trim() + '\n';
            continue;
        }
        
        // Handle regular text
        if (currentSection.type !== 'text') {
            if (currentSection.content.trim() || (currentSection.items && currentSection.items.length > 0)) {
                sections.push(currentSection);
            }
            currentSection = { type: 'text', content: '' };
        }
        
        currentSection.content += line + '\n';
    }
    
    // Add the last section
    if (currentSection.content.trim() || (currentSection.items && currentSection.items.length > 0)) {
        sections.push(currentSection);
    }
    
    return sections;
}

// Create heading element
function createHeading(content, level) {
    const heading = document.createElement(`h${Math.min(level, 6)}`);
    heading.style.cssText = `
        margin: ${level === 1 ? '20px 0 15px 0' : '15px 0 10px 0'};
        font-weight: ${level <= 2 ? '700' : '600'};
        font-size: ${20 - (level - 1) * 2}px;
        color: #0dcaf0;
        border-bottom: ${level <= 2 ? '2px solid #0dcaf0' : 'none'};
        padding-bottom: ${level <= 2 ? '5px' : '0'};
        line-height: 1.3;
    `;
    heading.textContent = content;
    return heading;
}

// Create enhanced code block
function createCodeBlock(content, language = 'text') {
    const codeContainer = document.createElement("div");
    codeContainer.style.cssText = `
        position: relative;
        margin: 12px 0;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    `;
    
    // Language label
    const languageLabel = document.createElement("div");
    languageLabel.style.cssText = `
        background: #0dcaf0;
        color: white;
        padding: 6px 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    languageLabel.innerHTML = `<span>${language}</span>`;
    
    const codeBlock = document.createElement("pre");
    codeBlock.style.cssText = `
        margin: 0;
        background: #1e1e1e;
        padding: 20px;
        font-family: 'Fira Code', 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
        font-size: 13px;
        color: #d4d4d4;
        overflow-x: auto;
        line-height: 1.5;
        white-space: pre-wrap;
        word-wrap: break-word;
    `;
    
    // Apply syntax highlighting for common languages
    codeBlock.innerHTML = applySyntaxHighlighting(content, language);

    const copyButton = document.createElement("button");
    copyButton.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.2s;
        backdrop-filter: blur(10px);
    `;
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(content.trim()).then(() => {
            copyButton.textContent = "Copied!";
            copyButton.style.background = "#00ff88";
            setTimeout(() => {
                copyButton.textContent = "Copy";
                copyButton.style.background = "rgba(255, 255, 255, 0.1)";
            }, 2000);
        });
    });
    
    languageLabel.appendChild(copyButton);
    codeContainer.appendChild(languageLabel);
    codeContainer.appendChild(codeBlock);
    
    return codeContainer;
}

// Basic syntax highlighting
function applySyntaxHighlighting(code, language) {
    if (!language || language === 'text') return escapeHtml(code);
    
    let highlighted = escapeHtml(code);
    
    // Basic highlighting for common languages
    switch (language.toLowerCase()) {
        case 'javascript':
        case 'js':
            highlighted = highlighted
                .replace(/\b(function|const|let|var|if|else|for|while|return|class|extends|import|export|from|default)\b/g, '<span style="color: #569cd6;">$1</span>')
                .replace(/\b(true|false|null|undefined)\b/g, '<span style="color: #4fc1ff;">$1</span>')
                .replace(/(\/\/.*$)/gm, '<span style="color: #6a9955;">$1</span>')
                .replace(/(".*?"|'.*?'|`.*?`)/g, '<span style="color: #ce9178;">$1</span>');
            break;
        case 'python':
        case 'py':
            highlighted = highlighted
                .replace(/\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda)\b/g, '<span style="color: #569cd6;">$1</span>')
                .replace(/\b(True|False|None)\b/g, '<span style="color: #4fc1ff;">$1</span>')
                .replace(/(#.*$)/gm, '<span style="color: #6a9955;">$1</span>')
                .replace(/(".*?"|'.*?')/g, '<span style="color: #ce9178;">$1</span>');
            break;
        case 'java':
            highlighted = highlighted
                .replace(/\b(public|private|protected|static|final|class|interface|extends|implements|if|else|for|while|return|new|this|super)\b/g, '<span style="color: #569cd6;">$1</span>')
                .replace(/\b(true|false|null)\b/g, '<span style="color: #4fc1ff;">$1</span>')
                .replace(/(\/\/.*$)/gm, '<span style="color: #6a9955;">$1</span>')
                .replace(/(".*?")/g, '<span style="color: #ce9178;">$1</span>');
            break;
        case 'cpp':
        case 'c++':
            highlighted = highlighted
                .replace(/\b(int|char|float|double|bool|void|if|else|for|while|return|class|public|private|protected|virtual|static|const)\b/g, '<span style="color: #569cd6;">$1</span>')
                .replace(/\b(true|false|NULL|nullptr)\b/g, '<span style="color: #4fc1ff;">$1</span>')
                .replace(/(\/\/.*$)/gm, '<span style="color: #6a9955;">$1</span>')
                .replace(/(".*?")/g, '<span style="color: #ce9178;">$1</span>');
            break;
    }
    
    return highlighted;
}

// Create formatted list
function createList(items, ordered = false) {
    const list = document.createElement(ordered ? "ol" : "ul");
    list.style.cssText = `
        margin: 12px 0;
        padding-left: 24px;
        line-height: 1.6;
    `;
    
    items.forEach(item => {
        const listItem = document.createElement("li");
        listItem.style.cssText = `
            margin-bottom: 6px;
            color: #333;
        `;
        listItem.innerHTML = formatInlineElements(item);
        list.appendChild(listItem);
    });
    
    return list;
}

// Create quote block
function createQuote(content) {
    const quote = document.createElement("blockquote");
    quote.style.cssText = `
        margin: 16px 0;
        padding: 12px 20px;
        border-left: 4px solid #0dcaf0;
        background: rgba(13, 202, 240, 0.05);
        border-radius: 0 8px 8px 0;
        font-style: italic;
        color: #555;
        position: relative;
    `;
    quote.innerHTML = formatInlineElements(content.trim());
    return quote;
}

// Create table (basic implementation)
function createTable(data) {
    // This is a placeholder for table creation
    // You can implement table parsing if needed
    const table = document.createElement("div");
    table.style.cssText = `
        margin: 16px 0;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
    `;
    table.textContent = "Table formatting not yet implemented";
    return table;
}

// Create divider
function createDivider() {
    const divider = document.createElement("hr");
    divider.style.cssText = `
        margin: 20px 0;
        border: none;
        height: 2px;
        background: linear-gradient(90deg, transparent, #0dcaf0, transparent);
        border-radius: 1px;
    `;
    return divider;
}

// Create formatted text with inline elements
function createFormattedText(content) {
    const textContainer = document.createElement("div");
    textContainer.style.cssText = `
        line-height: 1.6;
        margin-bottom: 8px;
    `;
    
    // Handle paragraphs
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    paragraphs.forEach((paragraph, index) => {
        if (paragraph.trim()) {
            const p = document.createElement("p");
            p.style.cssText = `
                margin: ${index === 0 ? '0' : '12px'} 0 0 0;
                color: #333;
            `;
            p.innerHTML = formatInlineElements(paragraph.trim());
            textContainer.appendChild(p);
        }
    });
    
    return textContainer;
}

// Format inline elements (bold, italic, code, links)
function formatInlineElements(text) {
    return text
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #0dcaf0;">$1</strong>')
        // Italic text
        .replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #555;">$1</em>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code style="background: #f1f3f4; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: #d63384; border: 1px solid #e0e0e0;">$1</code>')
        // Simple links (basic implementation)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #0dcaf0; text-decoration: none; border-bottom: 1px solid #0dcaf0;" target="_blank">$1</a>')
        // Line breaks
        .replace(/\n/g, '<br>');
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add this CSS for better styling
const enhancedStyle = document.createElement('style');
enhancedStyle.textContent = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.ai-message-content {
    overflow-wrap: break-word;
    word-wrap: break-word;
    hyphens: auto;
}

.ai-message-content pre {
    white-space: pre-wrap;
    word-wrap: break-word;
}

.ai-message-content code {
    white-space: pre-wrap;
}

/* Smooth transitions for interactive elements */
.ai-message-content button {
    transition: all 0.2s ease;
}

.ai-message-content button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
`;
document.head.appendChild(enhancedStyle);

// Add fadeIn animation
const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(style);