/**
 * AMD插件
 */
"use strict";

const path = require("path");
const AMDRequireDependency = require("./AMDRequireDependency");
const AMDRequireItemDependency = require("./AMDRequireItemDependency");
const AMDRequireArrayDependency = require("./AMDRequireArrayDependency");
const AMDRequireContextDependency = require("./AMDRequireContextDependency");
const AMDDefineDependency = require("./AMDDefineDependency");
const UnsupportedDependency = require("./UnsupportedDependency");
const LocalModuleDependency = require("./LocalModuleDependency");

const NullFactory = require("../NullFactory");

const AMDRequireDependenciesBlockParserPlugin = require("./AMDRequireDependenciesBlockParserPlugin");
const AMDDefineDependencyParserPlugin = require("./AMDDefineDependencyParserPlugin");

const AliasPlugin = require("enhanced-resolve/lib/AliasPlugin");

const ParserHelpers = require("../ParserHelpers");

class AMDPlugin {
  constructor(options, amdOptions) {
    this.amdOptions = amdOptions;
    this.options = options;
  }

  apply(compiler) {
    const options = this.options;
    const amdOptions = this.amdOptions;
    // 注入hook - AMDPlugin
    compiler.hooks.compilation.tap(
      "AMDPlugin",
      (compilation, { contextModuleFactory, normalModuleFactory }) => {
        compilation.dependencyFactories.set(
					AMDRequireDependency,
					new NullFactory()
				);
				compilation.dependencyTemplates.set(
					AMDRequireDependency,
					new AMDRequireDependency.Template()
				);
        
				compilation.dependencyFactories.set(
					AMDRequireItemDependency,
					normalModuleFactory
				);
				compilation.dependencyTemplates.set(
					AMDRequireItemDependency,
					new AMDRequireItemDependency.Template()
				);
        
				compilation.dependencyFactories.set(
					AMDRequireArrayDependency,
					new NullFactory()
				);
				compilation.dependencyTemplates.set(
					AMDRequireArrayDependency,
					new AMDRequireArrayDependency.Template()
				);
        
				compilation.dependencyFactories.set(
					AMDRequireContextDependency,
					contextModuleFactory
				);
				compilation.dependencyTemplates.set(
					AMDRequireContextDependency,
					new AMDRequireContextDependency.Template()
				);
        
				compilation.dependencyFactories.set(
					AMDDefineDependency,
					new NullFactory()
				);
				compilation.dependencyTemplates.set(
					AMDDefineDependency,
					new AMDDefineDependency.Template()
				);

				compilation.dependencyFactories.set(
					UnsupportedDependency,
					new NullFactory()
				);
				compilation.dependencyTemplates.set(
					UnsupportedDependency,
					new UnsupportedDependency.Template()
				);

				compilation.dependencyFactories.set(
					LocalModuleDependency,
					new NullFactory()
				);
				compilation.dependencyTemplates.set(
					LocalModuleDependency,
					new LocalModuleDependency.Template()
				);
        
        const handler = (parser, parserOptions) => {
					if (parserOptions.amd !== undefined && !parserOptions.amd) return;

					const setExpressionToModule = (outerExpr, module) => {
						parser.hooks.expression.for(outerExpr).tap("AMDPlugin", expr => {
							// TODO
						})
					};

					new AMDRequireDependenciesBlockParserPlugin(options).apply(parser);
					new AMDDefineDependencyParserPlugin(options).apply(parser);

					setExpressionToModule("require.amd", "!!webpack amd options");
					setExpressionToModule("define.amd", "!!webpack amd options");
					setExpressionToModule("define", "!!webpack amd define");

					parser.hooks.expression
						.for("__webpack_amd_options__")
						.tap("AMDPlugin", () => {
							// TODO
						});
					parser.hooks.evaluateTypeof
						.for("define.amd")
						.tap(
							"AMDPlugin",
							ParserHelpers.evaluateToString(typeof amdOptions)
						);
					parser.hooks.evaluateTypeof
						.for("require.amd")
						.tap(
							"AMDPlugin",
							ParserHelpers.evaluateToString(typeof amdOptions)
						);
					parser.hooks.evaluateIdentifier
						.for("define.amd")
						.tap(
							"AMDPlugin",
							ParserHelpers.evaluateToIdentifier("define.amd", true)
						);
					parser.hooks.evaluateIdentifier
						.for("require.amd")
						.tap(
							"AMDPlugin",
							ParserHelpers.evaluateToIdentifier("require.amd", true)
						);
					parser.hooks.typeof
						.for("define")
						.tap(
							"AMDPlugin",
							ParserHelpers.toConstantDependency(
								parser,
								JSON.stringify("function")
							)
						);
					parser.hooks.evaluateTypeof
						.for("define")
						.tap("AMDPlugin", ParserHelpers.evaluateToString("function"));
					parser.hooks.canRename
						.for("define")
						.tap("AMDPlugin", ParserHelpers.approve);
					parser.hooks.rename.for("define").tap("AMDPlugin", expr => {
						// TODO
					});
					parser.hooks.typeof
						.for("require")
						.tap(
							"AMDPlugin",
							ParserHelpers.toConstantDependency(
								parser,
								JSON.stringify("function")
							)
						);
					parser.hooks.evaluateTypeof
						.for("require")
						.tap("AMDPlugin", ParserHelpers.evaluateToString("function"));
        }
        
				normalModuleFactory.hooks.parser
        .for("javascript/auto")
        .tap("AMDPlugin", handler);
        normalModuleFactory.hooks.parser
          .for("javascript/dynamic")
          .tap("AMDPlugin", handler);
      }
    );
    // 注入hook - AMDPlugin
    compiler.hooks.afterResolvers.tap("AMDPlugin", () => {
      compiler.resolverFactory.hooks.resolver
        .for("normal")
        .tap("AMDPlugin", resolver => {
          // TODO
        })
    })
  }
}
module.exports = AMDPlugin;