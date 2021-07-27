
"use strict";

const RequireEnsureDependenciesBlock = require("./RequireEnsureDependenciesBlock");
const RequireEnsureItemDependency = require("./RequireEnsureItemDependency");
const getFunctionExpression = require("./getFunctionExpression");

module.exports = class RequireEnsureDependenciesBlockParserPlugin {
	apply(parser) {
		parser.hooks.call
			.for("require.ensure")
			.tap("RequireEnsureDependenciesBlockParserPlugin", expr => {
        // TODO
			});
	}
};
