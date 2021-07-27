
"use strict";

const { ConcatSource } = require("webpack-sources");
const Template = require("./Template");

class FunctionModuleTemplatePlugin {
	apply(moduleTemplate) {
		moduleTemplate.hooks.render.tap(
			"FunctionModuleTemplatePlugin",
			(moduleSource, module) => {
        // TODO
			}
		);

		moduleTemplate.hooks.package.tap(
			"FunctionModuleTemplatePlugin",
			(moduleSource, module) => {
        // TODO
			}
		);

		moduleTemplate.hooks.hash.tap("FunctionModuleTemplatePlugin", hash => {
      // TODO
		});
	}
}
module.exports = FunctionModuleTemplatePlugin;
