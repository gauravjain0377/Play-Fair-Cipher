# Playfair Cipher - Encryption & Decryption Tool

A modern web application for encrypting and decrypting messages using the Playfair cipher algorithm. Features a clean, professional UI built with HTML, CSS, and JavaScript, backed by a Java HTTP server.

## Features

- **Encryption & Decryption**: Encrypt and decrypt messages using the Playfair cipher
- **Key Square Visualization**: Visual 5x5 key square display based on your encryption key
- **Real-time Updates**: Key square updates automatically as you type
- **Modern UI**: Clean, minimalist design optimized for desktop use
- **RESTful API**: Backend API for encryption/decryption operations


## How to Run

1. **Compile the Java files**:
   ```bash
   javac *.java
   ```

2. **Start the server**:
   ```bash
   java Main
   ```

3. **Open your browser** and navigate to:
   ```
   http://localhost:8080
   ```

4. **Stop the server**: Press `Ctrl+C` in the terminal

## How to Use

1. **Enter an encryption key** (e.g., "MONARCHY") in the key input field
2. **View the generated key square** on the left panel
3. **Type your message** in the message textarea
4. **Click "Encrypt"** to encrypt your message or **"Decrypt"** to decrypt ciphertext
5. **View the result** in the result textarea
6. **Click "Clear"** to reset all fields

## API Endpoints

- `POST /api/encrypt` - Encrypt a message
- `POST /api/decrypt` - Decrypt ciphertext
- `POST /api/key-square` - Generate key square

## Technical Details

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Java HTTP Server (com.sun.net.httpserver)
- **Algorithm**: Playfair Cipher (5x5 key square, digraph substitution)

## Project Structure

```
├── index.html          # Main HTML file
├── style.css           # Stylesheet
├── script.js           # Frontend JavaScript
├── Main.java           # Application entry point
├── PlayfairCipher.java # Cipher algorithm implementation
└── PlayfairCipherServer.java # HTTP server and API handlers
```

## License

This project is provided as-is for educational purposes.
