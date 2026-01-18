import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public class PlayfairCipherServer {
    private static final int PORT = 8080;
    private HttpServer server;
    
    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(PORT), 0);
        
        server.createContext("/", new StaticFileHandler());
        
        server.createContext("/api/encrypt", new EncryptHandler());
        
        server.createContext("/api/decrypt", new EncryptHandler());
        
        server.createContext("/api/key-square", new KeySquareHandler());
        
        server.setExecutor(null);
        server.start();
        
        System.out.println("=========================================");
        System.out.println("Playfair Cipher Server is running!");
        System.out.println("Open your browser and visit:");
        System.out.println("http://localhost:" + PORT);
        System.out.println("=========================================");
    }
    
    public void stop() {
        if (server != null) {
            server.stop(0);
        }
    }
    
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String requestPath = exchange.getRequestURI().getPath();
            
            if (requestPath.equals("/")) {
                requestPath = "/index.html";
            }
            
            String filePath = requestPath.substring(1);
            
            if (filePath.contains("..")) {
                sendResponse(exchange, 403, "text/plain", "Forbidden");
                return;
            }
            
            Path path = Paths.get(filePath);
            
            if (Files.exists(path) && Files.isRegularFile(path)) {
                byte[] fileBytes = Files.readAllBytes(path);
                String contentType = getContentType(filePath);
                sendResponse(exchange, 200, contentType, new String(fileBytes));
            } else {
                sendResponse(exchange, 404, "text/html", 
                    "<html><body><h1>404 - File Not Found</h1></body></html>");
            }
        }
        
        private String getContentType(String filePath) {
            if (filePath.endsWith(".html")) return "text/html";
            if (filePath.endsWith(".css")) return "text/css";
            if (filePath.endsWith(".js")) return "application/javascript";
            if (filePath.endsWith(".json")) return "application/json";
            return "text/plain";
        }
    }
    
    static class EncryptHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equals(exchange.getRequestMethod())) {
                sendJSONResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
                return;
            }
            
            String requestBody = readRequestBody(exchange);
            Map<String, String> params = parseQueryParams(requestBody);
            
            String key = params.get("key");
            String text = params.get("text");
            String operation = exchange.getRequestURI().getPath().contains("encrypt") ? "encrypt" : "decrypt";
            
            if (key == null || key.trim().isEmpty()) {
                sendJSONResponse(exchange, 400, "{\"error\":\"Key is required\"}");
                return;
            }
            
            if (text == null || text.trim().isEmpty()) {
                sendJSONResponse(exchange, 400, "{\"error\":\"Text is required\"}");
                return;
            }
            
            try {
                PlayfairCipher cipher = new PlayfairCipher(key);
                String result;
                
                if ("encrypt".equals(operation)) {
                    result = cipher.encrypt(text);
                } else {
                    result = cipher.decrypt(text);
                }
                
                sendJSONResponse(exchange, 200, 
                    "{\"success\":true,\"result\":\"" + escapeJSON(result) + "\"}");
            } catch (Exception e) {
                sendJSONResponse(exchange, 500, 
                    "{\"error\":\"" + escapeJSON(e.getMessage()) + "\"}");
            }
        }
    }
    
    static class KeySquareHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equals(exchange.getRequestMethod())) {
                sendJSONResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
                return;
            }
            
            String requestBody = readRequestBody(exchange);
            Map<String, String> params = parseQueryParams(requestBody);
            
            String key = params.get("key");
            
            if (key == null || key.trim().isEmpty()) {
                sendJSONResponse(exchange, 400, "{\"error\":\"Key is required\"}");
                return;
            }
            
            try {
                PlayfairCipher cipher = new PlayfairCipher(key);
                String keySquare = cipher.getKeySquareString();
                
                String[][] keySquareArray = new String[5][5];
                String[] lines = keySquare.trim().split("\n");
                for (int i = 0; i < lines.length && i < 5; i++) {
                    String[] chars = lines[i].trim().split("\\s+");
                    for (int j = 0; j < chars.length && j < 5; j++) {
                        keySquareArray[i][j] = chars[j];
                    }
                }
                
                StringBuilder json = new StringBuilder("{\"success\":true,\"keySquare\":[");
                for (int i = 0; i < 5; i++) {
                    json.append("[");
                    for (int j = 0; j < 5; j++) {
                        json.append("\"").append(keySquareArray[i][j] != null ? keySquareArray[i][j] : "").append("\"");
                        if (j < 4) json.append(",");
                    }
                    json.append("]");
                    if (i < 4) json.append(",");
                }
                json.append("]}");
                
                sendJSONResponse(exchange, 200, json.toString());
            } catch (Exception e) {
                sendJSONResponse(exchange, 500, 
                    "{\"error\":\"" + escapeJSON(e.getMessage()) + "\"}");
            }
        }
    }
    
    private static String readRequestBody(HttpExchange exchange) throws IOException {
        InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), "utf-8");
        BufferedReader br = new BufferedReader(isr);
        StringBuilder body = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) {
            body.append(line);
        }
        return body.toString();
    }
    
    private static Map<String, String> parseQueryParams(String body) {
        Map<String, String> params = new HashMap<>();
        
        if (body.trim().startsWith("{")) {
            body = body.replaceAll("[{}\"]", "");
            String[] pairs = body.split(",");
            for (String pair : pairs) {
                String[] keyValue = pair.split(":");
                if (keyValue.length == 2) {
                    params.put(keyValue[0].trim(), keyValue[1].trim());
                }
            }
        } else {
            String[] pairs = body.split("&");
            for (String pair : pairs) {
                String[] keyValue = pair.split("=");
                if (keyValue.length == 2) {
                    try {
                        params.put(keyValue[0], java.net.URLDecoder.decode(keyValue[1], "UTF-8"));
                    } catch (UnsupportedEncodingException e) {
                        params.put(keyValue[0], keyValue[1]);
                    }
                }
            }
        }
        
        return params;
    }

    private static void sendResponse(HttpExchange exchange, int statusCode, 
                                    String contentType, String response) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.sendResponseHeaders(statusCode, response.getBytes().length);
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }

    private static void sendJSONResponse(HttpExchange exchange, int statusCode, 
                                        String jsonResponse) throws IOException {
        sendResponse(exchange, statusCode, "application/json", jsonResponse);
    }

    private static String escapeJSON(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
}
