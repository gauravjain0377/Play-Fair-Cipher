import java.util.*;

public class PlayfairCipher {
    private char[][] keySquare;
    private static final int SIZE = 5;
    
    public PlayfairCipher(String key) {
        this.keySquare = generateKeySquare(key);
    }
    
    private char[][] generateKeySquare(String key) {
        char[][] square = new char[SIZE][SIZE];
        String keyUpper = key.toUpperCase().replaceAll("[^A-Z]", "");
        keyUpper = keyUpper.replace('J', 'I');
        
        Set<Character> used = new LinkedHashSet<>();
        
        for (char c : keyUpper.toCharArray()) {
            if (!used.contains(c)) {
                used.add(c);
            }
        }
        
        for (char c = 'A'; c <= 'Z'; c++) {
            if (c != 'J' && !used.contains(c)) {
                used.add(c);
            }
        }
        
        Iterator<Character> iterator = used.iterator();
        for (int i = 0; i < SIZE; i++) {
            for (int j = 0; j < SIZE; j++) {
                if (iterator.hasNext()) {
                    square[i][j] = iterator.next();
                }
            }
        }
        
        return square;
    }
    
    private boolean getPosition(char c, int[] row, int[] col) {
        if (c == 'J') c = 'I';
        
        for (int i = 0; i < SIZE; i++) {
            for (int j = 0; j < SIZE; j++) {
                if (keySquare[i][j] == c) {
                    row[0] = i;
                    col[0] = j;
                    return true;
                }
            }
        }
        return false;
    }
    
    private String prepareText(String text) {
        String prepared = text.toUpperCase().replaceAll("[^A-Z]", "");
        prepared = prepared.replace('J', 'I');
        
        StringBuilder result = new StringBuilder();
        int i = 0;
        while (i < prepared.length()) {
            char first = prepared.charAt(i);
            
            if (i + 1 < prepared.length()) {
                char second = prepared.charAt(i + 1);
                
                if (first == second) {
                    result.append(first).append('X');
                    i++;
                } else {
                    result.append(first).append(second);
                    i += 2;
                }
            } else {
                result.append(first).append('Z');
                i++;
            }
        }
        
        return result.toString();
    }
    
    public String encrypt(String plaintext) {
        String text = prepareText(plaintext);
        StringBuilder ciphertext = new StringBuilder();
        
        int[] row1 = new int[1];
        int[] col1 = new int[1];
        int[] row2 = new int[1];
        int[] col2 = new int[1];
        
        for (int i = 0; i < text.length(); i += 2) {
            char first = text.charAt(i);
            char second = text.charAt(i + 1);
            
            if (getPosition(first, row1, col1) && getPosition(second, row2, col2)) {
                if (row1[0] == row2[0]) {
                    ciphertext.append(keySquare[row1[0]][(col1[0] + 1) % SIZE]);
                    ciphertext.append(keySquare[row2[0]][(col2[0] + 1) % SIZE]);
                }
                else if (col1[0] == col2[0]) {
                    ciphertext.append(keySquare[(row1[0] + 1) % SIZE][col1[0]]);
                    ciphertext.append(keySquare[(row2[0] + 1) % SIZE][col2[0]]);
                }
                else {
                    ciphertext.append(keySquare[row1[0]][col2[0]]);
                    ciphertext.append(keySquare[row2[0]][col1[0]]);
                }
            }
        }
        
        return ciphertext.toString();
    }
    
    public String decrypt(String ciphertext) {
        String text = ciphertext.toUpperCase().replaceAll("[^A-Z]", "");
        text = text.replace('J', 'I');
        
        if (text.length() % 2 != 0) {
            text += 'Z';
        }
        
        StringBuilder plaintext = new StringBuilder();
        
        int[] row1 = new int[1];
        int[] col1 = new int[1];
        int[] row2 = new int[1];
        int[] col2 = new int[1];
        
        for (int i = 0; i < text.length(); i += 2) {
            char first = text.charAt(i);
            char second = text.charAt(i + 1);
            
            if (getPosition(first, row1, col1) && getPosition(second, row2, col2)) {
                if (row1[0] == row2[0]) {
                    plaintext.append(keySquare[row1[0]][(col1[0] + SIZE - 1) % SIZE]);
                    plaintext.append(keySquare[row2[0]][(col2[0] + SIZE - 1) % SIZE]);
                }
                else if (col1[0] == col2[0]) {
                    plaintext.append(keySquare[(row1[0] + SIZE - 1) % SIZE][col1[0]]);
                    plaintext.append(keySquare[(row2[0] + SIZE - 1) % SIZE][col2[0]]);
                }
                else {
                    plaintext.append(keySquare[row1[0]][col2[0]]);
                    plaintext.append(keySquare[row2[0]][col1[0]]);
                }
            }
        }
        
        return plaintext.toString();
    }
    
    public String getKeySquareString() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < SIZE; i++) {
            for (int j = 0; j < SIZE; j++) {
                sb.append(keySquare[i][j]).append(" ");
            }
            sb.append("\n");
        }
        return sb.toString();
    }
}
