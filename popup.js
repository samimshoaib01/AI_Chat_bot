document.addEventListener('DOMContentLoaded', function () {
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('saveButton');
    const statusDiv = document.getElementById('status');

    // Load the existing key from local storage
    chrome.storage.local.get('geminiApiKey', (data) => {
        if (data.geminiApiKey) {
            apiKeyInput.value = data.geminiApiKey;
            statusDiv.textContent = 'API Key loaded.';
            statusDiv.style.backgroundColor = '#e6f7ff';
            statusDiv.style.color = '#0dcaf0';
        } else {
             statusDiv.textContent = 'No API Key set. The assistant will be disabled.';
             statusDiv.style.backgroundColor = '#ffebe6';
             statusDiv.style.color = '#ff4d4f';
        }
    });

    // Save the new key
    saveButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey || apiKey.length < 30) {
            statusDiv.textContent = 'Please enter a valid API key.';
            statusDiv.style.backgroundColor = '#ffebe6';
            statusDiv.style.color = '#ff4d4f';
            return;
        }

        // Save key to Chrome's local storage
        chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
            statusDiv.textContent = 'API Key saved successfully! Reload the problem page.';
            statusDiv.style.backgroundColor = '#e6fff1';
            statusDiv.style.color = '#00c48c';
            
            // Optionally close the popup after a brief delay
            setTimeout(() => {
                window.close();
            }, 2500);
        });
    });
});