
"use strict";

const Template = require("./Template");


module.exports = class RuntimeTemplate {
	constructor(outputOptions, requestShortener) {
		this.outputOptions = outputOptions || {};
		this.requestShortener = requestShortener;
	}
}