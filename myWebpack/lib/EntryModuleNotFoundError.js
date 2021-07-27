/**
 * 找不到入口文件错误
 */

"use strict";

const WebpackError = require("./WebpackError");

class EntryModuleNotFoundError extends WebpackError {
  constructor(err) {
    super("Entry module not found: " + err);
    
    this.name = "EntryModuleNotFoundError";
    this.details = err.details;
    this.error = err;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = EntryModuleNotFoundError;