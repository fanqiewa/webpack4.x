/**
 * 监听文件流
 */
"use strict";
// 用于目录和文件监视的包装库。
const Watchpack = require("watchpack");
const objectToMap = require("../util/objectToMap");

class NodeWatchFileSystem {
  constructor(inputFileSystem) {
    this.inputFileSystem = inputFileSystem;
    this.watcherOptions = {
      aggregateTimeout: 0
    };
    this.watcher = new Watchpack(this.watcherOptions);
  }
}

module.exports = NodeWatchFileSystem;