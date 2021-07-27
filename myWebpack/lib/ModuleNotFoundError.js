/**
 * 找不到模块错误
 */
"use strict";

const WebpackError = require("./WebpackError");

class ModuleNotFoundError extends WebpackError {
	constructor(module, err) {
		super("Module not found: " + err);

		this.name = "ModuleNotFoundError";
		this.details = err.details;
		this.missing = err.missing;
		this.module = module;
		this.error = err;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = ModuleNotFoundError;
