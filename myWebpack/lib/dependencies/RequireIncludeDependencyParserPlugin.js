
"use strict";

const RequireIncludeDependency = require("./RequireIncludeDependency");

module.exports = class RequireIncludeDependencyParserPlugin {
	apply(parser) {
		parser.hooks.call
			.for("require.include")
			.tap("RequireIncludeDependencyParserPlugin", expr => {
        // TODO
			});
	}
};
