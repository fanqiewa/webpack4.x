
"use strict";

const CommonJsRequireDependency = require("./CommonJsRequireDependency");
const CommonJsRequireContextDependency = require("./CommonJsRequireContextDependency");
const RequireHeaderDependency = require("./RequireHeaderDependency");
const LocalModuleDependency = require("./LocalModuleDependency");
const ContextDependencyHelpers = require("./ContextDependencyHelpers");
const LocalModulesHelpers = require("./LocalModulesHelpers");
const ParserHelpers = require("../ParserHelpers");

class CommonJsRequireDependencyParserPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(parser) {
		const options = this.options;

		const processItem = (expr, param) => {
      // TODO
		};
		const processContext = (expr, param) => {
      // TODO
		};

		parser.hooks.expression
			.for("require.cache")
			.tap(
				"CommonJsRequireDependencyParserPlugin",
				ParserHelpers.toConstantDependencyWithWebpackRequire(
					parser,
					"__webpack_require__.c"
				)
			);
		parser.hooks.expression
			.for("require")
			.tap("CommonJsRequireDependencyParserPlugin", expr => {
        // TODO
			});

		const createHandler = callNew => expr => {
      // TODO
		};
		parser.hooks.call
			.for("require")
			.tap("CommonJsRequireDependencyParserPlugin", createHandler(false));
		parser.hooks.new
			.for("require")
			.tap("CommonJsRequireDependencyParserPlugin", createHandler(true));
		parser.hooks.call
			.for("module.require")
			.tap("CommonJsRequireDependencyParserPlugin", createHandler(false));
		parser.hooks.new
			.for("module.require")
			.tap("CommonJsRequireDependencyParserPlugin", createHandler(true));
	}
}
module.exports = CommonJsRequireDependencyParserPlugin;
