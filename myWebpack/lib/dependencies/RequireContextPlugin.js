
"use strict";

const RequireContextDependency = require("./RequireContextDependency");
const ContextElementDependency = require("./ContextElementDependency");

const RequireContextDependencyParserPlugin = require("./RequireContextDependencyParserPlugin");

class RequireContextPlugin {
  constructor(modulesDirectories, extensions, mainFiles) {
    if (!Array.isArray(modulesDirectories)) {
      throw new Error("modulesDirectories must be an array");
    }
    if (!Array.isArray(extensions)) {
      throw new Error("extensions must be an array");
    }
		this.modulesDirectories = modulesDirectories;
		this.extensions = extensions;
		this.mainFiles = mainFiles;
  }

  apply(compiler) {
    // 注入hook - RequireContextPlugin
    compiler.hooks.compilation.tap(
      "RequireContextPlugin",
      (compilation, { contextModuleFactory, mormalModuleFactory }) => {
        compilation.dependencyFactories.set(
					RequireContextDependency,
					contextModuleFactory
				);
				compilation.dependencyTemplates.set(
					RequireContextDependency,
					new RequireContextDependency.Template()
				);

				compilation.dependencyFactories.set(
					ContextElementDependency,
					normalModuleFactory
				);

				const handler = (parser, parserOptions) => {
					if (
						parserOptions.requireContext !== undefined &&
						!parserOptions.requireContext
					)
						return;

					new RequireContextDependencyParserPlugin().apply(parser);
				};


				normalModuleFactory.hooks.parser
					.for("javascript/auto")
					.tap("RequireContextPlugin", handler);
				normalModuleFactory.hooks.parser
					.for("javascript/dynamic")
					.tap("RequireContextPlugin", handler);

				contextModuleFactory.hooks.alternatives.tap(
					"RequireContextPlugin",
					items => {
            // TODO
					}
				);

				contextModuleFactory.hooks.alternatives.tap(
					"RequireContextPlugin",
					items => {
            // TODO
					}
				);

				contextModuleFactory.hooks.alternatives.tap(
					"RequireContextPlugin",
					items => {
            // TODO
					}
				);
      }
    )
  }
}
module.exports = RequireContextPlugin;