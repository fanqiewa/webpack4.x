/**
 * 兼容性插件
 */
"use strict";

const ConstDependency = require("./dependencies/ConstDependency");

const NullFactory = require("./NullFactory");

class CompatibilityPlugin {
  apply(compiler) {
    // 注入hook - CompatibilityPlugin
    compiler.hooks.compilation.tap(
      "CompatibilityPlugin",
      (compilation, { normalModuleFactory }) => {
				compilation.dependencyFactories.set(ConstDependency, new NullFactory());
				compilation.dependencyTemplates.set(
					ConstDependency,
					new ConstDependency.Template()
				);

				normalModuleFactory.hooks.parser
					.for("javascript/auto")
					.tap("CompatibilityPlugin", (parser, parserOptions) => {
            if (
              parserOptions.broserify !== undefined &&
              !parserOptions.browserify
            )
              return;
            
            parser.hooks.call
              .for("require")
              .tap("CompatibilityPlugin", expr => {
                // TODO
              })
					});
      }
    )
  }
}
module.exports = CompatibilityPlugin;