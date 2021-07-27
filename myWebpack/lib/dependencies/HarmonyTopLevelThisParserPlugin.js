
"use strict";

const ConstDependency = require("./ConstDependency");

class HarmonyTopLevelThisParserPlugin {
	apply(parser) {
		parser.hooks.expression
			.for("this")
			.tap("HarmonyTopLevelThisParserPlugin", node => {
        // TODO
			});
	}
}

module.exports = HarmonyTopLevelThisParserPlugin;
