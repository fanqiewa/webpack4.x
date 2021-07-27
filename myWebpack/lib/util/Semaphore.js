/**
 * 信号量
 */
"use strict";

class Semaphore {
	constructor(available) {
		this.available = available; // 默认100
		this.waiters = [];
		this._continue = this._continue.bind(this);
	}

	// 获取信号量
	acquire(callback) {
		// 如果信号量大于0，则信号量减少1，并触发回调函数
		if (this.available > 0) {
			this.available--;
			callback();
		} else {
			// 如果信号量小于0，则将回调函数添加到监听队列中，等候执行
			this.waiters.push(callback);
		}
	}
	// 添加信号量
	release() {
		this.available++;
		if (this.waiters.length > 0) {
			process.nextTick(this._continue);
		}
	}
	// 触发等候中的回调函数
	_continue() {
		if (this.available > 0) {
			if (this.waiters.length > 0) {
				this.available--;
				const callback = this.waiters.pop();
				callback();
			}
		}
	}
}