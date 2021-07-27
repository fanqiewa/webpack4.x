"use strict";

// 堆栈
class Queue {
  constructor(items) {
    this.set = new Set(items);
    this.iterator = this.set[Symbol.iterator]();
  }

  get length() {
    return this.set.size;
  }

  // 入栈
  enqueue(item) {
    this.set.add(item);
  }

  // 出栈
  dequeue() {
    const result = this.iterator.next();
    if (result.done) return undefined;
    this.set.delete(result.value);
    return result.value;
  }
}

module.exports = Queue;