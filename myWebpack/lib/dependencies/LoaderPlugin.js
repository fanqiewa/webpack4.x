/**
 * loader插件
 */
"use strict";

const LoaderDependency = require("./LoaderDependency");
const NormalModule = require("../NormalModule");

class LoaderPlugin {
  apply(compiler) {
    // 注入hook - LoaderPlugin
    compiler.hooks.compilation.tap(
      "LoaderPlugin",
      (compilation, { normalModuleFactory }) => {
				compilation.dependencyFactories.set(
					LoaderDependency,
					normalModuleFactory
				);
      }
    );
    // 注入hook - LoaderPlugin
    compiler.hooks.compilation.tap("LoaderPlugin", compilation => {
      compilation.hooks.normalModuleLoader.tap(
				"LoaderPlugin",
				(loaderContext, module) => {
					loaderContext.loadModule = (request, callback) => {
            // TODO
					};
				}
			);
    })
  }
}
module.exports = LoaderPlugin;