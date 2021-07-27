
"use strict";

const path = require("path");
const ParserHelpers = require("./ParserHelpers");

class CommonJsStuffPlugin {
  apply(compiler) {
    // 注入hook - CommonJsStuffPlugin
    compiler.hooks.compilation.tap(
      "CommonJsStuffPlugin",
      (compilation, { normalModuleFactory }) => {
				const handler = (parser, parserOptions) => {
					parser.hooks.expression
						.for("require.main.require")
						.tap(
							"CommonJsStuffPlugin",
							ParserHelpers.expressionIsUnsupported(
								parser,
								"require.main.require is not supported by webpack."
							)
						);
					parser.hooks.expression
						.for("module.parent.require")
						.tap(
							"CommonJsStuffPlugin",
							ParserHelpers.expressionIsUnsupported(
								parser,
								"module.parent.require is not supported by webpack."
							)
						);
					parser.hooks.expression
						.for("require.main")
						.tap(
							"CommonJsStuffPlugin",
							ParserHelpers.toConstantDependencyWithWebpackRequire(
								parser,
								"__webpack_require__.c[__webpack_require__.s]"
							)
						);
					parser.hooks.expression
						.for("module.loaded")
						.tap("CommonJsStuffPlugin", expr => {
              // TODO
						});
					parser.hooks.expression
						.for("module.id")
						.tap("CommonJsStuffPlugin", expr => {
              // TODO
						});
					parser.hooks.expression
						.for("module.exports")
						.tap("CommonJsStuffPlugin", () => {
              // TODO
						});
					parser.hooks.evaluateIdentifier
						.for("module.hot")
						.tap(
							"CommonJsStuffPlugin",
							ParserHelpers.evaluateToIdentifier("module.hot", false)
						);
					parser.hooks.expression
						.for("module")
						.tap("CommonJsStuffPlugin", () => {
              // TODO
						});
				};

				normalModuleFactory.hooks.parser
					.for("javascript/auto")
					.tap("CommonJsStuffPlugin", handler);
				normalModuleFactory.hooks.parser
					.for("javascript/dynamic")
					.tap("CommonJsStuffPlugin", handler);
      }
    )
  }
}
module.exports = CommonJsStuffPlugin;