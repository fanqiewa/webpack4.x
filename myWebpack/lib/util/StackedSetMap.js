
"use strict";

const util = require("util");

const TOMBSTONE = {};
const UNDEFINED_MARKER = {};

// 堆栈类
class StackedSetMap {
	constructor(parentStack) {
		this.stack = parentStack === undefined ? [] : parentStack.slice();
		this.map = new Map();
		this.stack.push(this.map);
	}

	add(item) {
		this.map.set(item, true);
	}

	set(item, value) {
		this.map.set(item, value === undefined ? UNDEFINED_MARKER : value);
	}

	delete(item) {
		if (this.stack.length > 1) {
			this.map.set(item, TOMBSTONE);
		} else {
			this.map.delete(item);
		}
	}
	
	has(item) {
		const topValue = this.map.get(item);
		if (topValue !== undefined) return topValue !== TOMBSTONE;
		if (this.stack.length > 1) {
			for (var i = this.stack.length - 2; i >= 0; i--) {
				const value = this.stack[i].get(item);
				if (value !== undefined) {
					this.map.set(item, value);
					return value !== TOMBSTONE;
				}
			}
			this.map.set(item, TOMBSTONE);
		}
		return false;
	}

	// 创建子节点
	createChild() {
		return new StackedSetMap(this.stack);
	}

	get size() {
		this._compress();
		return this.map.size;
	}
	
	_compress() {
		if (this.stack.length === 1) return;
		this.map = new Map();
		for (const data of this.stack) {
			for (const pair of data) {
				if (pair[1] === TOMBSTONE) {
					this.map.delete(pair[0]);
				} else {
					this.map.set(pair[0], pair[1]);
				}
			}
		}
		this.stack = [this.map];
	}
}