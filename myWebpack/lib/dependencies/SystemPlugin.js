
"use strict";

const ParserHelpers = require("../ParserHelpers");
const WebpackError = require("../WebpackError");

class SystemPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    // 注入hook - SystemPlugin
    compiler.hooks.compilation.tap(
      "SystemPlugin",
      (compilation, { normalModuleFactory }) => {
				const handler = (parser, parserOptions) => {
					if (parserOptions.system !== undefined && !parserOptions.system)
						return;

					const shouldWarn = parserOptions.system === undefined;

					const setNotSupported = name => {
						parser.hooks.evaluateTypeof
							.for(name)
							.tap("SystemPlugin", ParserHelpers.evaluateToString("undefined"));
						parser.hooks.expression
							.for(name)
							.tap(
								"SystemPlugin",
								ParserHelpers.expressionIsUnsupported(
									parser,
									name + " is not supported by webpack."
								)
							);
					};

					parser.hooks.typeof
						.for("System.import")
						.tap(
							"SystemPlugin",
							ParserHelpers.toConstantDependency(
								parser,
								JSON.stringify("function")
							)
						);
					parser.hooks.evaluateTypeof
						.for("System.import")
						.tap("SystemPlugin", ParserHelpers.evaluateToString("function"));
					parser.hooks.typeof
						.for("System")
						.tap(
							"SystemPlugin",
							ParserHelpers.toConstantDependency(
								parser,
								JSON.stringify("object")
							)
						);
					parser.hooks.evaluateTypeof
						.for("System")
						.tap("SystemPlugin", ParserHelpers.evaluateToString("object"));

					setNotSupported("System.set");
					setNotSupported("System.get");
					setNotSupported("System.register");

					parser.hooks.expression.for("System").tap("SystemPlugin", () => {
            // TODO
					});

					parser.hooks.call.for("System.import").tap("SystemPlugin", expr => {
            // TODO
					});
				};

				normalModuleFactory.hooks.parser
					.for("javascript/auto")
					.tap("SystemPlugin", handler);
				normalModuleFactory.hooks.parser
					.for("javascript/dynamic")
					.tap("SystemPlugin", handler);
      }
    )
  }
}
module.exports = SystemPlugin;