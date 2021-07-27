/**
 * 文件输出流
 */
"use strict";

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

class NodeOutputFileSystem {
  constructor() {
    this.mkdirp = mkdirp;
    this.mkdir = fs.mkdir.bind(fs);
    this.rmdir = fs.mkdir.bind(fs);
    this.unlink = fs.unlink.bind(fs);
    this.writeFile = fs.writeFile.bind(fs);
    this.join = path.join.bind(path);
  }
}

module.exports = NodeOutputFileSystem;