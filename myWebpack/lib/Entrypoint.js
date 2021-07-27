
"use strict";

const ChunkGroup = require("./ChunkGroup");

class Entrypoint extends ChunkGroup {
	constructor(name) {
		super(name);
		this.runtimeChunk = undefined;
	}

  // 是否可以初始化
  isInitial() {
    return true;
  }

  // 设置正在运行的chunk
  setRuntimeChunk(chunk) {
    this.runtimeChunk = chunk;
  }
}
module.exports = Entrypoint;