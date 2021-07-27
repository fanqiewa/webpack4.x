
"use strict";

const AMDRequireItemDependency = require("./AMDRequireItemDependency");
const AMDRequireContextDependency = require("./AMDRequireContextDependency");
const ConstDependency = require("./ConstDependency");
const AMDDefineDependency = require("./AMDDefineDependency");
const AMDRequireArrayDependency = require("./AMDRequireArrayDependency");
const LocalModuleDependency = require("./LocalModuleDependency");
const ContextDependencyHelpers = require("./ContextDependencyHelpers");
const LocalModulesHelpers = require("./LocalModulesHelpers");

const isBoundFunctionExpression = expr => {
  // TODO
};

const isUnboundFunctionExpression = expr => {
  // TODO
};

const isCallable = expr => {
  // TODO
};

class AMDDefineDependencyParserPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(parser) {
		parser.hooks.call
			.for("define")
			.tap(
				"AMDDefineDependencyParserPlugin",
				this.processCallDefine.bind(this, parser)
			);
	}

	processArray(parser, expr, param, identifiers, namedModule) {
    // TODO
	}
	processContext(parser, expr, param) {
    // TODO
	}

	newDefineDependency(
		range,
		arrayRange,
		functionRange,
		objectRange,
		namedModule
	) {
    // TODO
	}
	newRequireArrayDependency(depsArray, range) {
    // TODO
	}
	newRequireItemDependency(request, range) {
    // TODO
	}
}
module.exports = AMDDefineDependencyParserPlugin;
