public class Main {
    private static PlayfairCipherServer server;
    
    public static void main(String[] args) {
        try {
            server = new PlayfairCipherServer();
            server.start();
            
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("\nShutting down server...");
                if (server != null) {
                    server.stop();
                }
            }));
            
            System.out.println("\nPress Ctrl+C to stop the server...");
            
        } catch (Exception e) {
            System.err.println("Error starting server: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
