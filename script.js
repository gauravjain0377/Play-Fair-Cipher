// Playfair Cipher - Pure JavaScript Implementation (No Server Required)

const SIZE = 5;

// DOM Elements
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

// Event Listeners
encryptBtn.addEventListener('click', handleEncrypt);
decryptBtn.addEventListener('click', handleDecrypt);
clearBtn.addEventListener('click', handleClear);
generateKeyBtn.addEventListener('click', handleGenerateKeySquare);

keyInput.addEventListener('input', debounce(() => {
    if (keyInput.value.trim()) {
        handleGenerateKeySquare();
    } else {
        keySquareDisplay.innerHTML = '<p class="placeholder-text">Enter a key to generate</p>';
    }
}, 300));

// ==================== PLAYFAIR CIPHER LOGIC ====================

function generateKeySquare(key) {
    const square = [];
    let keyUpper = key.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    
    const used = new Set();
    const chars = [];
    
    // Add key characters first
    for (const c of keyUpper) {
        if (!used.has(c)) {
            used.add(c);
            chars.push(c);
        }
    }
    
    // Add remaining alphabet (excluding J)
    for (let c = 65; c <= 90; c++) { // A-Z
        const char = String.fromCharCode(c);
        if (char !== 'J' && !used.has(char)) {
            used.add(char);
            chars.push(char);
        }
    }
    
    // Build 5x5 square
    for (let i = 0; i < SIZE; i++) {
        square[i] = [];
        for (let j = 0; j < SIZE; j++) {
            square[i][j] = chars[i * SIZE + j];
        }
    }
    
    return square;
}

function getPosition(keySquare, char) {
    const c = char === 'J' ? 'I' : char;
    
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (keySquare[i][j] === c) {
                return { row: i, col: j };
            }
        }
    }
    return null;
}

function prepareText(text) {
    let prepared = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    
    let result = '';
    let i = 0;
    
    while (i < prepared.length) {
        const first = prepared[i];
        
        if (i + 1 < prepared.length) {
            const second = prepared[i + 1];
            
            if (first === second) {
                result += first + 'X';
                i++;
            } else {
                result += first + second;
                i += 2;
            }
        } else {
            result += first + 'Z';
            i++;
        }
    }
    
    return result;
}

function encrypt(keySquare, plaintext) {
    const text = prepareText(plaintext);
    let ciphertext = '';
    
    for (let i = 0; i < text.length; i += 2) {
        const first = text[i];
        const second = text[i + 1];
        
        const pos1 = getPosition(keySquare, first);
        const pos2 = getPosition(keySquare, second);
        
        if (pos1 && pos2) {
            if (pos1.row === pos2.row) {
                // Same row: shift right
                ciphertext += keySquare[pos1.row][(pos1.col + 1) % SIZE];
                ciphertext += keySquare[pos2.row][(pos2.col + 1) % SIZE];
            } else if (pos1.col === pos2.col) {
                // Same column: shift down
                ciphertext += keySquare[(pos1.row + 1) % SIZE][pos1.col];
                ciphertext += keySquare[(pos2.row + 1) % SIZE][pos2.col];
            } else {
                // Rectangle: swap columns
                ciphertext += keySquare[pos1.row][pos2.col];
                ciphertext += keySquare[pos2.row][pos1.col];
            }
        }
    }
    
    return ciphertext;
}

function decrypt(keySquare, ciphertext) {
    let text = ciphertext.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    
    // Ensure even length
    if (text.length % 2 !== 0) {
        text += 'Z';
    }
    
    let plaintext = '';
    
    for (let i = 0; i < text.length; i += 2) {
        const first = text[i];
        const second = text[i + 1];
        
        const pos1 = getPosition(keySquare, first);
        const pos2 = getPosition(keySquare, second);
        
        if (pos1 && pos2) {
            if (pos1.row === pos2.row) {
                // Same row: shift left
                ciphertext += keySquare[pos1.row][(pos1.col + SIZE - 1) % SIZE];
                plaintext += keySquare[pos1.row][(pos1.col + SIZE - 1) % SIZE];
                plaintext += keySquare[pos2.row][(pos2.col + SIZE - 1) % SIZE];
            } else if (pos1.col === pos2.col) {
                // Same column: shift up
                plaintext += keySquare[(pos1.row + SIZE - 1) % SIZE][pos1.col];
                plaintext += keySquare[(pos2.row + SIZE - 1) % SIZE][pos2.col];
            } else {
                // Rectangle: swap columns
                plaintext += keySquare[pos1.row][pos2.col];
                plaintext += keySquare[pos2.row][pos1.col];
            }
        }
    }
    
    return plaintext;
}

// ==================== UI HANDLERS ====================

function handleEncrypt() {
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

    try {
        const keySquare = generateKeySquare(key);
        const result = encrypt(keySquare, message);
        resultOutput.value = result;
        showStatus('Message encrypted successfully!', 'success');
        displayKeySquare(keySquare);
    } catch (error) {
        showStatus(`Encryption error: ${error.message}`, 'error');
        resultOutput.value = '';
    }
}

function handleDecrypt() {
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

    try {
        const keySquare = generateKeySquare(key);
        const result = decrypt(keySquare, message);
        resultOutput.value = result;
        showStatus('Message decrypted successfully!', 'success');
        displayKeySquare(keySquare);
    } catch (error) {
        showStatus(`Decryption error: ${error.message}`, 'error');
        resultOutput.value = '';
    }
}

function handleGenerateKeySquare() {
    const key = keyInput.value.trim();

    if (!key) {
        keySquareDisplay.innerHTML = '<p class="placeholder-text">Enter a key to generate</p>';
        return;
    }

    try {
        const keySquare = generateKeySquare(key);
        displayKeySquare(keySquare);
        showStatus('Key square generated!', 'success');
    } catch (error) {
        keySquareDisplay.innerHTML = `<p class="placeholder-text">Error: ${error.message}</p>`;
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

// Initialize
console.log('Playfair Cipher Application loaded (Client-side only)');
showStatus('Ready - Enter a key and message to begin');
