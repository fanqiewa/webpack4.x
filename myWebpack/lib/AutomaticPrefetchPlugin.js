/**
 * 提前发现以前编译中的所有模块，同时监视更改，试图缩短增量构建时间
 */
"use strict";

const asyncLib = require("neo-async");
const PrefetchDependency = require("./dependencies/PrefetchDependency");
const NormalModule = require("./NormalModule");


class AutomaticPrefetchPlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap(
			"AutomaticPrefetchPlugin",
			(compilation, { normalModuleFactory }) => {
				compilation.dependencyFactories.set(
					PrefetchDependency,
					normalModuleFactory
				);
			}
		);
		let lastModules = null;
		compiler.hooks.afterCompile.tap("AutomaticPrefetchPlugin", compilation => {
			lastModules = compilation.modules
				.filter(m => m instanceof NormalModule)
				.map((m) => ({
					context: m.context,
					request: m.request
				}));
		});
		compiler.hooks.make.tapAsync(
			"AutomaticPrefetchPlugin",
			(compilation, callback) => {
				if (!lastModules) return callback();
				asyncLib.forEach(
					lastModules,
					(m, callback) => {
						compilation.prefetch(
							m.context || compiler.context,
							new PrefetchDependency(m.request),
							callback
						);
					},
					callback
				);
			}
		);
	}
}
module.exports = AutomaticPrefetchPlugin;
