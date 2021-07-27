
"use strict";

const RequireResolveDependency = require("./RequireResolveDependency");
const RequireResolveContextDependency = require("./RequireResolveContextDependency");
const RequireResolveHeaderDependency = require("./RequireResolveHeaderDependency");
const ContextDependencyHelpers = require("./ContextDependencyHelpers");

class RequireResolveDependencyParserPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(parser) {
		const options = this.options;

		const process = (expr, weak) => {
      // TODO
		};
		const processItem = (expr, param, weak) => {
      // TODO
		};
		const processContext = (expr, param, weak) => {
      // TODO
		};

		parser.hooks.call
			.for("require.resolve")
			.tap("RequireResolveDependencyParserPlugin", expr => {
        // TODO
			});
		parser.hooks.call
			.for("require.resolveWeak")
			.tap("RequireResolveDependencyParserPlugin", expr => {
        // TODO
			});
	}
}
module.exports = RequireResolveDependencyParserPlugin;
