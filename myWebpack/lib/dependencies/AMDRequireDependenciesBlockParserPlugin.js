
"use strict";

const AMDRequireItemDependency = require("./AMDRequireItemDependency");
const AMDRequireArrayDependency = require("./AMDRequireArrayDependency");
const AMDRequireContextDependency = require("./AMDRequireContextDependency");
const AMDRequireDependenciesBlock = require("./AMDRequireDependenciesBlock");
const UnsupportedDependency = require("./UnsupportedDependency");
const LocalModuleDependency = require("./LocalModuleDependency");
const ContextDependencyHelpers = require("./ContextDependencyHelpers");
const LocalModulesHelpers = require("./LocalModulesHelpers");
const ConstDependency = require("./ConstDependency");
const getFunctionExpression = require("./getFunctionExpression");
const UnsupportedFeatureWarning = require("../UnsupportedFeatureWarning");

class AMDRequireDependenciesBlockParserPlugin {
	constructor(options) {
		this.options = options;
	}

	processFunctionArgument(parser, expression) {
    // TODO
	}

	apply(parser) {
		parser.hooks.call
			.for("require")
			.tap(
				"AMDRequireDependenciesBlockParserPlugin",
				this.processCallRequire.bind(this, parser)
			);
	}

	processArray(parser, expr, param) {
    // TODO
	}
	processItem(parser, expr, param) {
    // TODO
	}
	processContext(parser, expr, param) {
    // TODO
	}

	processArrayForRequestString(param) {
    // TODO
	}

	processItemForRequestString(param) {
    // TODO
	}

	processCallRequire(parser, expr) {
    // TODO
	}

	newRequireDependenciesBlock(
		expr,
		arrayRange,
		functionRange,
		errorCallbackRange,
		module,
		loc,
		request
	) {
    // TODO
	}
	newRequireItemDependency(request, range) {
    // TODO
	}
	newRequireArrayDependency(depsArray, range) {
    // TODO
	}
}
module.exports = AMDRequireDependenciesBlockParserPlugin;
