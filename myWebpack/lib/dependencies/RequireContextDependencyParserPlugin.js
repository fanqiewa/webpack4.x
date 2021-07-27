
"use strict";

const RequireContextDependency = require("./RequireContextDependency");

module.exports = class RequireContextDependencyParserPlugin {
	apply(parser) {
		parser.hooks.call
			.for("require.context")
			.tap("RequireContextDependencyParserPlugin", expr => {
        // TODO
			});
	}
};
