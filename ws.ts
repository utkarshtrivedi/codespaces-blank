class WebSocketManager {
    private socket: WebSocket | null = null;
    private connectionPromise: Promise<WebSocket> | null = null;
    private isAuthenticated: boolean = false;
    private retryCount: number = 0;
    private readonly maxRetries: number = 5;

    public ensureConnection(url: string, loginMessage: string): Promise<WebSocket> {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = new Promise((resolve, reject) => {
            const attemptConnection = () => {
                this.socket = new WebSocket(url);

                this.socket.onopen = () => {
                    this.retryCount = 0; // Reset retry count on successful connection
                    this.socket?.send(loginMessage);
                };

                this.socket.onerror = (err) => {
                    this.retryCount++;
                    if (this.retryCount < this.maxRetries) {
                        console.log(`Retrying connection (${this.retryCount}/${this.maxRetries})...`);
                        setTimeout(attemptConnection, 1000); // Retry the connection after 1 second
                    } else {
                        reject(new Error(`Failed to connect after ${this.maxRetries} attempts`));
                        this.connectionPromise = null; // Clear the promise on error
                        this.retryCount = 0; // Reset retry count after max retries reached
                    }
                };

                this.socket.onmessage = (event) => {
                    if (event.data === "login:complete") {
                        this.isAuthenticated = true;
                        resolve(this.socket as WebSocket);
                        this.connectionPromise = null; // Clear the promise once resolved
                    }
                };

                this.socket.onclose = () => {
                    this.socket = null;
                    this.isAuthenticated = false;
                };
            };

            attemptConnection();
        });

        return this.connectionPromise;
    }

    public sendMessage(message: string): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.error('WebSocket is not connected or open');
        }
    }
}