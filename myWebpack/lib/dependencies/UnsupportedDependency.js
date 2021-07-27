
"use strict";
const NullDependency = require("./NullDependency");
const webpackMissingModule = require("./WebpackMissingModule").module;

class UnsupportedDependency extends NullDependency {
	// TODO
}

UnsupportedDependency.Template = class UnsupportedDependencyTemplate {
	// TODO
};

module.exports = UnsupportedDependency;
