// Use relative URL so it works both locally and when deployed
const API_BASE_URL = '/api';

const keyInput = document.getElementById('keyInput');
const messageInput = document.getElementById('messageInput');
const resultOutput = document.getElementById('resultOutput');
const keySquareDisplay = document.getElementById('keySquareDisplay');
const statusText = document.getElementById('statusText');
const statusBar = document.getElementById('statusBar');

const encryptBtn = document.getElementById('encryptBtn');
const decryptBtn = document.getElementById('decryptBtn');
const clearBtn = document.getElementById('clearBtn');
const generateKeyBtn = document.getElementById('generateKeyBtn');

encryptBtn.addEventListener('click', handleEncrypt);
decryptBtn.addEventListener('click', handleDecrypt);
clearBtn.addEventListener('click', handleClear);
generateKeyBtn.addEventListener('click', handleGenerateKeySquare);

keyInput.addEventListener('input', debounce(() => {
    if (keyInput.value.trim()) {
        handleGenerateKeySquare();
    }
}, 500));

async function callAPI(endpoint, data) {
    try {
        const params = new URLSearchParams(data);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function encryptText(key, text) {
    return await callAPI('/encrypt', { key, text });
}

async function decryptText(key, text) {
    return await callAPI('/decrypt', { key, text });
}

async function generateKeySquare(key) {
    return await callAPI('/key-square', { key });
}

async function handleEncrypt() {
    const key = keyInput.value.trim();
    const message = messageInput.value.trim();

    if (!key) {
        showStatus('Please enter an encryption key!', 'error');
        keyInput.focus();
        return;
    }

    if (!message) {
        showStatus('Please enter a message to encrypt!', 'error');
        messageInput.focus();
        return;
    }

    setLoading(true);

    try {
        const response = await encryptText(key, message);
        
        if (response.success) {
            resultOutput.value = response.result;
            showStatus('Message encrypted successfully!', 'success');
            handleGenerateKeySquare();
        } else {
            throw new Error(response.error || 'Encryption failed');
        }
    } catch (error) {
        showStatus(`Encryption error: ${error.message}`, 'error');
        resultOutput.value = '';
    } finally {
        setLoading(false);
    }
}

async function handleDecrypt() {
    const key = keyInput.value.trim();
    const message = resultOutput.value.trim() || messageInput.value.trim();

    if (!key) {
        showStatus('Please enter an encryption key!', 'error');
        keyInput.focus();
        return;
    }

    if (!message) {
        showStatus('Please enter a ciphertext to decrypt!', 'error');
        messageInput.focus();
        return;
    }

    setLoading(true);

    try {
        const response = await decryptText(key, message);
        
        if (response.success) {
            resultOutput.value = response.result;
            showStatus('Message decrypted successfully!', 'success');
            handleGenerateKeySquare();
        } else {
            throw new Error(response.error || 'Decryption failed');
        }
    } catch (error) {
        showStatus(`Decryption error: ${error.message}`, 'error');
        resultOutput.value = '';
    } finally {
        setLoading(false);
    }
}

async function handleGenerateKeySquare() {
    const key = keyInput.value.trim();

    if (!key) {
        keySquareDisplay.innerHTML = '<p class="placeholder-text">Enter a key to generate</p>';
        return;
    }

    try {
        const response = await generateKeySquare(key);
        
        if (response.success && response.keySquare) {
            displayKeySquare(response.keySquare);
        } else {
            throw new Error(response.error || 'Failed to generate key square');
        }
    } catch (error) {
        keySquareDisplay.innerHTML = `<p class="placeholder-text">Error: ${error.message}</p>`;
        console.error('Key square error:', error);
    }
}

function displayKeySquare(keySquareArray) {
    if (!keySquareArray || keySquareArray.length !== 5) {
        keySquareDisplay.innerHTML = '<p class="placeholder-text">Invalid key square</p>';
        return;
    }

    keySquareDisplay.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('div');
            cell.className = 'key-cell';
            cell.textContent = keySquareArray[i][j] || '';
            keySquareDisplay.appendChild(cell);
        }
    }
}

function handleClear() {
    keyInput.value = '';
    messageInput.value = '';
    resultOutput.value = '';
    keySquareDisplay.innerHTML = '<p class="placeholder-text">Enter a key to generate</p>';
    showStatus('All fields cleared', 'success');
}

function showStatus(message, type = '') {
    statusText.textContent = message;
    statusBar.className = 'status-bar';
    
    if (type === 'success') {
        statusBar.classList.add('success');
    } else if (type === 'error') {
        statusBar.classList.add('error');
    }
    
    setTimeout(() => {
        if (statusText.textContent === message) {
            statusText.textContent = 'Ready';
            statusBar.className = 'status-bar';
        }
    }, 5000);
}

function setLoading(loading) {
    if (loading) {
        document.body.classList.add('loading');
        encryptBtn.disabled = true;
        decryptBtn.disabled = true;
        showStatus('Processing...', '');
    } else {
        document.body.classList.remove('loading');
        encryptBtn.disabled = false;
        decryptBtn.disabled = false;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

console.log('Playfair Cipher Application loaded');
showStatus('Ready - Enter a key and message to begin');
