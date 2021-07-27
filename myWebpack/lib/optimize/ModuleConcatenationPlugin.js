
"use strict";

const HarmonyImportDependency = require("../dependencies/HarmonyImportDependency");
const ModuleHotAcceptDependency = require("../dependencies/ModuleHotAcceptDependency");
const ModuleHotDeclineDependency = require("../dependencies/ModuleHotDeclineDependency");
const ConcatenatedModule = require("./ConcatenatedModule");
const HarmonyCompatibilityDependency = require("../dependencies/HarmonyCompatibilityDependency");
const StackedSetMap = require("../util/StackedSetMap");

const formatBailoutReason = msg => {
	return "ModuleConcatenation bailout: " + msg;
};

class ModuleConcatenationPlugin {
  constructor(options) {
    if (typeof options !== "object") options = {};
    this.options = options;
  }

  apply(compiler) {
    // 注入hook - ModuleConcatenationPlugin
		compiler.hooks.compilation.tap(
			"ModuleConcatenationPlugin",
			(compilation, { normalModuleFactory }) => {
				const handler = (parser, parserOptions) => {
					parser.hooks.call.for("eval").tap("ModuleConcatenationPlugin", () => {
						// TODO
					});
				};

				normalModuleFactory.hooks.parser
					.for("javascript/auto")
					.tap("ModuleConcatenationPlugin", handler);
				normalModuleFactory.hooks.parser
					.for("javascript/dynamic")
					.tap("ModuleConcatenationPlugin", handler);
				normalModuleFactory.hooks.parser
					.for("javascript/esm")
					.tap("ModuleConcatenationPlugin", handler);

				const bailoutReasonMap = new Map();

				// 紧急原因
				const setBailoutReason = (module, reason) => {
          bailoutReasonMap.set(module, reason);
					module.optimizationBailout.push(
						typeof reason === "function"
							? rs => formatBailoutReason(reason(rs))
							: formatBailoutReason(reason)
					);
				};

				const getBailoutReason = (module, requestShortener) => {
          // TODO
				};

				compilation.hooks.optimizeChunkModules.tap(
					"ModuleConcatenationPlugin",
					(allChunks, modules) => {
						const relevantModules = [];
						const possibleInners = new Set();
						for (const module of modules) {
							if (
								!module.buildMeta ||
								module.buildMeta.exportsType !== "namespace" ||
								!module.dependencies.some(
									d => d instanceof HarmonyCompatibilityDependency
								) 
							)	{
								setBailoutReason(module, "Module is not an ECMAScript module");
								continue;
							}

							if (
								module.buildMeta &&
								module.buildMeta.moduleConcatenationBailout
							) {
								// TODO
							}
							if (!Array.isArray(module.buildMeta.providedExports)) {
								// TODO
							}	
							if (module.variables.length > 0) {
								// TODO
							}
							if (
								module.dependencies.some(
									dep =>
										dep instanceof ModuleHotAcceptDependency ||
										dep instanceof ModuleHotDeclineDependency
								)
							) {
								// TODO
							}
							
							relevantModules.push(module);

							if (module.isEntryModule()) {
								setBailoutReason(module, "Module is an entry point");
								continue;
							}

							if (module.getNumberOfChunks() === 0) {
								// TODO
							}
							// TODO
						}

						relevantModules.sort((a, b) => {
							return a.depth - b.depth;
						});
						const concatConfigurations = [];
						const usedAsInner = new Set();
						for (const currentRoot of relevantModules) {
							if (usedAsInner.has(currentRoot)) continue;

							const currentConfiguration = new ConcatConfiguration(currentRoot);
							const failureCache = new Map();

							// 尝试添加所有imports
							for (const imp of this._getImports(compilation, currentRoot)) {
								const problem = this._tryToAdd(
									compilation,
									currentConfiguration,
									imp,
									possibleInners,
									failureCache
								);
								if (problem) {
									failureCache.set(imp, problem);
									currentConfiguration.addWarning(imp, problem);
								}
							}
							if (!currentConfiguration.isEmpty()) {
								concatConfigurations.push(currentConfiguration);
								for (const module of currentConfiguration.getModules()) {
									if (module !== currentConfiguration.rootModule) {
										usedAsInner.add(module);
									}
								}
							}
						}

						concatConfigurations.sort((a, b) => {
							return b.modules.size - a.modules.size;
						});
						const usedModules = new Set();
						for (const concatConfiguration of concatConfigurations) {
							// TODO
						}

						// 过滤已被use过的
						compilation.modules = compilation.modules.filter(
							m => !usedModules.has(m)
						);
					}
				);
      }
    )
  }

	// 获取import
	_getImports(compilation, module) {
		return new Set(
			module.dependencies
				// 仅获取和谐依赖项的引用信息
				.map(dep => {
					if (!(dep instanceof HarmonyImportDependency)) return null;
					if (!compilation) return dep.getReference();
					return compilation.getDependencyReference(module, dep);
				})

				// 引用有效并且有一个模块
				// 依赖关系非常简单，可以将它们连接起来
				.filter(
					ref =>
						ref &&
						ref.module &&
						(Array.isArray(ref.importedNames) ||
							Array.isArray(ref.module.buildMeta.providedExports))
				)

				// 以导入的模块为例
				.map(ref => ref.module)
		)
	}

	// 尝试添加
	_tryToAdd(compilation, config, module, possibleModules, failureCache) {
		const cacheEntry = failureCache.get(module);
		if (cacheEntry) {
			return cacheEntry;
		}

		if (config.has(module)) {
			return null;
		}

		// 
		if (!possibleModules.has(module)) {
			failureCache.set(module, module); 
			return module;
		}

		// TODO
	}
}

module.exports = ModuleConcatenationPlugin;

class ConcatConfiguration {
	constructor(rootModule, cloneFrom) {
		this.rootModule = rootModule;
		if (cloneFrom) {
			// TODO
		} else {
			this.modules = new StackedSetMap();
			this.modules.add(rootModule);
			this.warnings = new StackedSetMap();
		}
	}
	
	add(module) {
		this.modules.add(module);
	}

	has(module) {
		return this.modules.has(module);
	}

	isEmpty() {
		return this.modules.size === 1;
	}

	addWarning(module, problem) {
		this.warnings.set(module, problem);
	}

}

module.exports = ModuleConcatenationPlugin;