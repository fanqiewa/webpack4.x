
"use strict";

const AbstractMethodError = require("../AbstractMethodError");

const BULK_SIZE = 1000;

class Hash {
	
}
exports.Hash = Hash;
class BulkUpdateDecorator extends Hash {
  
	constructor(hash) {
		super();
		this.hash = hash;
		this.buffer = "";
	}
  update(data, inputEncoding) {
		if (
			inputEncoding !== undefined ||
			typeof data !== "string" ||
			data.length > BULK_SIZE
		) {
			// TODO
		} else {
			this.buffer += data;
			if (this.buffer.length > BULK_SIZE) {
				this.hash.update(this.buffer);
				this.buffer = "";
			}
		}
		return this;
	}
	// 摘要认证
	digest(encoding) {
		if (this.buffer.length > 0) {
			this.hash.update(this.buffer);
		}
		var digestResult = this.hash.digest(encoding);
		return typeof digestResult === "string"
			? digestResult
			: digestResult.toString();
	}
}

module.exports = algorithm => {
	if (typeof algorithm === "function") {
		return new BulkUpdateDecorator(new algorithm());
	}
	switch (algorithm) {
		case "debug":
			return new DebugHash();
		default:
			// crypto模块的目的是为了提供通用的加密和哈希算法
			return new BulkUpdateDecorator(require("crypto").createHash(algorithm));
	}
};