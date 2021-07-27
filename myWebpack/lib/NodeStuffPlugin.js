
"use strict";

const path = require("path");
const ParserHelpers = require("./ParserHelpers");
const ConstDependency = require("./dependencies/ConstDependency");

const NullFactory = require("./NullFactory");

class NodeStuffPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const options = this.options;
    // 注入hook - NodeStuffPlugin
    compiler.hooks.compilation.tap(
      "NodeStuffPlugin",
      (compilation, { normalModuleFactory }) => {
				compilation.dependencyFactories.set(ConstDependency, new NullFactory());
				compilation.dependencyTemplates.set(
					ConstDependency,
					new ConstDependency.Template()
				);

				const handler = (parser, parserOptions) => {
					if (parserOptions.node === false) return;

					let localOptions = options;
					if (parserOptions.node) {
						localOptions = Object.assign({}, localOptions, parserOptions.node);
					}

					const setConstant = (expressionName, value) => {
						parser.hooks.expression
							.for(expressionName)
							.tap("NodeStuffPlugin", () => {
                // TODO
							});
					};

					const setModuleConstant = (expressionName, fn) => {
            // TOOO
					};
          const context = compiler.context;
          if (localOptions.__filename) {
            if (localOptions.__filename === "mock") {
              setConstant("__filename", "/index.js");
            } else {
              // TODO
            }
						parser.hooks.evaluateIdentifier
							.for("__filename")
							.tap("NodeStuffPlugin", expr => {
                // TODO
							});
          }
					if (localOptions.__dirname) {
						if (localOptions.__dirname === "mock") {
							setConstant("__dirname", "/");
						} else {
              // TODO
						}
						parser.hooks.evaluateIdentifier
							.for("__dirname")
							.tap("NodeStuffPlugin", expr => {
								if (!parser.state.module) return;
								return ParserHelpers.evaluateToString(
									parser.state.module.context
								)(expr);
							});
					}
					parser.hooks.expression
						.for("require.extensions")
						.tap(
							"NodeStuffPlugin",
							ParserHelpers.expressionIsUnsupported(
								parser,
								"require.extensions is not supported by webpack. Use a loader instead."
							)
						);
				};

				normalModuleFactory.hooks.parser
					.for("javascript/auto")
					.tap("NodeStuffPlugin", handler);
				normalModuleFactory.hooks.parser
					.for("javascript/dynamic")
					.tap("NodeStuffPlugin", handler);
      }
    )
  }
}
module.exports = NodeStuffPlugin;
