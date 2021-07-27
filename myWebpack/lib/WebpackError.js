/**
 * webpack错误
 */
"use strict";

const inspect = require("util").inspect.custom;

class WebpackError extends Error /* JS自带的错误类 */ {
  constructor(message) {
    super(message);

    this.details = undefined;
		this.missing = undefined;
		this.origin = undefined;
		this.dependencies = undefined;
		this.module = undefined;

    // Error.captureStackTrace(targetObject[, constructorOpt])
    // 在targetObject中添加一个.stack属性。对该属性进行访问时，将以字符串的形式返回Error.captureStackTrace()语句被调用时的代码位置信息(即：调用栈历史)。
		Error.captureStackTrace(this, this.constructor);
  }

	[inspect]() {
		return this.stack + (this.details ? `\n${this.details}` : "");
	}
}

module.exports = WebpackError;