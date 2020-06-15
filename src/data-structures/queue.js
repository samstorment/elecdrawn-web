import LinkedList from './linked-list.js';

export default class Queue {

    constructor() {
        this.queue = new LinkedList();
    }

    push(data) {
        this.queue.insertBack(data);
    }

    pop() {
        let poppedItem = this.queue.getFront();
        this.queue.deleteFront();
        return poppedItem;
    }

    length() {
        return this.queue.length;
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    print() {
        this.queue.printList();
    }
}