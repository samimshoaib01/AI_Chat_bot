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
    console.log(match);
    console.log("key genereation");

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

    console.log("API Request URL:", url);
    console.log("API Response:", response);

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
                console.log("Hints:");
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
    const navContainer = document.querySelector(
        '.coding_nav_bg__HRkIn > ul.d-flex.flex-row.p-0.gap-2.justify-content-between.m-0.hide-scrollbar'
    );

    if (navContainer) {
        const listItem = document.createElement("li");
        listItem.className = "d-flex flex-row rounded-3 dmsans align-items-center coding_list__V_ZOZ coding_card_mod_unactive__O_IEq";
        listItem.style.padding = "0.36rem 1rem";

        listItem.innerHTML = `
            <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" class="me-1" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548-.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            <span class="coding_ask_doubt_gradient_text__FX_hZ">Ask AI</span>
        `;

        listItem.addEventListener("click", () => {
            const chatbox = document.getElementById("CHAT_CONTAINER_ID");
            if (chatbox) {
                chatbox.style.display = chatbox.style.display === "block" ? "none" : "block";
            } else {
                console.log("Chatbox not found.");
            }
        });

        navContainer.appendChild(listItem);

        // Ensure the chatbox functionality is initialized
        addChatbox();
    } else {
        console.log("Navigation container not found.");
    }
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
    const apiKey = "AIzaSyCZeiZWq2Pkmg1FiEpKbfoiBzlbTnMFkHM"; // Replace with your actual API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
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
    const language = extractLanguage(jsonObject);

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


// All chat content stored here


function addChatbox() {
    const problemKey = getProblemKey();

    loadChat(problemKey).then((chatHistory) => {
        const chatboxHTML = `
            <div id="CHAT_CONTAINER_ID" style="
                display: none;
                position: fixed;
                bottom: 15px;
                left: 73px;
                width: calc(50% - 47px);
                background-color:${themes.light.container.background};
                border: ${themes.light.container.border};
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                overflow: hidden;
                transition: all 0.3s ease;
            ">
                <div id="chat-header" style="
                    background:${themes.light.header.background};
                    color: ${themes.light.header.color};
                    padding: 6px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <span style="font-weight: 600; font-size: 16px;">Coding Assistant</span>
                    <button id="close-chatbox" style="
                        background: none;
                        border: none;
                        color: #333;
                        cursor: pointer;
                        font-size: 18px;
                        padding: 5px;
                        opacity: 0.8;
                        transition: opacity 0.2s;
                    ">×</button>
                </div>
                <div id="chat-content" style="
                    height:  508px;
                    overflow-y: auto;
                    padding: 16px;
                    background-color:${themes.light.content.background};
                ">
                    <div id="chat-messages"></div>
                </div>
                <div id="chat-input" style="
                    padding: 12px;
                    background-color: ${themes.light.input.background};
                    display: flex;
                    gap: 8px;
                ">
                    <input type="text" id="chat-message-input" style="
                        flex: 1;
                        padding: 10px;
                        border:  ${themes.light.input.border};
                        border-radius: 8px;
                        outline: none;
                        font-size: 14px;
                        transition: border-color 0.2s;
                        background-color: ${themes.light.input.background};
                        color: ${themes.light.input.color};
                    " placeholder="Type your message...">
                    <button id="send-message" style="
                        background: ${themes.light.sendButton.background};
                        color: ${themes.light.sendButton.color};
                        border: none;
                        border-radius: 8px;
                        padding: 10px 20px;
                        cursor: pointer;
                        font-weight: 500;
                        transition: all 0.2s;
                    ">Send</button>
                </div>
            </div>
        `
           
        ;
        document.body.insertAdjacentHTML("beforeend", chatboxHTML);

               // Initialize theme observer
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
                    // Apply initial theme
                    const isDarkMode = modeSwitch.getAttribute("aria-checked") === "true";
                    applyTheme(isDarkMode);
                } else {
                    setTimeout(observeModeSwitch, 1000);
                }
            }
    
            observeModeSwitch();

        const chatbox = document.getElementById("CHAT_CONTAINER_ID");
        const chatHeader = document.getElementById("chat-header");
        const chatContent = document.getElementById("chat-content");
        const chatInput = document.getElementById("chat-input");
        const chatMessages = document.getElementById("chat-messages");
        const closeChatboxButton = document.getElementById("close-chatbox");
        const sendMessageButton = document.getElementById("send-message");
        const chatMessageInput = document.getElementById("chat-message-input");


        // Add hover effects
        closeChatboxButton.addEventListener("mouseover", () => closeChatboxButton.style.opacity = "1");
        closeChatboxButton.addEventListener("mouseout", () => closeChatboxButton.style.opacity = "0.8");
        sendMessageButton.addEventListener("mouseover", () => {
            sendMessageButton.style.background = "#0dcaf0";
            sendMessageButton.style.color = "white";
        });
        sendMessageButton.addEventListener("mouseout", () => {
            sendMessageButton.style.background = "#a4e6ff";
            sendMessageButton.style.color = "#333";
        });
        
        // Focus effect for input
        chatMessageInput.addEventListener("focus", () => {
            chatMessageInput.style.borderColor = "#0dcaf0";
            chatMessageInput.style.boxShadow = "0 0 0 3px rgba(13, 202, 240, 0.2)";
        });
        chatMessageInput.addEventListener("blur", () => {
            chatMessageInput.style.borderColor = "#0dcaf0";
            chatMessageInput.style.boxShadow = "none";
        });

        // Load previous chat history into chatbox
        chatHistory.forEach(({ sender, message }) => {
            appendMessageToChat(sender, message, chatMessages);
        });

        closeChatboxButton.addEventListener("click", () => {
            chatbox.style.display = "none";
        });

        // Enter key support
        chatMessageInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                sendMessageButton.click();
            }
        });

        sendMessageButton.addEventListener("click", async () => {
            const userMessage = chatMessageInput.value.trim();
            if (userMessage !== "") {
                appendMessageToChat("You", userMessage, chatMessages);
        
                chatMessageInput.value = "";
                chatMessages.scrollTop = chatMessages.scrollHeight;
        
                // Save user's message
                chatHistory.push({ sender: "You", message: userMessage });
                saveChat(problemKey, chatHistory);
        
                try {
                    
                        
                        await printChatHistory();
 
                        const currentUrl = getCurrentUrl();
                        const problemDetails = window.getProblemContextAndDetails();

                        const userSolution = getSolutionFromLocalStorage(problemDetails, currentUrl);
                    
                        const editorialText = editorialCode.length > 0
                            ? `Editorial Code: ${editorialCode.map(entry => `${entry.language}: ${entry.code}`).join("\n")}`
                            : "No editorial code available.";
                    
                        const hintsText = Object.keys(hints).length > 0
                            ? `Hints: ${Object.entries(hints).map(([key, value]) => `${key}: ${value}`).join("\n")}`
                            : "No hints available.";

                        console.log("problem deatils :",problemDetails);

                    
                        let abc = window.generatePrompt(problemDetails, hintsText, editorialText, userMessage, userSolution);
                        console.log(abc)
                        async function merge(abc, globalChatHistoryContent) {
                            const mergedText = `${globalChatHistoryContent}\n\n${abc}`; // Use backticks for string interpolation
                            return mergedText; // Return the combined text
                        }
                        
                        let apiRequestPayload = await merge(abc, globalChatHistoryContent); // Await the result of merge
                        console.log("apple"); // This will be logged after merge() finishes
                        

                      
        
                    console.log("API Request Payload:", apiRequestPayload);
        
                    // Now we pass apiRequestPayload correctly to fetchAIResponse
                    const aiResponse = await fetchAIResponse(apiRequestPayload);
                    appendMessageToChat("AI", aiResponse, chatMessages);
        
                    // Save AI's message
                    chatHistory.push({ sender: "AI", message: aiResponse });
                    saveChat(problemKey, chatHistory);
        
                } catch (error) {
                    appendMessageToChat("AI", "An error occurred. Please try again.", chatMessages);
                    console.error("Failed to fetch AI response:", error);
                }
            }
        });
        
        
        
    });

    function appendMessageToChat(sender, message, chatMessages, isError = false) {
        const messageDiv = document.createElement("div");
        messageDiv.style.marginBottom = "16px";
        messageDiv.style.display = "flex";
        messageDiv.style.flexDirection = "column";
        messageDiv.style.alignItems = sender === "You" ? "flex-end" : "flex-start";

        const messageBubble = document.createElement("div");
        messageBubble.style.maxWidth = "80%";
        messageBubble.style.padding = "12px 16px";
        messageBubble.style.borderRadius = sender === "You" ? "18px 18px 4px 18px" : "18px 18px 18px 4px";
        messageBubble.style.backgroundColor = sender === "You" ? "#a4e6ff" : "white";
        messageBubble.style.color = "#333";
        messageBubble.style.border = `2px solid ${sender === "You" ? "#0dcaf0" : "#e0e0e0"}`;

        const senderName = document.createElement("div");
        senderName.style.fontSize = "12px";
        senderName.style.marginBottom = "4px";
        senderName.style.color = "#666";
        senderName.textContent = sender;

        if (message.includes("```")) {
            const codeBlock = extractCodeBlock(message);
            messageBubble.innerHTML = `
                <div style="
                    background: #1e1e1e;
                    border-radius: 8px;
                    padding: 12px;
                    margin-top: 8px;
                    position: relative;
                    border: 2px solid #0dcaf0;
                ">
                    <pre style="
                        margin: 0;
                        font-family: 'Fira Code', monospace;
                        font-size: 13px;
                        color: #d4d4d4;
                        overflow-x: auto;
                    ">${codeBlock}</pre>
                    <button style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        background: #0dcaf0;
                        color: white;
                        border: none;
                        padding: 4px 8px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        transition: background 0.2s;
                    " onclick="copyToClipboard(\`${escapeHtml(codeBlock)}\`)">Copy</button>
                </div>
            `;
        } else {
            messageBubble.textContent = message;
            if (isError) {
                messageBubble.style.backgroundColor = "#fee";
                messageBubble.style.color = "#c00";
                messageBubble.style.border = "2px solid #c00";
            }
        }

        messageDiv.appendChild(senderName);
        messageDiv.appendChild(messageBubble);
        chatMessages.appendChild(messageDiv);
    }

    function extractCodeBlock(message) {
        const codeMatch = message.match(/```([\s\S]*?)```/);
        return codeMatch ? codeMatch[1] : message;
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    window.copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert("Code copied to clipboard!");
        }).catch((err) => {
            console.error("Failed to copy text:", err);
        });
    };
}