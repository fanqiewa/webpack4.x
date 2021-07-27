
"use strict";
const ConstDependency = require("./dependencies/ConstDependency");
const NullFactory = require("./NullFactory");
const ParserHelpers = require("./ParserHelpers");

class ConstPlugin {
  apply(compiler) {
    // 注入hook - ConstPlugin
    compiler.hooks.compilation.tap(
      "ConstPlugin",
      (compilation, { normalModuleFactory }) => {
				compilation.dependencyFactories.set(ConstDependency, new NullFactory());
				compilation.dependencyTemplates.set(
					ConstDependency,
					new ConstDependency.Template()
				);

				const handler = parser => {
					parser.hooks.statementIf.tap("ConstPlugin", statement => {
						// TODO
					});
					parser.hooks.expressionConditionalOperator.tap(
						"ConstPlugin",
						expression => {
							// TODO
						}
					);
					parser.hooks.expressionLogicalOperator.tap(
						"ConstPlugin",
						expression => {
							// TODO
						}
					);
					parser.hooks.evaluateIdentifier
						.for("__resourceQuery")
						.tap("ConstPlugin", expr => {
							// TODO
						});
					parser.hooks.expression
						.for("__resourceQuery")
						.tap("ConstPlugin", () => {
							// TODO
						});
				};


				normalModuleFactory.hooks.parser
					.for("javascript/auto")
					.tap("ConstPlugin", handler);
				normalModuleFactory.hooks.parser
					.for("javascript/dynamic")
					.tap("ConstPlugin", handler);
				normalModuleFactory.hooks.parser
					.for("javascript/esm")
					.tap("ConstPlugin", handler);
      }
    )
  }
}

module.exports = ConstPlugin;