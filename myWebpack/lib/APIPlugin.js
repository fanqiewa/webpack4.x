/**
 * API插件
 */
"use strict";

const ConstDependency = require("./dependencies/ConstDependency");
const ParserHelpers = require("./ParserHelpers");

const NullFactory = require("./NullFactory");

const REPLACEMENTS = {
	__webpack_require__: "__webpack_require__",
	__webpack_public_path__: "__webpack_require__.p",
	__webpack_modules__: "__webpack_require__.m",
	__webpack_chunk_load__: "__webpack_require__.e",
	__non_webpack_require__: "require",
	__webpack_nonce__: "__webpack_require__.nc",
	"require.onError": "__webpack_require__.oe"
};
const NO_WEBPACK_REQUIRE = {
	__non_webpack_require__: true
};
const REPLACEMENT_TYPES = {
	__webpack_public_path__: "string",
	__webpack_require__: "function",
	__webpack_modules__: "object",
	__webpack_chunk_load__: "function",
	__webpack_nonce__: "string"
};

class APIPlugin {
  apply(compiler) {
    // 注入hook - APIPlugin
    compiler.hooks.compilation.tap(
      "APIPlugin",
      (compilation, { normalModuleFactory }) => {
				compilation.dependencyFactories.set(ConstDependency, new NullFactory());
				compilation.dependencyTemplates.set(
					ConstDependency,
					new ConstDependency.Template()
				);

				const handler = parser => {
					Object.keys(REPLACEMENTS).forEach(key => {
						parser.hooks.expression
							.for(key)
							.tap(
								"APIPlugin",
								NO_WEBPACK_REQUIRE[key]
									? ParserHelpers.toConstantDependency(
											parser,
											REPLACEMENTS[key]
									  )
									: ParserHelpers.toConstantDependencyWithWebpackRequire(
											parser,
											REPLACEMENTS[key]
									  )
							);
						const type = REPLACEMENT_TYPES[key];
						if (type) {
							parser.hooks.evaluateTypeof
								.for(key)
								.tap("APIPlugin", ParserHelpers.evaluateToString(type));
						}
					});
				};

				normalModuleFactory.hooks.parser
					.for("javascript/auto")
					.tap("APIPlugin", handler);
				normalModuleFactory.hooks.parser
					.for("javascript/dynamic")
					.tap("APIPlugin", handler);
				normalModuleFactory.hooks.parser
					.for("javascript/esm")
					.tap("APIPlugin", handler);
      }
    )
  }
}

module.exports = APIPlugin;