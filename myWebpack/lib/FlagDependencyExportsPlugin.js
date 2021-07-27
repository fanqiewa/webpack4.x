
"use strict";

const Queue = require("./util/Queue");


class FlagDependencyExportsPlugin {
	apply(compiler) {
    // 注入hook - FlagDependencyExportsPlugin
		compiler.hooks.compilation.tap(
			"FlagDependencyExportsPlugin",
			compilation => {
				// 完成module编译
				compilation.hooks.finishModules.tap(
					"FlagDependencyExportsPlugin",
					modules => {
						const dependencies = new Map();

						const queue = new Queue();

						let module;
						let moduleWithExports;
						let moduleProvidedExports;
						let providedExportsAreTemporary;

						// 处理依赖快
						const processDependenciesBlock = depBlock => {
							for (const dep of depBlock.dependencies) {
								if (processDependency(dep)) return true;
							}
							for (const variable of depBlock.variables) {
								// TODO
							}
							for (const block of depBlock.blocks) {
								// TODO
							}
							return false;
						}
						// 处理依赖
						const processDependency = dep => {
							// 原型上的getExports方法 Dependency
							const exportDesc = dep.getExports && dep.getExports();
							if (!exportDesc) return;
						}

						// 触发依赖
						const notifyDependencies = () => {
							const deps = dependencies.get(module);
							if (deps !== undefined) {
								// TODO
							}
						}

						const notifyDependenciesIfDifferent = (set, array) => {
							// TODO
						}

						for (const module of modules) {
							if (module.buildInfo.temporaryProvidedExports) {
								// TODO
							} else if (!module.buildMeta.provideExports) {
								queue.enqueue(module);
							}
						}

						while (queue.length > 0) {
							module = queue.dequeue();

							if (module.buildMeta.providedExports !== true) {
								// 模块导出类型 e.g. namespace
								moduleWithExports =
									module.buildMeta && module.buildMeta.exportsType;
								moduleProvidedExports = new Set();
								providedExportsAreTemporary = false;
								processDependenciesBlock(module);
								module.buildInfo.temporaryProvidedExports = providedExportsAreTemporary;
								if (!moduleWithExports) {
									notifyDependencies();
									module.buildMeta.providedExports = true;
								} else if (module.buildMeta.providedExports === true) {
									// TODO
								} else if (!module.buildMeta.providedExports) {
									notifyDependencies();
									module.buildMeta.providedExports = Array.from(
										moduleProvidedExports
									);
								} else {
									// TODO
								}
							}
						}
					}
				);
				const providedExportsCache = new WeakMap();
				compilation.hooks.rebuildModule.tap(
					"FlagDependencyExportsPlugin",
					module => {
            // TODO
					}
				);
				compilation.hooks.finishRebuildingModule.tap(
					"FlagDependencyExportsPlugin",
					module => {
            // TODO
					}
				);
      });
    }
}

module.exports = FlagDependencyExportsPlugin;