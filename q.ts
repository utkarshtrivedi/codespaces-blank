class Queue<T> {
    private items: T[] = [];

    // Adds an item to the back of the queue
    public enqueue(item: T): void {
        this.items.push(item);
    }

    // Removes and returns the item at the front of the queue
    public dequeue(): T | undefined {
        return this.items.shift();
    }

    // Returns the item at the front of the queue without removing it
    public peek(): T | undefined {
        return this.items[0];
    }

    // Checks if the queue is empty
    public isEmpty(): boolean {
        return this.items.length === 0;
    }

    // Returns the number of items in the queue
    public size(): number {
        return this.items.length;
    }

    // Clears all items from the queue
    public clear(): void {
        this.items = [];
    }

    // Returns the items in the queue as an array
    public toArray(): T[] {
        return [...this.items];
    }
}

// Usage example:
const queue = new Queue<number>();

queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);

console.log(queue.dequeue()); // Outputs: 1
console.log(queue.peek());    // Outputs: 2
console.log(queue.isEmpty()); // Outputs: false
console.log(queue.size());    // Outputs: 2

queue.clear();
console.log(queue.isEmpty()); // Outputs: true