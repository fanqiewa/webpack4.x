/**
 * 文件输入流
 */
"use strict";

const fs = require("graceful-fs");

class NodeJsInputFileSystem {
  readdir(path, callback) {
    // TODO
  }

  readdirSync(path) {
    // TODO
  }
}

const fsMethods = [
	"stat",
	"statSync",
	"readFile",
	"readFileSync",
	"readlink",
	"readlinkSync"
];

for (const key of fsMethods) {
	Object.defineProperty(NodeJsInputFileSystem.prototype, key, {
		configurable: true,
		writable: true,
		value: fs[key].bind(fs)
	});
}
module.exports = NodeJsInputFileSystem;