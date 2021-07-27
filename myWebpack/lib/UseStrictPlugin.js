/**
 * 严格模式插件
 */
"use strict";

const ConstDependency = require("./dependencies/ConstDependency");

class UseStrictPlugin {
  apply(compiler) {
    // 注入hook - UseStrictPlugin
    compiler.hooks.compilation.tap(
      "UseStrictPlugin",
      (compilation, { normalModuleFactory }) => {
				const handler = parser => {
					parser.hooks.program.tap("UseStrictPlugin", ast => {
						const firstNode = ast.body[0];
						if (
							firstNode &&
							firstNode.type === "ExpressionStatement" &&
							firstNode.expression.type === "Literal" &&
							firstNode.expression.value === "use strict"
						) {
							// TODO
						}
					});
				};

				normalModuleFactory.hooks.parser
					.for("javascript/auto")
					.tap("UseStrictPlugin", handler);
				normalModuleFactory.hooks.parser
					.for("javascript/dynamic")
					.tap("UseStrictPlugin", handler);
				normalModuleFactory.hooks.parser
					.for("javascript/esm")
					.tap("UseStrictPlugin", handler);
      }
    )
  }
}

module.exports = UseStrictPlugin;
