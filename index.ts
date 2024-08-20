class SubscriptionDigester {
    private arrayToMerge: any[] = [];
    private mergedArray: any[] = [];
    private intervalId: NodeJS.Timeout | null = null;
    private isMerging: boolean = false;
    private webSocketManager: WebSocketManager;
    private wsUrl: string;
    private loginMessage: string;

    constructor(webSocketManager: WebSocketManager, wsUrl: string, loginMessage: string) {
        this.webSocketManager = webSocketManager;
        this.wsUrl = wsUrl;
        this.loginMessage = loginMessage;
    }

    public addItemAndStartDigestion(item: any): void {
        this.arrayToMerge.push(item);

        if (this.intervalId) {
            return; // Interval is already running, do nothing
        }

        // Start the interval if it's not already running
        this.startInterval();
    }

    private startInterval(): void {
        this.intervalId = setInterval(() => {
            this.performMergeAndSend();

            if (this.arrayToMerge.length === 0 && this.mergedArray.length === 0 && !this.isMerging) {
                // Stop the interval if there's nothing left to merge and send
                this.stopInterval();
            }
        }, 1000);
    }

    private stopInterval(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private performMergeAndSend(): void {
        if (this.isMerging) {
            return; // Avoid overlapping merge and send operations
        }

        this.isMerging = true;

        this.performMerge();

        this.webSocketManager.ensureConnection(this.wsUrl, this.loginMessage)
            .then(() => {
                this.performSend();
            })
            .catch(err => {
                console.error('Failed to connect to WebSocket:', err);
            })
            .finally(() => {
                this.isMerging = false;
            });
    }

    private performMerge(): void {
        if (this.arrayToMerge.length === 0) {
            return; // No items to merge
        }

        console.log('Performing merge operation...');
        this.mergedArray.push(...this.arrayToMerge);
        this.arrayToMerge.length = 0; // Clear the arrayToMerge after merging
    }

    private performSend(): void {
        if (this.mergedArray.length === 0) {
            return; // No items to send
        }

        console.log('Performing send operation with merged array:', this.mergedArray);

        // Send each item in the merged array over the WebSocket connection
        this.mergedArray.forEach(item => {
            const message = JSON.stringify(item);
            this.webSocketManager.sendMessage(message);
        });

        // Clear the merged array after sending
        this.mergedArray.length = 0;
    }
}